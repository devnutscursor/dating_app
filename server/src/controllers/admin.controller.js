import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { User } from '../models/User.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { PayoutRequest } from '../models/PayoutRequest.model.js';
import { Report } from '../models/Report.model.js';
import { Chat } from '../models/Chat.model.js';
import { Activity } from '../models/Activity.model.js';
import { serializeUser } from '../utils/serializeUser.js';
import { countPendingFemaleMedia } from '../utils/countPendingFemaleMedia.js';
import { SiteSettings } from '../models/SiteSettings.model.js';
import { getPlatformSettings, invalidateSettingsCache } from '../services/siteSettings.js';

const SALT_ROUNDS = 12;
const SORT_FIELDS = new Set(['name', 'coins', 'createdAt', 'role', 'isOnline', 'isBlocked']);
const MEMBER_ROLES = { role: { $in: ['male', 'female', 'moderator'] } };

function pctChangeLabel(current, previous) {
  if (previous <= 0) return current > 0 ? '+100%' : '0%';
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

async function countChatMessagesSince(since) {
  const rows = await Chat.aggregate([
    { $unwind: '$messages' },
    ...(since ? [{ $match: { 'messages.createdAt': { $gte: since } } }] : []),
    { $count: 'n' },
  ]);
  return rows[0]?.n ?? 0;
}

async function countChatMessagesBetween(start, end) {
  const rows = await Chat.aggregate([
    { $unwind: '$messages' },
    { $match: { 'messages.createdAt': { $gte: start, $lt: end } } },
    { $count: 'n' },
  ]);
  return rows[0]?.n ?? 0;
}

export async function dashboardStats(req, res) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [
    totalUsers,
    activeToday,
    messagesAllTime,
    messagesThisWeek,
    messagesLastWeek,
    videoCalls,
    videoCallsThisWeek,
    videoCallsLastWeek,
    purchaseAgg,
    purchasesThisWeek,
    purchasesLastWeek,
    newSignupsThisWeek,
    newSignupsLastWeek,
    usersLastWeekTotal,
    pendingReports,
    pendingContent,
    pendingPayouts,
    recentTransactions,
    recentReports,
    recentActivities,
  ] = await Promise.all([
    User.countDocuments(MEMBER_ROLES),
    User.countDocuments({ ...MEMBER_ROLES, isOnline: true }),
    countChatMessagesSince(null),
    countChatMessagesSince(weekAgo),
    countChatMessagesBetween(twoWeeksAgo, weekAgo),
    Transaction.countDocuments({ type: 'videoCall' }),
    Transaction.countDocuments({ type: 'videoCall', createdAt: { $gte: weekAgo } }),
    Transaction.countDocuments({
      type: 'videoCall',
      createdAt: { $gte: twoWeeksAgo, $lt: weekAgo },
    }),
    Transaction.aggregate([
      { $match: { type: 'purchase', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.countDocuments({ type: 'purchase', createdAt: { $gte: weekAgo } }),
    Transaction.countDocuments({
      type: 'purchase',
      createdAt: { $gte: twoWeeksAgo, $lt: weekAgo },
    }),
    User.countDocuments({ ...MEMBER_ROLES, createdAt: { $gte: weekAgo } }),
    User.countDocuments({
      ...MEMBER_ROLES,
      createdAt: { $gte: twoWeeksAgo, $lt: weekAgo },
    }),
    User.countDocuments({ ...MEMBER_ROLES, createdAt: { $lt: weekAgo } }),
    Report.countDocuments({ status: { $in: ['pending', 'reviewing'] } }),
    countPendingFemaleMedia(),
    PayoutRequest.countDocuments({ status: 'pending' }),
    Transaction.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('userId', 'name')
      .lean(),
    Report.find()
      .sort({ _id: -1 })
      .limit(3)
      .populate('reporterId', 'name')
      .populate('reportedId', 'name')
      .lean(),
    Activity.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('actorId', 'name')
      .populate('recipientId', 'name')
      .lean(),
  ]);

  const coinPurchases = purchaseAgg[0]?.total ?? 0;

  const activityFromTx = recentTransactions.map((t) => {
    const name =
      t.userId && typeof t.userId === 'object' && t.userId.name ? String(t.userId.name) : 'Member';
    const actionMap = {
      purchase: 'purchased',
      unlock: 'unlocked',
      tip: 'tipped',
      videoCall: 'video call',
      payout: 'requested payout',
      gift: 'sent gift',
    };
    return {
      user: name,
      action: actionMap[t.type] ?? t.type,
      target: t.description || `${t.amount} ${t.currency || 'coins'}`,
      at: t.createdAt?.toISOString?.() || t.timestamp || '',
    };
  });

  const activityFromReports = recentReports.map((r) => {
    const reporter =
      r.reporterId && typeof r.reporterId === 'object' && r.reporterId.name
        ? String(r.reporterId.name)
        : 'Member';
    const reported =
      r.reportedId && typeof r.reportedId === 'object' && r.reportedId.name
        ? String(r.reportedId.name)
        : 'a member';
    return {
      user: reporter,
      action: 'reported',
      target: reported,
      at: r.createdAt?.toISOString?.() || r.createdAt || '',
    };
  });

  const activityFromFeed = recentActivities.map((a) => {
    const actor =
      a.actorId && typeof a.actorId === 'object' && a.actorId.name
        ? String(a.actorId.name)
        : 'Member';
    const target =
      a.recipientId && typeof a.recipientId === 'object' && a.recipientId.name
        ? String(a.recipientId.name)
        : 'member';
    const actionMap = {
      like: 'liked',
      view: 'viewed',
      gift: 'gifted',
      message: 'messaged',
    };
    return {
      user: actor,
      action: actionMap[a.type] ?? a.type,
      target: a.details?.trim() || target,
      at: a.createdAt?.toISOString?.() || '',
    };
  });

  const recentActivity = [...activityFromTx, ...activityFromReports, ...activityFromFeed]
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, 8);

  res.json({
    stats: {
      totalUsers: { value: totalUsers, change: pctChangeLabel(totalUsers, usersLastWeekTotal) },
      activeToday: { value: activeToday, change: null },
      messagesSent: {
        value: messagesAllTime,
        change: pctChangeLabel(messagesThisWeek, messagesLastWeek),
      },
      videoCalls: {
        value: videoCalls,
        change: pctChangeLabel(videoCallsThisWeek, videoCallsLastWeek),
      },
      revenue: {
        value: coinPurchases,
        label: 'Coins purchased',
        change: pctChangeLabel(purchasesThisWeek, purchasesLastWeek),
      },
      newSignups: {
        value: newSignupsThisWeek,
        change: pctChangeLabel(newSignupsThisWeek, newSignupsLastWeek),
      },
    },
    quickActions: {
      pendingPayouts,
      pendingReports,
      pendingContent,
    },
    recentActivity,
  });
}

export async function listUsers(req, res) {
  const {
    search = '',
    role: roleFilter = 'all',
    online = 'all',
    tab = 'all',
    createdFrom,
    createdTo,
    sort = 'createdAt',
    order = 'desc',
  } = req.query;

  const conds = [];

  if (['male', 'female', 'moderator'].includes(String(roleFilter))) {
    conds.push({ role: String(roleFilter) });
  } else {
    conds.push({ role: { $in: ['male', 'female', 'moderator'] } });
  }

  if (online === 'online') conds.push({ isOnline: true });
  if (online === 'offline') conds.push({ isOnline: false });

  if (tab === 'active') {
    conds.push({ $or: [{ isBlocked: false }, { isBlocked: { $exists: false } }] });
  } else if (tab === 'blocked') {
    conds.push({ isBlocked: true });
  } else if (tab === 'reported') {
    const ids = await Report.distinct('reportedId', { status: 'pending' });
    if (!ids.length) {
      return res.json({ users: [] });
    }
    conds.push({ _id: { $in: ids } });
  }

  const q = String(search).trim();
  if (q) {
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(esc, 'i');
    conds.push({ $or: [{ name: rx }, { email: rx }] });
  }

  if (createdFrom || createdTo) {
    const range = {};
    if (createdFrom) {
      const d = new Date(String(createdFrom));
      if (!Number.isNaN(d.getTime())) range.$gte = d;
    }
    if (createdTo) {
      const d = new Date(String(createdTo));
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999);
        range.$lte = d;
      }
    }
    if (Object.keys(range).length) conds.push({ createdAt: range });
  }

  const query = conds.length === 1 ? conds[0] : { $and: conds };
  const sf = SORT_FIELDS.has(String(sort)) ? String(sort) : 'createdAt';
  const dir = String(order) === 'asc' ? 1 : -1;

  const users = await User.find(query).sort({ [sf]: dir }).limit(500).lean();
  res.json({ users: users.map((u) => serializeUser({ ...u, _id: u._id })) });
}

export async function createUser(req, res) {
  const { name, email, password, userType, coins, age } = req.body;
  if (!name || !email || !password || !userType) {
    return res.status(400).json({ error: 'Name, email, password, and user type are required' });
  }
  const type = String(userType).toLowerCase();
  if (!['male', 'female', 'moderator'].includes(type)) {
    return res.status(400).json({ error: 'User type must be male, female, or moderator' });
  }
  if (!validator.isEmail(String(email))) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
  const coinValue = Number.isFinite(Number(coins)) ? Math.max(0, Math.floor(Number(coins))) : 100;
  const ageN = Number.isFinite(Number(age)) ? Math.min(120, Math.max(18, Math.floor(Number(age)))) : 25;

  let role;
  let gender;
  if (type === 'moderator') {
    role = 'moderator';
    gender = 'female';
  } else {
    role = type;
    gender = type;
  }

  const user = await User.create({
    email: String(email).toLowerCase(),
    password: passwordHash,
    role,
    name: String(name).trim(),
    gender,
    age: ageN,
    profileSetupComplete: true,
    interests: [],
    photos: [],
    videos: [],
    coins: coinValue,
    isVerified: false,
    isBlocked: false,
    emailVerified: true,
  });

  res.status(201).json({ user: serializeUser(user) });
}

export async function patchUser(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.role === 'admin') {
    return res.status(403).json({ error: 'Cannot modify admin accounts' });
  }
  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ error: 'You cannot modify your own account from this list' });
  }

  const { name, coins, isVerified, isBlocked } = req.body;

  if (name !== undefined) {
    user.name = String(name).trim();
    if (!user.name) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
  }
  if (coins !== undefined) {
    const n = Number(coins);
    if (!Number.isFinite(n) || n < 0) {
      return res.status(400).json({ error: 'Invalid coins value' });
    }
    user.coins = Math.floor(n);
  }
  if (isVerified !== undefined) {
    user.isVerified = Boolean(isVerified);
  }
  if (isBlocked !== undefined) {
    user.isBlocked = Boolean(isBlocked);
  }

  await user.save();
  res.json({ user: serializeUser(user) });
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.role === 'admin') {
    return res.status(403).json({ error: 'Cannot delete admin accounts' });
  }
  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  await User.deleteOne({ _id: id });
  res.json({ message: 'User deleted' });
}

