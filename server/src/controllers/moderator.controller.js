import mongoose from 'mongoose';
import { Report } from '../models/Report.model.js';
import { VerificationRequest } from '../models/VerificationRequest.model.js';
import { Chat } from '../models/Chat.model.js';
import { User } from '../models/User.model.js';
import { serializeChatDoc, serializeMessage } from '../utils/serializeChat.js';
import { createInAppNotification } from '../services/inAppNotifications.js';
import { countPendingFemaleMedia } from '../utils/countPendingFemaleMedia.js';

function mapReportLean(r) {
  const rep = r.reporterId;
  const rpd = r.reportedId;
  const reporterName =
    rep && typeof rep === 'object' && rep.name ? String(rep.name) : 'Unknown user';
  const reportedName =
    rpd && typeof rpd === 'object' && rpd.name ? String(rpd.name) : 'Unknown user';
  const reporterId =
    rep && typeof rep === 'object' && rep._id ? rep._id.toString() : rep?.toString?.() ?? '';
  const reportedId =
    rpd && typeof rpd === 'object' && rpd._id ? rpd._id.toString() : rpd?.toString?.() ?? '';
  const reporterIsSuspended =
    rep && typeof rep === 'object' && 'isBlocked' in rep ? Boolean(rep.isBlocked) : false;
  const reportedIsSuspended =
    rpd && typeof rpd === 'object' && 'isBlocked' in rpd ? Boolean(rpd.isBlocked) : false;
  return {
    id: r._id.toString(),
    relatedChatId: r.relatedChatId ? r.relatedChatId.toString?.() ?? String(r.relatedChatId) : undefined,
    reporterId,
    reportedId,
    reporterName,
    reportedName,
    reporterIsSuspended,
    reportedIsSuspended,
    type: r.type,
    topic: r.topic,
    comment: r.comment,
    status: r.status,
    createdAt: r.createdAt,
    resolvedAt: r.resolvedAt,
    moderatorId: r.moderatorId?.toString?.(),
    resolution: r.resolution,
  };
}

function mapVerification(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    userId: o.userId?.toString(),
    userDisplayName: o.userDisplayName,
    profilePhotoUrl: o.profilePhotoUrl,
    videoUrl: o.videoUrl,
    challengeNumbers: o.challengeNumbers,
    status: o.status,
    submittedAt: o.submittedAt,
  };
}

export async function listContent(req, res) {
  const females = await User.find({ gender: 'female', role: 'female' })
    .select('name photos videos')
    .limit(500)
    .lean();

  const items = [];
  for (const u of females) {
    const uid = u._id.toString();
    for (const p of u.photos || []) {
      if (p.status !== 'pending') continue;
      items.push({
        id: `${uid}:${p._id.toString()}`,
        userId: uid,
        memberName: String(u.name || 'Member').slice(0, 120),
        mediaKind: 'photo',
        mediaId: p._id.toString(),
        url: p.url,
        thumbnail: p.thumbnail || p.url,
        isPublic: p.isPublic !== false,
        unlockPrice: p.unlockPrice != null ? p.unlockPrice : undefined,
      });
    }
    for (const v of u.videos || []) {
      if (v.status !== 'pending') continue;
      items.push({
        id: `${uid}:${v._id.toString()}`,
        userId: uid,
        memberName: String(u.name || 'Member').slice(0, 120),
        mediaKind: 'video',
        mediaId: v._id.toString(),
        url: v.url,
        thumbnail: v.thumbnail,
        isPublic: v.isPublic !== false,
        unlockPrice: v.unlockPrice != null ? v.unlockPrice : undefined,
      });
    }
  }
  items.sort((a, b) => String(b.mediaId).localeCompare(String(a.mediaId)));
  res.json({ items: items.slice(0, 200) });
}

export async function reviewFemaleMedia(req, res) {
  const { userId, mediaKind, mediaId, decision, rejectionReason } = req.body ?? {};
  if (!['photo', 'video'].includes(String(mediaKind))) {
    return res.status(400).json({ error: 'mediaKind must be photo or video' });
  }
  if (!['approved', 'rejected'].includes(String(decision))) {
    return res.status(400).json({ error: 'decision must be approved or rejected' });
  }
  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  if (!mediaId || !mongoose.Types.ObjectId.isValid(String(mediaId))) {
    return res.status(400).json({ error: 'Invalid mediaId' });
  }

  const user = await User.findById(userId);
  if (!user || user.gender !== 'female' || user.role !== 'female') {
    return res.status(404).json({ error: 'Member not found' });
  }

  const arr = mediaKind === 'photo' ? user.photos : user.videos;
  const sub = arr.id(mediaId);
  if (!sub) {
    return res.status(404).json({ error: 'Media not found' });
  }
  if (sub.status !== 'pending') {
    return res.status(400).json({ error: 'This item is not pending review' });
  }

  sub.status = decision;
  await user.save();

  const io = req.app.get('io');
  const rejection =
    rejectionReason != null && String(rejectionReason).trim()
      ? ` ${String(rejectionReason).trim().slice(0, 280)}`
      : '';
  if (decision === 'approved') {
    await createInAppNotification(io, {
      userId: user._id,
      kind: 'system',
      title: 'Content approved',
      body: 'Your photo or video passed review and is visible to others according to your privacy settings.',
    });
  } else {
    await createInAppNotification(io, {
      userId: user._id,
      kind: 'system',
      title: 'Content not approved',
      body:
        `That upload didn't meet our community guidelines.${rejection} You can upload a replacement from your profile.`.slice(
          0,
          1900
        ),
    });
  }

  res.json({ ok: true });
}

