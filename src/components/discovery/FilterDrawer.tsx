import React from 'react';
import { 
  X, 
  Sliders, 
  MapPin, 
  Heart, 
  BookOpen, 
  Briefcase, 
  Globe, 
  Sparkles, 
  Video, 
  ShieldCheck, 
  Search, 
  RotateCcw,
  Check
} from 'lucide-react';
import { 
  MatchFilter, 
  Gender, 
  Complexion, 
  Ethnicity, 
  Religion, 
  EducationLevel 
} from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { SUGGESTED_SEARCH_CHIPS } from '../../utils/searchMatching';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MatchFilter;
  onUpdateFilters: (newFilters: Partial<MatchFilter>) => void;
  onResetFilters: () => void;
  matchCount: number;
}

const GENDERS: Gender[] = ['Woman', 'Man', 'Non-binary', 'Agender', 'Genderfluid', 'Transgender'];

const COMPLEXIONS: Complexion[] = [
  'Fair / Porcelain',
  'Warm Beige',
  'Olive / Honey',
  'Caramel / Tan',
  'Warm Bronze',
  'Deep Brown',
  'Rich Ebony'
];

const ETHNICITIES: Ethnicity[] = [
  'African / Black',
  'Asian / East & SE Asian',
  'Asian / South Asian',
  'Hispanic / Latino',
  'Middle Eastern / Arab',
  'Native / Indigenous',
  'White / Caucasian',
  'Multiracial / Mixed'
];

const RELIGIONS: Religion[] = [
  'Agnostic',
  'Atheist',
  'Buddhist',
  'Catholic',
  'Christian',
  'Hindu',
  'Jewish',
  'Muslim',
  'Spiritual / Eclectic'
];

const EDUCATION_LEVELS: EducationLevel[] = [
  'High School / Secondary',
  'Vocational / Trade School',
  "Bachelor's Degree",
  "Master's / Graduate",
  'Doctorate / PhD / MD / JD'
];

