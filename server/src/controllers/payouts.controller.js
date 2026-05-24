import mongoose from 'mongoose';
import { PayoutRequest } from '../models/PayoutRequest.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { User } from '../models/User.model.js';
import {
  COIN_TO_USD,
  MIN_WITHDRAWAL_USD,
  WITHDRAWAL_FEE_RATE,
  meetsMinimumWithdrawal,
  netUsdAfterFee,
  withdrawalFeeCoins,
} from '../config/payouts.js';
import { createInAppNotification } from '../services/inAppNotifications.js';

function serializePayout(doc, user) {
  const p = doc.toObject ? doc.toObject() : doc;
  return {
    id: p._id.toString(),
    userId: p.userId?.toString?.() || String(p.userId),
    userName: user?.name || 'Member',
    userEmail: user?.email || '',
    amount: p.amountCoins,
    amountCoins: p.amountCoins,
    feeCoins: p.feeCoins,
    walletAddress: p.walletAddress,
    wallet: maskWallet(p.walletAddress),
    status: p.status,
    adminNote: p.adminNote || undefined,
    requestedAt: p.createdAt?.toISOString?.() || '',
    processedAt: p.processedAt?.toISOString?.() || undefined,
    netUsd: netUsdAfterFee(p.amountCoins),
  };
}

