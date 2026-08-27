import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  Sparkles, 
  MapPin, 
  Navigation, 
  Accessibility, 
  Send, 
  X, 
  Volume2, 
  Check, 
  Heart, 
  ShieldCheck, 
  Star, 
  Clock, 
  Compass, 
  Coffee, 
  Trees, 
  Palette, 
  Music, 
  Gamepad2, 
  Telescope,
  ChevronRight,
  Info,
  ExternalLink,
  VolumeX,
  Footprints,
  Eye,
  Ear
} from 'lucide-react';
import { UserProfile, SharedLocation } from '../../types/dating';
import { 
  AccessibleVenue, 
  DateNightPlan, 
  generateDateNightSuggestions, 
  convertVenueToSharedLocation 
} from '../../utils/dateNightEngine';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface DateNightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  matchedUser: UserProfile;
  onSendDateProposal: (venue: AccessibleVenue, customMessage?: string) => void;
}

export const DateNightModal: React.FC<DateNightModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  matchedUser,
  onSendDateProposal
}) => {
  const plan: DateNightPlan = generateDateNightSuggestions(currentUser, matchedUser);
  const [selectedVenueId, setSelectedVenueId] = useState<string>(plan.suggestedVenues[0]?.id || '');
  const [customInviteNote, setCustomInviteNote] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedVenueDetails, setExpandedVenueDetails] = useState<string | null>(null);

  const apiKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  const activeVenue = plan.suggestedVenues.find(v => v.id === selectedVenueId) || plan.suggestedVenues[0];

  if (!isOpen) return null;

  const handleSelectVenue = (venue: AccessibleVenue) => {
    setSelectedVenueId(venue.id);
    audioHaptics.triggerNavigationClick();
  };

  const handleProposeVenue = (venue: AccessibleVenue) => {
    audioHaptics.triggerMatchSuccess();
    const defaultMsg = customInviteNote.trim() 
      ? customInviteNote.trim()
      : `Hey ${matchedUser.name.split(' ')[0]}! I found this accessible spot that matches our love for ${venue.matchedInterests.slice(0, 2).join(' & ')}. Would you like to check out ${venue.name} together? ✨`;
    
    onSendDateProposal(venue, defaultMsg);
    speechService.speak(`Date invitation to ${venue.name} sent to ${matchedUser.name}!`);
    onClose();
  };

  const handleReadAloudOverview = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const text = `
      Date Night Recommendations for you and ${matchedUser.name}. 
      Based on your shared passions for ${plan.sharedInterests.join(', ')} and location in ${plan.primaryLocation}.
      Venue 1: ${plan.suggestedVenues[0]?.name}, a ${plan.suggestedVenues[0]?.categoryLabel}. ${plan.suggestedVenues[0]?.whyItsGreatForYou}.
      Venue 2: ${plan.suggestedVenues[1]?.name}, a ${plan.suggestedVenues[1]?.categoryLabel}. ${plan.suggestedVenues[1]?.whyItsGreatForYou}.
      Venue 3: ${plan.suggestedVenues[2]?.name}, a ${plan.suggestedVenues[2]?.categoryLabel}. ${plan.suggestedVenues[2]?.whyItsGreatForYou}.
    `;
    speechService.speak(text, () => setIsSpeaking(false));
  };

  const getCategoryIcon = (category: AccessibleVenue['category']) => {
    switch (category) {
      case 'cafe': return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'park':
      case 'tea_house': return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'museum':
      case 'art_studio': return <Palette className="w-4 h-4 text-rose-400" />;
      case 'music_venue': return <Music className="w-4 h-4 text-purple-400" />;
      case 'boardgame_cafe': return <Gamepad2 className="w-4 h-4 text-indigo-400" />;
      case 'astronomy_center': return <Telescope className="w-4 h-4 text-sky-400" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-night-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div 
        id="date-night-suggestion-modal"
        className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-950 via-indigo-950/40 to-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="date-night-title" className="text-base sm:text-lg font-black text-white">
                  Date Night Suggestions
                </h2>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                  3 Accessible Venues
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                AI-curated for <strong className="text-white">{currentUser.name}</strong> & <strong className="text-white">{matchedUser.name}</strong> based on shared passions & accessibility
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReadAloudOverview}
              title={isSpeaking ? "Stop Narration" : "Read Suggestions Aloud"}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                isSpeaking 
                  ? 'bg-amber-500 text-black border-amber-400 animate-pulse font-bold' 
                  : 'bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Pause' : 'Listen'}</span>
            </button>

            <button
              onClick={() => {
                if (isSpeaking) speechService.stopSpeaking();
                onClose();
              }}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shared Match Context Ribbon */}
        <div className="bg-neutral-950/80 border-b border-neutral-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-400 font-semibold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Shared Passions:
            </span>
            {plan.sharedInterests.map((interest, i) => (
              <span 
                key={i} 
                className="px-2.5 py-0.5 rounded-lg bg-indigo-950/80 text-indigo-200 border border-indigo-500/30 text-[11px] font-medium"
              >
                {interest}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Area: <strong className="text-neutral-200">{plan.primaryLocation}</strong></span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* 3 Venue Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plan.suggestedVenues.map((venue, idx) => {
              const isSelected = venue.id === selectedVenueId;
              const isDetailsOpen = expandedVenueDetails === venue.id;

              return (
                <div
                  key={venue.id}
                  id={`venue-card-${venue.id}`}
                  onClick={() => handleSelectVenue(venue)}
                  className={`flex flex-col rounded-2xl border transition-all cursor-pointer overflow-hidden relative ${
                    isSelected
                      ? 'bg-neutral-800/90 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40'
                  }`}
                >
                  {/* Option Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 text-[10px] font-bold text-white flex items-center gap-1">
                    <span className="text-indigo-400">#{idx + 1}</span>
                    <span>Option</span>
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute top-3 right-3 z-10 bg-amber-500/90 backdrop-blur-md text-black px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5 shadow-md">
                    <Star className="w-3 h-3 fill-black" />
                    <span>{venue.rating}</span>
                  </div>

                  {/* Venue Cover Image */}
                  <div className="h-32 w-full relative overflow-hidden bg-neutral-950">
                    <img
                      src={venue.photoUrl}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                  </div>

                  {/* Venue Card Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 font-semibold mb-1">
                        {getCategoryIcon(venue.category)}
                        <span>{venue.categoryLabel}</span>
                        <span>•</span>
                        <span className="text-neutral-400">{venue.priceLevel}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white line-clamp-1 leading-snug">
                        {venue.name}
                      </h3>
                      
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                        <MapPin className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                        <span>{venue.neighborhood}</span>
                      </p>

                      <p className="text-xs text-neutral-300 mt-2 line-clamp-2 leading-relaxed bg-black/20 p-2 rounded-xl border border-neutral-800">
                        {venue.whyItsGreatForYou}
                      </p>
                    </div>

                    {/* Accessibility Highlights Quick Chips */}
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-wrap gap-1">
                        {venue.accessibilityBadges.map((badge, bIdx) => (
                          <span 
                            key={bIdx}
                            className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1"
                          >
                            <Accessibility className="w-2.5 h-2.5 text-emerald-400" />
                            {badge}
                          </span>
                        ))}
                      </div>

                      {/* Select / Active Indicator */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVenue(venue);
                        }}
                        className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected Venue</span>
                          </>
                        ) : (
                          <span>Select This Venue</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Venue Spotlight & Interactive Google Maps Viewport */}
          {activeVenue && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                      {getCategoryIcon(activeVenue.category)}
                    </span>
                    <h3 className="text-base font-black text-white">{activeVenue.name}</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{activeVenue.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeVenue.lat},${activeVenue.lng}&query=${encodeURIComponent(activeVenue.name + ' ' + activeVenue.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 border border-neutral-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    <span>Directions</span>
                  </a>
                </div>
              </div>

              {/* Map & Venue Attributes Split Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Google Map Viewport */}
                <div className="lg:col-span-5 h-56 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative">
                  {apiKey ? (
                    <APIProvider apiKey={apiKey}>
                      <Map
                        mapId="DATE_NIGHT_MAP_ID"
                        defaultCenter={{ lat: activeVenue.lat, lng: activeVenue.lng }}
                        center={{ lat: activeVenue.lat, lng: activeVenue.lng }}
                        defaultZoom={15}
                        gestureHandling="cooperative"
                        disableDefaultUI={false}
                        zoomControl={true}
                        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <AdvancedMarker 
                          position={{ lat: activeVenue.lat, lng: activeVenue.lng }}
                          title={activeVenue.name}
                        >
                          <Pin
                            background="#e11d48"
                            borderColor="#ffffff"
                            glyphColor="#ffffff"
                            scale={1.2}
                          />
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-900 via-neutral-950 to-indigo-950/50 text-center relative overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 border border-rose-500/40">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-white">{activeVenue.name}</p>
                      <p className="text-[10px] text-neutral-400 max-w-xs mt-0.5">{activeVenue.address}</p>
                      <span className="mt-2 text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Coordinates: {activeVenue.lat.toFixed(4)}, {activeVenue.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Granular Accessibility Checklist & Environment Stats */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-semibold">Noise Level</span>
                      <span className="text-xs font-bold text-white mt-0.5 block">{activeVenue.noiseLevel}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-semibold">Lighting</span>
                      <span className="text-xs font-bold text-white mt-0.5 block">{activeVenue.lightingLevel}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-neutral-400 block font-semibold">Transit Access</span>
                      <span className="text-[11px] font-bold text-white mt-0.5 block truncate">{activeVenue.publicTransitDistance}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verified Accessibility Accommodations</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeVenue.accessibilityFeatures.map((feat, fIdx) => (
                        <div 
                          key={fIdx} 
                          className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-start gap-2"
                        >
                          <span className="p-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </span>
                          <div>
                            <span className="text-xs font-bold text-white block">{feat.title}</span>
                            <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">{feat.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety & Best Time to Visit */}
                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-[11px]">{activeVenue.safetyHighlight}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-300 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>Best: {activeVenue.bestTimeToVisit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversation Prompt & Proposal Action Box */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-neutral-900 to-indigo-950/60 border border-indigo-500/30 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Customize Date Proposal Note to {matchedUser.name}</span>
              </label>
              <span className="text-[10px] text-neutral-400">Sends directly into your encrypted chat</span>
            </div>

            <textarea
              rows={2}
              value={customInviteNote}
              onChange={(e) => setCustomInviteNote(e.target.value)}
              placeholder={`e.g. Hey ${matchedUser.name.split(' ')[0]}! I noticed we both love ${plan.sharedInterests[0] || 'art & coffee'}. Would you like to check out ${activeVenue.name} this weekend?`}
              className="w-full bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-neutral-400 italic">
                💡 Conversation starter: "{plan.icebreakerTopic}"
              </p>

              <button
                type="button"
                id="btn-send-date-proposal"
                onClick={() => handleProposeVenue(activeVenue)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Propose Date at {activeVenue.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
