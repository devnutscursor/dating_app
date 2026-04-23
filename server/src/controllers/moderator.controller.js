import { ContentItem } from '../models/ContentItem.model.js';
import { Report } from '../models/Report.model.js';
import { VerificationRequest } from '../models/VerificationRequest.model.js';

function mapContent(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    userId: o.userId?.toString(),
    type: o.type,
    url: o.url,
    status: o.status,
    submittedAt: o.submittedAt,
  };
}

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
  return {
    id: r._id.toString(),
    reporterId,
    reportedId,
    reporterName,
    reportedName,
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
  const items = await ContentItem.find({ status: 'pending' }).limit(100);
  res.json({ items: items.map(mapContent) });
}

export async function listReports(req, res) {
  const items = await Report.find()
    .sort({ _id: -1 })
    .limit(100)
    .populate('reporterId', 'name')
    .populate('reportedId', 'name')
    .lean();
  res.json({ reports: items.map(mapReportLean) });
}

const REPORT_STATUSES = new Set(['pending', 'reviewing', 'resolved', 'dismissed']);

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
  report.status = status;
  if (status === 'resolved' || status === 'dismissed') {
    report.resolvedAt = new Date().toISOString().slice(0, 10);
    report.moderatorId = req.user._id;
    if (resolution != null && String(resolution).trim()) {
      report.resolution = String(resolution).trim().slice(0, 500);
    }
  }
  await report.save();
  const fresh = await Report.findById(report._id)
    .populate('reporterId', 'name')
    .populate('reportedId', 'name')
    .lean();
  res.json({ report: mapReportLean(fresh) });
}

export async function listVerifications(req, res) {
  const items = await VerificationRequest.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(50);
  res.json({ verifications: items.map(mapVerification) });
}
