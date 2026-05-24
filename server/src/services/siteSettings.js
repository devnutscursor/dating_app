import { SiteSettings } from '../models/SiteSettings.model.js';

/** In-memory cache so hot paths (billing, unlock) don't hit DB every request. */
let _cache = null;

const DEFAULTS = {
  coinPricing: {
    photoUnlock: 100,
    videoUnlock: 500,
    audioCallPerMinute: 5,
    videoCallPerMinute: 10,
    messagePriority: 5,
    profileBoost: 100,
    messageCost: 0,
  },
  videoCall: { minDuration: 1, maxDuration: 120, quality: 'hd' },
  security: { requireVerification: false, autoBlockReports: 0, contentModeration: true },
  notifications: { emailAdmins: false, newUserAlerts: false, reportAlerts: false },
};

/**
 * Upsert the global settings document once on startup (so defaults are
 * persisted and visible in the admin panel immediately).
 */
export async function ensureDefaultSettings() {
  await SiteSettings.updateOne(
    { _id: 'global' },
    { $setOnInsert: DEFAULTS },
    { upsert: true }
  );
}

function toPlain(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
}

/** Returns cached settings object. Loads from DB on first call. */
export async function getPlatformSettings() {
  if (_cache) return _cache;
  const doc = await SiteSettings.findById('global');
  _cache = doc ? toPlain(doc) : { _id: 'global', ...DEFAULTS };
  return _cache;
}

/** Invalidate in-memory cache (call after PATCH). */
export function invalidateSettingsCache() {
  _cache = null;
}
