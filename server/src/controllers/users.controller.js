import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { Like } from '../models/Like.model.js';
import { serializeUser } from '../utils/serializeUser.js';
import { createActivity, recordProfileViewIfFresh } from '../services/activityLog.js';

const PUBLIC_USER_SELECT =
  '-password -email -emailVerificationOtpHash -emailVerificationOtpExpires';

export async function discover(req, res) {
  const self = req.user;
  const opposite = self.gender === 'male' ? 'female' : 'male';
  const likedIds = await Like.find({ fromUser: self._id }).distinct('toUser');
  const users = await User.find({
    gender: opposite,
    role: opposite,
    _id: { $ne: self._id, $nin: likedIds },
    isBlocked: { $ne: true },
    profileSetupComplete: true,
  })
    .select(PUBLIC_USER_SELECT)
    .limit(60)
    .lean();
  res.json({ users: users.map((u) => serializeUser({ ...u, _id: u._id })) });
}

/** Opposite-gender members who are online (for Online tab). */
export async function listOnline(req, res) {
  const self = req.user;
  const opposite = self.gender === 'male' ? 'female' : 'male';
  const users = await User.find({
    gender: opposite,
    role: opposite,
    _id: { $ne: self._id },
    isBlocked: { $ne: true },
    profileSetupComplete: true,
    isOnline: true,
  })
    .select(PUBLIC_USER_SELECT)
    .limit(60)
    .lean();
  res.json({ users: users.map((u) => serializeUser({ ...u, _id: u._id })) });
}

export async function getUserById(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: 'User not found' });
  }
  const user = await User.findById(req.params.id).select(PUBLIC_USER_SELECT);
  if (!user || ['admin', 'moderator'].includes(user.role)) {
    return res.status(404).json({ error: 'User not found' });
  }
  const expectedOpposite = req.user.gender === 'male' ? 'female' : 'male';
  if (
    !req.user._id.equals(user._id) &&
    user.gender === expectedOpposite &&
    !['admin', 'moderator'].includes(req.user.role)
  ) {
    void recordProfileViewIfFresh(req.user._id, user._id);
  }
  const data = serializeUser(user);
  if (data?.email !== undefined) delete data.email;
  res.json({ user: data });
}

export async function listLikes(req, res) {
  const tab = req.query.tab === 'sent' ? 'sent' : 'received';
  const [receivedCount, sentCount] = await Promise.all([
    Like.countDocuments({ toUser: req.user._id }),
    Like.countDocuments({ fromUser: req.user._id }),
  ]);
  const populateOpts = {
    path: tab === 'received' ? 'fromUser' : 'toUser',
    model: 'User',
    match: { role: { $nin: ['admin', 'moderator'] } },
    select: PUBLIC_USER_SELECT,
  };
  if (tab === 'received') {
    const likes = await Like.find({ toUser: req.user._id })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate(populateOpts)
      .lean();
    const users = likes
      .map((l) => (l.fromUser ? serializeUser({ ...l.fromUser, _id: l.fromUser._id }) : null))
      .filter(Boolean);
    return res.json({ users, receivedCount, sentCount });
  }
  const likes = await Like.find({ fromUser: req.user._id })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate(populateOpts)
    .lean();
  const users = likes
    .map((l) => (l.toUser ? serializeUser({ ...l.toUser, _id: l.toUser._id }) : null))
    .filter(Boolean);
  res.json({ users, receivedCount, sentCount });
}

