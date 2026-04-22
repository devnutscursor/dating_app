import mongoose from 'mongoose';
import { Chat } from '../models/Chat.model.js';
import { User } from '../models/User.model.js';
import { serializeChatDoc } from '../utils/serializeChat.js';
import { emitChatUpdatedToParticipants } from '../realtime/emitChatUpdate.js';

export async function listChats(req, res) {
  const selfId = req.user._id;
  /** Threads with real messages (either side). Empty “opened” chats from Message with no sends stay hidden. */
  const chats = await Chat.find({
    participants: selfId,
    'messages.0': { $exists: true },
  })
    .populate('participants', '-password')
    .sort({ updatedAt: -1 });
  res.json({
    chats: chats.map((c) => serializeChatDoc(c, selfId)),
  });
}

export async function getChat(req, res) {
  const chat = await Chat.findOne({
    _id: req.params.chatId,
    participants: req.user._id,
  }).populate('participants', '-password');
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  const selfStr = req.user._id.toString();
  let marked = false;
  for (const m of chat.messages) {
    const sid = m.senderId?.toString?.() || String(m.senderId);
    if (sid !== selfStr && !m.isRead) {
      m.isRead = true;
      marked = true;
    }
  }
  if (marked) {
    if (chat.lastMessage) {
      const lmSender =
        chat.lastMessage.senderId?.toString?.() || String(chat.lastMessage.senderId);
      if (lmSender !== selfStr) chat.lastMessage.isRead = true;
    }
    chat.markModified('messages');
    chat.markModified('lastMessage');
    await chat.save();
  }
  res.json({ chat: serializeChatDoc(chat, req.user._id) });
}

export async function createOrGetChat(req, res) {
  const { participantId } = req.body;
  if (!participantId || !mongoose.isValidObjectId(participantId)) {
    return res.status(400).json({ error: 'Valid participantId is required' });
  }
  if (participantId === req.user._id.toString()) {
    return res.status(400).json({ error: 'Cannot chat with yourself' });
  }
  const other = await User.findById(participantId);
  if (!other || ['admin', 'moderator'].includes(other.role)) {
    return res.status(404).json({ error: 'User not found' });
  }
  const existing = await Chat.findOne({
    participants: { $all: [req.user._id, other._id], $size: 2 },
  }).populate('participants', '-password');
  if (existing) {
    return res.json({ chat: serializeChatDoc(existing, req.user._id) });
  }
  const chat = await Chat.create({
    participants: [req.user._id, other._id],
    messages: [],
    unreadCount: 0,
    isBlocked: false,
    isReported: false,
  });
  const populated = await Chat.findById(chat._id).populate('participants', '-password');
  res.status(201).json({ chat: serializeChatDoc(populated, req.user._id) });
}

export async function sendMessage(req, res) {
  const { content, type } = req.body;
  const chat = await Chat.findOne({
    _id: req.params.chatId,
    participants: req.user._id,
  });
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  const msg = {
    senderId: req.user._id,
    content: content ?? '',
    type: type && ['text', 'image', 'video', 'gift'].includes(type) ? type : 'text',
    isRead: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  chat.messages.push(msg);
  const last = chat.messages[chat.messages.length - 1];
  chat.lastMessage = {
    id: last._id.toString(),
    senderId: req.user._id,
    content: msg.content,
    type: msg.type,
    timestamp: msg.timestamp,
    isRead: false,
  };
  await chat.save();
  const populated = await Chat.findById(chat._id).populate('participants', '-password');
  const io = req.app.get('io');
  emitChatUpdatedToParticipants(io, populated);
  res.status(201).json({ chat: serializeChatDoc(populated, req.user._id) });
}
