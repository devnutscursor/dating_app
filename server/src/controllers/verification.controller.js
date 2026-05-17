import mongoose from 'mongoose';
import { VerificationRequest } from '../models/VerificationRequest.model.js';
import { User } from '../models/User.model.js';
import { createInAppNotification } from '../services/inAppNotifications.js';

function randomChallengeDigits() {
  return Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join(' ');
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

export async function getMyVerification(req, res) {
  const user = req.user;
  if (user.isVerified) {
    return res.json({ isVerified: true, status: 'approved' });
  }
  const pending = await VerificationRequest.findOne({
    userId: user._id,
    status: 'pending',
  }).sort({ createdAt: -1 });
  if (pending) {
    return res.json({
      isVerified: false,
      status: 'pending',
      request: mapVerification(pending),
    });
  }
  const last = await VerificationRequest.findOne({ userId: user._id }).sort({ createdAt: -1 });
  return res.json({
    isVerified: false,
    status: last?.status === 'rejected' ? 'rejected' : 'none',
    lastRequest: last ? mapVerification(last) : null,
  });
}

export async function createVerificationChallenge(req, res) {
  const user = req.user;
  if (user.isVerified) {
    return res.status(400).json({ error: 'Your account is already verified' });
  }
  const existing = await VerificationRequest.findOne({ userId: user._id, status: 'pending' });
  if (existing) {
    return res.json({
      challengeNumbers: existing.challengeNumbers,
      requestId: existing._id.toString(),
    });
  }
  const challengeNumbers = randomChallengeDigits();
  const profilePhotoUrl =
    user.profilePicture ||
    user.photos?.find((p) => p.isPublic !== false && p.url)?.url ||
    '';
  if (!profilePhotoUrl) {
    return res.status(400).json({
      error: 'Add a profile photo before starting video verification',
    });
  }
  const doc = await VerificationRequest.create({
    userId: user._id,
    userDisplayName: String(user.name || 'Member').slice(0, 120),
    profilePhotoUrl,
    challengeNumbers,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  });
  res.status(201).json({
    challengeNumbers: doc.challengeNumbers,
    requestId: doc._id.toString(),
  });
}

export async function submitVerificationVideo(req, res) {
  const user = req.user;
  const { videoUrl, requestId } = req.body ?? {};
  if (!videoUrl || typeof videoUrl !== 'string') {
    return res.status(400).json({ error: 'videoUrl is required' });
  }
  if (user.isVerified) {
    return res.status(400).json({ error: 'Your account is already verified' });
  }
  let request;
  if (requestId && mongoose.Types.ObjectId.isValid(String(requestId))) {
    request = await VerificationRequest.findOne({
      _id: requestId,
      userId: user._id,
      status: 'pending',
    });
  } else {
    request = await VerificationRequest.findOne({ userId: user._id, status: 'pending' }).sort({
      createdAt: -1,
    });
  }
  if (!request) {
    return res.status(400).json({ error: 'Start verification first to receive your number challenge' });
  }
  request.videoUrl = String(videoUrl).slice(0, 2000);
  request.submittedAt = new Date().toISOString();
  const profilePhotoUrl =
    user.profilePicture ||
    user.photos?.find((p) => p.isPublic !== false && p.url)?.url ||
    request.profilePhotoUrl;
  if (profilePhotoUrl) request.profilePhotoUrl = profilePhotoUrl;
  request.userDisplayName = String(user.name || 'Member').slice(0, 120);
  await request.save();

  const io = req.app.get('io');
  await createInAppNotification(io, {
    userId: user._id,
    kind: 'system',
    title: 'Verification submitted',
    body: 'We received your video. A moderator will review it shortly.',
  });

  res.json({ ok: true, request: mapVerification(request) });
}

export async function reviewVerification(req, res) {
  const { id } = req.params;
  const { decision } = req.body ?? {};
  if (!mongoose.Types.ObjectId.isValid(String(id))) {
    return res.status(400).json({ error: 'Invalid verification id' });
  }
  if (!['approved', 'rejected'].includes(String(decision))) {
    return res.status(400).json({ error: 'decision must be approved or rejected' });
  }
  const request = await VerificationRequest.findById(id);
  if (!request || request.status !== 'pending') {
    return res.status(404).json({ error: 'Pending verification not found' });
  }
  request.status = decision;
  await request.save();

  const member = await User.findById(request.userId);
  const io = req.app.get('io');
  if (member) {
    if (decision === 'approved') {
      member.isVerified = true;
      await member.save();
      await createInAppNotification(io, {
        userId: member._id,
        kind: 'system',
        title: 'You are verified',
        body: 'Your video verification was approved. A verified badge now appears on your profile.',
      });
    } else {
      await createInAppNotification(io, {
        userId: member._id,
        kind: 'system',
        title: 'Verification not approved',
        body: 'Your video did not pass review. You can record a new verification from your profile.',
      });
    }
  }

  res.json({ ok: true, verification: mapVerification(request) });
}
