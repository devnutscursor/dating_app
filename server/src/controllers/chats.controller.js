import mongoose from 'mongoose';
import { Chat } from '../models/Chat.model.js';
import { User } from '../models/User.model.js';
import { Report } from '../models/Report.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { serializeChatDoc, isMessageVisibleToViewer } from '../utils/serializeChat.js';
import { emitChatUpdatedToParticipants } from '../realtime/emitChatUpdate.js';
import { createActivity } from '../services/activityLog.js';
import { createInAppNotification } from '../services/inAppNotifications.js';

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
  if (chat.isBlocked) {
    return res.status(403).json({ error: 'This conversation has been blocked' });
  }
  if (chat.chatKind === 'moderator_support') {
    return res.status(400).json({ error: 'Gifts are not available in moderation chats' });
  }
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
  const chats = await Chat.find({
    participants: selfId,
    isBlocked: { $ne: true },
    $or: [{ 'messages.0': { $exists: true } }, { chatKind: 'moderator_support' }],
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
  if (chat.isBlocked) {
    return res.status(403).json({ error: 'This conversation has been blocked' });
  }
  const selfStr = req.user._id.toString();
  let marked = false;
  for (const m of chat.messages) {
    if (!isMessageVisibleToViewer(m, selfStr)) continue;
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
    chatKind: 'direct',
    participants: { $all: [req.user._id, other._id], $size: 2 },
  }).populate('participants', '-password');
  if (existing) {
    if (existing.isBlocked) {
      return res.status(400).json({ error: 'This chat is blocked' });
    }
    return res.json({ chat: serializeChatDoc(existing, req.user._id) });
  }
  const chat = await Chat.create({
    participants: [req.user._id, other._id],
    messages: [],
    chatKind: 'direct',
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
  if (chat.isBlocked) {
    return res.status(403).json({ error: 'This conversation has been blocked' });
  }
  const msgType = type && ['text', 'image', 'video', 'gift'].includes(type) ? type : 'text';

  if (chat.chatKind === 'moderator_support' && (msgType === 'gift')) {
    return res.status(400).json({
      error: 'Gifts are not available in moderation chats',
    });
  }

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

  const wasEmptyBeforeSend = chat.messages.length === 0;

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

  if (
    chat.chatKind === 'moderator_support' &&
    req.user.role === 'moderator' &&
    wasEmptyBeforeSend &&
    io
  ) {
    const other = otherParticipantId(chat, req.user._id);
    if (other) {
      const trimmed = typeof content === 'string' ? content.trim() : '';
      let body = trimmed
        ? trimmed.slice(0, 280)
        : msgType === 'image'
          ? 'Moderation sent a photo.'
          : msgType === 'video'
            ? 'Moderation sent a video.'
            : 'You have a new message from the moderation team.';
      await createInAppNotification(io, {
        userId: other,
        kind: 'moderator_dm',
        title: 'Message from moderation',
        body,
      });
    }
  }

  emitChatUpdatedToParticipants(io, populated);
  res.status(201).json({ chat: serializeChatDoc(populated, req.user._id) });
}

const REPORT_TYPES = new Set(['financial', 'profile', 'harassment']);

export async function blockChat(req, res) {
  const chat = await Chat.findOne({
    _id: req.params.chatId,
    participants: req.user._id,
  });
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  if (chat.chatKind === 'moderator_support') {
    return res.status(400).json({ error: 'Moderation chats cannot be blocked' });
  }
  if (chat.isBlocked) {
    const populated = await Chat.findById(chat._id).populate('participants', '-password');
    return res.json({ ok: true, alreadyBlocked: true, chat: serializeChatDoc(populated, req.user._id) });
  }
  chat.isBlocked = true;
  await chat.save();
  const populated = await Chat.findById(chat._id).populate('participants', '-password');
  const io = req.app.get('io');
  emitChatUpdatedToParticipants(io, populated);
  return res.json({ ok: true, chat: serializeChatDoc(populated, req.user._id) });
}

export async function reportUserInChat(req, res) {
  const { type, topic, comment } = req.body ?? {};
  if (!REPORT_TYPES.has(String(type))) {
    return res.status(400).json({ error: 'Invalid report type' });
  }
  const topicStr = typeof topic === 'string' ? topic.trim() : '';
  const commentStr = typeof comment === 'string' ? comment.trim() : '';
  if (!topicStr) {
    return res.status(400).json({ error: 'Topic is required' });
  }
  if (!commentStr) {
    return res.status(400).json({ error: 'Comment is required' });
  }

  const chat = await Chat.findOne({
    _id: req.params.chatId,
    participants: req.user._id,
  });
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  if (chat.isBlocked) {
    return res.status(403).json({ error: 'This conversation has been blocked' });
  }
  if (chat.chatKind === 'moderator_support') {
    return res.status(400).json({
      error: 'You cannot file a dating report from a moderation conversation',
    });
  }

  const reportedId = otherParticipantId(chat, req.user._id);
  if (!reportedId) {
    return res.status(400).json({ error: 'Invalid chat participants' });
  }
  const target = await User.findById(reportedId).select('role name');
  if (!target || ['admin', 'moderator'].includes(target.role)) {
    return res.status(400).json({ error: 'Cannot report this user' });
  }

  await Report.create({
    reporterId: req.user._id,
    reportedId,
    relatedChatId: chat._id,
    type,
    topic: topicStr.slice(0, 200),
    comment: commentStr.slice(0, 5000),
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10),
  });

  const reportedName = target.name?.trim() || 'this member';
  const summaryComment = commentStr.length > 800 ? `${commentStr.slice(0, 797)}…` : commentStr;
  const ackLines = [
    `You reported ${reportedName} to MemberDate moderation.`,
    `Category: ${String(type)}. Subject: ${topicStr}.`,
    `Details you submitted: ${summaryComment}`,
  ];
  chat.messages.push({
    senderId: req.user._id,
    content: ackLines.join('\n\n'),
    type: 'text',
    visibility: 'sender_only',
    isRead: true,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  if (!chat.isReported) {
    chat.isReported = true;
  }
  chat.markModified('messages');
  await chat.save();

  const populated = await Chat.findById(chat._id).populate('participants', '-password');
  const io = req.app.get('io');
  emitChatUpdatedToParticipants(io, populated);
  return res.status(201).json({ ok: true, chat: serializeChatDoc(populated, req.user._id) });
}
