import mongoose from 'mongoose';
import { Chat } from '../models/Chat.model.js';
import { User } from '../models/User.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { serializeChatDoc } from '../utils/serializeChat.js';
import { emitChatUpdatedToParticipants } from '../realtime/emitChatUpdate.js';
import { createActivity } from '../services/activityLog.js';

function otherParticipantId(chat, selfId) {
  const selfStr = selfId.toString();
  const other = (chat.participants || []).find((p) => p.toString() !== selfStr);
  return other || null;
}

/**
 * Debit sender, credit recipient, persist gift message + ledger rows.
 * Uses compensating updates (no multi-doc transaction) so it works on standalone MongoDB.
 */
async function persistGiftMessage(req, res, chat, amt, giftLabel) {
  const recipientId = otherParticipantId(chat, req.user._id);
  if (!recipientId) {
    return res.status(400).json({ error: 'Invalid chat participants' });
  }
  const recipient = await User.findById(recipientId).select('_id gender role name');
  if (!recipient || recipient.gender !== 'female' || ['admin', 'moderator'].includes(recipient.role)) {
    return res.status(400).json({ error: 'Gifts can only be sent to women on the platform' });
  }

  const senderName = req.user.name || 'Member';
  const recipientName = recipient.name || 'Member';
  const label = typeof giftLabel === 'string' && giftLabel.trim() ? giftLabel.trim() : 'Gift';

  const msg = {
    senderId: req.user._id,
    content: label,
    type: 'gift',
    isRead: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    giftAmount: amt,
  };

  let debitDone = false;
  let creditDone = false;
  let chatSaved = false;
  try {
    const senderAfter = await User.findOneAndUpdate(
      { _id: req.user._id, coins: { $gte: amt } },
      { $inc: { coins: -amt } },
      { new: true }
    );
    if (!senderAfter) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }
    debitDone = true;

    await User.findByIdAndUpdate(recipientId, { $inc: { coins: amt } });
    creditDone = true;

    chat.messages.push(msg);
    const last = chat.messages[chat.messages.length - 1];
    chat.lastMessage = {
      id: last._id.toString(),
      senderId: req.user._id,
      content: msg.content,
      type: msg.type,
      timestamp: msg.timestamp,
      isRead: false,
      giftAmount: msg.giftAmount,
    };
    await chat.save();
    chatSaved = true;

    const ts = new Date().toISOString().slice(0, 10);
    try {
      await Transaction.create([
        {
          userId: req.user._id,
          type: 'gift',
          amount: amt,
          currency: 'coins',
          description: `${label} → ${recipientName}`,
          status: 'completed',
          relatedUserId: recipientId,
          timestamp: ts,
        },
        {
          userId: recipientId,
          type: 'gift',
          amount: amt,
          currency: 'coins',
          description: `${label} from ${senderName}`,
          status: 'completed',
          relatedUserId: req.user._id,
          timestamp: ts,
        },
      ]);
    } catch (ledgerErr) {
      console.error('Gift transaction ledger failed', ledgerErr);
    }

    await createActivity({
      recipientId,
      actorId: req.user._id,
      type: 'gift',
      giftAmount: amt,
      details: '',
    });

    const populated = await Chat.findById(chat._id).populate('participants', '-password');
    const io = req.app.get('io');
    emitChatUpdatedToParticipants(io, populated);
    return res.status(201).json({
      chat: serializeChatDoc(populated, req.user._id),
      coins: senderAfter.coins,
    });
  } catch (err) {
    if (!chatSaved && creditDone) {
      await User.findByIdAndUpdate(recipientId, { $inc: { coins: -amt } }).catch(() => {});
    }
    if (!chatSaved && debitDone) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { coins: amt } }).catch(() => {});
    }
    console.error('persistGiftMessage', err);
    return res.status(500).json({ error: 'Could not send gift' });
  }
}

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
  const { content, type, mediaUrl, giftAmount } = req.body;
  const chat = await Chat.findOne({
    _id: req.params.chatId,
    participants: req.user._id,
  });
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  const msgType = type && ['text', 'image', 'video', 'gift'].includes(type) ? type : 'text';

  if (msgType === 'image' || msgType === 'video') {
    if (!mediaUrl || typeof mediaUrl !== 'string' || !/^https?:\/\//i.test(mediaUrl.trim())) {
      return res.status(400).json({ error: 'A valid mediaUrl is required for photo or video messages' });
    }
  }
  if (msgType === 'gift') {
    if (req.user.gender !== 'male') {
      return res.status(403).json({ error: 'Only men can send gifts' });
    }
    const amt = Number(giftAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: 'A valid giftAmount is required for gift messages' });
    }
    return persistGiftMessage(req, res, chat, amt, content);
  }

  const msg = {
    senderId: req.user._id,
    content: typeof content === 'string' ? content : '',
    type: msgType,
    isRead: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  if (msgType === 'image' || msgType === 'video') {
    msg.mediaUrl = String(mediaUrl).trim();
  }

  chat.messages.push(msg);
  const last = chat.messages[chat.messages.length - 1];
  chat.lastMessage = {
    id: last._id.toString(),
    senderId: req.user._id,
    content: msg.content,
    type: msg.type,
    timestamp: msg.timestamp,
    isRead: false,
    mediaUrl: msg.mediaUrl,
    giftAmount: msg.giftAmount,
  };
  await chat.save();
  const populated = await Chat.findById(chat._id).populate('participants', '-password');
  const io = req.app.get('io');
  emitChatUpdatedToParticipants(io, populated);
  res.status(201).json({ chat: serializeChatDoc(populated, req.user._id) });
}
