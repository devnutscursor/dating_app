import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { User } from '../models/User.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { Report } from '../models/Report.model.js';
import { serializeUser } from '../utils/serializeUser.js';

const SALT_ROUNDS = 12;
const SORT_FIELDS = new Set(['name', 'coins', 'createdAt', 'role', 'isOnline', 'isBlocked']);

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

export async function listTransactions(req, res) {
  const rows = await Transaction.find().sort({ createdAt: -1 }).limit(200).lean();
  const list = rows.map((t) => ({
    id: t._id.toString(),
    userId: t.userId?.toString(),
    type: t.type,
    amount: t.amount,
    currency: t.currency,
    description: t.description,
    timestamp: t.timestamp,
    status: t.status,
    relatedUserId: t.relatedUserId?.toString(),
  }));
  res.json({ transactions: list });
}

/** Stub: persist to `SiteSettings` collection in a later phase */
export async function getSettings(req, res) {
  res.json({
    settings: {
      coinPricing: {
        photoUnlock: 10,
        videoUnlock: 50,
        videoCallPerMinute: 10,
        messagePriority: 5,
        profileBoost: 100,
        messageCost: 0,
      },
    },
  });
}

export async function patchSettings(req, res) {
  res.json({ message: 'Settings accepted (stub — wire Mongo persistence next)', body: req.body });
}
