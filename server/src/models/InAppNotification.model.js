import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: {
      type: String,
      enum: ['report_outcome', 'moderator_dm', 'system'],
      default: 'system',
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    /** Secondary line (outcome summary) rendered below `body` in the notifications UI */
    subtitle: String,
    read: { type: Boolean, default: false },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const InAppNotification = mongoose.model('InAppNotification', notificationSchema);
