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

function mapReport(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    reporterId: o.reporterId?.toString(),
    reportedId: o.reportedId?.toString(),
    type: o.type,
    topic: o.topic,
    comment: o.comment,
    status: o.status,
    createdAt: o.createdAt,
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
  const items = await Report.find().sort({ _id: -1 }).limit(100);
  res.json({ reports: items.map(mapReport) });
}

export async function listVerifications(req, res) {
  const items = await VerificationRequest.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(50);
  res.json({ verifications: items.map(mapVerification) });
}
