import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['financial', 'profile', 'harassment'], required: true },
    topic: { type: String, required: true },
    comment: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
    },
    createdAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    resolvedAt: String,
    moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolution: String,
  },
  { timestamps: false }
);

export const Report = mongoose.model('Report', reportSchema);
