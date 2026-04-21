import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model.js';
import { Chat } from '../models/Chat.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { Report } from '../models/Report.model.js';
import { ContentItem } from '../models/ContentItem.model.js';
import { VerificationRequest } from '../models/VerificationRequest.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dating_app';
const SALT = 12;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected:', MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
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
    unreadCount: 2,
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
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