export async function listReports(req, res) {
  const items = await Report.find()
    .sort({ _id: -1 })
    .limit(100)
    .populate('reporterId', 'name isBlocked')
    .populate('reportedId', 'name isBlocked')
    .lean();
  res.json({ reports: items.map(mapReportLean) });
}

/** Read-only messages between the reporter and the reported user (the dating chat). */
export async function getReportTranscript(req, res) {
  const { reportId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    return res.status(400).json({ error: 'Invalid report id' });
  }
  const report = await Report.findById(reportId).lean();
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  let chatDoc = null;
  if (report.relatedChatId) {
    chatDoc = await Chat.findById(report.relatedChatId)
      .populate('participants', 'name profilePicture')
      .lean();
  }
  if (!chatDoc) {
    chatDoc = await Chat.findOne({
      chatKind: 'direct',
      participants: { $all: [report.reporterId, report.reportedId], $size: 2 },
    })
      .populate('participants', 'name profilePicture')
      .lean();
  }

  if (!chatDoc) {
    return res.json({ transcript: null, reason: 'no_thread' });
  }

  const nameById = {};
  for (const p of chatDoc.participants || []) {
    nameById[p._id.toString()] = p.name || 'User';
  }
  const messages = (chatDoc.messages || []).map((m) => {
    const sm = serializeMessage(m);
    return {
      ...sm,
      senderName: nameById[sm.senderId] || 'User',
    };
  });

  res.json({
    transcript: {
      chatId: chatDoc._id.toString(),
      messages,
      participants: (chatDoc.participants || []).map((p) => ({
        id: p._id.toString(),
        name: p.name,
        profilePicture: p.profilePicture,
      })),
    },
  });
}

/** Open (or reuse) a moderator_support thread with one party on the report. */
export async function openReportSupportThread(req, res) {
  const { targetUserId } = req.body ?? {};
  if (!mongoose.Types.ObjectId.isValid(String(targetUserId))) {
    return res.status(400).json({ error: 'Invalid target user id' });
  }

  const report = await Report.findById(req.params.reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const tid = String(targetUserId);
  const rid = report.reporterId.toString();
  const rpd = report.reportedId.toString();
  if (tid !== rid && tid !== rpd) {
    return res.status(403).json({ error: 'Target must be the reporter or the reported user' });
  }

  const member = await User.findById(targetUserId).select('role');
  if (!member || ['admin', 'moderator'].includes(member.role)) {
    return res.status(400).json({ error: 'Invalid member for support thread' });
  }

  let chat = await Chat.findOne({
    chatKind: 'moderator_support',
    participants: { $all: [req.user._id, targetUserId], $size: 2 },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, targetUserId],
      messages: [],
      chatKind: 'moderator_support',
      unreadCount: 0,
      isBlocked: false,
      isReported: false,
    });
  }

  const populated = await Chat.findById(chat._id).populate('participants', '-password');
  res.json({ chat: serializeChatDoc(populated, req.user._id) });
}

const REPORT_STATUSES = new Set(['pending', 'reviewing', 'resolved', 'dismissed']);

async function notifyPartiesAboutOutcome(io, report, status, resolutionText) {
  if (!io) return;
  const note = resolutionText?.trim();

  if (status === 'reviewing') {
    const body =
      'A report you are involved in has been escalated for senior review. You will be notified when there is an outcome.';
    const subtitle = note ? `Moderator note: ${note.slice(0, 500)}` : undefined;
    await createInAppNotification(io, {
      userId: report.reporterId,
      kind: 'report_outcome',
      title: 'Report escalated',
      body,
      subtitle,
      reportId: report._id,
    });
    await createInAppNotification(io, {
      userId: report.reportedId,
      kind: 'report_outcome',
      title: 'Report escalated',
      body,
      subtitle,
      reportId: report._id,
    });
    return;
  }

  const reportedUser = await User.findById(report.reportedId).select('name').lean();
  const reportedName = reportedUser?.name || 'the member';

  const outcomeResolved = note ? `Outcome: resolved. ${note}` : 'Outcome: resolved.';
  const outcomeDismissReporter = note
    ? `Outcome: closed without further action. ${note}`
    : 'Outcome: closed without further action.';
  const outcomeDismissReported = note
    ? `Outcome: no action taken against your account. ${note}`
    : 'Outcome: no action taken against your account.';

  if (status === 'resolved') {
    await createInAppNotification(io, {
      userId: report.reporterId,
      kind: 'report_outcome',
      title: 'Report resolved',
      body: `We reviewed your report about ${reportedName}.`,
      subtitle: outcomeResolved,
      reportId: report._id,
    });
    await createInAppNotification(io, {
      userId: report.reportedId,
      kind: 'report_outcome',
      title: 'Report resolved',
      body: `A moderation report involving you has been reviewed.`,
      subtitle: outcomeResolved,
      reportId: report._id,
    });
    return;
  }

  if (status === 'dismissed') {
    await createInAppNotification(io, {
      userId: report.reporterId,
      kind: 'report_outcome',
      title: 'Report closed',
      body: `We reviewed your report about ${reportedName}.`,
      subtitle: outcomeDismissReporter,
      reportId: report._id,
    });
    await createInAppNotification(io, {
      userId: report.reportedId,
      kind: 'report_outcome',
      title: 'Report closed',
      body: `A moderation report involving you has been reviewed.`,
      subtitle: outcomeDismissReported,
      reportId: report._id,
    });
  }
}

