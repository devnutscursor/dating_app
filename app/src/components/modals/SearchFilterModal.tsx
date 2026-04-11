import { useState } from 'react';
import { X, Search, MapPin, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { datingGoals, countries } from '@/config/design';

interface SearchFilterModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchFilterModal({ open, onClose }: SearchFilterModalProps) {
  const [searchId, setSearchId] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [isOnline, setIsOnline] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Search by ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by ID</label>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter user ID"
                className="bg-transparent border-none outline-none text-sm flex-1"
              />
            </div>
          </div>

          {/* Dating Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Dating Goal
            </label>
            <div className="space-y-2">
              {datingGoals.map((goal) => (
                <label 
                  key={goal.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
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
                    className="w-4 h-4 text-green-500"
                  />
                  <span className="text-sm text-gray-700">{goal.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  min={18}
                  max={99}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <span className="text-xs text-gray-500 mt-1 block">Min Age</span>
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  min={18}
                  max={99}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <span className="text-xs text-gray-500 mt-1 block">Max Age</span>
              </div>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.flag} {country.label}
                </option>
              ))}
            </select>
          </div>

          {/* Online Status */}
          <div>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="checkbox"
                checked={isOnline}
                onChange={(e) => setIsOnline(e.target.checked)}
                className="w-4 h-4 text-green-500"
              />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Show only online users</span>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Reset
          </Button>
          <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
