import { COIN_PACKS, getCoinPack } from '../config/coinPacks.js';
import { Transaction } from '../models/Transaction.model.js';
import { User } from '../models/User.model.js';
import {
  createInvoice,
  getPaymentUrls,
  isPaymentComplete,
  verifyIpnSignature,
} from '../services/nowpayments.js';
import { notifyCoinBalanceChange } from '../services/coinBalanceNotifications.js';

function serializeTransaction(tx) {
  return {
    id: tx._id.toString(),
    userId: tx.userId.toString(),
    type: tx.type,
    amount: tx.amount,
    currency: tx.currency,
    description: tx.description,
    status: tx.status,
    timestamp: tx.timestamp || tx.createdAt?.toISOString?.() || new Date().toISOString(),
    relatedUserId: tx.relatedUserId?.toString(),
  };
}

export async function listPacks(req, res) {
  const packs = COIN_PACKS.map((p) => ({
    id: p.id,
    name: p.name,
    coins: p.coins,
    price: p.priceUsd,
    originalPrice: p.originalPrice ?? undefined,
    features: p.features,
    isPopular: Boolean(p.isPopular),
  }));
  res.json({ packs });
}

export async function listMyTransactions(req, res) {
  const txs = await Transaction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({ transactions: txs.map(serializeTransaction) });
}

export async function createPayment(req, res) {
  if (req.user.role !== 'male') {
    return res.status(403).json({ error: 'Only members can purchase coin packs' });
  }

  const packId = req.body?.packId;
  const pack = getCoinPack(packId);
  if (!pack) {
    return res.status(400).json({ error: 'Invalid coin pack' });
  }

  const orderId = `${req.user._id.toString()}_${pack.id}_${Date.now()}`;
  const urls = getPaymentUrls();

  const tx = await Transaction.create({
    userId: req.user._id,
    type: 'purchase',
    amount: pack.coins,
    currency: 'coins',
    description: `${pack.name} — ${pack.coins} coins`,
    status: 'pending',
    orderId,
    packId: pack.id,
    priceUsd: pack.priceUsd,
    timestamp: new Date().toISOString(),
  });

  try {
    const invoice = await createInvoice({
      price_amount: pack.priceUsd,
      price_currency: 'usd',
      order_id: orderId,
      order_description: `${pack.coins} coins — ${pack.name}`,
      ipn_callback_url: urls.ipnCallbackUrl,
      success_url: urls.successUrl,
      cancel_url: urls.cancelUrl,
    });

    tx.nowPaymentId = invoice.id != null ? String(invoice.id) : undefined;
    await tx.save();

    res.json({
      invoiceUrl: invoice.invoice_url,
      orderId,
      paymentId: invoice.id,
    });
  } catch (err) {
    tx.status = 'failed';
    await tx.save();
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    return res.status(status).json({
      error: err.message || 'Could not create payment',
    });
  }
}

/**
 * NOWPayments IPN webhook — must receive raw body (mounted before express.json).
 */
export async function paymentWebhook(req, res) {
  const signature = req.headers['x-nowpayments-sig'];
  const rawBody = req.body;

  if (!verifyIpnSignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const orderId = payload.order_id;
  const paymentStatus = payload.payment_status;

  if (!orderId) {
    return res.status(200).send('ok');
  }

  const tx = await Transaction.findOne({ orderId });
  if (!tx) {
    return res.status(200).send('ok');
  }

  tx.nowPaymentStatus = paymentStatus;
  if (payload.payment_id != null) {
    tx.nowPaymentId = String(payload.payment_id);
  }

  if (isPaymentComplete(paymentStatus)) {
    if (tx.status !== 'completed') {
      tx.status = 'completed';
      await tx.save();
      const updated = await User.findByIdAndUpdate(
        tx.userId,
        { $inc: { coins: tx.amount } },
        { new: true }
      );
      if (updated) {
        void notifyCoinBalanceChange(req.app.get('io'), {
          userId: updated._id,
          delta: tx.amount,
          newBalance: updated.coins,
          reason: tx.description || 'Coin pack purchase',
        });
      }
    } else {
      await tx.save();
    }
    return res.status(200).send('ok');
  }

  const failedStatuses = ['failed', 'refunded', 'expired'];
  if (failedStatuses.includes(String(paymentStatus || '').toLowerCase())) {
    tx.status = 'failed';
    await tx.save();
  } else {
    await tx.save();
  }

  return res.status(200).send('ok');
}
