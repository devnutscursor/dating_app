import { User } from '../models/User.model.js';

/** Count pending photo/video uploads on female member profiles. */
export async function countPendingFemaleMedia() {
  const females = await User.find({ gender: 'female', role: 'female' })
    .select('photos videos')
    .limit(500)
    .lean();
  let n = 0;
  for (const u of females) {
    for (const p of u.photos || []) {
      if (p.status === 'pending') n += 1;
    }
    for (const v of u.videos || []) {
      if (v.status === 'pending') n += 1;
    }
  }
  return n;
}
