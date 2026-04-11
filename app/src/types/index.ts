// Type definitions for MemberDate application

export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  country: string;
  city: string;
  datingGoal: string;
  aboutMe?: string;
  lookingFor?: string;
  interests: string[];
  photos: Photo[];
  videos: Video[];
  isOnline: boolean;
  lastActive?: string;
  coins: number;
  isVerified: boolean;
  profilePicture?: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnail?: string;
  isPublic: boolean;
  unlockPrice?: number;
  isUnlocked?: boolean;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  isPublic: boolean;
  unlockPrice?: number;
  isUnlocked?: boolean;
  status: 'approved' | 'pending' | 'rejected';
  duration?: number;
}

export interface Chat {
  id: string;
  participant: User;
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
  isBlocked: boolean;
  isReported: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'gift';
  timestamp: string;
  isRead: boolean;
  mediaUrl?: string;
  giftAmount?: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'message' | 'gift' | 'videoCall' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  sender?: User;
  data?: any;
}

export interface VideoCallSession {
  id: string;
  callerId: string;
  receiverId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  cost: number;
  giftsReceived: number;
  status: 'ongoing' | 'completed' | 'cancelled';
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'unlock' | 'tip' | 'videoCall' | 'payout' | 'gift';
  amount: number;
  currency: 'coins' | 'usd';
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  relatedUserId?: string;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  walletAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  type: 'financial' | 'profile' | 'harassment';
  topic: string;
  comment: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  moderatorId?: string;
  resolution?: string;
}

export interface ContentModerationItem {
  id: string;
  userId: string;
  type: 'photo' | 'video';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  moderatorId?: string;
  rejectionReason?: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'payment' | 'moderation' | 'security';
  updatedAt: string;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalTransactions: number;
  revenueToday: number;
  videoCallMinutes: number;
  messagesSent: number;
  photosUnlocked: number;
}

export interface SearchFilters {
  datingGoal?: string;
  minAge?: number;
  maxAge?: number;
  country?: string;
  lookingFor?: 'male' | 'female' | 'all';
  isOnline?: boolean;
}

export interface GiftOption {
  id: string;
  name: string;
  coins: number;
  icon: string;
  isSpecial?: boolean;
}

export interface CoinPack {
  id: string;
  name: string;
  coins: number;
  price: number;
  originalPrice?: number;
  features: string[];
  isPopular?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

export interface ActivityItem {
  id: string;
  type: 'like' | 'view' | 'gift' | 'message';
  user: User;
  timestamp: string;
  details?: string;
}
