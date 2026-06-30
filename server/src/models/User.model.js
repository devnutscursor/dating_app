import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    thumbnail: String,
    isPublic: { type: Boolean, default: true },
    unlockPrice: Number,
    isUnlocked: { type: Boolean, default: false },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
  },
  { _id: true }
);

const videoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    thumbnail: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    unlockPrice: Number,
    isUnlocked: { type: Boolean, default: false },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    duration: Number,
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['male', 'female', 'admin', 'moderator'],
      required: true,
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationOtpHash: { type: String, select: false },
    emailVerificationOtpExpires: Date,
    passwordResetOtpHash: { type: String, select: false },
    passwordResetOtpExpires: Date,
    profileSetupComplete: { type: Boolean, default: false },

    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 18, max: 120, default: 25 },
    gender: { type: String, enum: ['male', 'female'], required: true },
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    datingGoal: { type: String, default: '' },
    aboutMe: { type: String, default: '' },
    lookingFor: { type: String, default: '' },
    interests: [{ type: String }],
    profilePicture: String,
    photos: [photoSchema],
    videos: [videoSchema],
    coins: { type: Number, default: 0 },
    /** Saved USDT TRC20 address for withdrawals (women) */
    usdtWalletAddress: { type: String, default: '' },
    likesReceivedCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    /** Set when moderated account suspension applies (distinct from informal “blocked chats”) */
    platformSuspendedReason: { type: String, default: '' },
    platformSuspendedAt: Date,
    platformSuspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isOnline: { type: Boolean, default: false },
    lastActive: String,
  },
  { timestamps: true }
);

userSchema.index({ gender: 1, isOnline: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model('User', userSchema);
