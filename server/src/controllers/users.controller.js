import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { Like } from '../models/Like.model.js';
import { Favorite } from '../models/Favorite.model.js';
import { MediaUnlock } from '../models/MediaUnlock.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { serializeUser } from '../utils/serializeUser.js';
import { applyPublicMediaFilter } from '../utils/mediaVisibility.js';
import { createActivity, recordProfileViewIfFresh } from '../services/activityLog.js';
import { getPlatformSettings } from '../services/siteSettings.js';

async function getUnlockedMediaIdSets(viewerId, ownerId) {
  const rows = await MediaUnlock.find({ viewerId, ownerId }).lean();
  const unlockedPhotoIds = new Set();
  const unlockedVideoIds = new Set();
  for (const row of rows) {
    const id = row.mediaId?.toString?.() || String(row.mediaId);
    if (row.mediaKind === 'photo') unlockedPhotoIds.add(id);
    else unlockedVideoIds.add(id);
  }
  return { unlockedPhotoIds, unlockedVideoIds };
}

/** One query for discover/online lists — per-owner unlock id sets. */
async function getUnlockedSetsByOwner(viewerId, ownerIds) {
  const map = new Map();
  const ids = ownerIds.map((id) => id?.toString?.()).filter(Boolean);
  for (const id of ids) {
    map.set(id, { unlockedPhotoIds: new Set(), unlockedVideoIds: new Set() });
  }
  if (ids.length === 0) return map;

  const rows = await MediaUnlock.find({
    viewerId,
    ownerId: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
  }).lean();

  for (const row of rows) {
    const ownerKey = row.ownerId?.toString?.() || String(row.ownerId);
    const entry = map.get(ownerKey) || { unlockedPhotoIds: new Set(), unlockedVideoIds: new Set() };
    const mediaId = row.mediaId?.toString?.() || String(row.mediaId);
    if (row.mediaKind === 'photo') entry.unlockedPhotoIds.add(mediaId);
    else entry.unlockedVideoIds.add(mediaId);
    map.set(ownerKey, entry);
  }
  return map;
}

function mapUserForViewer(viewerId, u, unlockByOwner, likedByMe = false, favoritedByMe = false) {
  const ownerKey = u._id?.toString?.() || String(u._id);
  const { unlockedPhotoIds, unlockedVideoIds } =
    unlockByOwner?.get(ownerKey) || { unlockedPhotoIds: new Set(), unlockedVideoIds: new Set() };
  const profile = applyPublicMediaFilter(serializeUser({ ...u, _id: u._id }), {
    isViewerOwnerOfProfile: false,
    unlockedPhotoIds,
    unlockedVideoIds,
  });
  return {
    ...profile,
    likedByMe: Boolean(likedByMe),
    favoritedByMe: Boolean(favoritedByMe),
  };
}

async function getFavoriteIdSet(fromUserId) {
  const ids = await Favorite.find({ fromUser: fromUserId }).distinct('toUser');
  return new Set(ids.map((id) => id.toString()));
}

const PUBLIC_USER_SELECT =
  '-password -email -emailVerificationOtpHash -emailVerificationOtpExpires';

