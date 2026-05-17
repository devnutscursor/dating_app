import type { GiftIconKind } from '@/types';

/** Visual theme for chat gift cards — keyed by gift label (see `GIFT_OPTIONS` names). */

export type GiftVisualTokens = {
  card: string;
  orb: string;
  icon: string;
  label: string;
  title: string;
  pill: string;
  coinsIcon: string;
  time: string;
};

type Pair = { sent: GiftVisualTokens; received: GiftVisualTokens };

function hashName(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const COMPLIMENT: Pair = {
  sent: {
    card: 'border-violet-300/90 bg-gradient-to-br from-violet-200 via-purple-100 to-fuchsia-100 text-violet-950',
    orb: 'bg-violet-400',
    icon: 'bg-gradient-to-br from-violet-600 to-purple-700 text-white ring-violet-300/40',
    label: 'text-violet-900/75',
    title: 'text-violet-950',
    pill: 'bg-white/85 text-violet-950 ring-violet-400/50',
    coinsIcon: 'text-violet-600',
    time: 'text-violet-900/55',
  },
  received: {
    card: 'border-violet-200/90 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 text-violet-950',
    orb: 'bg-violet-300',
    icon: 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white ring-violet-200/60',
    label: 'text-violet-800/80',
    title: 'text-violet-950',
    pill: 'bg-white/90 text-violet-950 ring-violet-300/55',
    coinsIcon: 'text-violet-600',
    time: 'text-violet-900/50',
  },
};

const SMALL_GIFT: Pair = {
  sent: {
    card: 'border-teal-300/90 bg-gradient-to-br from-teal-200 via-cyan-100 to-emerald-100 text-teal-950',
    orb: 'bg-teal-400',
    icon: 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white ring-teal-300/45',
    label: 'text-teal-900/75',
    title: 'text-teal-950',
    pill: 'bg-white/85 text-teal-950 ring-teal-400/50',
    coinsIcon: 'text-teal-600',
    time: 'text-teal-900/55',
  },
  received: {
    card: 'border-teal-200/90 bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-100 text-teal-950',
    orb: 'bg-teal-300',
    icon: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white ring-teal-200/55',
    label: 'text-teal-800/80',
    title: 'text-teal-950',
    pill: 'bg-white/90 text-teal-950 ring-teal-300/55',
    coinsIcon: 'text-teal-600',
    time: 'text-teal-900/50',
  },
};

const FULL_ACCESS: Pair = {
  sent: {
    card: 'border-amber-400/95 bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-200 text-amber-950',
    orb: 'bg-amber-400',
    icon: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white ring-amber-300/50',
    label: 'text-amber-900/80',
    title: 'text-amber-950',
    pill: 'bg-white/90 text-amber-950 ring-amber-400/55',
    coinsIcon: 'text-amber-700',
    time: 'text-amber-900/55',
  },
  received: {
    card: 'border-orange-200/90 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100 text-amber-950',
    orb: 'bg-orange-300',
    icon: 'bg-gradient-to-br from-orange-500 to-rose-600 text-white ring-orange-200/55',
    label: 'text-orange-900/75',
    title: 'text-amber-950',
    pill: 'bg-white/90 text-amber-950 ring-orange-300/55',
    coinsIcon: 'text-orange-600',
    time: 'text-amber-900/50',
  },
};

/** Extra palettes for unknown / future gift names (stable per label). */
const FALLBACK: Pair[] = [
  {
    sent: {
      card: 'border-sky-300/90 bg-gradient-to-br from-sky-200 via-blue-50 to-indigo-100 text-sky-950',
      orb: 'bg-sky-400',
      icon: 'bg-gradient-to-br from-sky-600 to-blue-700 text-white ring-sky-300/45',
      label: 'text-sky-900/75',
      title: 'text-sky-950',
      pill: 'bg-white/85 text-sky-950 ring-sky-400/50',
      coinsIcon: 'text-sky-600',
      time: 'text-sky-900/55',
    },
    received: {
      card: 'border-sky-200/90 bg-gradient-to-br from-blue-50 to-sky-100 text-sky-950',
      orb: 'bg-sky-300',
      icon: 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white ring-sky-200/50',
      label: 'text-sky-800/78',
      title: 'text-sky-950',
      pill: 'bg-white/90 text-sky-950 ring-sky-300/50',
      coinsIcon: 'text-sky-600',
      time: 'text-sky-900/50',
    },
  },
  {
    sent: {
      card: 'border-rose-300/90 bg-gradient-to-br from-rose-200 via-pink-100 to-fuchsia-100 text-rose-950',
      orb: 'bg-rose-400',
      icon: 'bg-gradient-to-br from-rose-600 to-pink-600 text-white ring-rose-300/45',
      label: 'text-rose-900/75',
      title: 'text-rose-950',
      pill: 'bg-white/85 text-rose-950 ring-rose-400/50',
      coinsIcon: 'text-rose-600',
      time: 'text-rose-900/55',
    },
    received: {
      card: 'border-rose-200/90 bg-gradient-to-br from-pink-50 to-rose-100 text-rose-950',
      orb: 'bg-rose-300',
      icon: 'bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white ring-rose-200/50',
      label: 'text-rose-800/78',
      title: 'text-rose-950',
      pill: 'bg-white/90 text-rose-950 ring-rose-300/50',
      coinsIcon: 'text-rose-600',
      time: 'text-rose-900/50',
    },
  },
  {
    sent: {
      card: 'border-lime-300/90 bg-gradient-to-br from-lime-200 via-green-100 to-emerald-100 text-lime-950',
      orb: 'bg-lime-400',
      icon: 'bg-gradient-to-br from-lime-600 to-green-700 text-white ring-lime-300/45',
      label: 'text-lime-900/75',
      title: 'text-lime-950',
      pill: 'bg-white/85 text-lime-950 ring-lime-400/50',
      coinsIcon: 'text-lime-700',
      time: 'text-lime-900/55',
    },
    received: {
      card: 'border-lime-200/90 bg-gradient-to-br from-green-50 to-lime-100 text-lime-950',
      orb: 'bg-lime-300',
      icon: 'bg-gradient-to-br from-green-600 to-lime-600 text-white ring-lime-200/50',
      label: 'text-lime-800/78',
      title: 'text-lime-950',
      pill: 'bg-white/90 text-lime-950 ring-lime-300/50',
      coinsIcon: 'text-lime-700',
      time: 'text-lime-900/50',
    },
  },
];

const BY_NAME: Record<string, Pair> = {
  compliment: COMPLIMENT,
  'small gift': SMALL_GIFT,
  'full access': FULL_ACCESS,
  'custom gift': FALLBACK[0],
};

export function giftIconKindForLabel(giftName: string | undefined): GiftIconKind {
  const key = giftName?.trim().toLowerCase() || '';
  if (key === 'compliment') return 'compliment';
  if (key === 'small gift') return 'small_gift';
  if (key === 'full access') return 'full_access';
  if (key === 'custom gift') return 'custom';
  return 'small_gift';
}

export function getGiftVisualTheme(giftName: string | undefined, isMe: boolean): GiftVisualTokens {
  const key = giftName?.trim().toLowerCase() || '';
  const pair = BY_NAME[key] ?? FALLBACK[hashName(key) % FALLBACK.length];
  return isMe ? pair.sent : pair.received;
}
