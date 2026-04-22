import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

likeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
likeSchema.index({ toUser: 1, createdAt: -1 });
likeSchema.index({ fromUser: 1, createdAt: -1 });

export const Like = mongoose.model('Like', likeSchema);