function maskWallet(addr) {
  const s = String(addr || '').trim();
  if (s.length <= 12) return s;
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

/** POST /api/payouts/request — woman requests withdrawal */
export async function requestPayout(req, res) {
  if (req.user.gender !== 'female' || req.user.role !== 'female') {
    return res.status(403).json({ error: 'Only women can request payouts' });
  }

  const amountCoins = Math.floor(Number(req.body?.amountCoins));
  const walletAddress = typeof req.body?.walletAddress === 'string' ? req.body.walletAddress.trim() : '';

  if (!Number.isFinite(amountCoins) || amountCoins < 1) {
    return res.status(400).json({ error: 'Enter a valid coin amount' });
  }
  if (!walletAddress || walletAddress.length < 10) {
    return res.status(400).json({ error: 'Enter a valid USDT TRC20 wallet address' });
  }
  if (!meetsMinimumWithdrawal(amountCoins)) {
    return res.status(400).json({
      error: `Minimum withdrawal is $${MIN_WITHDRAWAL_USD} USD after fees`,
    });
  }

  const pending = await PayoutRequest.findOne({
    userId: req.user._id,
    status: { $in: ['pending', 'processing'] },
  });
  if (pending) {
    return res.status(400).json({ error: 'You already have a payout in progress' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  if (user.coins < amountCoins) {
    return res.status(400).json({ error: 'Insufficient coins' });
  }

  const feeCoins = withdrawalFeeCoins(amountCoins);
  const ts = new Date().toISOString().slice(0, 10);

  user.coins -= amountCoins;
  user.usdtWalletAddress = walletAddress;
  await user.save();

  const tx = await Transaction.create({
    userId: user._id,
    type: 'payout',
    amount: amountCoins,
    currency: 'coins',
    description: `Withdrawal request — ${amountCoins} coins`,
    status: 'pending',
    timestamp: ts,
  });

  const payout = await PayoutRequest.create({
    userId: user._id,
    amountCoins,
    feeCoins,
    walletAddress,
    status: 'pending',
    transactionId: tx._id,
  });

  const io = req.app.get('io');
  const { notifyAdminsPayoutRequested } = await import('../services/adminAlerts.js');
  void notifyAdminsPayoutRequested(io, {
    payoutId: payout._id,
    userName: user.name,
    amountCoins,
    walletAddress,
  }).catch(() => {});

  res.status(201).json({
    payout: serializePayout(payout, user),
    coins: user.coins,
    config: { coinToUsd: COIN_TO_USD, minWithdrawalUsd: MIN_WITHDRAWAL_USD, feeRate: WITHDRAWAL_FEE_RATE },
  });
}

/** GET /api/payouts/mine */
export async function listMyPayouts(req, res) {
  if (req.user.gender !== 'female' && req.user.role !== 'female') {
    return res.status(403).json({ error: 'Not available' });
  }

  const user = await User.findById(req.user._id).select('usdtWalletAddress name email').lean();
  const rows = await PayoutRequest.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();

  res.json({
    payouts: rows.map((p) => serializePayout(p, user || req.user)),
    walletAddress: user?.usdtWalletAddress || '',
    config: { coinToUsd: COIN_TO_USD, minWithdrawalUsd: MIN_WITHDRAWAL_USD, feeRate: WITHDRAWAL_FEE_RATE },
  });
}

/** GET /admin/payouts */
export async function listPayoutsAdmin(req, res) {
  const { status = 'all', search = '' } = req.query;
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  let rows = await PayoutRequest.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('userId', 'name email')
    .lean();

  const q = String(search).trim().toLowerCase();
  if (q) {
    rows = rows.filter((p) => {
      const u = p.userId;
      const name = (u?.name || '').toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const wallet = (p.walletAddress || '').toLowerCase();
      return name.includes(q) || email.includes(q) || wallet.includes(q);
    });
  }

  res.json({
    payouts: rows.map((p) => serializePayout(p, p.userId)),
  });
}

/** GET /admin/payouts/stats */
export async function payoutStatsAdmin(req, res) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [pendingRows, processingRows, completedTodayRows, monthCompleted] = await Promise.all([
    PayoutRequest.find({ status: 'pending' }).select('amountCoins').lean(),
    PayoutRequest.find({ status: 'processing' }).select('amountCoins').lean(),
    PayoutRequest.find({ status: 'completed', processedAt: { $gte: startOfDay } }).select('amountCoins').lean(),
    PayoutRequest.find({ status: 'completed', processedAt: { $gte: startOfMonth } }).select('amountCoins').lean(),
  ]);

  const sumNetUsd = (rows) =>
    Math.round(rows.reduce((sum, p) => sum + netUsdAfterFee(p.amountCoins), 0) * 100) / 100;

  res.json({
    stats: {
      pendingCount: pendingRows.length,
      processingCount: processingRows.length,
      completedTodayCount: completedTodayRows.length,
      pendingUsdTotal: sumNetUsd(pendingRows),
      processingUsdTotal: sumNetUsd(processingRows),
      completedTodayUsd: sumNetUsd(completedTodayRows),
      monthCompletedUsd: sumNetUsd(monthCompleted),
    },
  });
}

/** PATCH /admin/payouts/:id */
export async function patchPayoutAdmin(req, res) {
  const { id } = req.params;
  const { status, adminNote } = req.body ?? {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid payout id' });
  }
  if (!['processing', 'completed', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be processing, completed, or rejected' });
  }

  const payout = await PayoutRequest.findById(id);
  if (!payout) {
    return res.status(404).json({ error: 'Payout not found' });
  }
  if (payout.status === 'completed' || payout.status === 'rejected') {
    return res.status(400).json({ error: 'Payout is already finalized' });
  }

  const user = await User.findById(payout.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const note = typeof adminNote === 'string' ? adminNote.trim().slice(0, 500) : '';
  payout.processedBy = req.user._id;
  payout.processedAt = new Date();
  if (note) payout.adminNote = note;

  const io = req.app.get('io');

  if (status === 'processing') {
    payout.status = 'processing';
    await payout.save();
    if (payout.transactionId) {
      await Transaction.findByIdAndUpdate(payout.transactionId, { status: 'pending' });
    }
    await createInAppNotification(io, {
      userId: user._id,
      kind: 'system',
      title: 'Payout processing',
      body: `Your withdrawal of ${payout.amountCoins} coins is being processed.`,
    });
    return res.json({ payout: serializePayout(payout, user) });
  }

  if (status === 'completed') {
    payout.status = 'completed';
    await payout.save();
    if (payout.transactionId) {
      await Transaction.findByIdAndUpdate(payout.transactionId, {
        status: 'completed',
        description: `Withdrawal completed — ${payout.amountCoins} coins`,
      });
    }
    await createInAppNotification(io, {
      userId: user._id,
      kind: 'system',
      title: 'Payout completed',
      body: `Your withdrawal of ${payout.amountCoins} coins has been sent.`,
    });
    return res.json({ payout: serializePayout(payout, user) });
  }

  // rejected — refund coins
  payout.status = 'rejected';
  await payout.save();
  user.coins += payout.amountCoins;
  await user.save();
  if (payout.transactionId) {
    await Transaction.findByIdAndUpdate(payout.transactionId, {
      status: 'failed',
      description: `Withdrawal rejected — ${payout.amountCoins} coins refunded`,
    });
  }
  await createInAppNotification(io, {
    userId: user._id,
    kind: 'system',
    title: 'Payout rejected',
    body: note
      ? `Your withdrawal was rejected: ${note}. Coins were returned to your balance.`
      : 'Your withdrawal was rejected. Coins were returned to your balance.',
    subtitle: note || undefined,
  });

  return res.json({ payout: serializePayout(payout, user) });
}
