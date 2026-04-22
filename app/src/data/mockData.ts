import type { User, Chat, Notification, Transaction, Report, ContentModerationItem, CoinPack, GiftOption } from '@/types';

export const mockUsers: User[] = [
  {
    id: '45638384',
    name: 'Ariana',
    age: 40,
    gender: 'female',
    country: 'ua',
    city: 'Odessa',
    datingGoal: 'long-term',
    aboutMe: 'Im simple woman. I looking for good man for life',
    lookingFor: 'I wanna meet rich man',
    interests: ['Poker', 'Technology', 'Hiking', 'Relax'],
    photos: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', isPublic: true, status: 'approved' },
      { id: 'p2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', isPublic: true, status: 'approved' },
      { id: 'p3', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', isPublic: false, unlockPrice: 100, isUnlocked: false, status: 'approved' },
    ],
    videos: [
      { id: 'v1', url: 'https://example.com/video1.mp4', thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', isPublic: true, status: 'approved' },
    ],
    isOnline: true,
    coins: 105,
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
  {
    id: '23738384',
    name: 'Margo',
    age: 30,
    gender: 'female',
    country: 'ua',
    city: 'Kyiv',
    datingGoal: 'just-fun',
    aboutMe: 'Love to have fun and meet new people',
    lookingFor: 'Looking for adventure',
    interests: ['Travel', 'Music', 'Dancing'],
    photos: [
      { id: 'p4', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', isPublic: true, status: 'approved' },
    ],
    videos: [],
    isOnline: true,
    coins: 250,
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
  },
  {
    id: '9748384',
    name: 'Tom',
    age: 60,
    gender: 'male',
    country: 'ua',
    city: 'Odessa',
    datingGoal: 'long-term',
    aboutMe: 'Im simple man. I looking for good woman for life',
    lookingFor: 'I wanna meet sexy woman',
    interests: ['Poker', 'Technology', 'Hiking', 'Relax'],
    photos: [
      { id: 'p5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', isPublic: true, status: 'approved' },
      { id: 'p6', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', isPublic: true, status: 'approved' },
    ],
    videos: [
      { id: 'v2', url: 'https://example.com/video2.mp4', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', isPublic: true, status: 'approved' },
    ],
    isOnline: true,
    coins: 500,
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: '345890',
    name: 'Rayan',
    age: 18,
    gender: 'male',
    country: 'ua',
    city: 'Lviv',
    datingGoal: 'friendship',
    aboutMe: 'Young and energetic',
    lookingFor: 'New friends',
    interests: ['Gaming', 'Sports', 'Technology'],
    photos: [
      { id: 'p7', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', isPublic: true, status: 'approved' },
    ],
    videos: [],
    isOnline: true,
    coins: 50,
    isVerified: false,
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
  {
    id: '142985',
    name: 'Chris',
    age: 43,
    gender: 'male',
    country: 'ua',
    city: 'Kharkiv',
    datingGoal: 'short-term',
    aboutMe: 'Businessman looking for company',
    lookingFor: 'Casual dating',
    interests: ['Business', 'Travel', 'Fine dining'],
    photos: [
      { id: 'p8', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', isPublic: true, status: 'approved' },
    ],
    videos: [],
    isOnline: true,
    coins: 1000,
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  },
  {
    id: '2398127',
    name: 'Kevin',
    age: 35,
    gender: 'male',
    country: 'ua',
    city: 'Odessa',
    datingGoal: 'long-term',
    aboutMe: 'Looking for a serious relationship',
    lookingFor: 'A good woman',
    interests: ['Travel', 'Technology', 'Hiking', 'Relax', 'Poker', 'Chess'],
    photos: [
      { id: 'p9', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', isPublic: true, status: 'approved' },
      { id: 'p10', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400', isPublic: true, status: 'approved' },
      { id: 'p11', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400', isPublic: true, status: 'approved' },
    ],
    videos: [],
    isOnline: true,
    coins: 105,
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
  },
  {
    id: '345891',
    name: 'Manya',
    age: 18,
    gender: 'female',
    country: 'ua',
    city: 'Kyiv',
    datingGoal: 'figuring-out',
    aboutMe: 'Just exploring',
    lookingFor: 'Not sure yet',
    interests: ['Music', 'Movies', 'Shopping'],
    photos: [
      { id: 'p12', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', isPublic: true, status: 'approved' },
    ],
    videos: [],
    isOnline: false,
    lastActive: '5 min ago',
    coins: 75,
    isVerified: false,
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  },
];

export const mockChats: Chat[] = [
  {
    id: 'c1',
    participant: mockUsers[0],
    messages: [
      { id: 'm1', senderId: '45638384', content: 'Hello there. How are you?', type: 'text', timestamp: '2:35', isRead: true },
      { id: 'm2', senderId: '2398127', content: 'Hello. Im good! You?', type: 'text', timestamp: '2:35', isRead: true },
    ],
    unreadCount: 0,
    lastMessage: { id: 'm2', senderId: '2398127', content: 'Hello. Im good! You?', type: 'text', timestamp: '2:35', isRead: true },
    isBlocked: false,
    isReported: false,
  },
  {
    id: 'c2',
    participant: mockUsers[6],
    messages: [
      { id: 'm3', senderId: '345891', content: 'Hello Kevin', type: 'text', timestamp: '5:57 am', isRead: false },
    ],
    unreadCount: 2,
    lastMessage: { id: 'm3', senderId: '345891', content: 'Hello Kevin', type: 'text', timestamp: '5:57 am', isRead: false },
    isBlocked: false,
    isReported: false,
  },
  {
    id: 'c3',
    participant: mockUsers[2],
    messages: [
      { id: 'm4', senderId: '9748384', content: 'Hello there. How are you?', type: 'text', timestamp: '2:34 am', isRead: true },
    ],
    unreadCount: 0,
    lastMessage: { id: 'm4', senderId: '9748384', content: 'Hello there. How are you?', type: 'text', timestamp: '2:34 am', isRead: true },
    isBlocked: false,
    isReported: false,
  },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'like', title: 'New Like', message: 'liked your profile', timestamp: '2 min ago', isRead: false, sender: mockUsers[2] },
  { id: 'n2', type: 'gift', title: 'New Gift', message: 'sent present for you', timestamp: '5 min ago', isRead: false, sender: mockUsers[2] },
  { id: 'n3', type: 'system', title: 'Coins Credited', message: 'The coins have been credited back', timestamp: '1 hour ago', isRead: true },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', userId: '2398127', type: 'purchase', amount: 100, currency: 'coins', description: 'Standard Pack', timestamp: '2026-03-11', status: 'completed' },
  { id: 't2', userId: '2398127', type: 'unlock', amount: 100, currency: 'coins', description: 'Unlock photo from Ariana', timestamp: '2026-03-11', status: 'completed', relatedUserId: '45638384' },
  { id: 't3', userId: '2398127', type: 'videoCall', amount: 700, currency: 'coins', description: 'Video call with Margo (60 min)', timestamp: '2026-03-11', status: 'completed', relatedUserId: '23738384' },
  { id: 't4', userId: '2398127', type: 'gift', amount: 50, currency: 'coins', description: 'Gift to Ariana', timestamp: '2026-03-11', status: 'completed', relatedUserId: '45638384' },
];

export const mockReports: Report[] = [
  { id: 'r1', reporterId: '2398127', reportedId: '45638384', type: 'harassment', topic: 'Inappropriate behavior', comment: 'User sent inappropriate messages', status: 'pending', createdAt: '2026-03-11' },
  { id: 'r2', reporterId: '345891', reportedId: '9748384', type: 'financial', topic: 'Payment issue', comment: 'Did not receive promised content', status: 'reviewing', createdAt: '2026-03-10' },
];

export const mockContentModeration: ContentModerationItem[] = [
  { id: 'cm1', userId: '45638384', type: 'photo', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', status: 'pending', submittedAt: '2026-03-11' },
  { id: 'cm2', userId: '23738384', type: 'video', url: 'https://example.com/video3.mp4', status: 'pending', submittedAt: '2026-03-11' },
];

export const coinPacks: CoinPack[] = [
  { id: 'cp1', name: 'Standard Pack', coins: 100, price: 14.99, features: ['Profile Boost (24hrs)'] },
  { id: 'cp2', name: 'Medium Pack', coins: 250, price: 35.99, originalPrice: 37.50, features: ['Profile Boost (24hrs)', 'Messages Priority (24 hrs)'], isPopular: true },
  { id: 'cp3', name: 'Elite Pack', coins: 1000, price: 139.99, originalPrice: 149.99, features: ['Profile Priority', 'Messages Priority'] },
];

export const giftOptions: GiftOption[] = [
  { id: 'g1', name: 'Compliment', coins: 50, icon: 'Gift' },
  { id: 'g2', name: 'Small gift', coins: 100, icon: 'Gift' },
  { id: 'g3', name: 'Full Access', coins: 250, icon: 'Gift', isSpecial: true },
];

export const currentUser: User = mockUsers[5]; // Kevin for man view
export const currentWomanUser: User = mockUsers[0]; // Ariana for woman view
