import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['like', 'view', 'gift', 'message'],
      required: true,
    },
    /** Extra copy for gifts, etc. */
    details: { type: String, default: '' },
    giftAmount: { type: Number },
    /**
     * Only for `type: 'view'`. `Math.floor(Date.now() / VIEW_DEDUPE_MS)` so concurrent profile GETs
     * dedupe via a partial unique index (React Strict Mode double-fetch, etc.).
     */
    viewBucket: { type: Number },
  },
  { timestamps: true }
);

activitySchema.index({ recipientId: 1, createdAt: -1 });
activitySchema.index({ recipientId: 1, actorId: 1, type: 1, createdAt: -1 });
activitySchema.index(
  { recipientId: 1, actorId: 1, type: 1, viewBucket: 1 },
  { unique: true, partialFilterExpression: { type: 'view', viewBucket: { $exists: true, $type: 'number' } } }
);

export const Activity = mongoose.model('Activity', activitySchema);
