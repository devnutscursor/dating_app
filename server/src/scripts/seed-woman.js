/**
 * Add one female member without wiping the database.
 *
 * Usage:
 *   npm run seed:woman
 *   npm run seed:woman -- --email nova@memberdate.com --password password123 --name Nova
 *   npm run seed:woman -- --verified --coins 200
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dating_app';
const SALT = 12;

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  if (i === -1 || i === process.argv.length - 1) return undefined;
  return process.argv[i + 1];
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

async function nextDefaultEmail() {
  for (let n = 1; n <= 99; n += 1) {
    const email = `seedwoman${String(n).padStart(2, '0')}@memberdate.com`;
    const exists = await User.findOne({ email }).select('_id').lean();
    if (!exists) return email;
  }
  throw new Error('Could not find a free seedwomanXX@memberdate.com slot (01–99 taken). Pass --email.');
}

async function main() {
  const password = argValue('--password') || process.env.SEED_WOMAN_PASSWORD || 'password123';
  const name = argValue('--name') || process.env.SEED_WOMAN_NAME || 'Test Woman';
  const age = Math.min(120, Math.max(18, Math.floor(Number(argValue('--age') || 28))));
  const coins = Math.max(0, Math.floor(Number(argValue('--coins') ?? 0)));
  const verified = hasFlag('--verified') || process.env.SEED_WOMAN_VERIFIED === 'true';
  const city = argValue('--city') || 'Kyiv';
  const country = argValue('--country') || 'ua';
  const pic =
    argValue('--photo') ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400';
  const emailArg = (argValue('--email') || process.env.SEED_WOMAN_EMAIL || '').trim().toLowerCase();

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  } catch (err) {
    console.error('Could not connect to MongoDB.');
    console.error('Check server/.env MONGODB_URI and that MongoDB is running (or Atlas IP whitelist).');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const email = emailArg || (await nextDefaultEmail());
  console.log('Connected to database');

  const existing = await User.findOne({ email });
  if (existing) {
    console.error(`Email already in use: ${email}`);
    console.error(`Existing user: ${existing.name} (${existing._id})`);
    process.exit(1);
  }

  const user = await User.create({
    email,
    password: bcrypt.hashSync(password, SALT),
    role: 'female',
    gender: 'female',
    emailVerified: true,
    profileSetupComplete: true,
    name,
    age,
    country,
    city,
    datingGoal: 'long-term',
    aboutMe: 'Seed account for testing.',
    lookingFor: 'Testing the platform.',
    interests: ['Music', 'Travel'],
    coins,
    likesReceivedCount: 0,
    isVerified: verified,
    isOnline: false,
    isBlocked: false,
    profilePicture: pic,
    photos: [{ url: pic, isPublic: true, status: 'approved' }],
    videos: [],
  });

  console.log('\n=== Woman account created ===');
  console.log('Email:   ', email);
  console.log('Password:', password);
  console.log('Name:    ', user.name);
  console.log('User ID: ', user._id.toString());
  console.log('Verified:', user.isVerified ? 'yes (profile badge)' : 'no — good for video verification tests');
  console.log('Coins:   ', user.coins);
  console.log('\nLogin at /login then open /woman/profile or /woman/profile/verify');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
