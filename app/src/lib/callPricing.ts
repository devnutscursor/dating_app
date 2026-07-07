import { useEffect, useState } from 'react';
import { coinPricing } from '@/config/design';
import { apiGet } from '@/lib/api';
import type { CallType } from '@/lib/chatSocket';

export type CallPricingRates = {
  audioCallPerMinute: number;
  videoCallPerMinute: number;
};

const FALLBACK: CallPricingRates = {
  audioCallPerMinute: coinPricing.audioCallPerMinute,
  videoCallPerMinute: coinPricing.videoCallPerMinute,
};

let cached: CallPricingRates | null = null;

export async function fetchCallPricing(): Promise<CallPricingRates> {
  if (cached) return cached;
  try {
    const data = await apiGet<{ coinPricing?: Partial<CallPricingRates> }>('/settings/public');
    cached = {
      audioCallPerMinute:
        Number(data.coinPricing?.audioCallPerMinute) > 0
          ? Number(data.coinPricing?.audioCallPerMinute)
          : FALLBACK.audioCallPerMinute,
      videoCallPerMinute:
        Number(data.coinPricing?.videoCallPerMinute) > 0
          ? Number(data.coinPricing?.videoCallPerMinute)
          : FALLBACK.videoCallPerMinute,
    };
  } catch {
    cached = FALLBACK;
  }
  return cached;
}

export function coinsPerMinuteForType(rates: CallPricingRates, callType: CallType): number {
  return callType === 'audio' ? rates.audioCallPerMinute : rates.videoCallPerMinute;
}

export function insufficientCoinsForCallMessage(callType: CallType, coinsPerMinute: number): string {
  const label = callType === 'audio' ? 'voice call' : 'video chat';
  return `You need at least ${coinsPerMinute} coins to start a ${label}.`;
}

export function invalidateCallPricingCache() {
  cached = null;
}

export function useCallPricing(): CallPricingRates {
  const [rates, setRates] = useState<CallPricingRates>(FALLBACK);
  useEffect(() => {
    void fetchCallPricing().then(setRates);
  }, []);
  return rates;
}
