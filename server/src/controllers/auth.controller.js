import bcrypt from 'bcryptjs';
import validator from 'validator';
import { User } from '../models/User.model.js';
import { signAccessToken } from '../utils/jwt.js';
import { serializeUser } from '../utils/serializeUser.js';

const SALT_ROUNDS = 12;

function computeAge(birthDateStr) {
  if (!birthDateStr) return 25;
  const d = new Date(birthDateStr);
  if (Number.isNaN(d.getTime())) return 25;
  const diff = Date.now() - d.getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return Math.min(120, Math.max(18, age || 25));
}

export async function register(req, res) {
  const { name, email, password, gender, birthDate } = req.body;
  if (!name || !email || !password || !gender) {
    return res.status(400).json({ error: 'Name, email, password, and gender are required' });
  }
  if (!['male', 'female'].includes(gender)) {
    return res.status(400).json({ error: 'Gender must be male or female' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const age = computeAge(birthDate);
  const user = await User.create({
    email: email.toLowerCase(),
    password: passwordHash,
    role: gender,
    name: name.trim(),
    gender,
    age,
    profileSetupComplete: false,
    interests: [],
    photos: [],
    videos: [],
    coins: 100,
  });
  const accessToken = signAccessToken({ sub: user._id.toString() });
  res.status(201).json({
    accessToken,
    user: serializeUser(user),
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (user.isBlocked) {
    return res.status(403).json({ error: 'This account has been suspended' });
  }
  user.password = undefined;
  const accessToken = signAccessToken({ sub: user._id.toString() });
  res.json({
    accessToken,
    user: serializeUser(user),
  });
}

export async function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}

export async function logout(req, res) {
  res.json({ message: 'Logged out. Clear the token on the client.' });
}