export async function discover(req, res) {
  const self = req.user;
  const opposite = self.gender === 'male' ? 'female' : 'male';
  const {
    userId,
    datingGoal,
    country,
    minAge,
    maxAge,
    isOnline,
  } = req.query;

  const baseFilter = {
    gender: opposite,
    role: opposite,
    isBlocked: { $ne: true },
    profileSetupComplete: true,
  };

  if (userId && mongoose.Types.ObjectId.isValid(String(userId))) {
    const target = await User.findOne({ ...baseFilter, _id: userId }).select(PUBLIC_USER_SELECT).lean();
    if (!target) return res.json({ users: [] });
    const unlockByOwner = await getUnlockedSetsByOwner(self._id, [target._id]);
    const [likedSet, favoriteSet] = await Promise.all([
      Like.find({ fromUser: self._id, toUser: target._id }).distinct('toUser').then((ids) => new Set(ids.map(String))),
      Favorite.find({ fromUser: self._id, toUser: target._id }).distinct('toUser').then((ids) => new Set(ids.map(String))),
    ]);
    const key = target._id.toString();
    return res.json({
      users: [
        mapUserForViewer(
          self._id,
          target,
          unlockByOwner,
          likedSet.has(key),
          favoriteSet.has(key)
        ),
      ],
    });
  }

  if (datingGoal && String(datingGoal).trim()) {
    baseFilter.datingGoal = String(datingGoal).trim();
  }
  if (country && String(country).trim()) {
    baseFilter.country = String(country).trim();
  }
  const min = minAge != null && minAge !== '' ? Number(minAge) : null;
  const max = maxAge != null && maxAge !== '' ? Number(maxAge) : null;
  if (Number.isFinite(min) || Number.isFinite(max)) {
    baseFilter.age = {};
    if (Number.isFinite(min)) baseFilter.age.$gte = Math.max(18, min);
    if (Number.isFinite(max)) baseFilter.age.$lte = Math.min(120, max);
  }
  if (String(isOnline) === 'true') {
    baseFilter.isOnline = true;
  }

  const likedIds = await Like.find({ fromUser: self._id }).distinct('toUser');
  const likedSet = new Set(likedIds.map((id) => id.toString()));
  const favoriteSet = await getFavoriteIdSet(self._id);
  const users = await User.find({
    ...baseFilter,
    _id: { $ne: self._id },
  })
    .select(PUBLIC_USER_SELECT)
    .limit(60)
    .lean();
  const unlockByOwner = await getUnlockedSetsByOwner(
    self._id,
    users.map((u) => u._id)
  );
  res.json({
    users: users.map((u) => {
      const key = u._id.toString();
      return mapUserForViewer(self._id, u, unlockByOwner, likedSet.has(key), favoriteSet.has(key));
    }),
  });
}

/** Opposite-gender members who are online (for Online tab). */
export async function listOnline(req, res) {
  const self = req.user;
  const opposite = self.gender === 'male' ? 'female' : 'male';
  const likedIds = await Like.find({ fromUser: self._id }).distinct('toUser');
  const likedSet = new Set(likedIds.map((id) => id.toString()));
  const favoriteSet = await getFavoriteIdSet(self._id);
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
  const unlockByOwner = await getUnlockedSetsByOwner(
    self._id,
    users.map((u) => u._id)
  );
  res.json({
    users: users.map((u) => {
      const key = u._id.toString();
      return mapUserForViewer(self._id, u, unlockByOwner, likedSet.has(key), favoriteSet.has(key));
    }),
  });
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
  const isOwn = req.user._id.equals(user._id);
  if (isOwn) {
    return res.json({ user: data });
  }
  const { unlockedPhotoIds, unlockedVideoIds } = await getUnlockedMediaIdSets(req.user._id, user._id);
  const [liked, favorited] = await Promise.all([
    Like.exists({ fromUser: req.user._id, toUser: user._id }),
    Favorite.exists({ fromUser: req.user._id, toUser: user._id }),
  ]);
  res.json({
    user: {
      ...applyPublicMediaFilter(data, {
        isViewerOwnerOfProfile: false,
        unlockedPhotoIds,
        unlockedVideoIds,
      }),
      likedByMe: Boolean(liked),
      favoritedByMe: Boolean(favorited),
    },
  });
}

