import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchFilters } from '@/contexts/SearchFiltersContext';
import {
  buildSearchFilterChips,
  hasActiveSearchFilters,
} from '@/lib/searchFilterChips';

type AppliedSearchFiltersBarProps = {
  resultCount?: number;
  loading?: boolean;
};

export default function AppliedSearchFiltersBar({
  resultCount,
  loading = false,
}: AppliedSearchFiltersBarProps) {
  const { filters, userIdSearch, clearFilter, resetFilters, openFilterModal } =
    useSearchFilters();

  if (!hasActiveSearchFilters(filters, userIdSearch)) {
    return null;
  }

  const chips = buildSearchFilterChips(filters, userIdSearch);

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-green-600" />
          <span className="text-sm font-semibold text-gray-900">Active filters</span>
          {!loading && resultCount !== undefined && (
            <span className="text-sm text-gray-500">
              · {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={openFilterModal}>
            Edit filters
          </Button>
          <Button type="button" size="sm" variant="ghost" className="text-gray-600" onClick={resetFilters}>
            Clear all
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-900"
          >
            {chip.label}
            <button
              type="button"
              onClick={() => clearFilter(chip.id)}
              className="rounded-full p-0.5 text-green-700 transition-colors hover:bg-green-200/80 hover:text-green-950"
              aria-label={`Remove ${chip.label} filter`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
