import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
favoriteSchema.index({ fromUser: 1, createdAt: -1 });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