const POPULAR_HOBBIES = [
  'Hiking',
  'Baking',
  'Pottery',
  'Sound Design',
  'Paraclimbing',
  'Board Games',
  'Photography',
  'Stargazing',
  'Jazz Jamming',
  'Matcha Tastings',
  'Urban Gardening',
  'Modular Synthesizers',
  'Sourdough Baking',
  'Sci-Fi Reading',
  'Museum Crawls',
  'ASL Learning',
  'Bouldering',
  'Culinary Arts',
  'Poetry',
  'Volunteering'
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  matchCount
}) => {
  if (!isOpen) return null;

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item) ? array.filter(x => x !== item) : [...array, item];
  };

  return (
    <div 
      id="filter-drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-drawer-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
    >
      <div className="bg-neutral-900 border-l border-neutral-800 text-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 id="filter-drawer-title" className="text-sm font-bold text-white">
                Personalized Match Filters
              </h2>
              <p className="text-[11px] text-neutral-400">
                Detailed matching preferences & proximity search
              </p>
            </div>
          </div>
          <button
            id="btn-close-filter-drawer"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* Descriptive Keyword & Trait Search */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1">
              Search by Description, Trait or Keyword
            </label>
            <p className="text-[11px] text-neutral-400 mb-2">
              Filter by physical features (e.g. <em>dark complexion</em>, <em>6ft tall</em>), career, accessibility, or values.
            </p>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                id="drawer-search-query-input"
                type="text"
                placeholder="e.g. dark complexion, 6ft, ASL, educator, vegan..."
                value={filters.searchQuery}
                onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => onUpdateFilters({ searchQuery: '' })}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-2.5 p-0.5 text-neutral-400 hover:text-white rounded-full bg-neutral-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick suggested chips inside drawer */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {SUGGESTED_SEARCH_CHIPS.slice(0, 8).map((chip) => {
                const isSelected = filters.searchQuery.toLowerCase() === chip.query.toLowerCase();
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      onUpdateFilters({ searchQuery: isSelected ? '' : chip.query });
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                        : 'bg-neutral-800/70 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    <span>{chip.emoji}</span>
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Proximity Distance */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Maximum Proximity Radius
              </label>
              <span className="text-xs font-bold text-indigo-400 font-mono">
                {filters.maxDistanceKm >= 100 ? 'Worldwide (100+ km)' : `Within ${filters.maxDistanceKm} km`}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={filters.maxDistanceKm}
              onChange={(e) => onUpdateFilters({ maxDistanceKm: parseInt(e.target.value) })}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              <span>5 km</span>
              <span>25 km</span>
              <span>50 km</span>
              <span>100+ km</span>
            </div>
          </div>

          {/* Age Range */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Age Range
              </label>
              <span className="text-xs font-bold text-indigo-400 font-mono">
                {filters.minAge} - {filters.maxAge} years
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="18"
                max={filters.maxAge}
                value={filters.minAge}
                onChange={(e) => onUpdateFilters({ minAge: Math.max(18, parseInt(e.target.value) || 18) })}
                className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-center text-white"
              />
              <input
                type="number"
                min={filters.minAge}
                max="80"
                value={filters.maxAge}
                onChange={(e) => onUpdateFilters({ maxAge: Math.min(80, parseInt(e.target.value) || 80) })}
                className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-center text-white"
              />
            </div>
          </div>

          {/* Height Range */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Height Range (cm)
              </label>
              <span className="text-xs font-bold text-indigo-400 font-mono">
                {filters.minHeightCm} cm - {filters.maxHeightCm} cm
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="140"
                max={filters.maxHeightCm}
                value={filters.minHeightCm}
                onChange={(e) => onUpdateFilters({ minHeightCm: parseInt(e.target.value) || 140 })}
                className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-center text-white"
              />
              <input
                type="number"
                min={filters.minHeightCm}
                max="220"
                value={filters.maxHeightCm}
                onChange={(e) => onUpdateFilters({ maxHeightCm: parseInt(e.target.value) || 220 })}
                className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-center text-white"
              />
            </div>
          </div>

          {/* Shared Hobbies & Interests Multi-Select */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Shared Hobbies & Passions ({filters.selectedHobbies.length} selected)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_HOBBIES.map((hobby) => {
                const isSelected = filters.selectedHobbies.includes(hobby);
                return (
                  <button
                    key={hobby}
                    onClick={() => {
                      onUpdateFilters({
                        selectedHobbies: toggleArrayItem(filters.selectedHobbies, hobby)
                      });
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                        : 'bg-neutral-800/60 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {hobby}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Complexion Selector */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
              Complexion Preferences
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMPLEXIONS.map((comp) => {
                const isSelected = filters.complexions.includes(comp);
                return (
                  <button
                    key={comp}
                    onClick={() => {
                      onUpdateFilters({
                        complexions: toggleArrayItem(filters.complexions, comp)
                      });
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-neutral-800/60 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    {comp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Race & Ethnicity */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Race / Ethnicity
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ETHNICITIES.map((eth) => {
                const isSelected = filters.ethnicities.includes(eth);
                return (
                  <button
                    key={eth}
                    onClick={() => {
                      onUpdateFilters({
                        ethnicities: toggleArrayItem(filters.ethnicities, eth)
                      });
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-neutral-800/60 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    {eth}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Religion */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
              Religion / Beliefs
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RELIGIONS.map((rel) => {
                const isSelected = filters.religions.includes(rel);
                return (
                  <button
                    key={rel}
                    onClick={() => {
                      onUpdateFilters({
                        religions: toggleArrayItem(filters.religions, rel)
                      });
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-neutral-800/60 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    {rel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level of Education */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Level of Education
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EDUCATION_LEVELS.map((edu) => {
                const isSelected = filters.educationLevels.includes(edu);
                return (
                  <button
                    key={edu}
                    onClick={() => {
                      onUpdateFilters({
                        educationLevels: toggleArrayItem(filters.educationLevels, edu)
                      });
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-neutral-800/60 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    {edu}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Authenticity & Verified Filters */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 border border-neutral-700">
              <span className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-400" />
                Must have Video Bio
              </span>
              <input
                type="checkbox"
                checked={filters.requireVideoBio}
                onChange={(e) => onUpdateFilters({ requireVideoBio: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 border border-neutral-700">
              <span className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Profiles Only
              </span>
              <input
                type="checkbox"
                checked={filters.requireVerified}
                onChange={(e) => onUpdateFilters({ requireVerified: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer with Apply & Reset */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between gap-3">
          <button
            id="btn-reset-filters"
            onClick={() => {
              onResetFilters();
              audioHaptics.triggerNavigationClick();
            }}
            className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          
          <button
            id="btn-apply-filters"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Show {matchCount} {matchCount === 1 ? 'Match' : 'Matches'}
          </button>
        </div>
      </div>
    </div>
  );
};
