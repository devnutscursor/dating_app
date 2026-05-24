import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['purchase', 'unlock', 'tip', 'videoCall', 'payout', 'gift'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['coins', 'usd'], default: 'coins' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    /** NOWPayments / checkout */
    orderId: { type: String, index: true },
    packId: String,
    priceUsd: Number,
    nowPaymentId: String,
    nowPaymentStatus: String,
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1 });
transactionSchema.index({ orderId: 1 }, { unique: true, sparse: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
