import React, { useState } from 'react';
import { 
  Heart, 
  X, 
  Star, 
  Volume2, 
  VolumeX, 
  Video, 
  MapPin, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  Award,
  Lock,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react';
import { UserProfile, CompatibilityInsight } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';
import { calculateCompatibility } from '../../data/mockProfiles';
import { getSearchMatchReasons } from '../../utils/searchMatching';
import { CompatibilityScoreIndicator } from './CompatibilityScoreIndicator';

interface ProfileCardProps {
  profile: UserProfile;
  currentUser: UserProfile;
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  onOpenVideoBio: (profile: UserProfile) => void;
  onOpenDateNight?: (profile: UserProfile) => void;
  onOpenSmartOpener?: (profile: UserProfile) => void;
  isBiometricLocked?: boolean;
  searchQuery?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  currentUser,
  onLike,
  onPass,
  onSuperLike,
  onOpenVideoBio,
  onOpenDateNight,
  onOpenSmartOpener,
  isBiometricLocked = false,
  searchQuery = ''
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isExpandedDetails, setIsExpandedDetails] = useState(Boolean(searchQuery.trim()));
  const [isNarrating, setIsNarrating] = useState(false);

  const compatibility: CompatibilityInsight = calculateCompatibility(currentUser, profile);
  const searchMatchReasons = searchQuery.trim() ? getSearchMatchReasons(profile, searchQuery) : [];

  const handleReadProfileAloud = () => {
    if (isNarrating) {
      speechService.stopSpeaking();
      setIsNarrating(false);
      return;
    }

    setIsNarrating(true);
    audioHaptics.triggerNavigationClick();

    const narrationScript = `
      Profile of ${profile.name}, ${profile.age} years old, ${profile.gender}, pronouns ${profile.pronouns}.
      Located ${profile.locationCity}. Compatibility score: ${compatibility.scorePercent} percent, with ${compatibility.hobbiesBreakdown.totalShared} shared hobbies and ${compatibility.demographics.overallDemographicPercent} percent demographic alignment.
      Occupation: ${profile.jobTitle} at ${profile.companyOrField}.
      Bio: ${profile.bio}.
      Physical and personal attributes: Height ${profile.heightFeet}, complexion ${profile.complexion}, ethnicity ${profile.raceEthnicity}, religion ${profile.religion}, education ${profile.education}.
      Hobbies: ${profile.hobbies.join(', ')}.
      Relationship goal: ${profile.relationshipGoal}.
      Accessibility badges: ${profile.accessibilityBadges.join(', ')}.
    `;

    speechService.speak(narrationScript, () => {
      setIsNarrating(false);
    });
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex < profile.photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
      audioHaptics.triggerNavigationClick();
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
      audioHaptics.triggerNavigationClick();
    }
  };

  return (
    <article 
      id={`profile-card-${profile.id}`}
      aria-label={`Dating profile of ${profile.name}, ${profile.age}, ${profile.jobTitle}`}
      className="w-full max-w-md mx-auto bg-neutral-900 border border-neutral-800 text-white rounded-3xl overflow-hidden shadow-2xl transition-all relative flex flex-col"
    >
      {/* Top Image & Media Carousel */}
      <div className="relative h-[380px] sm:h-[430px] w-full bg-neutral-950 overflow-hidden select-none">
        <img
          src={profile.photos[photoIndex]}
          alt={`Photo ${photoIndex + 1} of ${profile.name}`}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isBiometricLocked && profile.isPrivateProfile ? 'blur-xl scale-110' : ''
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-black/60 pointer-events-none" />

        {/* Photo Progress Dash Indicators */}
        {profile.photos.length > 1 && (
          <div className="absolute top-3 inset-x-4 flex gap-1.5 z-10">
            {profile.photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i === photoIndex ? 'bg-white shadow-sm' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo Navigation Touch Areas */}
        {profile.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              disabled={photoIndex === 0}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-opacity disabled:opacity-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextPhoto}
              disabled={photoIndex === profile.photos.length - 1}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-opacity disabled:opacity-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Top Badges: Compatibility & Verified */}
        <div className="absolute top-7 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <CompatibilityScoreIndicator
              compatibility={compatibility}
              profile={profile}
              currentUser={currentUser}
              compact
            />
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Screen Reader Verbal Readout Action */}
            <button
              id={`btn-read-aloud-${profile.id}`}
              onClick={handleReadProfileAloud}
              aria-label={isNarrating ? "Stop reading profile" : `Listen to screen reader audio narration of ${profile.name}'s profile`}
              className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all border ${
                isNarrating 
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
                  : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
              }`}
            >
              {isNarrating ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
            </button>

            {/* AI Smart Opener Button */}
            {onOpenSmartOpener && (
              <button
                id={`btn-smart-opener-${profile.id}`}
                onClick={() => {
                  audioHaptics.triggerNavigationClick();
                  onOpenSmartOpener(profile);
                }}
                aria-label={`Generate AI Smart Opener Icebreakers for ${profile.name}`}
                title="AI Smart Opener: Suggest Icebreakers"
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg transition-transform hover:scale-105 border border-indigo-400/50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Smart Opener</span>
              </button>
            )}

            {/* Date Night Suggestions Button */}
            {onOpenDateNight && (
              <button
                id={`btn-date-night-${profile.id}`}
                onClick={() => {
                  audioHaptics.triggerNavigationClick();
                  onOpenDateNight(profile);
                }}
                aria-label={`Explore 3 Accessible Date Night Venues with ${profile.name}`}
                title="Date Night Suggestions"
                className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg transition-transform hover:scale-105 border border-indigo-400/50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Date Ideas</span>
              </button>
            )}

            {/* Video Bio Launcher Button */}
            {profile.videoBio && (
              <button
                id={`btn-open-video-bio-${profile.id}`}
                onClick={() => {
                  onOpenVideoBio(profile);
                  audioHaptics.triggerNavigationClick();
                }}
                aria-label={`Watch ${profile.name}'s authentic Video Bio`}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg transition-transform hover:scale-105 border border-rose-400/50 animate-bounce-subtle"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Bio</span>
              </button>
            )}
          </div>
        </div>

        {/* Card Name, Age & Quick Headline */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {profile.name}, {profile.age}
            </h2>
            {profile.verified && (
              <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" title="Verified Profile" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300 font-medium">
            <span className="bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700 text-neutral-200">
              {profile.gender} ({profile.pronouns})
            </span>
            <span className="flex items-center gap-1 bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700">
              <MapPin className="w-3 h-3 text-rose-400" />
              {profile.locationCity}
            </span>
            <span className="bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700 text-emerald-300 font-semibold">
              {profile.heightFeet} ({profile.heightCm} cm)
            </span>
          </div>
        </div>
      </div>

      {/* Main Profile Details Section */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Visual Compatibility Percentage Indicator (Shared Hobbies & Demographic Preferences) */}
        <CompatibilityScoreIndicator
          compatibility={compatibility}
          profile={profile}
          currentUser={currentUser}
        />

        {/* Search Match Highlight Banner */}
        {searchMatchReasons.length > 0 && (
          <div className="p-2.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/50 flex flex-wrap items-center gap-1.5 animate-in fade-in">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Search Match:
            </span>
            {searchMatchReasons.map((reason, idx) => (
              <span
                key={idx}
                className="bg-indigo-600/60 text-white font-semibold text-[10px] px-2 py-0.5 rounded-lg border border-indigo-400/40"
              >
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Bio Text */}
        <div>
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
            {profile.bio}
          </p>
        </div>

        {/* Accessibility & Inclusive Badges */}
        {profile.accessibilityBadges.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Accessibility & Community
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.accessibilityBadges.map((badge, i) => (
                <span
                  key={i}
                  className="bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 text-[11px] font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1"
                >
                  <Award className="w-3 h-3 text-indigo-400" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies & Passions with Shared Highlight */}
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
            Hobbies & Interests
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.hobbies.map((hobby, i) => {
              const isShared = currentUser.hobbies.includes(hobby);
              return (
                <span
                  key={i}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                    isShared
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/50 font-bold'
                      : 'bg-neutral-800/60 text-neutral-300 border-neutral-700'
                  }`}
                >
                  {isShared && <Sparkles className="w-3 h-3 text-rose-400" />}
                  {hobby}
                </span>
              );
            })}
          </div>
        </div>

        {/* Detailed Personal Attributes Drawer (Height, Complexion, Race, Religion, Job, Education) */}
        <div className="pt-2 border-t border-neutral-800">
          <button
            id={`btn-toggle-details-${profile.id}`}
            onClick={() => {
              setIsExpandedDetails(!isExpandedDetails);
              audioHaptics.triggerNavigationClick();
            }}
            aria-expanded={isExpandedDetails}
            className="w-full flex items-center justify-between py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              {isExpandedDetails ? 'Hide Detailed Background & Attributes' : 'View Full Profile Details (Height, Race, Religion, Job...)'}
            </span>
            {isExpandedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isExpandedDetails && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800 animate-in fade-in duration-150">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 block font-medium">Occupation</span>
                <span className="font-semibold text-neutral-100 flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{profile.jobTitle}</span>
                </span>
              </div>

              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 block font-medium">Education</span>
                <span className="font-semibold text-neutral-100 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{profile.education}</span>
                </span>
              </div>

              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 block font-medium">Complexion</span>
                <span className="font-semibold text-neutral-100 block mt-0.5">{profile.complexion}</span>
              </div>

              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 block font-medium">Race & Ethnicity</span>
                <span className="font-semibold text-neutral-100 block mt-0.5">{profile.raceEthnicity}</span>
              </div>

              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 block font-medium">Religion & Beliefs</span>
                <span className="font-semibold text-neutral-100 block mt-0.5">{profile.religion}</span>
              </div>

              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 block font-medium">Nationality</span>
                <span className="font-semibold text-neutral-100 flex items-center gap-1 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{profile.nationality}</span>
                </span>
              </div>

              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80 col-span-2">
                <span className="text-[10px] text-neutral-400 block font-medium">Languages Spoken</span>
                <span className="font-semibold text-neutral-100 block mt-0.5">{profile.languages.join(' • ')}</span>
              </div>

              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80 col-span-2">
                <span className="text-[10px] text-neutral-400 block font-medium">Relationship Goal</span>
                <span className="font-semibold text-indigo-300 block mt-0.5">{profile.relationshipGoal}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Pass, Superlike, Like (Enlarged Accessible Hitboxes) */}
      <div className="p-4 pt-2 pb-5 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-center gap-4 sm:gap-6">
        {/* Pass Button */}
        <button
          id={`btn-pass-${profile.id}`}
          onClick={() => {
            audioHaptics.triggerSwipeLeft();
            onPass();
          }}
          aria-label={`Pass on ${profile.name} (Keyboard: Arrow Left or X)`}
          className="w-14 h-14 rounded-full bg-neutral-900 hover:bg-neutral-800 border-2 border-rose-500/60 text-rose-400 hover:text-rose-300 flex items-center justify-center transition-all hover:scale-110 shadow-lg active:scale-95"
        >
          <X className="w-7 h-7" />
        </button>

        {/* Super Like Button */}
        <button
          id={`btn-superlike-${profile.id}`}
          onClick={() => {
            audioHaptics.triggerSuperLike();
            onSuperLike();
          }}
          aria-label={`Super like ${profile.name} (Keyboard: S)`}
          className="w-12 h-12 rounded-full bg-neutral-900 hover:bg-neutral-800 border-2 border-sky-500/60 text-sky-400 hover:text-sky-300 flex items-center justify-center transition-all hover:scale-110 shadow-lg active:scale-95"
        >
          <Star className="w-5 h-5 fill-current" />
        </button>

        {/* Like Button */}
        <button
          id={`btn-like-${profile.id}`}
          onClick={() => {
            audioHaptics.triggerSwipeRight();
            onLike();
          }}
          aria-label={`Like ${profile.name} (Keyboard: Arrow Right or L)`}
          className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 border-2 border-rose-400 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xl active:scale-95 ring-4 ring-rose-500/20"
        >
          <Heart className="w-7 h-7 fill-current" />
        </button>
      </div>
    </article>
  );
};
