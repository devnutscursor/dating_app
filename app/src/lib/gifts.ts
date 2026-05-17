import type { GiftOption } from '@/types';

export const GIFT_OPTIONS: GiftOption[] = [
  { id: 'g1', name: 'Compliment', coins: 50, icon: 'compliment' },
  { id: 'g2', name: 'Small gift', coins: 100, icon: 'small_gift' },
  { id: 'g3', name: 'Full Access', coins: 250, icon: 'full_access', isSpecial: true },
];

export const CUSTOM_GIFT_ID = 'custom';

export const MIN_CUSTOM_GIFT_COINS = 10;
export const MAX_CUSTOM_GIFT_COINS = 50_000;
export const MAX_GIFT_COMMENT_LENGTH = 500;

export type GiftSendPayload = {
  name: string;
  coins: number;
  comment?: string;
};