function serializeAdminTransaction(t) {
  const u = t.userId;
  const userName =
    u && typeof u === 'object' && u.name ? String(u.name) : undefined;
  const userEmail =
    u && typeof u === 'object' && u.email ? String(u.email) : undefined;
  return {
    id: t._id.toString(),
    userId: u?._id?.toString?.() || t.userId?.toString?.() || String(t.userId),
    userName,
    userEmail,
    type: t.type,
    amount: t.amount,
    currency: t.currency,
    description: t.description,
    timestamp: t.createdAt?.toISOString?.() || t.timestamp || '',
    status: t.status,
    relatedUserId: t.relatedUserId?.toString(),
    priceUsd: t.priceUsd,
  };
}

export async function listTransactions(req, res) {
  const { type = 'all', search = '', limit = '200' } = req.query;
  const filter = {};
  if (type && type !== 'all') {
    filter.type = type;
  }
  const cap = Math.min(Math.max(parseInt(String(limit), 10) || 200, 1), 500);

  let rows = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .limit(cap)
    .populate('userId', 'name email')
    .lean();

  const q = String(search).trim().toLowerCase();
  if (q) {
    rows = rows.filter((t) => {
      const u = t.userId;
      const name = (u?.name || '').toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      return name.includes(q) || email.includes(q) || desc.includes(q);
    });
  }

  res.json({ transactions: rows.map(serializeAdminTransaction) });
}

