import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model.js';
import { Like } from '../models/Like.model.js';
import { Chat } from '../models/Chat.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { Report } from '../models/Report.model.js';
import { ContentItem } from '../models/ContentItem.model.js';
import { VerificationRequest } from '../models/VerificationRequest.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dating_app';
const SALT = 12;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.join(__dirname, '../..');
const SEED_CREDENTIALS_FILE = path.join(SERVER_ROOT, 'SEED_TEST_ACCOUNTS.txt');
/** Shared password for the 5 + 5 seed demo members (see SEED_TEST_ACCOUNTS.txt after seed). */
const SEED_DEMO_BATCH_PASSWORD = 'SeedMember2026!';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected:', MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
    Like.deleteMany({}),
    Chat.deleteMany({}),
    Transaction.deleteMany({}),
    Report.deleteMany({}),
    ContentItem.deleteMany({}),
    VerificationRequest.deleteMany({}),
  ]);

  const hash = (pw) => bcrypt.hashSync(pw, SALT);

  const admin = await User.create({
    email: 'admin@memberdate.com',
    password: hash('password123'),
    role: 'admin',
    emailVerified: true,
    name: 'Admin User',
    gender: 'male',
    age: 35,
    country: 'us',
    city: 'New York',
    coins: 0,
    isVerified: true,
    profileSetupComplete: true,
    interests: [],
    photos: [],
    videos: [],
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  });

  const moderator = await User.create({
    email: 'moderator@memberdate.com',
    password: hash('password123'),
    role: 'moderator',
    emailVerified: true,
    name: 'Moderator',
    gender: 'female',
    age: 30,
    country: 'us',
    city: 'Los Angeles',
    coins: 0,
    isVerified: true,
    profileSetupComplete: true,
    interests: [],
    photos: [],
    videos: [],
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  });

  const ariana = await User.create({
    email: 'ariana@memberdate.com',
    password: hash('password123'),
    role: 'female',
    emailVerified: true,
    name: 'Ariana',
    gender: 'female',
    age: 40,
    country: 'ua',
    city: 'Odessa',
    datingGoal: 'long-term',
    aboutMe: 'Im simple woman. I looking for good man for life',
    lookingFor: 'I wanna meet rich man',
    interests: ['Poker', 'Technology', 'Hiking', 'Relax'],
    coins: 105,
    likesReceivedCount: 42,
    isVerified: true,
    isOnline: true,
    profileSetupComplete: true,
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        isPublic: true,
        status: 'approved',
      },
    ],
    videos: [],
  });

  const kevin = await User.create({
    email: 'kevin@memberdate.com',
    password: hash('password123'),
    role: 'male',
    emailVerified: true,
    name: 'Kevin',
    gender: 'male',
    age: 35,
    country: 'ua',
    city: 'Odessa',
    datingGoal: 'long-term',
    aboutMe: 'Looking for a serious relationship',
    lookingFor: 'A good woman',
    interests: ['Travel', 'Technology', 'Hiking', 'Relax', 'Poker', 'Chess'],
    coins: 105,
    likesReceivedCount: 24,
    isVerified: true,
    isOnline: true,
    profileSetupComplete: true,
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
        isPublic: true,
        status: 'approved',
      },
    ],
    videos: [],
  });

  const margo = await User.create({
    email: 'margo@memberdate.com',
    password: hash('password123'),
    role: 'female',
    emailVerified: true,
    name: 'Margo',
    gender: 'female',
    age: 30,
    country: 'ua',
    city: 'Kyiv',
    datingGoal: 'just-fun',
    aboutMe: 'Love to have fun and meet new people',
    lookingFor: 'Looking for adventure',
    interests: ['Travel', 'Music', 'Dancing'],
    coins: 250,
    isVerified: true,
    isOnline: true,
    profileSetupComplete: true,
    profilePicture: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
        isPublic: true,
        status: 'approved',
      },
    ],
    videos: [],
  });

  const seedDemoMales = [
    {
      email: 'seedman01@memberdate.com',
      name: 'James',
      age: 28,
      city: 'London',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a40e?w=400',
      aboutMe: 'Coffee, climbing, and good conversation.',
      lookingFor: 'Someone genuine and upbeat.',
      interests: ['Travel', 'Music', 'Hiking'],
    },
    {
      email: 'seedman02@memberdate.com',
      name: 'Oliver',
      age: 31,
      city: 'Manchester',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      aboutMe: 'Designer who loves weekend hikes.',
      lookingFor: 'A partner to explore the city with.',
      interests: ['Technology', 'Fitness', 'Cooking'],
    },
    {
      email: 'seedman03@memberdate.com',
      name: 'Noah',
      age: 26,
      city: 'Bristol',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      aboutMe: 'Runner and podcast addict.',
      lookingFor: 'Kindness and curiosity matter most.',
      interests: ['Sports', 'Reading', 'Music'],
    },
    {
      email: 'seedman04@memberdate.com',
      name: 'Leo',
      age: 33,
      city: 'Edinburgh',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      aboutMe: 'Chef on weekdays, cyclist on Sundays.',
      lookingFor: 'Great food and easy laughs.',
      interests: ['Cooking', 'Travel', 'Fitness'],
    },
    {
      email: 'seedman05@memberdate.com',
      name: 'Ethan',
      age: 29,
      city: 'Birmingham',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      aboutMe: 'Engineer learning Spanish slowly.',
      lookingFor: 'Something that grows naturally.',
      interests: ['Technology', 'Chess', 'Relax'],
    },
  ];

  const seedDemoFemales = [
    {
      email: 'seedwoman01@memberdate.com',
      name: 'Sophie',
      age: 27,
      city: 'Leeds',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      aboutMe: 'Art galleries and early mornings.',
      lookingFor: 'Someone thoughtful with a sense of humour.',
      interests: ['Music', 'Travel', 'Reading'],
    },
    {
      email: 'seedwoman02@memberdate.com',
      name: 'Emma',
      age: 30,
      city: 'Liverpool',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      aboutMe: 'Teacher who loves live music.',
      lookingFor: 'Honesty and good energy.',
      interests: ['Music', 'Dancing', 'Cooking'],
    },
    {
      email: 'seedwoman03@memberdate.com',
      name: 'Mia',
      age: 25,
      city: 'Cardiff',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      aboutMe: 'Yoga and fiction in equal measure.',
      lookingFor: 'A calm, supportive connection.',
      interests: ['Fitness', 'Reading', 'Relax'],
    },
    {
      email: 'seedwoman04@memberdate.com',
      name: 'Isla',
      age: 32,
      city: 'Glasgow',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
      aboutMe: 'Marketing by day, pottery by night.',
      lookingFor: 'Creativity and kindness.',
      interests: ['Technology', 'Music', 'Travel'],
    },
    {
      email: 'seedwoman05@memberdate.com',
      name: 'Lily',
      age: 28,
      city: 'Nottingham',
      country: 'gb',
      pic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      aboutMe: 'Dog mum and weekend baker.',
      lookingFor: 'Someone who loves animals and road trips.',
      interests: ['Cooking', 'Travel', 'Hiking'],
    },
  ];

  for (const row of seedDemoMales) {
    await User.create({
      email: row.email,
      password: hash(SEED_DEMO_BATCH_PASSWORD),
      role: 'male',
      gender: 'male',
      emailVerified: true,
      name: row.name,
      age: row.age,
      country: row.country,
      city: row.city,
      datingGoal: 'long-term',
      aboutMe: row.aboutMe,
      lookingFor: row.lookingFor,
      interests: row.interests,
      coins: 100,
      likesReceivedCount: 0,
      isVerified: true,
      isOnline: true,
      profileSetupComplete: true,
      profilePicture: row.pic,
      photos: [{ url: row.pic, isPublic: true, status: 'approved' }],
      videos: [],
    });
  }

  for (const row of seedDemoFemales) {
    await User.create({
      email: row.email,
      password: hash(SEED_DEMO_BATCH_PASSWORD),
      role: 'female',
      gender: 'female',
      emailVerified: true,
      name: row.name,
      age: row.age,
      country: row.country,
      city: row.city,
      datingGoal: 'long-term',
      aboutMe: row.aboutMe,
      lookingFor: row.lookingFor,
      interests: row.interests,
      coins: 100,
      likesReceivedCount: 0,
      isVerified: true,
      isOnline: true,
      profileSetupComplete: true,
      profilePicture: row.pic,
      photos: [{ url: row.pic, isPublic: true, status: 'approved' }],
      videos: [],
    });
  }

  const credentialsBody = [
    'MemberDate – seed test accounts',
    'This file is generated by: npm run seed (from the server folder)',
    `Generated (UTC): ${new Date().toISOString()}`,
    '',
    'Do not commit this file; it is listed in .gitignore.',
    '',
    '=== 5 demo men + 5 demo women (new batch) ===',
    `Password (same for all 10 accounts below): ${SEED_DEMO_BATCH_PASSWORD}`,
    '',
    'Men:',
    ...seedDemoMales.map((r) => `  ${r.email}  |  ${r.name}`),
    '',
    'Women:',
    ...seedDemoFemales.map((r) => `  ${r.email}  |  ${r.name}`),
    '',
    '=== Original seed demo users (password: password123) ===',
    '  kevin@memberdate.com     (male)',
    '  ariana@memberdate.com    (female)',
    '  margo@memberdate.com     (female)',
    '  admin@memberdate.com     (admin)',
    '  moderator@memberdate.com (moderator)',
    '',
  ].join('\n');

  fs.writeFileSync(SEED_CREDENTIALS_FILE, credentialsBody, 'utf8');

  const chat1 = await Chat.create({
    participants: [kevin._id, ariana._id],
    messages: [
      {
        senderId: ariana._id,
        content: 'Hello there. How are you?',
        type: 'text',
        isRead: true,
        timestamp: '2:35',
      },
      {
        senderId: kevin._id,
        content: 'Hello. Im good! You?',
        type: 'text',
        isRead: true,
        timestamp: '2:35',
      },
    ],
    unreadCount: 0,
    lastMessage: {
      id: 'seed-lm1',
      senderId: kevin._id,
      content: 'Hello. Im good! You?',
      type: 'text',
      timestamp: '2:35',
      isRead: true,
    },
    isBlocked: false,
    isReported: false,
  });

  await Chat.create({
    participants: [kevin._id, margo._id],
    messages: [
      {
        senderId: margo._id,
        content: 'Hey Kevin!',
        type: 'text',
        isRead: false,
        timestamp: '5:57 am',
      },
    ],
    unreadCount: 0,
    lastMessage: {
      id: 'seed-lm2',
      senderId: margo._id,
      content: 'Hey Kevin!',
      type: 'text',
      timestamp: '5:57 am',
      isRead: false,
    },
    isBlocked: false,
    isReported: false,
  });

  await Transaction.create([
    {
      userId: kevin._id,
      type: 'purchase',
      amount: 100,
      currency: 'coins',
      description: 'Standard Pack',
      timestamp: '2026-03-11',
      status: 'completed',
    },
    {
      userId: kevin._id,
      type: 'unlock',
      amount: 100,
      currency: 'coins',
      description: 'Unlock photo from Ariana',
      timestamp: '2026-03-11',
      status: 'completed',
      relatedUserId: ariana._id,
    },
  ]);

  await Report.create({
    reporterId: kevin._id,
    reportedId: ariana._id,
    type: 'harassment',
    topic: 'Inappropriate behavior',
    comment: 'User sent inappropriate messages',
    status: 'pending',
    createdAt: '2026-03-11',
  });

  await ContentItem.create({
    userId: ariana._id,
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    status: 'pending',
    submittedAt: '2026-03-11',
  });

  await VerificationRequest.create({
    userId: ariana._id,
    userDisplayName: 'Sarah M.',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    challengeNumbers: '7 4 2 9 1',
    status: 'pending',
  });

  console.log('Seed complete.');
  console.log('Admin:', admin.email, '| Moderator:', moderator.email);
  console.log('Kevin (male):', kevin.email, '| Ariana (female):', ariana.email);
  console.log('Sample chat id (Kevin <-> Ariana):', chat1._id.toString());
  console.log('5 men + 5 women demo logins written to:', SEED_CREDENTIALS_FILE);
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
