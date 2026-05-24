import mongoose from 'mongoose';

const payoutRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amountCoins: { type: Number, required: true, min: 1 },
    feeCoins: { type: Number, required: true, default: 0 },
    walletAddress: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    /** Linked ledger row (type payout) for history */
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    adminNote: { type: String, default: '' },
    processedAt: Date,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

payoutRequestSchema.index({ userId: 1, status: 1 });

export const PayoutRequest = mongoose.model('PayoutRequest', payoutRequestSchema);