export async function updateReport(req, res) {
  const { status, resolution } = req.body ?? {};
  if (!REPORT_STATUSES.has(String(status))) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (!req.params.reportId) {
    return res.status(400).json({ error: 'Report id is required' });
  }
  const report = await Report.findById(req.params.reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const prevStatus = report.status;
  report.status = status;

  if (status === 'reviewing') {
    report.moderatorId = req.user._id;
    if (resolution != null && String(resolution).trim()) {
      report.resolution = String(resolution).trim().slice(0, 500);
    }
  }

  if (status === 'resolved' || status === 'dismissed') {
    report.resolvedAt = new Date().toISOString().slice(0, 10);
    report.moderatorId = req.user._id;
    if (resolution != null && String(resolution).trim()) {
      report.resolution = String(resolution).trim().slice(0, 500);
    }
  }

  await report.save();

  const io = req.app.get('io');
  if (prevStatus !== report.status && ['reviewing', 'resolved', 'dismissed'].includes(status)) {
    await notifyPartiesAboutOutcome(io, report, status, report.resolution || '');
  }

  const fresh = await Report.findById(report._id)
    .populate('reporterId', 'name')
    .populate('reportedId', 'name')
    .lean();
  res.json({ report: mapReportLean(fresh) });
}

export async function listVerifications(req, res) {
  const items = await VerificationRequest.find({
    status: 'pending',
    videoUrl: { $exists: true, $ne: '' },
  })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ verifications: items.map(mapVerification) });
}

export async function moderatorStats(req, res) {
  const today = new Date().toISOString().slice(0, 10);
  const [pendingContent, pendingReports, pendingVerifications, resolvedReportsToday, resolvedVerificationsToday] =
    await Promise.all([
      countPendingFemaleMedia(),
      Report.countDocuments({ status: { $in: ['pending', 'reviewing'] } }),
      VerificationRequest.countDocuments({ status: 'pending', videoUrl: { $exists: true, $ne: '' } }),
      Report.countDocuments({
        status: { $in: ['resolved', 'dismissed'] },
        resolvedAt: today,
      }),
      VerificationRequest.countDocuments({
        status: { $in: ['approved', 'rejected'] },
        updatedAt: { $gte: new Date(today) },
      }),
    ]);

  const recentReports = await Report.find({ status: { $in: ['resolved', 'dismissed'] } })
    .sort({ updatedAt: -1 })
    .limit(3)
    .populate('reportedId', 'name')
    .lean();
  const recentVerifications = await VerificationRequest.find({
    status: { $in: ['approved', 'rejected'] },
  })
    .sort({ updatedAt: -1 })
    .limit(3)
    .lean();

  const recentActivity = [
    ...recentReports.map((r) => ({
      type: 'report',
      action: r.status === 'dismissed' ? 'Dismissed report' : 'Resolved report',
      user:
        r.reportedId && typeof r.reportedId === 'object' && r.reportedId.name
          ? String(r.reportedId.name)
          : 'Member',
      at: r.resolvedAt || r.updatedAt?.toISOString?.() || '',
    })),
    ...recentVerifications.map((v) => ({
      type: 'verification',
      action: v.status === 'approved' ? 'Verified user' : 'Rejected verification',
      user: v.userDisplayName || 'Member',
      at: v.updatedAt?.toISOString?.() || v.submittedAt || '',
    })),
  ]
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, 6);

  res.json({
    pendingContent,
    pendingReports,
    pendingVerifications,
    resolvedToday: resolvedReportsToday + resolvedVerificationsToday,
    recentActivity,
  });
}

/** Shared moderation inbox — all member ↔ moderator support threads. */
export async function listSupportChats(req, res) {
  const chats = await Chat.find({
    chatKind: 'moderator_support',
    isBlocked: { $ne: true },
    'messages.0': { $exists: true },
  })
    .populate('participants', '-password')
    .sort({ updatedAt: -1 })
    .limit(200);

  const serialized = chats.map((c) => serializeChatDoc(c, req.user._id));
  serialized.sort((a, b) => {
    const aUnread = a.unreadCount > 0 ? 1 : 0;
    const bUnread = b.unreadCount > 0 ? 1 : 0;
    if (aUnread !== bUnread) return bUnread - aUnread;
    return 0;
  });

  res.json({ chats: serialized });
}
