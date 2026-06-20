import { Activity } from '../models/Activity.model.js';
import { serializeUser } from '../utils/serializeUser.js';
import {
  femaleNeedsVideoVerification,
  VIDEO_VERIFICATION_REQUIRED_BODY,
} from '../utils/femaleVideoVerification.js';

const ACTOR_SELECT =
  '-password -email -emailVerificationOtpHash -emailVerificationOtpExpires';

export async function listActivities(req, res) {
  if (femaleNeedsVideoVerification(req.user)) {
    return res.json({ activities: [], ...VIDEO_VERIFICATION_REQUIRED_BODY });
  }
  const rows = await Activity.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('actorId', ACTOR_SELECT)
    .lean();

  const activities = [];
  for (const r of rows) {
    const actorDoc = r.actorId;
    if (!actorDoc || typeof actorDoc !== 'object' || !actorDoc._id) continue;
    const actor = serializeUser({ ...actorDoc, _id: actorDoc._id });
    if (!actor) continue;
    if (actor.email !== undefined) delete actor.email;
    activities.push({
      id: r._id.toString(),
      type: r.type,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      details: r.details || undefined,
      giftAmount: r.giftAmount,
      actor,
    });
  }

  res.json({ activities });
}
