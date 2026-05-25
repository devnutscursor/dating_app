import type { SearchFilters } from '@/types';
import { DEFAULT_SEARCH_FILTERS } from '@/contexts/SearchFiltersContext';

export const CACHE = {
  online: 'online',
  activities: 'activities',
  coinPacks: 'wallet:packs',
  transactions: 'wallet:transactions',
  profile: (userId: string) => `profile:${userId}`,
  discover: (filters: SearchFilters, userIdSearch: string, version: number) =>
    `discover:v${version}:${userIdSearch}:${JSON.stringify(filters)}`,
  defaultDiscover: () =>
    `discover:v0::${JSON.stringify(DEFAULT_SEARCH_FILTERS)}`,
} as const;
