import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'global' },
    coinPricing: {
      photoUnlock: { type: Number, default: 100 },
      videoUnlock: { type: Number, default: 500 },
      audioCallPerMinute: { type: Number, default: 5 },
      videoCallPerMinute: { type: Number, default: 10 },
      messagePriority: { type: Number, default: 5 },
      profileBoost: { type: Number, default: 100 },
      messageCost: { type: Number, default: 0 },
    },
    videoCall: {
      minDuration: { type: Number, default: 1 },
      maxDuration: { type: Number, default: 120 },
      quality: { type: String, enum: ['sd', 'hd', 'fhd'], default: 'hd' },
    },
    security: {
      requireVerification: { type: Boolean, default: true },
      autoBlockReports: { type: Number, default: 0 },
      contentModeration: { type: Boolean, default: true },
    },
    notifications: {
      emailAdmins: { type: Boolean, default: false },
      newUserAlerts: { type: Boolean, default: false },
      reportAlerts: { type: Boolean, default: false },
    },
  },
  { _id: false, timestamps: true }
);

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