export async function transactionStats(req, res) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [
    purchaseUsdAgg,
    purchaseCount,
    purchasesThisWeek,
    purchasesLastWeek,
    videoCallMinutesAgg,
    videoCallsThisWeek,
    videoCallsLastWeek,
  ] = await Promise.all([
    Transaction.aggregate([
      { $match: { type: 'purchase', status: 'completed' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$priceUsd', 0] } } } },
    ]),
    Transaction.countDocuments({ type: 'purchase', status: 'completed' }),
    Transaction.countDocuments({ type: 'purchase', status: 'completed', createdAt: { $gte: weekAgo } }),
    Transaction.countDocuments({
      type: 'purchase',
      status: 'completed',
      createdAt: { $gte: twoWeeksAgo, $lt: weekAgo },
    }),
    Transaction.aggregate([
      { $match: { type: 'videoCall', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.countDocuments({ type: 'videoCall', createdAt: { $gte: weekAgo } }),
    Transaction.countDocuments({
      type: 'videoCall',
      createdAt: { $gte: twoWeeksAgo, $lt: weekAgo },
    }),
  ]);

  const totalRevenueUsd = Math.round((purchaseUsdAgg[0]?.total ?? 0) * 100) / 100;
  const videoCallMinutes = videoCallMinutesAgg[0]?.total ?? 0;

  res.json({
    stats: {
      totalRevenueUsd,
      coinPurchases: purchaseCount,
      videoCallMinutes,
      purchasesChange: pctChangeLabel(purchasesThisWeek, purchasesLastWeek),
      videoCallsChange: pctChangeLabel(videoCallsThisWeek, videoCallsLastWeek),
    },
  });
}

export async function getSettings(req, res) {
  const settings = await getPlatformSettings();
  res.json({ settings });
}

export async function patchSettings(req, res) {
  const { coinPricing, videoCall, security, notifications } = req.body ?? {};

  const update = {};

  if (coinPricing && typeof coinPricing === 'object') {
    const fields = [
      'photoUnlock',
      'videoUnlock',
      'audioCallPerMinute',
      'videoCallPerMinute',
      'messagePriority',
      'profileBoost',
      'messageCost',
    ];
    for (const f of fields) {
      if (coinPricing[f] !== undefined) {
        const n = Number(coinPricing[f]);
        if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: `coinPricing.${f} must be a non-negative number` });
        update[`coinPricing.${f}`] = Math.floor(n);
      }
    }
  }

  if (videoCall && typeof videoCall === 'object') {
    if (videoCall.minDuration !== undefined) {
      const n = Number(videoCall.minDuration);
      if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: 'videoCall.minDuration must be a non-negative number' });
      update['videoCall.minDuration'] = Math.floor(n);
    }
    if (videoCall.maxDuration !== undefined) {
      const n = Number(videoCall.maxDuration);
      if (!Number.isFinite(n) || n < 1) return res.status(400).json({ error: 'videoCall.maxDuration must be >= 1' });
      update['videoCall.maxDuration'] = Math.floor(n);
    }
    if (videoCall.quality !== undefined) {
      if (!['sd', 'hd', 'fhd'].includes(videoCall.quality)) return res.status(400).json({ error: 'videoCall.quality must be sd, hd or fhd' });
      update['videoCall.quality'] = videoCall.quality;
    }
  }

  if (security && typeof security === 'object') {
    if (security.requireVerification !== undefined) update['security.requireVerification'] = Boolean(security.requireVerification);
    if (security.contentModeration !== undefined) update['security.contentModeration'] = Boolean(security.contentModeration);
    if (security.autoBlockReports !== undefined) {
      const n = Number(security.autoBlockReports);
      if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: 'security.autoBlockReports must be >= 0' });
      update['security.autoBlockReports'] = Math.floor(n);
    }
  }

  if (notifications && typeof notifications === 'object') {
    for (const f of ['emailAdmins', 'newUserAlerts', 'reportAlerts']) {
      if (notifications[f] !== undefined) update[`notifications.${f}`] = Boolean(notifications[f]);
    }
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  await SiteSettings.updateOne({ _id: 'global' }, { $set: update }, { upsert: true });
  invalidateSettingsCache();
  const fresh = await getPlatformSettings();
  res.json({ settings: fresh });
}
