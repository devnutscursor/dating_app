import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    type: { type: String, enum: ['text', 'image', 'video', 'gift'], default: 'text' },
    isRead: { type: Boolean, default: false },
    mediaUrl: String,
    giftAmount: Number,
    timestamp: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [messageSchema],
    unreadCount: { type: Number, default: 0 },
    /** Mixed: nested object uses `type` which conflicts with Mongoose path syntax unless embedded in sub-schema */
    lastMessage: { type: mongoose.Schema.Types.Mixed, default: null },
    isBlocked: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

export const Chat = mongoose.model('Chat', chatSchema);
