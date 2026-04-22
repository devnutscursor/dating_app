import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';
import { User } from '../models/User.model.js';
import { signAccessToken } from '../utils/jwt.js';
import { serializeUser } from '../utils/serializeUser.js';
import { sendVerificationEmail } from '../utils/mailer.js';

const SALT_ROUNDS = 12;
const OTP_ROUNDS = 10;
const OTP_TTL_MS = 15 * 60 * 1000;

function computeAge(birthDateStr) {
  if (!birthDateStr) return 25;
  const d = new Date(birthDateStr);
  if (Number.isNaN(d.getTime())) return 25;
  const diff = Date.now() - d.getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return Math.min(120, Math.max(18, age || 25));
}

function generateSixDigitOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

async function assignEmailOtp(userDoc) {
  const plain = generateSixDigitOtp();
  const hash = await bcrypt.hash(plain, OTP_ROUNDS);
  userDoc.emailVerificationOtpHash = hash;
  userDoc.emailVerificationOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  await userDoc.save();
  await sendVerificationEmail({ to: userDoc.email, code: plain, name: userDoc.name });
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
  if (birthDate) {
    const bd = new Date(birthDate);
    if (!Number.isNaN(bd.getTime()) && bd.getTime() > Date.now()) {
      return res.status(400).json({ error: 'Date of birth cannot be in the future' });
    }
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const age = computeAge(birthDate);
  const plainOtp = generateSixDigitOtp();
  const otpHash = await bcrypt.hash(plainOtp, OTP_ROUNDS);

  try {
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
      emailVerified: false,
      emailVerificationOtpHash: otpHash,
      emailVerificationOtpExpires: new Date(Date.now() + OTP_TTL_MS),
    });

    await sendVerificationEmail({ to: user.email, code: plainOtp, name: user.name });

    const accessToken = signAccessToken({ sub: user._id.toString() });
    return res.status(201).json({
      accessToken,
      user: serializeUser(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors || {}).map((e) => e.message);
      return res.status(400).json({ error: messages.length ? messages.join(' ') : 'Invalid registration data' });
    }
    console.error('[auth/register]', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
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

export async function verifyEmail(req, res) {
  const { code } = req.body;
  if (!code || String(code).replace(/\s/g, '').length !== 6) {
    return res.status(400).json({ error: 'Enter the 6-digit code' });
  }
  // Include OTP hash only; `expires` is not select:false, so listing it in a narrow `.select()` dropped it and made every code look expired.
  const user = await User.findById(req.user._id).select('+emailVerificationOtpHash');
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  if (user.emailVerified) {
    return res.json({ user: serializeUser(user), message: 'Email already verified' });
  }
  if (!user.emailVerificationOtpHash) {
    return res.status(400).json({ error: 'No verification code on file. Request a new code.' });
  }
  if (!user.emailVerificationOtpExpires || user.emailVerificationOtpExpires.getTime() < Date.now()) {
    return res.status(400).json({ error: 'Code expired. Request a new code.' });
  }
  const match = await bcrypt.compare(String(code).replace(/\s/g, ''), user.emailVerificationOtpHash);
  if (!match) {
    return res.status(400).json({ error: 'Invalid code' });
  }
  user.emailVerified = true;
  user.emailVerificationOtpHash = undefined;
  user.emailVerificationOtpExpires = undefined;
  await user.save();
  res.json({ user: serializeUser(user) });
}

export async function resendVerification(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  if (user.emailVerified) {
    return res.json({ message: 'Email already verified' });
  }
  await assignEmailOtp(user);
  res.json({ message: 'Verification code sent' });
}

export async function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}

export async function logout(req, res) {
  res.json({ message: 'Logged out. Clear the token on the client.' });
}
