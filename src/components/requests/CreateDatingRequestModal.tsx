import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Send, 
  Coffee, 
  Utensils, 
  Palette, 
  Trees, 
  Gamepad2, 
  Music, 
  Video, 
  Check, 
  Heart,
  Volume2,
  Accessibility,
  Info,
  ChevronRight
} from 'lucide-react';
import { UserProfile, DatingRequest, DatingActivityType } from '../../types/dating';
import { ACCESSIBLE_VENUE_DATABASE, AccessibleVenue } from '../../utils/dateNightEngine';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface CreateDatingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  matchedUser?: UserProfile | null;
  availableProfiles: UserProfile[];
  onSubmitRequest: (request: DatingRequest) => void;
}

const ACTIVITY_TYPES: { type: DatingActivityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'art_culture', label: 'Art & Culture', icon: Palette },
  { type: 'coffee_drinks', label: 'Coffee & Drinks', icon: Coffee },
  { type: 'tea_lounge', label: 'Tea & Quiet Lounge', icon: Coffee },
  { type: 'outdoor_nature', label: 'Outdoor & Nature', icon: Trees },
  { type: 'games_arcade', label: 'Games & Arcade', icon: Gamepad2 },
  { type: 'live_music', label: 'Acoustic & Music', icon: Music },
  { type: 'dining', label: 'Dining & Bites', icon: Utensils },
  { type: 'virtual_video', label: 'Virtual Video Date', icon: Video },
];

const PRESET_DATES = [
  'This Friday • 6:30 PM',
  'This Saturday • 3:30 PM',
  'This Sunday • 11:00 AM',
  'Next Wednesday • 5:00 PM',
  'Next Thursday • 7:00 PM'
];

const ACCESSIBILITY_OPTIONS = [
  'Step-free entrance & elevators',
  'Sensory-friendly quiet atmosphere',
  'Tactile seating & low-glare lighting',
  'ASL welcoming & fluent staff',
  'Braille / Audio-described menus',
  'Wide wheelchair clearance aisles',
  'Single-occupancy accessible restrooms'
];

const DIETARY_OPTIONS = [
  'Gluten-free menu items',
  'Vegan & Plant-based options',
  'Non-alcoholic craft mocktails',
  'Decaf specialty coffee',
  'Nut-free kitchen environment'
];

