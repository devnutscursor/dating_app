import { countries, datingGoals } from '@/config/design';
import { DEFAULT_SEARCH_FILTERS } from '@/contexts/SearchFiltersContext';
import type { SearchFilters } from '@/types';

export type SearchFilterChipId =
  | 'userId'
  | 'datingGoal'
  | 'country'
  | 'isOnline'
  | 'ageRange';

export type SearchFilterChip = {
  id: SearchFilterChipId;
  label: string;
};

export function hasActiveSearchFilters(
  filters: SearchFilters,
  userIdSearch: string
): boolean {
  if (userIdSearch.trim()) return true;
  if (filters.datingGoal) return true;
  if (filters.country) return true;
  if (filters.isOnline) return true;
  const min = filters.minAge ?? DEFAULT_SEARCH_FILTERS.minAge ?? 18;
  const max = filters.maxAge ?? DEFAULT_SEARCH_FILTERS.maxAge ?? 99;
  if (min > (DEFAULT_SEARCH_FILTERS.minAge ?? 18)) return true;
  if (max < (DEFAULT_SEARCH_FILTERS.maxAge ?? 99)) return true;
  return false;
}

export function buildSearchFilterChips(
  filters: SearchFilters,
  userIdSearch: string
): SearchFilterChip[] {
  const chips: SearchFilterChip[] = [];
  const trimmedId = userIdSearch.trim();
  if (trimmedId) {
    const shortId = trimmedId.length > 12 ? `${trimmedId.slice(0, 8)}…` : trimmedId;
    chips.push({ id: 'userId', label: `ID: ${shortId}` });
  }
  if (filters.datingGoal) {
    const goal = datingGoals.find((g) => g.value === filters.datingGoal);
    chips.push({ id: 'datingGoal', label: goal?.label ?? filters.datingGoal });
  }
  if (filters.country) {
    const c = countries.find((x) => x.value === filters.country);
    chips.push({
      id: 'country',
      label: c ? `${c.flag} ${c.label}` : filters.country,
    });
  }
  const min = filters.minAge ?? DEFAULT_SEARCH_FILTERS.minAge ?? 18;
  const max = filters.maxAge ?? DEFAULT_SEARCH_FILTERS.maxAge ?? 99;
  const defaultMin = DEFAULT_SEARCH_FILTERS.minAge ?? 18;
  const defaultMax = DEFAULT_SEARCH_FILTERS.maxAge ?? 99;
  if (min > defaultMin || max < defaultMax) {
    chips.push({ id: 'ageRange', label: `Age ${min}–${max}` });
  }
  if (filters.isOnline) {
    chips.push({ id: 'isOnline', label: 'Online only' });
  }
  return chips;
}
