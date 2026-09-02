import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  X, 
  RotateCcw, 
  Send, 
  MessageCircle, 
  Coffee, 
  Utensils, 
  Palette, 
  Trees, 
  Gamepad2, 
  Music, 
  Video, 
  ExternalLink, 
  Search, 
  Filter, 
  CalendarDays, 
  Heart, 
  Accessibility, 
  ChevronRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { DatingRequest, UserProfile, DatingActivityType, AlternativeDateProposal } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { CreateDatingRequestModal } from './CreateDatingRequestModal';
import { DeclineRequestModal } from './DeclineRequestModal';
import { RescheduleRequestModal } from './RescheduleRequestModal';

interface DatingRequestsHubProps {
  currentUser: UserProfile;
  datingRequests: DatingRequest[];
  availableProfiles: UserProfile[];
  onAcceptRequest: (request: DatingRequest) => void;
  onDeclineRequest: (requestId: string, reasonNote?: string) => void;
  onRescheduleRequest: (requestId: string, alternative: AlternativeDateProposal) => void;
  onCreateNewRequest: (request: DatingRequest) => void;
  onOpenChatWithPartner: (userId: string, userName: string, userAvatar: string) => void;
  onOpenSafetyChecklist?: (request: DatingRequest) => void;
}

export const DatingRequestsHub: React.FC<DatingRequestsHubProps> = ({
  currentUser,
  datingRequests,
  availableProfiles,
  onAcceptRequest,
  onDeclineRequest,
  onRescheduleRequest,
  onCreateNewRequest,
  onOpenChatWithPartner,
  onOpenSafetyChecklist
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'incoming' | 'outgoing' | 'scheduled' | 'all'>('incoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeDeclineRequest, setActiveDeclineRequest] = useState<DatingRequest | null>(null);
  const [activeRescheduleRequest, setActiveRescheduleRequest] = useState<DatingRequest | null>(null);

  // Counts
  const incomingCount = useMemo(() => 
    datingRequests.filter(r => r.recipientId === currentUser.id && r.status === 'pending').length,
    [datingRequests, currentUser.id]
  );

  const outgoingCount = useMemo(() => 
    datingRequests.filter(r => r.senderId === currentUser.id).length,
    [datingRequests, currentUser.id]
  );

  const scheduledCount = useMemo(() => 
    datingRequests.filter(r => r.status === 'accepted').length,
    [datingRequests]
  );

  // Filtered list
  const filteredRequests = useMemo(() => {
    return datingRequests.filter(req => {
      // Sub tab filter
      if (activeSubTab === 'incoming') {
        if (req.recipientId !== currentUser.id) return false;
      } else if (activeSubTab === 'outgoing') {
        if (req.senderId !== currentUser.id) return false;
      } else if (activeSubTab === 'scheduled') {
        if (req.status !== 'accepted') return false;
      }

      // Activity filter
      if (selectedActivityFilter !== 'all' && req.activityType !== selectedActivityFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const otherPartyName = req.senderId === currentUser.id ? req.recipientName : req.senderName;
        const matchesName = otherPartyName.toLowerCase().includes(q);
        const matchesVenue = req.venueName.toLowerCase().includes(q);
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesNeighborhood = (req.venueNeighborhood || '').toLowerCase().includes(q);
        return matchesName || matchesVenue || matchesTitle || matchesNeighborhood;
      }

      return true;
    });
  }, [datingRequests, activeSubTab, selectedActivityFilter, searchQuery, currentUser.id]);

  const getActivityIcon = (type: DatingActivityType) => {
    switch (type) {
      case 'art_culture': return <Palette className="w-4 h-4 text-rose-400" />;
      case 'coffee_drinks':
      case 'tea_lounge': return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'outdoor_nature': return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'games_arcade': return <Gamepad2 className="w-4 h-4 text-indigo-400" />;
      case 'live_music': return <Music className="w-4 h-4 text-purple-400" />;
      case 'dining': return <Utensils className="w-4 h-4 text-orange-400" />;
      case 'virtual_video': return <Video className="w-4 h-4 text-sky-400" />;
      default: return <Sparkles className="w-4 h-4 text-rose-400" />;
    }
  };

  const generateGoogleCalendarUrl = (req: DatingRequest) => {
    const title = encodeURIComponent(`Date with ${req.senderId === currentUser.id ? req.recipientName : req.senderName} @ ${req.venueName}`);
    const details = encodeURIComponent(`hubb Date Meetup • ${req.title}\nVenue: ${req.venueName}\nAddress: ${req.venueAddress}\nAccessibility: ${req.accessibilityAccommodations.join(', ')}`);
    const location = encodeURIComponent(`${req.venueName}, ${req.venueAddress}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6 space-y-5">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-rose-950/40 to-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider">
                Date Night & Meetups
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Safe Spots Verified
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Dating Requests & Meetup Plans
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Propose and manage accessible, high-compatibility date invitations with verified public venues and emergency contact safety check-ins.
            </p>
          </div>

          <button
            id="btn-propose-new-date"
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/60 cursor-pointer transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Propose a Date</span>
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-neutral-800/80">
          <button
            onClick={() => {
              setActiveSubTab('incoming');
              audioHaptics.triggerNavigationClick();
            }}
            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
              activeSubTab === 'incoming'
                ? 'bg-rose-950/80 border-rose-500 text-white shadow-md'
                : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <p className="text-lg sm:text-xl font-black text-rose-400">{incomingCount}</p>
            <p className="text-[11px] font-semibold">Incoming Requests</p>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('outgoing');
              audioHaptics.triggerNavigationClick();
            }}
            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
              activeSubTab === 'outgoing'
                ? 'bg-amber-950/80 border-amber-500 text-white shadow-md'
                : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <p className="text-lg sm:text-xl font-black text-amber-400">{outgoingCount}</p>
            <p className="text-[11px] font-semibold">Sent Requests</p>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('scheduled');
              audioHaptics.triggerNavigationClick();
            }}
            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
              activeSubTab === 'scheduled'
                ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <p className="text-lg sm:text-xl font-black text-emerald-400">{scheduledCount}</p>
            <p className="text-[11px] font-semibold">Confirmed Dates</p>
          </button>
        </div>
      </div>

      {/* Sub Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Navigation Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
          <button
            onClick={() => {
              setActiveSubTab('incoming');
              audioHaptics.triggerNavigationClick();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'incoming'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Incoming</span>
            {incomingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-950 text-rose-300 text-[10px] font-black border border-rose-400">
                {incomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveSubTab('outgoing');
              audioHaptics.triggerNavigationClick();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'outgoing'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Sent / Outgoing</span>
            <span className="text-[10px] opacity-80">({outgoingCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('scheduled');
              audioHaptics.triggerNavigationClick();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'scheduled'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Confirmed Dates</span>
            <span className="text-[10px] opacity-80">({scheduledCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('all');
              audioHaptics.triggerNavigationClick();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-neutral-800 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>All History</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search dates, venues, partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-rose-500 rounded-2xl pl-9 pr-3 py-2 text-white text-xs outline-none"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No dating requests found in this view</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {activeSubTab === 'incoming' 
                ? "You're all caught up on date invitations! Propose a new date to one of your high-compatibility matches."
                : "Explore verified matches and send a thoughtful date invitation."}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md mt-2"
            >
              + Send a Date Invitation
            </button>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isIncoming = req.recipientId === currentUser.id;
            const otherPartyName = isIncoming ? req.senderName : req.recipientName;
            const otherPartyAvatar = isIncoming ? req.senderAvatar : req.recipientAvatar;

            return (
              <div
                key={req.id}
                className={`bg-neutral-900 border rounded-3xl p-5 shadow-lg space-y-4 transition-all ${
                  req.status === 'accepted'
                    ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-neutral-900'
                    : req.status === 'pending' && isIncoming
                    ? 'border-rose-500/50 ring-1 ring-rose-500/20'
                    : 'border-neutral-800'
                }`}
              >
                {/* Header of the request */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {otherPartyAvatar ? (
                      <img
                        src={otherPartyAvatar}
                        alt={otherPartyName}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-400 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-neutral-800 border-2 border-rose-400 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {otherPartyName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate">
                          {isIncoming ? `${req.senderName}` : `To ${req.recipientName}`}
                        </h3>
                        {req.senderVerified && (
                          <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" title="Verified Dater" />
                        )}
                        {req.compatibilityScore && (
                          <span className="text-[10px] font-black bg-rose-950/80 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                            {req.compatibilityScore}% Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 truncate">
                        {isIncoming ? (req.senderJob ? `${req.senderJob} • ` : '') : 'Outgoing Invitation • '}
                        {req.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status Pill */}
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                      req.status === 'accepted'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : req.status === 'declined'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                        : req.status === 'rescheduled'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : 'bg-indigo-950 text-indigo-300 border-indigo-500/50'
                    }`}>
                      {req.status === 'accepted' ? '✓ Date Confirmed' : req.status === 'declined' ? 'Declined' : req.status === 'rescheduled' ? 'Reschedule Proposed' : 'Pending Reply'}
                    </span>
                  </div>
                </div>

                {/* Date Proposal Details Card */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                        {getActivityIcon(req.activityType)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm">{req.title}</h4>
                        <p className="text-[11px] text-neutral-400">{req.venueCategoryLabel || 'Curated Meetup'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{req.proposedDateTime}</span>
                    </div>
                  </div>

                  {/* Venue card */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 min-w-0">
                      {req.venuePhotoUrl && (
                        <img
                          src={req.venuePhotoUrl}
                          alt={req.venueName}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-white truncate">{req.venueName}</p>
                        <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {req.venueAddress}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${req.venueName}, ${req.venueAddress}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-500/40 px-2.5 py-1.5 rounded-xl flex-shrink-0 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Map & Transit</span>
                    </a>
                  </div>

                  {/* Message note */}
                  {req.icebreakerMessage && (
                    <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl text-xs text-neutral-200 leading-relaxed italic">
                      "{req.icebreakerMessage}"
                    </div>
                  )}

                  {/* Response note if present */}
                  {req.responseNote && (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-200">
                      <span className="font-bold">{otherPartyName}: </span>
                      "{req.responseNote}"
                    </div>
                  )}

                  {/* Alternative proposal details if present */}
                  {req.alternativeProposal && (
                    <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl space-y-1 text-xs text-amber-200">
                      <p className="font-bold flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Alternative Time/Venue Proposed:</span>
                      </p>
                      <p className="text-white font-semibold">{req.alternativeProposal.proposedDateTime}</p>
                      {req.alternativeProposal.note && <p className="italic text-neutral-300">"{req.alternativeProposal.note}"</p>}
                    </div>
                  )}

                  {/* Accessibility & Dietary Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {req.accessibilityAccommodations.map((acc, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1"
                      >
                        <Accessibility className="w-2.5 h-2.5" />
                        {acc}
                      </span>
                    ))}
                    {req.dietaryPreferences?.map((diet, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg"
                      >
                        {diet}
                      </span>
                    ))}
                    {req.isVerifiedSafeSpot && (
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified Public Safe Spot
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {/* Left: Chat or Safety link */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChatWithPartner(
                        isIncoming ? req.senderId : req.recipientId,
                        otherPartyName,
                        otherPartyAvatar
                      )}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 cursor-pointer transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat with {otherPartyName.split(' ')[0]}</span>
                    </button>

                    {req.status === 'accepted' && (
                      <a
                        href={generateGoogleCalendarUrl(req)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-bold border border-indigo-500/40 transition-colors"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Add to Google Calendar</span>
                      </a>
                    )}
                  </div>

                  {/* Right: Decision controls */}
                  <div className="flex items-center gap-2">
                    {req.status === 'pending' && isIncoming ? (
                      <>
                        <button
                          onClick={() => setActiveDeclineRequest(req)}
                          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold border border-neutral-700 cursor-pointer transition-colors"
                        >
                          Decline
                        </button>

                        <button
                          onClick={() => setActiveRescheduleRequest(req)}
                          className="px-3.5 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 text-amber-300 text-xs font-bold border border-amber-500/40 cursor-pointer transition-colors"
                        >
                          Suggest New Time
                        </button>

                        <button
                          onClick={() => {
                            audioHaptics.triggerMatchCelebration();
                            onAcceptRequest(req);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Accept Date!</span>
                        </button>
                      </>
                    ) : req.status === 'accepted' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Confirmed
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateDatingRequestModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUser={currentUser}
          availableProfiles={availableProfiles}
          onSubmitRequest={(newReq) => {
            onCreateNewRequest(newReq);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {activeDeclineRequest && (
        <DeclineRequestModal
          isOpen={Boolean(activeDeclineRequest)}
          onClose={() => setActiveDeclineRequest(null)}
          request={activeDeclineRequest}
          onConfirmDecline={(reqId, note) => {
            onDeclineRequest(reqId, note);
            setActiveDeclineRequest(null);
          }}
        />
      )}

      {activeRescheduleRequest && (
        <RescheduleRequestModal
          isOpen={Boolean(activeRescheduleRequest)}
          onClose={() => setActiveRescheduleRequest(null)}
          request={activeRescheduleRequest}
          currentUserId={currentUser.id}
          onConfirmAlternative={(reqId, alt) => {
            onRescheduleRequest(reqId, alt);
            setActiveRescheduleRequest(null);
          }}
        />
      )}
    </div>
  );
};
