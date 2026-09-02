import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  Heart, 
  MessageCircle, 
  Grid, 
  Layers, 
  Mic, 
  Volume2 
} from 'lucide-react';
import { UserProfile, MatchFilter } from '../../types/dating';
import { ProfileCard } from './ProfileCard';
import { SearchDescriptionBar } from './SearchDescriptionBar';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface DiscoveryDeckProps {
  profiles: UserProfile[];
  currentUser: UserProfile;
  onOpenVideoBio: (profile: UserProfile) => void;
  onOpenDateNight?: (profile: UserProfile) => void;
  onOpenSmartOpener?: (profile: UserProfile) => void;
  onOpenFilters: () => void;
  onStartChatWith: (profile: UserProfile) => void;
  isBiometricLocked?: boolean;
  onResetDeck: () => void;
  onToggleViewMode: () => void;
  viewMode: 'deck' | 'grid';
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const DiscoveryDeck: React.FC<DiscoveryDeckProps> = ({
  profiles,
  currentUser,
  onOpenVideoBio,
  onOpenDateNight,
  onOpenSmartOpener,
  onOpenFilters,
  onStartChatWith,
  isBiometricLocked = false,
  onResetDeck,
  onToggleViewMode,
  viewMode,
  searchQuery = '',
  onSearchChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);

  // Auto reset index when search query changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery, profiles.length]);

  const currentProfile = profiles[currentIndex];

  // Auto-announce profile to screen reader when card changes
  useEffect(() => {
    if (currentProfile) {
      const detailsParts = [
        currentProfile.name,
        currentProfile.age > 0 ? `age ${currentProfile.age}` : null,
        currentProfile.jobTitle || null,
        currentProfile.locationCity || null
      ].filter(Boolean);
      const announce = `Viewing profile of ${detailsParts.join(', ')}.`;
      speechService.speak(announce, undefined, false);
    }
  }, [currentIndex, currentProfile]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!currentProfile) return;

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'l') {
        handleLike();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'x') {
        handlePass();
      } else if (e.key.toLowerCase() === 's') {
        handleSuperLike();
      } else if (e.key.toLowerCase() === 'v' && currentProfile.videoBio) {
        onOpenVideoBio(currentProfile);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentProfile]);

  const handleLike = () => {
    if (!currentProfile) return;
    audioHaptics.triggerSwipeRight();

    // Trigger match celebration for demo authenticity
    if (currentIndex % 2 === 0 || currentProfile.verified) {
      triggerMatch(currentProfile);
    } else {
      nextCard();
    }
  };

  const handlePass = () => {
    if (!currentProfile) return;
    audioHaptics.triggerSwipeLeft();
    nextCard();
  };

  const handleSuperLike = () => {
    if (!currentProfile) return;
    audioHaptics.triggerSuperLike();
    triggerMatch(currentProfile);
  };

  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const triggerMatch = (profile: UserProfile) => {
    setMatchedProfile(profile);
    audioHaptics.triggerMatchCelebration();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    speechService.speak(`It's a Match! You and ${profile.name} liked each other.`);
  };

  return (
    <div id="discovery-deck-container" className="w-full flex-1 flex flex-col items-center justify-start p-3 sm:p-4 max-w-lg mx-auto relative">
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

      {/* Top Deck Header Bar */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Discover ({Math.max(0, profiles.length - currentIndex)} Available)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-grid-deck"
            onClick={onToggleViewMode}
            aria-label={viewMode === 'deck' ? "Switch to Grid View" : "Switch to Card Swipe Deck"}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
          >
            {viewMode === 'deck' ? <Grid className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </button>

          <button
            id="btn-open-filter-deck"
            onClick={onOpenFilters}
            aria-label="Open matchmaking search filters"
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Card View / Deck */}
      <div className="w-full flex-1 flex items-center justify-center relative min-h-[560px]">
        <AnimatePresence mode="wait">
          {currentProfile ? (
            <motion.div
              key={currentProfile.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.22 }}
              className="w-full"
            >
              <ProfileCard
                profile={currentProfile}
                currentUser={currentUser}
                onLike={handleLike}
                onPass={handlePass}
                onSuperLike={handleSuperLike}
                onOpenVideoBio={onOpenVideoBio}
                onOpenDateNight={onOpenDateNight}
                onOpenSmartOpener={onOpenSmartOpener}
                isBiometricLocked={isBiometricLocked}
                searchQuery={searchQuery}
              />
            </motion.div>
          ) : (
            /* Empty Deck State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center text-white max-w-md w-full shadow-2xl flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 ring-4 ring-indigo-500/20">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {profiles.length === 0 ? 'No Other Users Registered Yet' : "You're All Caught Up!"}
              </h3>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                {profiles.length === 0
                  ? 'Your feed displays only authentic accounts created by real users. As new community members register their accounts, they will appear right here.'
                  : "You've reviewed all suggested profiles matching your current proximity and personal preference filters."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  id="btn-deck-reset"
                  onClick={() => {
                    setCurrentIndex(0);
                    onResetDeck();
                    audioHaptics.triggerNavigationClick();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  Review Again
                </button>
                <button
                  id="btn-deck-adjust-filters"
                  onClick={onOpenFilters}
                  className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  Expand Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Match Celebration Dialog Popup */}
      {matchedProfile && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-neutral-900 border border-indigo-500/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-600/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mb-4 ring-8 ring-rose-500/10">
              <Heart className="w-10 h-10 fill-current animate-pulse" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">It's a Match!</h2>
            <p className="text-xs text-neutral-300 mb-6">
              You and <strong className="text-white">{matchedProfile.name}</strong> have liked each other!
            </p>

            <div className="flex items-center justify-center -space-x-3 mb-6">
              {currentUser.photos[0] ? (
                <img
                  src={currentUser.photos[0]}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-900/60 border-2 border-indigo-500 shadow-md flex items-center justify-center text-lg font-bold text-white">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              {matchedProfile.photos[0] ? (
                <img
                  src={matchedProfile.photos[0]}
                  alt={matchedProfile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-rose-500 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-900/60 border-2 border-rose-500 shadow-md flex items-center justify-center text-lg font-bold text-white">
                  {matchedProfile.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {onOpenSmartOpener && (
                <button
                  id="btn-match-smart-opener"
                  onClick={() => {
                    const matched = matchedProfile;
                    setMatchedProfile(null);
                    nextCard();
                    audioHaptics.triggerNavigationClick();
                    onOpenSmartOpener(matched);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  ✨ AI Smart Opener (Break the Ice)
                </button>
              )}

              {onOpenDateNight && (
                <button
                  id="btn-match-plan-date"
                  onClick={() => {
                    const matched = matchedProfile;
                    setMatchedProfile(null);
                    nextCard();
                    audioHaptics.triggerMatchSuccess();
                    onOpenDateNight(matched);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Suggest 3 Date Venues
                </button>
              )}

              <button
                id="btn-send-instant-message"
                onClick={() => {
                  onStartChatWith(matchedProfile);
                  setMatchedProfile(null);
                  nextCard();
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                Send Encrypted Message
              </button>

              <button
                id="btn-continue-swiping"
                onClick={() => {
                  setMatchedProfile(null);
                  nextCard();
                  audioHaptics.triggerNavigationClick();
                }}
                className="w-full py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
