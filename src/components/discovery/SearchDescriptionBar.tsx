import React from 'react';
import { Search, X, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { SUGGESTED_SEARCH_CHIPS } from '../../utils/searchMatching';
import { audioHaptics } from '../../services/audioHaptics';

interface SearchDescriptionBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchCount?: number;
  totalCount?: number;
  onOpenFilters?: () => void;
  compact?: boolean;
}

export const SearchDescriptionBar: React.FC<SearchDescriptionBarProps> = ({
  searchQuery,
  onSearchChange,
  matchCount,
  totalCount,
  onOpenFilters,
  compact = false
}) => {
  const handleChipClick = (chipQuery: string) => {
    audioHaptics.triggerNavigationClick();
    if (searchQuery.toLowerCase() === chipQuery.toLowerCase()) {
      onSearchChange('');
    } else {
      onSearchChange(chipQuery);
    }
  };

  const handleClear = () => {
    audioHaptics.triggerNavigationClick();
    onSearchChange('');
  };

  return (
    <div id="search-description-bar" className="w-full space-y-2 mb-3">
      {/* Search Input Box */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center">
            <Search className="w-4 h-4 text-indigo-400" />
          </div>

          <input
            id="input-description-search"
            type="text"
            role="searchbox"
            aria-label="Search users by name, username, physical traits, or interests"
            placeholder="Search by name, @username, traits, or interests..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neutral-900/90 hover:bg-neutral-900 focus:bg-neutral-900 text-white placeholder-neutral-400 text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-2xl border border-neutral-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none shadow-inner"
          />

          {searchQuery && (
            <button
              id="btn-clear-description-search"
              onClick={handleClear}
              aria-label="Clear search filter"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-full bg-neutral-800 hover:bg-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {onOpenFilters && (
          <button
            id="btn-open-filter-drawer"
            onClick={onOpenFilters}
            aria-label="Open detailed preferences and match filters"
            className="px-3 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">All Filters</span>
          </button>
        )}
      </div>

      {/* Suggested Search Description Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Suggestions:
        </span>

        {SUGGESTED_SEARCH_CHIPS.map((chip) => {
          const isSelected = searchQuery.toLowerCase() === chip.query.toLowerCase();
          return (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip.query)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold'
                  : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
              {isSelected && <Check className="w-3 h-3 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Active Description Filter Match Feedback */}
      {searchQuery.trim() && matchCount !== undefined && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Showing <strong className="text-white font-bold">{matchCount}</strong> {matchCount === 1 ? 'profile' : 'profiles'} matching <span className="underline font-semibold decoration-indigo-400">"{searchQuery}"</span>
            </span>
          </span>
          <button
            onClick={handleClear}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-200 underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};
