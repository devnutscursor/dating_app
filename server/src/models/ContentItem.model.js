import mongoose from 'mongoose';

const contentItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['photo', 'video'], required: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    reviewedAt: String,
    moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
  },
  { timestamps: false }
);

export const ContentItem = mongoose.model('ContentItem', contentItemSchema);
