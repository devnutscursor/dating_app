import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';
import { User } from '../models/User.model.js';
import { signAccessToken } from '../utils/jwt.js';
import { serializeUserForClient, memberNeedsEmailVerification } from '../utils/enrichMemberUser.js';
import { sendVerificationEmail } from '../utils/mailer.js';
import { forceUserOffline } from '../services/presence.js';
import { notifyAdminsNewSignup } from '../services/adminAlerts.js';
import { getPlatformSettings } from '../services/siteSettings.js';

const SALT_ROUNDS = 12;
const OTP_ROUNDS = 10;
const OTP_TTL_MS = 15 * 60 * 1000;

function ageFromBirthDate(birthDateStr) {
  if (!birthDateStr) return null;
  const born = new Date(`${String(birthDateStr).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(born.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1;
  }
  return age;
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
  if (!birthDate) {
    return res.status(400).json({ error: 'Date of birth is required' });
  }
  const bd = new Date(birthDate);
  if (Number.isNaN(bd.getTime())) {
    return res.status(400).json({ error: 'Invalid date of birth' });
  }
  if (bd.getTime() > Date.now()) {
    return res.status(400).json({ error: 'Date of birth cannot be in the future' });
  }
  const age = ageFromBirthDate(birthDate);
  if (age === null) {
    return res.status(400).json({ error: 'Invalid date of birth' });
  }
  if (age < 18) {
    return res.status(400).json({ error: 'You must be at least 18 years old to register' });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const storedAge = Math.min(120, age);
  const settings = await getPlatformSettings();
  const requireVerification = Boolean(settings?.security?.requireVerification);

  let plainOtp;
  let otpHash;
  if (requireVerification) {
    plainOtp = generateSixDigitOtp();
    otpHash = await bcrypt.hash(plainOtp, OTP_ROUNDS);
  }

  try {
    const user = await User.create({
      email: email.toLowerCase(),
      password: passwordHash,
      role: gender,
      name: name.trim(),
      gender,
      age: storedAge,
      profileSetupComplete: false,
      interests: [],
      photos: [],
      videos: [],
      coins: 100,
      emailVerified: !requireVerification,
      ...(requireVerification
        ? {
            emailVerificationOtpHash: otpHash,
            emailVerificationOtpExpires: new Date(Date.now() + OTP_TTL_MS),
          }
        : {}),
    });

    if (requireVerification) {
      await sendVerificationEmail({ to: user.email, code: plainOtp, name: user.name });
    }

    const io = req.app.get('io');
    void notifyAdminsNewSignup(io, {
      userId: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
    }).catch((err) => console.error('[adminAlerts] new signup', err));

    const accessToken = signAccessToken({ sub: user._id.toString() });
    return res.status(201).json({
      accessToken,
      user: await serializeUserForClient(user),
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
    user: await serializeUserForClient(user),
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
  const settings = await getPlatformSettings();
  if (!memberNeedsEmailVerification(user, settings)) {
    return res.json({
      user: await serializeUserForClient(user),
      message: 'Email verification is not required',
    });
  }
  if (user.emailVerified) {
    return res.json({ user: await serializeUserForClient(user), message: 'Email already verified' });
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
  res.json({ user: await serializeUserForClient(user) });
}

export async function resendVerification(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  const settings = await getPlatformSettings();
  if (!memberNeedsEmailVerification(user, settings)) {
    return res.json({ message: 'Email verification is not required for new accounts' });
  }
  if (user.emailVerified) {
    return res.json({ message: 'Email already verified' });
  }
  await assignEmailOtp(user);
  res.json({ message: 'Verification code sent' });
}

export async function me(req, res) {
  res.json({ user: await serializeUserForClient(req.user) });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const role = req.user.role;
  if (role !== 'male' && role !== 'female') {
    return res.status(403).json({ error: 'Password change is only available for member accounts' });
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const ok = await bcrypt.compare(String(currentPassword), user.password);
  if (!ok) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  user.password = await bcrypt.hash(String(newPassword), SALT_ROUNDS);
  await user.save();
  res.json({ message: 'Password updated' });
}

export async function logout(req, res) {
  await forceUserOffline(req.user._id);
  const user = await User.findById(req.user._id);
  res.json({
    message: 'Logged out. Clear the token on the client.',
    user: user ? await serializeUserForClient(user) : undefined,
  });
}
