import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Search, MapPin, Heart, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { datingGoals, countries } from '@/config/design';
import { DEFAULT_SEARCH_FILTERS, useSearchFilters } from '@/contexts/SearchFiltersContext';
import type { SearchFilters } from '@/types';
import { profileReturnState } from '@/lib/profileNavigation';

interface SearchFilterModalProps {
  open: boolean;
  onClose: () => void;
  userType: 'man' | 'woman';
}

export default function SearchFilterModal({ open, onClose, userType }: SearchFilterModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { filters, userIdSearch, applyFilters, resetFilters } = useSearchFilters();

  const [searchId, setSearchId] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearchId(userIdSearch);
    setSelectedGoal(filters.datingGoal ?? '');
    setSelectedCountry(filters.country ?? '');
    setMinAge(filters.minAge ?? DEFAULT_SEARCH_FILTERS.minAge ?? 18);
    setMaxAge(filters.maxAge ?? DEFAULT_SEARCH_FILTERS.maxAge ?? 99);
    setIsOnline(Boolean(filters.isOnline));
  }, [open, filters, userIdSearch]);

  if (!open) return null;

  const buildFilters = (): SearchFilters => ({
    ...(selectedGoal ? { datingGoal: selectedGoal } : {}),
    ...(selectedCountry ? { country: selectedCountry } : {}),
    minAge,
    maxAge,
    ...(isOnline ? { isOnline: true } : {}),
  });

  const handleApply = () => {
    const next = buildFilters();
    applyFilters(next, searchId.trim());
    onClose();
    if (searchId.trim()) {
      navigate(
        `/${userType}/view-profile/${searchId.trim()}`,
        profileReturnState(location.pathname + location.search)
      );
      return;
    }
    navigate(`/${userType}/home`);
    toast.success('Filters applied');
  };

  const handleReset = () => {
    resetFilters();
    onClose();
    navigate(`/${userType}/home`);
    toast.message('Filters cleared');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} role="presentation" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 p-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Search by ID</label>
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter user ID"
                className="flex-1 border-none bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Heart className="h-4 w-4 text-pink-500" />
              Dating Goal
            </label>
            <div className="space-y-2">
              {datingGoals.map((goal) => (
                <label
                  key={goal.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedGoal === goal.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="datingGoal"
                    value={goal.value}
                    checked={selectedGoal === goal.value}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="h-4 w-4 text-green-500"
                  />
                  <span className="text-sm text-gray-700">{goal.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Age Range</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  min={18}
                  max={99}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-gray-500">Min Age</span>
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  min={18}
                  max={99}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-gray-500">Max Age</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="h-4 w-4 text-blue-500" />
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.flag} {country.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="h-4 w-4 text-green-500"
            />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">Show only online users</span>
            </div>
          </label>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white p-4">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
          <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
