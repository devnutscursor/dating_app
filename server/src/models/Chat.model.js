import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    type: { type: String, enum: ['text', 'image', 'video', 'gift', 'call'], default: 'text' },
    /** If `sender_only`, only the sender sees this row (used for reporter-only confirmations). */
    visibility: {
      type: String,
      enum: ['all', 'sender_only'],
      default: 'all',
    },
    isRead: { type: Boolean, default: false },
    mediaUrl: String,
    giftAmount: Number,
    /** Optional note from the sender (gift messages only) */
    giftNote: { type: String, maxlength: 500 },
    /** Call summary messages */
    callDurationSeconds: Number,
    callCoinsTotal: Number,
    callKind: { type: String, enum: ['audio', 'video'] },
    timestamp: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const chatSchema = new mongoose.Schema(
  {
    /** Regular member↔member thread vs moderator↔member support thread */
    chatKind: {
      type: String,
      enum: ['direct', 'moderator_support'],
      default: 'direct',
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [messageSchema],
    unreadCount: { type: Number, default: 0 },
    /** Mixed: nested object uses `type` which conflicts with Mongoose path syntax unless embedded in sub-schema */
    lastMessage: { type: mongoose.Schema.Types.Mixed, default: null },
    isBlocked: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
    /** User ids who pinned this thread (per-user, Telegram-style) */
    pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

export const Chat = mongoose.model('Chat', chatSchema);
