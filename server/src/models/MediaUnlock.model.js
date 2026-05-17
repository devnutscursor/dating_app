import mongoose from 'mongoose';

/** Records which member unlocked a specific private photo/video on another member's profile. */
const mediaUnlockSchema = new mongoose.Schema(
  {
    viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaKind: { type: String, enum: ['photo', 'video'], required: true },
    mediaId: { type: mongoose.Schema.Types.ObjectId, required: true },
    coinsPaid: { type: Number, required: true },
  },
  { timestamps: true }
);

mediaUnlockSchema.index({ viewerId: 1, ownerId: 1, mediaKind: 1, mediaId: 1 }, { unique: true });

export const MediaUnlock = mongoose.model('MediaUnlock', mediaUnlockSchema);
