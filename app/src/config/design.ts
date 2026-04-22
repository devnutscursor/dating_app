// Design System Configuration for MemberDate
// All design elements can be changed from this single file

export const colors = {
  // Primary Colors
  primary: {
    DEFAULT: '#22c55e', // Green buttons, actions
    hover: '#16a34a',
    light: '#86efac',
    dark: '#15803d',
  },
  
  // Secondary Colors
  secondary: {
    DEFAULT: '#3b82f6', // Blue accents
    hover: '#2563eb',
    light: '#93c5fd',
    dark: '#1d4ed8',
  },
  
  // Accent Colors
  accent: {
    gold: '#fbbf24', // Coins, premium
    goldDark: '#f59e0b',
    red: '#ef4444', // Block, report, cancel
    redDark: '#dc2626',
    orange: '#f97316', // Warnings
    purple: '#a855f7', // Special features
  },
  
  // Neutral Colors
  neutral: {
    white: '#ffffff',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    black: '#000000',
  },
  
  // Background Colors
  background: {
    main: '#ffffff',
    sidebar: '#f9fafb',
    card: '#ffffff',
    modal: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
  
  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    muted: '#9ca3af',
    inverse: '#ffffff',
    link: '#3b82f6',
  },
  
  // Status Colors
  status: {
    online: '#22c55e',
    offline: '#9ca3af',
    away: '#fbbf24',
    busy: '#ef4444',
  },
  
  // Border Colors
  border: {
    DEFAULT: '#e5e7eb',
    light: '#f3f4f6',
    dark: '#d1d5db',
  },
};

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['Monaco', 'monospace'],
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',  // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.75rem',  // 12px
  lg: '1rem',     // 16px
  xl: '1.5rem',   // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

export const transitions = {
  fast: '150ms ease-in-out',
  DEFAULT: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Coin pricing configuration
export const coinPricing = {
  photoUnlock: 10,
  videoUnlock: 50,
  videoCallPerMinute: 10,
  messagePriority: 5,
  profileBoost: 100,
  packs: [
    { name: 'Standard Pack', coins: 100, price: 14.99, originalPrice: null, features: ['Profile Boost (24hrs)'] },
    { name: 'Medium Pack', coins: 250, price: 35.99, originalPrice: 37.50, features: ['Profile Boost (24hrs)', 'Messages Priority (24 hrs)'] },
    { name: 'Elite Pack', coins: 1000, price: 139.99, originalPrice: 149.99, features: ['Profile Priority', 'Messages Priority'] },
  ],
};

// Navigation items
export const navigationItems = {
  man: [
    { id: 'home', label: 'Home', icon: 'Home', href: '/man/home' },
    { id: 'profile', label: 'My profile', icon: 'User', href: '/man/profile' },
    { id: 'chats', label: 'All chats', icon: 'Mail', href: '/man/chats' },
    { id: 'likes', label: 'Likes', icon: 'Heart', href: '/man/likes' },
    { id: 'online', label: 'Online', icon: 'ToggleLeft', href: '/man/online' },
    { id: 'faq', label: 'FAQ', icon: 'Shield', href: '/man/faq' },
    { id: 'wallet', label: 'My wallet', icon: 'Wallet', href: '/man/wallet' },
  ],
  woman: [
    { id: 'home', label: 'Home', icon: 'Home', href: '/woman/home' },
    { id: 'profile', label: 'My profile', icon: 'User', href: '/woman/profile' },
    { id: 'chats', label: 'All chats', icon: 'Mail', href: '/woman/chats' },
    { id: 'likes', label: 'Likes', icon: 'Heart', href: '/woman/likes' },
    { id: 'online', label: 'Online', icon: 'ToggleLeft', href: '/woman/online' },
    { id: 'faq', label: 'FAQ', icon: 'Shield', href: '/woman/faq' },
    { id: 'wallet', label: 'My wallet', icon: 'Wallet', href: '/woman/wallet' },
  ],
};

// Dating goals options
export const datingGoals = [
  { value: 'long-term', label: 'Long-term relationship' },
  { value: 'short-term', label: 'Short-term relationship' },
  { value: 'friendship', label: 'Friendship' },
  { value: 'figuring-out', label: 'I\'m still figuring it out' },
  { value: 'just-fun', label: 'Just have fun' },
];

// Countries list (simplified)
export const countries = [
  { value: 'ua', label: 'Ukraine', flag: '🇺🇦' },
  { value: 'us', label: 'United States', flag: '🇺🇸' },
  { value: 'gb', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'de', label: 'Germany', flag: '🇩🇪' },
  { value: 'fr', label: 'France', flag: '🇫🇷' },
  { value: 'it', label: 'Italy', flag: '🇮🇹' },
  { value: 'es', label: 'Spain', flag: '🇪🇸' },
  { value: 'pl', label: 'Poland', flag: '🇵🇱' },
];

// Report types
export const reportTypes = [
  { value: 'financial', label: 'Financial Dispute', color: 'red' },
  { value: 'profile', label: 'Profile Mismatch', color: 'blue' },
  { value: 'harassment', label: 'Harassment/Spam', color: 'green' },
];

// Interest tags
export const interestTags = [
  'Travel', 'Technology', 'Hiking', 'Relax', 'Poker', 'Chess',
  'Music', 'Sports', 'Reading', 'Cooking', 'Gaming', 'Fitness',
];

/** Sidebar logo row + main `Header` — identical height so the bottom border reads as one line. */
export const layoutTopBarRowClass =
  'flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6';

/** Sidebar “You” row — same height as in-chat “Chats + search” header (`layoutChatsListColumnHeaderClass`). */
export const layoutChatsListProfileBandClass =
  'flex h-24 shrink-0 items-center border-b border-gray-200 bg-white px-4';

/** In-chat left column: “Chats” title + search — matches sidebar profile strip height. */
export const layoutChatsListColumnHeaderClass =
  'flex h-24 shrink-0 flex-col justify-center gap-2 border-b border-gray-200 bg-white px-4';

/**
 * Partner row toolbar + Activity panel title — shorter than chats/profile strip (`h-24`); fits title + subtitle typography.
 */
export const layoutConversationToolbarClass =
  'flex h-20 shrink-0 items-center border-b border-gray-200 bg-white px-4';

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  coinPricing,
  navigationItems,
  datingGoals,
  countries,
  reportTypes,
  interestTags,
};