/** POST body: `{ mediaKind: 'photo'|'video', mediaId: string }` — male unlocks private media on a woman's profile */
export async function unlockMedia(req, res) {
  const ownerId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  if (req.user.gender !== 'male' || req.user.role !== 'male') {
    return res.status(403).json({ error: 'Only male members can unlock paid content' });
  }

  const { mediaKind, mediaId } = req.body ?? {};
  if (!['photo', 'video'].includes(String(mediaKind))) {
    return res.status(400).json({ error: 'mediaKind must be photo or video' });
  }
  if (!mediaId || !mongoose.Types.ObjectId.isValid(String(mediaId))) {
    return res.status(400).json({ error: 'Valid mediaId is required' });
  }

  const owner = await User.findById(ownerId);
  if (!owner || owner.gender !== 'female' || owner.role !== 'female') {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const mediaOid = new mongoose.Types.ObjectId(String(mediaId));
  const collection = mediaKind === 'photo' ? owner.photos : owner.videos;
  const item = collection.id(mediaOid);
  if (!item) {
    return res.status(404).json({ error: 'Media not found' });
  }
  if (item.status !== 'approved') {
    return res.status(400).json({ error: 'This content is not available to unlock yet' });
  }
  if (item.isPublic !== false) {
    return res.status(400).json({ error: 'This content is already public' });
  }

  const existing = await MediaUnlock.findOne({
    viewerId: req.user._id,
    ownerId: owner._id,
    mediaKind,
    mediaId: mediaOid,
  });
  if (existing) {
    const viewerFresh = await User.findById(req.user._id);
    const { unlockedPhotoIds, unlockedVideoIds } = await getUnlockedMediaIdSets(req.user._id, owner._id);
    return res.json({
      ok: true,
      alreadyUnlocked: true,
      coins: viewerFresh?.coins ?? req.user.coins,
      user: applyPublicMediaFilter(serializeUser(owner), {
        isViewerOwnerOfProfile: false,
        unlockedPhotoIds,
        unlockedVideoIds,
      }),
    });
  }

  const s = await getPlatformSettings();
  const defaultPrice = mediaKind === 'photo'
    ? (s.coinPricing?.photoUnlock ?? 100)
    : (s.coinPricing?.videoUnlock ?? 500);
  const price = Number.isFinite(item.unlockPrice) && item.unlockPrice > 0 ? Math.floor(item.unlockPrice) : defaultPrice;

  const viewer = await User.findById(req.user._id);
  if (!viewer) {
    return res.status(401).json({ error: 'User not found' });
  }
  if (viewer.coins < price) {
    return res.status(400).json({ error: 'Insufficient coins' });
  }

  viewer.coins -= price;
  owner.coins += price;
  await viewer.save();
  await owner.save();

  await MediaUnlock.create({
    viewerId: viewer._id,
    ownerId: owner._id,
    mediaKind,
    mediaId: mediaOid,
    coinsPaid: price,
  });

  const label = mediaKind === 'photo' ? 'photo' : 'video';
  await Transaction.create({
    userId: viewer._id,
    type: 'unlock',
    amount: price,
    currency: 'coins',
    description: `Unlocked private ${label} from ${owner.name}`,
    status: 'completed',
    relatedUserId: owner._id,
  });
  await Transaction.create({
    userId: owner._id,
    type: 'unlock',
    amount: price,
    currency: 'coins',
    description: `Earned from ${label} unlock by ${viewer.name}`,
    status: 'completed',
    relatedUserId: viewer._id,
  });

  const { unlockedPhotoIds, unlockedVideoIds } = await getUnlockedMediaIdSets(viewer._id, owner._id);
  const profile = applyPublicMediaFilter(serializeUser(owner), {
    isViewerOwnerOfProfile: false,
    unlockedPhotoIds,
    unlockedVideoIds,
  });

  res.json({
    ok: true,
    alreadyUnlocked: false,
    coins: viewer.coins,
    user: profile,
  });
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
      .map((l) =>
        l.fromUser
          ? applyPublicMediaFilter(serializeUser({ ...l.fromUser, _id: l.fromUser._id }), {
              isViewerOwnerOfProfile: req.user._id.equals(l.fromUser._id),
            })
          : null
      )
      .filter(Boolean);
    return res.json({ users, receivedCount, sentCount });
  }
  const likes = await Like.find({ fromUser: req.user._id })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate(populateOpts)
    .lean();
  const users = likes
    .map((l) =>
      l.toUser
        ? applyPublicMediaFilter(serializeUser({ ...l.toUser, _id: l.toUser._id }), {
            isViewerOwnerOfProfile: req.user._id.equals(l.toUser._id),
          })
        : null
    )
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
  const existing = await Like.findOne({ fromUser: req.user._id, toUser: toUserId });
  const unlike = req.body?.unlike === true;

  if (unlike) {
    if (!existing) {
      return res.json({ ok: true, liked: false });
    }
    await Like.deleteOne({ _id: existing._id });
    const owner = await User.findById(toUserId).select('likesReceivedCount').lean();
    const nextCount = Math.max(0, (owner?.likesReceivedCount ?? 0) - 1);
    await User.findByIdAndUpdate(toUserId, { $set: { likesReceivedCount: nextCount } });
    return res.json({ ok: true, liked: false });
  }

  if (existing) {
    return res.json({ ok: true, liked: true });
  }
  await Like.create({ fromUser: req.user._id, toUser: toUserId });
  await User.findByIdAndUpdate(toUserId, { $inc: { likesReceivedCount: 1 } });
  await createActivity({
    recipientId: toUserId,
    actorId: req.user._id,
    type: 'like',
  });
  res.status(201).json({ ok: true, liked: true });
}

