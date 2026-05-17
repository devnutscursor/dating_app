import { Coins, Crown, Gift, MessageCircleHeart } from 'lucide-react';
import type { GiftIconKind } from '@/types';
import { cn } from '@/lib/utils';

type Props = {
  kind: GiftIconKind | string;
  className?: string;
  strokeWidth?: number;
};

export function GiftOptionIcon({ kind, className, strokeWidth = 2 }: Props) {
  const props = { className: cn('shrink-0', className), strokeWidth };
  switch (kind) {
    case 'compliment':
      return <MessageCircleHeart {...props} />;
    case 'small_gift':
      return <Gift {...props} />;
    case 'full_access':
      return <Crown {...props} />;
    case 'custom':
      return <Coins {...props} />;
    default:
      return <Gift {...props} />;
  }
}