export async function createLike(req, res) {
  const rawId = req.body?.userId ?? req.body?.toUserId;
  if (!rawId || !mongoose.Types.ObjectId.isValid(String(rawId))) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  const toUserId = new mongoose.Types.ObjectId(String(rawId));
  if (toUserId.equals(req.user._id)) {
    return res.status(400).json({ error: 'Cannot like yourself' });
  }
  const target = await User.findById(toUserId);
  if (!target || ['admin', 'moderator'].includes(target.role)) {
    return res.status(404).json({ error: 'User not found' });
  }
  const expectedOpposite = req.user.gender === 'male' ? 'female' : 'male';
  if (target.gender !== expectedOpposite) {
    return res.status(400).json({ error: 'Invalid like target' });
  }
  const dup = await Like.findOne({ fromUser: req.user._id, toUser: toUserId });
  if (dup) {
    return res.json({ ok: true, alreadyLiked: true });
  }
  await Like.create({ fromUser: req.user._id, toUser: toUserId });
  await User.findByIdAndUpdate(toUserId, { $inc: { likesReceivedCount: 1 } });
  await createActivity({
    recipientId: toUserId,
    actorId: req.user._id,
    type: 'like',
  });
  res.status(201).json({ ok: true, alreadyLiked: false });
}

const allowedProfileFields = [
  'name',
  'age',
  'country',
  'city',
  'datingGoal',
  'aboutMe',
  'lookingFor',
  'interests',
  'profilePicture',
  'photos',
  'videos',
  'profileSetupComplete',
];

function sanitizeInterests(input) {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map((i) => String(i).trim().slice(0, 80)).filter(Boolean))].slice(0, 50);
}

function sanitizePhotos(input) {
  if (!Array.isArray(input)) return undefined;
  return input
    .slice(0, 40)
    .map((p) => ({
      url: typeof p.url === 'string' ? p.url.slice(0, 2048) : '',
      thumbnail: typeof p.thumbnail === 'string' ? p.thumbnail.slice(0, 2048) : undefined,
      isPublic: p.isPublic !== false,
      isUnlocked: Boolean(p.isUnlocked),
      unlockPrice: Number.isFinite(p.unlockPrice) ? Math.max(0, Math.floor(p.unlockPrice)) : undefined,
      status: ['approved', 'pending', 'rejected'].includes(p.status) ? p.status : 'approved',
    }))
    .filter((p) => p.url);
}

function sanitizeVideos(input) {
  if (!Array.isArray(input)) return undefined;
  return input
    .slice(0, 40)
    .map((v) => ({
      url: typeof v.url === 'string' ? v.url.slice(0, 2048) : '',
      thumbnail: typeof v.thumbnail === 'string' ? v.thumbnail.slice(0, 2048) : '',
      isPublic: v.isPublic !== false,
      isUnlocked: Boolean(v.isUnlocked),
      unlockPrice: Number.isFinite(v.unlockPrice) ? Math.max(0, Math.floor(v.unlockPrice)) : undefined,
      status: ['approved', 'pending', 'rejected'].includes(v.status) ? v.status : 'approved',
      duration: Number.isFinite(v.duration) ? v.duration : undefined,
    }))
    .filter((v) => v.url && v.thumbnail);
}

function clampStr(s, max) {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, max);
}

export async function updateMe(req, res) {
  const updates = {};
  for (const key of allowedProfileFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (updates.aboutMe !== undefined) updates.aboutMe = clampStr(updates.aboutMe, 5000);
  if (updates.lookingFor !== undefined) updates.lookingFor = clampStr(updates.lookingFor, 5000);
  if (updates.name !== undefined) updates.name = clampStr(updates.name, 120);
  if (updates.country !== undefined) updates.country = clampStr(updates.country, 80);
  if (updates.city !== undefined) updates.city = clampStr(updates.city, 120);
  if (updates.datingGoal !== undefined) updates.datingGoal = clampStr(updates.datingGoal, 120);
  if (updates.profilePicture !== undefined) {
    updates.profilePicture = updates.profilePicture ? String(updates.profilePicture).slice(0, 2048) : '';
  }
  if (updates.interests !== undefined) updates.interests = sanitizeInterests(updates.interests);
  if (updates.photos !== undefined) updates.photos = sanitizePhotos(updates.photos);
  if (updates.videos !== undefined) updates.videos = sanitizeVideos(updates.videos);
  if (updates.age !== undefined) {
    const n = Number(updates.age);
    if (!Number.isFinite(n)) delete updates.age;
    else updates.age = Math.min(120, Math.max(18, Math.floor(n)));
  }

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  res.json({ user: serializeUser(user) });
}
