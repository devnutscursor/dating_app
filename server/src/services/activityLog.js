import { Activity } from '../models/Activity.model.js';

export const VIEW_DEDUPE_MS = 6 * 60 * 60 * 1000;

export function viewBucketForTimestamp(ts = Date.now()) {
  return Math.floor(Number(ts) / VIEW_DEDUPE_MS);
}

/**
 * Log something that appears in `recipientId`'s Activity feed (actor did the action).
 */
export async function createActivity({ recipientId, actorId, type, details, giftAmount }) {
  try {
    await Activity.create({
      recipientId,
      actorId,
      type,
      details: typeof details === 'string' ? details.slice(0, 500) : '',
      giftAmount: Number.isFinite(giftAmount) ? giftAmount : undefined,
    });
  } catch (err) {
    console.error('createActivity', err);
  }
}

function isDuplicateKeyError(err) {
  return Boolean(err && (err.code === 11000 || err.code === 11001));
}

/**
 * One profile-view row per (viewer, profile owner) per time bucket.
 * Uses a partial unique index so parallel GET /users/:id (e.g. React Strict Mode) cannot insert twice.
 */
export async function recordProfileViewIfFresh(actorId, profileOwnerId) {
  try {
    if (!actorId || !profileOwnerId || actorId.equals(profileOwnerId)) return;
    const viewBucket = viewBucketForTimestamp();
    await Activity.create({
      recipientId: profileOwnerId,
      actorId,
      type: 'view',
      viewBucket,
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) return;
    console.error('recordProfileViewIfFresh', err);
  }
}
