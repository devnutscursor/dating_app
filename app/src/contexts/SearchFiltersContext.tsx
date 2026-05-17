import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { SearchFilters } from '@/types';
import type { SearchFilterChipId } from '@/lib/searchFilterChips';

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  minAge: 18,
  maxAge: 99,
};

type SearchFiltersContextValue = {
  filters: SearchFilters;
  userIdSearch: string;
  setFilters: (next: SearchFilters) => void;
  setUserIdSearch: (id: string) => void;
  resetFilters: () => void;
  applyFilters: (next: SearchFilters, userId?: string) => void;
  clearFilter: (id: SearchFilterChipId) => void;
  version: number;
  filterModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  openFilterModal: () => void;
};

const SearchFiltersContext = createContext<SearchFiltersContextValue | null>(null);

export function SearchFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<SearchFilters>({ ...DEFAULT_SEARCH_FILTERS });
  const [userIdSearch, setUserIdSearch] = useState('');
  const [version, setVersion] = useState(0);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const setFilters = useCallback((next: SearchFilters) => {
    setFiltersState(next);
    setVersion((v) => v + 1);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({ ...DEFAULT_SEARCH_FILTERS });
    setUserIdSearch('');
    setVersion((v) => v + 1);
  }, []);

  const applyFilters = useCallback((next: SearchFilters, userId?: string) => {
    setFiltersState(next);
    setUserIdSearch(userId?.trim() ?? '');
    setVersion((v) => v + 1);
  }, []);

  const openFilterModal = useCallback(() => setFilterModalOpen(true), []);

  const clearFilter = useCallback((id: SearchFilterChipId) => {
    if (id === 'userId') {
      setUserIdSearch('');
    } else if (id === 'datingGoal') {
      setFiltersState((prev) => {
        const { datingGoal: _removed, ...rest } = prev;
        return rest;
      });
    } else if (id === 'country') {
      setFiltersState((prev) => {
        const { country: _removed, ...rest } = prev;
        return rest;
      });
    } else if (id === 'isOnline') {
      setFiltersState((prev) => {
        const { isOnline: _removed, ...rest } = prev;
        return rest;
      });
    } else if (id === 'ageRange') {
      setFiltersState((prev) => ({
        ...prev,
        minAge: DEFAULT_SEARCH_FILTERS.minAge,
        maxAge: DEFAULT_SEARCH_FILTERS.maxAge,
      }));
    }
    setVersion((v) => v + 1);
  }, []);

  const value = useMemo(
    () => ({
      filters,
      userIdSearch,
      setFilters,
      setUserIdSearch,
      resetFilters,
      applyFilters,
      clearFilter,
      version,
      filterModalOpen,
      setFilterModalOpen,
      openFilterModal,
    }),
    [
      filters,
      userIdSearch,
      setFilters,
      resetFilters,
      applyFilters,
      clearFilter,
      version,
      filterModalOpen,
      openFilterModal,
    ]
  );

  return <SearchFiltersContext.Provider value={value}>{children}</SearchFiltersContext.Provider>;
}

export function useSearchFilters() {
  const ctx = useContext(SearchFiltersContext);
  if (!ctx) {
    throw new Error('useSearchFilters must be used within SearchFiltersProvider');
  }
  return ctx;
}