const favoritePopulateOpts = { path: 'toUser', select: PUBLIC_USER_SELECT };

export async function listFavorites(req, res) {
  const favorites = await Favorite.find({ fromUser: req.user._id })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate(favoritePopulateOpts)
    .lean();
  const ownerIds = favorites.map((f) => f.toUser?._id).filter(Boolean);
  const unlockByOwner = await getUnlockedSetsByOwner(req.user._id, ownerIds);
  const users = favorites
    .map((f) =>
      f.toUser
        ? mapUserForViewer(req.user._id, { ...f.toUser, _id: f.toUser._id }, unlockByOwner, false, true)
        : null
    )
    .filter(Boolean);
  res.json({ users, count: users.length });
}

export async function toggleFavorite(req, res) {
  const rawId = req.body?.userId ?? req.body?.toUserId;
  if (!rawId || !mongoose.Types.ObjectId.isValid(String(rawId))) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  const toUserId = new mongoose.Types.ObjectId(String(rawId));
  if (toUserId.equals(req.user._id)) {
    return res.status(400).json({ error: 'Cannot favorite yourself' });
  }
  const target = await User.findById(toUserId);
  if (!target || ['admin', 'moderator'].includes(target.role)) {
    return res.status(404).json({ error: 'User not found' });
  }
  const expectedOpposite = req.user.gender === 'male' ? 'female' : 'male';
  if (target.gender !== expectedOpposite) {
    return res.status(400).json({ error: 'Invalid favorite target' });
  }
  const existing = await Favorite.findOne({ fromUser: req.user._id, toUser: toUserId });
  if (existing) {
    await Favorite.deleteOne({ _id: existing._id });
    return res.json({ ok: true, favorited: false });
  }
  await Favorite.create({ fromUser: req.user._id, toUser: toUserId });
  res.status(201).json({ ok: true, favorited: true });
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

function cleanPhotoEntries(input) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 40)
    .map((p) => ({
      id: typeof p.id === 'string' && mongoose.Types.ObjectId.isValid(p.id) ? p.id : null,
      url: typeof p.url === 'string' ? p.url.slice(0, 2048) : '',
      thumbnail: typeof p.thumbnail === 'string' ? p.thumbnail.slice(0, 2048) : undefined,
      isPublic: p.isPublic !== false,
      isUnlocked: Boolean(p.isUnlocked),
      unlockPrice: Number.isFinite(Number(p.unlockPrice)) ? Math.max(0, Math.floor(Number(p.unlockPrice))) : undefined,
    }))
    .filter((p) => p.url);
}

