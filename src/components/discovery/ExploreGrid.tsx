import React from 'react';
import { Sparkles, Video, MapPin, CheckCircle2, Heart, Sliders, Layers } from 'lucide-react';
import { UserProfile } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { calculateCompatibility } from '../../data/mockProfiles';
import { SearchDescriptionBar } from './SearchDescriptionBar';
import { getSearchMatchReasons } from '../../utils/searchMatching';
import { CompatibilityScoreIndicator } from './CompatibilityScoreIndicator';

interface ExploreGridProps {
  profiles: UserProfile[];
  currentUser: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
  onOpenVideoBio: (profile: UserProfile) => void;
  onOpenDateNight?: (profile: UserProfile) => void;
  onOpenSmartOpener?: (profile: UserProfile) => void;
  onOpenFilters: () => void;
  onToggleViewMode: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const ExploreGrid: React.FC<ExploreGridProps> = ({
  profiles,
  currentUser,
  onSelectProfile,
  onOpenVideoBio,
  onOpenDateNight,
  onOpenSmartOpener,
  onOpenFilters,
  onToggleViewMode,
  searchQuery = '',
  onSearchChange
}) => {
  return (
    <div id="explore-grid-container" className="w-full max-w-5xl mx-auto p-4 flex-1">
      {/* Top Search & Filter Bar */}
      {onSearchChange && (
        <SearchDescriptionBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          matchCount={profiles.length}
          totalCount={profiles.length}
          onOpenFilters={onOpenFilters}
        />
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Explore Compatible Matches
          </h2>
          <p className="text-xs text-neutral-400">
            {profiles.length} profiles matching your proximity and preference filters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleViewMode}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5"
            title="Switch to Card Deck Mode"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Deck Mode</span>
          </button>
          <button
            onClick={onOpenFilters}
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {profiles.length === 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-white max-w-md mx-auto shadow-2xl my-8">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">No Matching Profiles Found</h3>
          <p className="text-xs text-neutral-400 mb-6">
            No users matched <span className="text-white font-semibold">"{searchQuery}"</span>. Try a broader search like "dark complexion", "6ft", "ASL", or reset your filters.
          </p>
          <button
            onClick={() => onSearchChange && onSearchChange('')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => {
          const compatibility = calculateCompatibility(currentUser, profile);
          const searchMatchReasons = searchQuery.trim() ? getSearchMatchReasons(profile, searchQuery) : [];

          return (
            <div
              key={profile.id}
              onClick={() => {
                onSelectProfile(profile);
                audioHaptics.triggerNavigationClick();
              }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-lg hover:border-indigo-500/60 transition-all hover:scale-[1.01] cursor-pointer group flex flex-col"
            >
              {/* Image Preview */}
              <div className="relative h-64 w-full bg-neutral-950 overflow-hidden">
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/40" />

                {/* Compatibility indicator badge */}
                <div className="absolute top-3 left-3 z-10">
                  <CompatibilityScoreIndicator
                    compatibility={compatibility}
                    profile={profile}
                    currentUser={currentUser}
                    compact
                  />
                </div>

                {/* Video Bio pill */}
                {profile.videoBio && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenVideoBio(profile);
                    }}
                    className="absolute top-3 right-3 bg-rose-600/90 hover:bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-400/40 shadow flex items-center gap-1"
                  >
                    <Video className="w-3 h-3" />
                    <span>Video</span>
                  </button>
                )}

                {/* Name & Distance */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                    {profile.name}, {profile.age}
                    {profile.verified && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                  </h3>
                  <p className="text-xs text-neutral-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    {profile.locationCity}
                  </p>
                </div>
              </div>

              {/* Bio & Hobbies */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {/* Search Match Highlights */}
                {searchMatchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-[10px]">
                    <span className="text-indigo-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                      Matched:
                    </span>
                    {searchMatchReasons.map((r, i) => (
                      <span key={i} className="text-indigo-200 font-semibold bg-indigo-900/60 px-1.5 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                  {profile.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {profile.hobbies.slice(0, 3).map((h, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded-lg"
                    >
                      {h}
                    </span>
                  ))}
                  {profile.hobbies.length > 3 && (
                    <span className="text-[10px] text-neutral-400 self-center px-1">
                      +{profile.hobbies.length - 3} more
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="truncate">{profile.jobTitle}</span>
                  <div className="flex items-center gap-1.5">
                    {onOpenSmartOpener && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioHaptics.triggerNavigationClick();
                          onOpenSmartOpener(profile);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title={`Generate AI Smart Opener icebreakers for ${profile.name}`}
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                        <span>Opener</span>
                      </button>
                    )}
                    {onOpenDateNight && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioHaptics.triggerNavigationClick();
                          onOpenDateNight(profile);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title={`View 3 Date Night Suggestions for ${profile.name}`}
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>Date Ideas</span>
                      </button>
                    )}
                    <span className="font-semibold text-emerald-400">{profile.heightFeet}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

