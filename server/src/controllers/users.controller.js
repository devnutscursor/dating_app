import { User } from '../models/User.model.js';
import { serializeUser } from '../utils/serializeUser.js';

export async function discover(req, res) {
  const self = req.user;
  const opposite = self.gender === 'male' ? 'female' : 'male';
  const users = await User.find({
    gender: opposite,
    role: opposite,
    _id: { $ne: self._id },
  })
    .limit(60)
    .lean();
  res.json({ users: users.map((u) => serializeUser({ ...u, _id: u._id })) });
}

export async function getUserById(req, res) {
  const user = await User.findById(req.params.id);
  if (!user || ['admin', 'moderator'].includes(user.role)) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: serializeUser(user) });
}

const allowedProfileFields = [
  'name',
  'age',
  'country',
  'city',
  'datingGoal',
  'aboutMe',
  'lookingFor',
  'interests',
  'profilePicture',
  'photos',
  'videos',
  'profileSetupComplete',
];

export async function updateMe(req, res) {
  const updates = {};
  for (const key of allowedProfileFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  res.json({ user: serializeUser(user) });
}