function cleanVideoEntries(input) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 40)
    .map((v) => ({
      id: typeof v.id === 'string' && mongoose.Types.ObjectId.isValid(v.id) ? v.id : null,
      url: typeof v.url === 'string' ? v.url.slice(0, 2048) : '',
      thumbnail: typeof v.thumbnail === 'string' ? v.thumbnail.slice(0, 2048) : '',
      isPublic: v.isPublic !== false,
      isUnlocked: Boolean(v.isUnlocked),
      unlockPrice: Number.isFinite(Number(v.unlockPrice)) ? Math.max(0, Math.floor(Number(v.unlockPrice))) : undefined,
      duration: Number.isFinite(Number(v.duration)) ? Number(v.duration) : undefined,
    }))
    .filter((v) => v.url && v.thumbnail);
}

function mergePhotosWithRetention(cleaned, existingPhotos, isFemaleMember, moderationEnabled = true) {
  const byId = new Map((existingPhotos || []).map((d) => [d._id.toString(), d]));
  const byUrl = new Map((existingPhotos || []).map((d) => [d.url, d]));
  return cleaned.map((c) => {
    const prev = (c.id ? byId.get(c.id) : undefined) || (c.url ? byUrl.get(c.url) : undefined);
    let status;
    if (isFemaleMember && moderationEnabled) {
      if (!prev || prev.url !== c.url) status = 'pending';
      else status = ['approved', 'pending', 'rejected'].includes(prev.status) ? prev.status : 'pending';
    } else if (!prev || prev.url !== c.url) {
      status = 'approved';
    } else status = ['approved', 'pending', 'rejected'].includes(prev.status) ? prev.status : 'approved';

    const o = {
      url: c.url,
      thumbnail: c.thumbnail,
      isPublic: c.isPublic,
      isUnlocked: c.isUnlocked,
      unlockPrice: c.unlockPrice,
      status,
    };
    if (prev?._id) o._id = prev._id;
    return o;
  });
}

function mergeVideosWithRetention(cleaned, existingVideos, isFemaleMember, moderationEnabled = true) {
  const byId = new Map((existingVideos || []).map((d) => [d._id.toString(), d]));
  const byUrl = new Map((existingVideos || []).map((d) => [d.url, d]));
  return cleaned.map((c) => {
    const prev = (c.id ? byId.get(c.id) : undefined) || (c.url ? byUrl.get(c.url) : undefined);
    let status;
    if (isFemaleMember && moderationEnabled) {
      if (!prev || prev.url !== c.url || prev.thumbnail !== c.thumbnail) status = 'pending';
      else status = ['approved', 'pending', 'rejected'].includes(prev.status) ? prev.status : 'pending';
    } else if (!prev || prev.url !== c.url) {
      status = 'approved';
    } else status = ['approved', 'pending', 'rejected'].includes(prev.status) ? prev.status : 'approved';

    const o = {
      url: c.url,
      thumbnail: c.thumbnail,
      isPublic: c.isPublic,
      isUnlocked: c.isUnlocked,
      unlockPrice: c.unlockPrice,
      duration: c.duration,
      status,
    };
    if (prev?._id) o._id = prev._id;
    return o;
  });
}

function clampStr(s, max) {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, max);
}

export async function updateMe(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isFemaleMember = user.gender === 'female' && user.role === 'female';

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
  if (updates.age !== undefined) {
    const n = Number(updates.age);
    if (!Number.isFinite(n)) delete updates.age;
    else updates.age = Math.min(120, Math.max(18, Math.floor(n)));
  }

  const photosDirty = updates.photos !== undefined;
  const videosDirty = updates.videos !== undefined;
  if (photosDirty || videosDirty) {
    const siteSettings = await getPlatformSettings();
    const moderationEnabled = siteSettings?.security?.contentModeration !== false;
    if (photosDirty) {
      user.photos = mergePhotosWithRetention(cleanPhotoEntries(updates.photos), user.photos, isFemaleMember, moderationEnabled);
      delete updates.photos;
    }
    if (videosDirty) {
      user.videos = mergeVideosWithRetention(cleanVideoEntries(updates.videos), user.videos, isFemaleMember, moderationEnabled);
      delete updates.videos;
    }
  }

  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined) user[key] = val;
  }

  await user.save();
  res.json({ user: serializeUser(user) });
}