export const CreateDatingRequestModal: React.FC<CreateDatingRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  matchedUser,
  availableProfiles,
  onSubmitRequest,
}) => {
  if (!isOpen) return null;

  const [selectedRecipient, setSelectedRecipient] = useState<UserProfile>(
    matchedUser || availableProfiles[0] || currentUser
  );
  const [selectedActivity, setSelectedActivity] = useState<DatingActivityType>('art_culture');
  const [selectedVenue, setSelectedVenue] = useState<AccessibleVenue>(ACCESSIBLE_VENUE_DATABASE[0]);
  const [customVenueName, setCustomVenueName] = useState('');
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [proposedDateTime, setProposedDateTime] = useState('This Saturday • 3:30 PM');
  const [customDateTime, setCustomDateTime] = useState('');
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([
    'Step-free entrance & elevators',
    'Sensory-friendly quiet atmosphere'
  ]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([
    'Gluten-free menu items',
    'Non-alcoholic craft mocktails'
  ]);
  const [customNote, setCustomNote] = useState('');
  const [notifyEmergencyContact, setNotifyEmergencyContact] = useState(true);

  const toggleAccommodation = (item: string) => {
    setSelectedAccommodations(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleDietary = (item: string) => {
    setSelectedDietary(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalVenueName = isCustomVenue && customVenueName.trim() ? customVenueName.trim() : selectedVenue.name;
    const finalVenueAddress = isCustomVenue ? (selectedRecipient.locationCity || currentUser.locationCity || '') : selectedVenue.address;
    const finalDateTime = customDateTime.trim() ? customDateTime.trim() : proposedDateTime;
    const defaultNote = `Hi ${selectedRecipient.name.split(' ')[0]}! I'd love to invite you to ${finalVenueName} for our first date. Would you be free on ${finalDateTime}? ✨`;

    const newRequest: DatingRequest = {
      id: `req-out-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.photos[0],
      senderAge: currentUser.age,
      senderPronouns: currentUser.pronouns,
      senderJob: currentUser.jobTitle,
      senderVerified: currentUser.verified,
      recipientId: selectedRecipient.id,
      recipientName: selectedRecipient.name,
      recipientAvatar: selectedRecipient.photos[0],
      recipientAge: selectedRecipient.age,
      title: `${finalVenueName.split(' ')[0]} Meetup & Connection`,
      activityType: selectedActivity,
      venueName: finalVenueName,
      venueAddress: finalVenueAddress,
      venueNeighborhood: isCustomVenue ? 'Local Safe Spot' : selectedVenue.neighborhood,
      venuePhotoUrl: isCustomVenue ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' : selectedVenue.photoUrl,
      venueRating: isCustomVenue ? 4.8 : selectedVenue.rating,
      venueCategoryLabel: isCustomVenue ? 'Accessible Meetup' : selectedVenue.categoryLabel,
      venueCoordinates: isCustomVenue ? { lat: 37.7749, lng: -122.4194 } : { lat: selectedVenue.lat, lng: selectedVenue.lng },
      proposedDateTime: finalDateTime,
      proposedTimestamp: Date.now() + 1000 * 60 * 60 * 48,
      accessibilityAccommodations: selectedAccommodations,
      dietaryPreferences: selectedDietary,
      icebreakerMessage: customNote.trim() ? customNote.trim() : defaultNote,
      compatibilityScore: 94,
      status: 'pending',
      createdAt: 'Just now',
      isVerifiedSafeSpot: true,
      emergencyContactNotified: notifyEmergencyContact
    };

    audioHaptics.triggerMatchCelebration();
    speechService.speak(`Dating request sent to ${selectedRecipient.name} for ${finalVenueName}!`);
    onSubmitRequest(newRequest);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-date-request-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div 
        id="create-dating-request-modal"
        className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-950 via-rose-950/30 to-neutral-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/50">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-date-request-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Propose a Date & Meetup
              </h2>
              <p className="text-xs text-neutral-400">
                Craft an accessible, thoughtful date invitation with verified safety spots
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close date request composer"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Recipient Selector (if not locked to a specific match) */}
          {!matchedUser && availableProfiles.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold text-neutral-300 flex items-center gap-1.5">
                <span>Select Partner to Invite:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableProfiles.slice(0, 6).map(p => {
                  const isSelected = selectedRecipient.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedRecipient(p);
                        audioHaptics.triggerNavigationClick();
                      }}
                      className={`flex items-center gap-2 p-2 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected 
                          ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/40 text-white'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <img
                        src={p.photos[0]}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover border border-rose-400 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold truncate text-xs">{p.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{p.age} • {p.locationCity.split(',')[0]}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchedUser && (
            <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={matchedUser.photos[0]}
                  alt={matchedUser.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-rose-500"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    {matchedUser.name}, {matchedUser.age}
                    {matchedUser.verified && <ShieldCheck className="w-4 h-4 text-indigo-400" />}
                  </h4>
                  <p className="text-xs text-neutral-400">{matchedUser.jobTitle}</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                Date Candidate
              </span>
            </div>
          )}

          {/* Activity Category */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-300">Activity & Date Vibe:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ACTIVITY_TYPES.map(act => {
                const Icon = act.icon;
                const isSelected = selectedActivity === act.type;
                return (
                  <button
                    key={act.type}
                    type="button"
                    onClick={() => {
                      setSelectedActivity(act.type);
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-rose-950/80 to-amber-950/80 border-rose-500 text-white ring-1 ring-rose-500/50'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-400' : ''}`} />
                    <span className="text-xs font-semibold leading-tight">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Venue Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-300">Curated Accessible Venue:</label>
              <button
                type="button"
                onClick={() => setIsCustomVenue(!isCustomVenue)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
              >
                {isCustomVenue ? "Choose from Curated Venues" : "Custom Location"}
              </button>
            </div>

            {!isCustomVenue ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ACCESSIBLE_VENUE_DATABASE.map(venue => {
                  const isSelected = selectedVenue.id === venue.id;
                  return (
                    <div
                      key={venue.id}
                      onClick={() => {
                        setSelectedVenue(venue);
                        audioHaptics.triggerNavigationClick();
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neutral-950 border-amber-500/80 ring-1 ring-amber-500/40 text-white'
                          : 'bg-neutral-950/50 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={venue.photoUrl}
                          alt={venue.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-white truncate">{venue.name}</h5>
                          <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            {venue.neighborhood} • {venue.categoryLabel}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-1.5 rounded-full font-bold">
                              ★ {venue.rating}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {venue.noiseLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-500 text-black' : 'border-neutral-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter Venue / Coffee Shop / Park Name..."
                  value={customVenueName}
                  onChange={(e) => setCustomVenueName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-2xl px-4 py-3 text-white text-xs sm:text-sm outline-none"
                />
              </div>
            )}
          </div>

          {/* Date & Time Selector */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Proposed Date & Time:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_DATES.map(d => {
                const isSelected = proposedDateTime === d && !customDateTime;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setProposedDateTime(d);
                      setCustomDateTime('');
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Or custom date/time (e.g. Next Saturday, 5:30 PM)..."
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-2xl px-3.5 py-2.5 text-white text-xs outline-none mt-1"
            />
          </div>

          {/* Accessibility Accommodations Checklist */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-indigo-400" />
              <span>Accessibility Accommodations Requested / Guaranteed:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ACCESSIBILITY_OPTIONS.map(acc => {
                const isChecked = selectedAccommodations.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccommodation(acc)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-200'
                        : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                      isChecked ? 'border-indigo-400 bg-indigo-600 text-white' : 'border-neutral-700'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{acc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary & Sensory Atmosphere */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-300">Dietary & Menu Considerations:</label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map(diet => {
                const isChecked = selectedDietary.includes(diet);
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleDietary(diet)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-amber-950/70 border-amber-500/80 text-amber-200'
                        : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {diet} {isChecked ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personalized Invitation Note */}
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-300 flex items-center justify-between">
              <span>Personalized Invitation Note:</span>
              <span className="text-[10px] text-neutral-400">Optional</span>
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={`Hey ${selectedRecipient.name.split(' ')[0]}! Would love to invite you to ${selectedVenue.name} for our first date...`}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-2xl p-3 text-white text-xs sm:text-sm outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Safety Check Integration Toggle */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 p-3 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-emerald-300 text-xs">Aura Verified Safe Meetup</p>
                <p className="text-[11px] text-neutral-400">Venue is in a public, monitored location with emergency contact sync</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyEmergencyContact}
              onChange={(e) => setNotifyEmergencyContact(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-dating-request"
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-95 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer transition-transform"
            >
              <Send className="w-4 h-4" />
              <span>Send Date Invitation to {selectedRecipient.name.split(' ')[0]}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
