import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userDisplayName: String,
    profilePhotoUrl: String,
    videoUrl: String,
    challengeNumbers: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);
