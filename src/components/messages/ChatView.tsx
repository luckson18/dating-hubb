import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  ShieldAlert,
  Send, 
  Mic, 
  Clock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check,
  CheckCheck, 
  ChevronLeft, 
  KeyRound,
  Info,
  Smartphone,
  Timer,
  MapPin,
  Navigation,
  AlertTriangle,
  FileText,
  WifiOff,
  CloudOff
} from 'lucide-react';
import { Conversation, Message, UserProfile, SharedLocation, MessageDraft } from '../../types/dating';
import { MessageStatusIndicator } from './MessageStatusIndicator';
import { DeliveryDetailsModal } from './DeliveryDetailsModal';
import { GoogleMapLocationCard } from '../maps/GoogleMapLocationCard';
import { ShareLocationModal } from '../maps/ShareLocationModal';
import { DateNightModal } from '../discovery/DateNightModal';
import { SmartOpenerModal } from '../discovery/SmartOpenerModal';
import { SafetyCheckModal } from '../security/SafetyCheckModal';
import { AccessibleVenue, convertVenueToSharedLocation } from '../../utils/dateNightEngine';
import { audioHaptics } from '../../services/audioHaptics';
import { draftSyncService, SyncServiceState } from '../../services/draftSyncService';

interface ChatViewProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string, isVoice?: boolean, voiceTranscript?: string) => void;
  onSendLocation?: (conversationId: string, location: SharedLocation, text?: string) => void;
  onBackToList?: () => void;
  currentUser: UserProfile;
  initialDraftMessage?: MessageDraft | null;
  onOpenDraftsModal?: () => void;
}

const ICEBREAKERS = [
  "What is your absolute favorite way to unwind on a Sunday?",
  "I noticed your passion for accessibility and design! What project are you proudest of?",
  "If you could teleport us to any coffee or tea shop right now, where would we go? ☕",
  "Tell me about a book, song, or game that changed how you view the world!"
];

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onSendLocation,
  onBackToList,
  currentUser,
  initialDraftMessage,
  onOpenDraftsModal
}) => {
  const [inputText, setInputText] = useState('');
  const [showCipherPayloads, setShowCipherPayloads] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isShareLocationOpen, setIsShareLocationOpen] = useState(false);
  const [isDateNightOpen, setIsDateNightOpen] = useState(false);
  const [isSmartOpenerOpen, setIsSmartOpenerOpen] = useState(false);
  const [isSafetyCheckOpen, setIsSafetyCheckOpen] = useState(false);
  const [safetyCheckLocation, setSafetyCheckLocation] = useState<SharedLocation | undefined>(undefined);
  const [confirmedLocations, setConfirmedLocations] = useState<Record<string, boolean>>({});
  const [selectedDeliveryMessage, setSelectedDeliveryMessage] = useState<Message | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read'>('all');
  const [syncState, setSyncState] = useState<SyncServiceState>(draftSyncService.getState());
  const [draftSavedIndicator, setDraftSavedIndicator] = useState(false);
  const [messageDrafts, setMessageDrafts] = useState<MessageDraft[]>(draftSyncService.getAllMessageDrafts());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const voiceIntervalRef = useRef<any>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Subscribe to draftSyncService
  useEffect(() => {
    const unsub = draftSyncService.subscribe((state) => {
      setSyncState(state);
      setMessageDrafts(draftSyncService.getAllMessageDrafts());
    });
    return () => unsub();
  }, []);

  // Restore draft when conversation changes or initialDraftMessage provided
  useEffect(() => {
    if (!activeConv) return;

    if (initialDraftMessage && initialDraftMessage.conversationId === activeConv.id) {
      setInputText(initialDraftMessage.text);
      return;
    }

    const savedDraft = draftSyncService.getMessageDraft(activeConv.id);
    if (savedDraft) {
      setInputText(savedDraft.text);
    } else {
      setInputText('');
    }
  }, [activeConv?.id, initialDraftMessage]);

  // Real-time auto-saving draft as user types
  useEffect(() => {
    if (!activeConv) return;

    const timer = setTimeout(() => {
      if (inputText.trim()) {
        draftSyncService.saveMessageDraft(
          activeConv.id,
          activeConv.participant.id,
          activeConv.participant.name,
          activeConv.participant.photos[0],
          inputText
        );
        setMessageDrafts(draftSyncService.getAllMessageDrafts());
        setDraftSavedIndicator(true);
        setTimeout(() => setDraftSavedIndicator(false), 2000);
      } else {
        draftSyncService.clearMessageDraft(activeConv.id);
        setMessageDrafts(draftSyncService.getAllMessageDrafts());
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputText, activeConv?.id, activeConv?.participant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const text = inputText.trim();
    setInputText('');
    draftSyncService.clearMessageDraft(activeConv.id);

    onSendMessage(activeConv.id, text);
    audioHaptics.triggerMessageSent();
  };

  const handleDateNightProposal = (venue: AccessibleVenue, customMessage?: string) => {
    if (!activeConv) return;
    const sharedLoc = convertVenueToSharedLocation(venue);
    const textNote = customMessage || `✨ Date Night Idea: ${venue.name} (${venue.categoryLabel}). ${venue.whyItsGreatForYou}`;
    
    if (onSendLocation) {
      onSendLocation(activeConv.id, sharedLoc, textNote);
    } else {
      onSendMessage(activeConv.id, textNote);
    }
  };

  const handleShareLocationSubmit = (loc: SharedLocation) => {
    if (!activeConv) return;
    if (onSendLocation) {
      onSendLocation(activeConv.id, loc, loc.notes ? `📍 Shared Meetup: ${loc.placeName}` : undefined);
    } else {
      // Fallback message with location descriptor
      onSendMessage(activeConv.id, `📍 Meetup Spot: ${loc.placeName} (${loc.address})`);
    }
  };

  const handleConfirmMeetup = (loc: SharedLocation) => {
    const key = `${loc.placeName}-${loc.address}`;
    setConfirmedLocations(prev => ({ ...prev, [key]: true }));
  };

  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setVoiceSeconds(0);
    audioHaptics.triggerNavigationClick();

    voiceIntervalRef.current = setInterval(() => {
      setVoiceSeconds(prev => prev + 1);
    }, 1000);
  };

  const finishVoiceRecording = () => {
    clearInterval(voiceIntervalRef.current);
    setIsRecordingVoice(false);

    if (activeConv) {
      const sampleTranscripts = [
        "Hey! Recorded this quick voice note. Can't wait to catch up about your video bio!",
        "Hi! Loving our conversation. Hope you're having an awesome week!",
        "Thanks for the message! Let's definitely grab matcha soon."
      ];
      const transcript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
      onSendMessage(activeConv.id, `🎙️ Voice Note (${voiceSeconds}s)`, true, transcript);
      audioHaptics.triggerMessageSent();
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter(c => {
    if (filterTab === 'unread') return c.unreadCount > 0;
    if (filterTab === 'read') return c.unreadCount === 0;
    return true;
  });

  // Calculate latest outgoing message delivery info for the active conversation
  const lastOutgoingMessage = activeConv?.messages
    .slice()
    .reverse()
    .find(m => m.senderId === 'user-me');

  const getLatestDeliveryBanner = () => {
    if (!lastOutgoingMessage) return null;
    const st = lastOutgoingMessage.status || (lastOutgoingMessage.read ? 'read' : 'delivered');
    if (st === 'queued') {
      return (
        <div className="flex items-center justify-end gap-1.5 px-4 py-1 text-[11px] text-amber-300 font-medium select-none">
          <CloudOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>
            Queued locally in offline outbox • Will auto-sync when connected
          </span>
        </div>
      );
    }
    if (st === 'syncing') {
      return (
        <div className="flex items-center justify-end gap-1.5 px-4 py-1 text-[11px] text-indigo-300 font-medium select-none">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <span>Auto-syncing with secure relay server...</span>
        </div>
      );
    }
    if (st === 'read') {
      return (
        <div className="flex items-center justify-end gap-1.5 px-4 py-1 text-[11px] text-cyan-300 font-medium select-none">
          <CheckCheck className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_3px_rgba(56,189,248,0.5)]" />
          <span>
            Seen by <strong>{activeConv.participant.name}</strong>
            {lastOutgoingMessage.readAt ? ` • ${lastOutgoingMessage.readAt}` : ''}
          </span>
        </div>
      );
    }
    if (st === 'delivered') {
      return (
        <div className="flex items-center justify-end gap-1.5 px-4 py-1 text-[11px] text-neutral-400 font-medium select-none">
          <CheckCheck className="w-3.5 h-3.5 text-neutral-300" />
          <span>
            Delivered to {activeConv.participant.name.split(' ')[0]}'s encrypted device
            {lastOutgoingMessage.deliveredAt ? ` • ${lastOutgoingMessage.deliveredAt}` : ''}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-end gap-1.5 px-4 py-1 text-[11px] text-neutral-400 font-medium select-none">
        <Check className="w-3.5 h-3.5 text-neutral-400" />
        <span>Sent • Awaiting recipient device connection</span>
      </div>
    );
  };

  return (
    <div id="encrypted-chat-container" className="w-full max-w-6xl mx-auto flex-1 flex flex-col md:flex-row bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl min-h-[580px] my-2">
      {/* Left Sidebar: Conversations List */}
      <aside 
        aria-label="Encrypted Conversations"
        className={`w-full md:w-80 border-r border-neutral-800 bg-neutral-950/60 flex flex-col ${
          activeConversationId && 'hidden md:flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Secured Messages
            </h2>
            <p className="text-[10px] text-neutral-400 font-mono">End-to-End Encrypted (AES-GCM)</p>
          </div>
          <div className="flex items-center gap-1.5">
            {!syncState.isOnline && (
              <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <WifiOff className="w-2.5 h-2.5" />
                Offline
              </span>
            )}
            <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
              E2EE
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center px-3 py-2 border-b border-neutral-800/80 gap-1 bg-neutral-950/40 text-xs">
          {(['all', 'unread', 'read'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilterTab(tab);
                audioHaptics.triggerNavigationClick();
              }}
              className={`flex-1 py-1 px-2 rounded-xl font-medium text-[11px] capitalize transition-all ${
                filterTab === tab
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'unread' ? 'Unread' : 'Seen / Read'}
            </button>
          ))}
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400">
              No conversations in this view.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConv?.id;
              const lastMsg = conv.messages[conv.messages.length - 1];
              const lastMsgIsMe = lastMsg?.senderId === 'user-me';
              const conversationDraft = messageDrafts.find(d => d.conversationId === conv.id);

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    audioHaptics.triggerNavigationClick();
                  }}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors relative ${
                    isSelected ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : 'hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {conv.participant.photos[0] ? (
                      <img
                        src={conv.participant.photos[0]}
                        alt={conv.participant.name}
                        className="w-12 h-12 rounded-full object-cover border border-neutral-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-200">
                        {conv.participant.name.charAt(0)}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-xs font-bold text-white truncate">{conv.participant.name}</h3>
                      <span className="text-[10px] text-neutral-400 font-mono flex-shrink-0 ml-1">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    {conversationDraft ? (
                      <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium truncate">
                        <FileText className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="font-bold text-amber-400 flex-shrink-0">Draft:</span>
                        <span className="truncate text-amber-200/90">{conversationDraft.text}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 truncate font-normal">
                        {lastMsgIsMe && lastMsg && (
                          <span className="flex-shrink-0">
                            {lastMsg.status === 'queued' ? (
                              <CloudOff className="w-3.5 h-3.5 text-amber-400 inline" title="Queued Offline" />
                            ) : lastMsg.status === 'syncing' ? (
                              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping inline-block" title="Syncing" />
                            ) : lastMsg.status === 'read' || lastMsg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-400 inline" title="Seen" />
                            ) : lastMsg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-neutral-400 inline" title="Delivered" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-neutral-400 inline" title="Sent" />
                            )}
                          </span>
                        )}
                        <span className="truncate">
                          {lastMsg ? lastMsg.text : 'Start encrypted conversation'}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Side: Active Chat Window */}
      {activeConv ? (
        <section 
          aria-label={`Chat with ${activeConv.participant.name}`}
          className={`flex-1 flex flex-col bg-neutral-900 ${
            !activeConversationId && 'hidden md:flex'
          }`}
        >
          {/* Active Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBackToList && (
                <button
                  onClick={onBackToList}
                  className="md:hidden p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                  aria-label="Back to conversations list"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {activeConv.participant.photos[0] ? (
                <img
                  src={activeConv.participant.photos[0]}
                  alt={activeConv.participant.name}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-indigo-500 flex items-center justify-center text-sm font-bold text-neutral-200">
                  {activeConv.participant.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  {activeConv.participant.name}
                  <Lock className="w-3 h-3 text-emerald-400" />
                </h3>
                <p className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {activeConv.participant.lastActive}
                  <span className="text-neutral-500">•</span>
                  <span className="text-cyan-300">Read Receipts Enabled</span>
                </p>
              </div>
            </div>

            {/* Cryptographic Key & Safety & Map Actions */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <button
                id="btn-safety-check-header"
                onClick={() => {
                  audioHaptics.triggerNavigationClick();
                  setSafetyCheckLocation(undefined);
                  setIsSafetyCheckOpen(true);
                }}
                title="First Meetup Safety Check: Send live location & details to trusted contact"
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/25 to-amber-500/25 hover:from-amber-500/35 hover:to-orange-500/35 text-amber-300 border border-amber-500/50 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm ring-1 ring-amber-500/30"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="inline">Safety Check</span>
              </button>

              <button
                id="btn-smart-opener-header"
                onClick={() => {
                  audioHaptics.triggerNavigationClick();
                  setIsSmartOpenerOpen(true);
                }}
                title="AI Smart Opener: Generate personalized icebreakers"
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 text-indigo-200 border border-indigo-500/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="hidden md:inline">Smart Opener</span>
              </button>

              <button
                id="btn-date-night-header"
                onClick={() => {
                  audioHaptics.triggerNavigationClick();
                  setIsDateNightOpen(true);
                }}
                title="Date Night Suggestions: 3 Accessible Local Venues"
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-950 to-indigo-950 hover:from-rose-900 hover:to-indigo-900 text-rose-200 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Date Ideas</span>
              </button>

              <button
                id="btn-share-location-header"
                onClick={() => {
                  audioHaptics.triggerNavigationClick();
                  setIsShareLocationOpen(true);
                }}
                title="Share Safe Meetup Location with Google Maps"
                className="px-2.5 py-1 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Share Meetup</span>
              </button>

              <button
                id="btn-view-e2ee-key"
                onClick={() => setShowKeyModal(true)}
                title="View Cryptographic Safety Key"
                className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Verify Key</span>
              </button>

              <button
                onClick={() => setShowCipherPayloads(!showCipherPayloads)}
                title="Toggle Raw Ciphertext View"
                className={`p-1.5 rounded-xl border text-xs cursor-pointer ${
                  showCipherPayloads 
                    ? 'bg-amber-400 text-black border-amber-300' 
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                {showCipherPayloads ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-cyan-300" />}
              </button>
            </div>
          </div>

          {/* E2EE & Read Feedback Banner */}
          <div className="bg-emerald-950/30 border-b border-emerald-500/20 px-4 py-1.5 text-center text-[10px] text-emerald-300 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span>End-to-End Encrypted. Real-time delivered & seen status indicators active.</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {activeConv.messages.map((msg) => {
              const isMe = msg.senderId === 'user-me';
              const senderName = isMe ? currentUser.name : activeConv.participant.name;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3 shadow-md relative group ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-bl-none'
                    }`}
                  >
                    {/* Message Body (Location / Voice / Text) */}
                    {msg.location ? (
                      <div className="space-y-2">
                        {msg.text && msg.text !== `📍 Shared Meetup Spot: ${msg.location.placeName}` && (
                          <p className="text-xs sm:text-sm leading-relaxed mb-1.5">{msg.text}</p>
                        )}
                        <GoogleMapLocationCard
                          location={msg.location}
                          isSenderMe={isMe}
                          onConfirmMeetup={handleConfirmMeetup}
                          onTriggerSafetyCheck={(loc) => {
                            setSafetyCheckLocation(loc);
                            setIsSafetyCheckOpen(true);
                          }}
                          isConfirmed={!!confirmedLocations[`${msg.location.placeName}-${msg.location.address}`]}
                        />
                      </div>
                    ) : msg.mediaType === 'voice' ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-white/20">
                            <Mic className="w-4 h-4 text-amber-300" />
                          </div>
                          <div className="flex-1">
                            <div className="h-4 flex items-center gap-0.5">
                              {[30, 70, 45, 90, 60, 40, 85, 30, 95, 50].map((h, i) => (
                                <span
                                  key={i}
                                  className="w-1 bg-white/80 rounded-full"
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-white/80 font-mono">Voice Message</span>
                          </div>
                        </div>
                        {msg.voiceTranscript && (
                          <p className="text-[11px] text-indigo-100 bg-black/20 p-2 rounded-xl border border-white/10 italic">
                            "{msg.voiceTranscript}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                    )}

                    {/* Raw Cipher Payload Inspector */}
                    {showCipherPayloads && (
                      <div className="mt-2 pt-2 border-t border-white/20 text-[9px] font-mono text-amber-200 bg-black/40 p-1.5 rounded-lg break-all">
                        <strong>Encrypted Ciphertext:</strong> {msg.cipherPreview || 'aes-256-gcm:d87f61a00c...'}
                      </div>
                    )}

                    {/* Message Metadata & Delivery Status Indicator */}
                    <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                      isMe ? 'text-indigo-200' : 'text-neutral-400'
                    }`}>
                      <span>{msg.timestamp}</span>

                      {/* Interactive Read/Delivered Status Indicator for sender */}
                      {isMe && (
                        <div className="flex items-center">
                          <MessageStatusIndicator
                            message={msg}
                            participantName={activeConv.participant.name}
                            onClickDetails={(m) => setSelectedDeliveryMessage(m)}
                            showTextLabel={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Empty conversation welcome state */}
            {activeConv.messages.length === 0 && (
              <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-950/50">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-base font-bold text-white">
                    You matched with {activeConv.participant.name.split(' ')[0]}!
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Skip the generic "hey" — use our AI Smart Opener to craft thoughtful, authentic icebreakers based on mutual interests.
                  </p>
                </div>

                <button
                  id="btn-smart-opener-empty-state"
                  onClick={() => {
                    audioHaptics.triggerNavigationClick();
                    setIsSmartOpenerOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Smart Openers</span>
                </button>
              </div>
            )}

            {/* Conversation-level Delivery / Seen status feedback */}
            {getLatestDeliveryBanner()}

            <div ref={messagesEndRef} />
          </div>

          {/* Icebreaker & Smart Opener Suggestions Ribbon */}
          <div className="px-4 py-2 bg-neutral-950/60 border-t border-neutral-800/80 overflow-x-auto flex items-center gap-2 no-scrollbar">
            <button
              id="btn-safety-check-ribbon"
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                setSafetyCheckLocation(undefined);
                setIsSafetyCheckOpen(true);
              }}
              className="text-[11px] flex-shrink-0 bg-gradient-to-r from-amber-950/90 to-orange-950/90 hover:from-amber-900 hover:to-orange-900 text-amber-300 border border-amber-500/50 px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-sm ring-1 ring-amber-500/30"
              title="First Meetup Safety Check: Send location alert to trusted contact"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Safety Check</span>
            </button>

            <button
              id="btn-smart-opener-ribbon"
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                setIsSmartOpenerOpen(true);
              }}
              className="text-[11px] flex-shrink-0 bg-gradient-to-r from-indigo-950 to-purple-950 hover:from-indigo-900 hover:to-purple-900 text-indigo-200 border border-indigo-500/50 px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Smart Opener</span>
            </button>

            {ICEBREAKERS.map((ib, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputText(ib);
                  audioHaptics.triggerNavigationClick();
                }}
                className="text-[11px] flex-shrink-0 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white px-2.5 py-1 rounded-xl border border-neutral-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-neutral-400" />
                <span className="truncate max-w-[200px]">{ib}</span>
              </button>
            ))}
          </div>

          {/* Message Input & Voice & Location Bar */}
          <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-950/80 space-y-2">
            {/* Draft & Offline Helper Banner */}
            <div className="flex items-center justify-between text-[11px] px-1">
              <div className="flex items-center gap-2">
                {draftSavedIndicator && (
                  <span className="text-emerald-400 font-medium flex items-center gap-1 animate-fade-in">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Draft saved locally
                  </span>
                )}
                {!draftSavedIndicator && inputText.trim() && (
                  <span className="text-neutral-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-neutral-500" />
                    Auto-saving draft...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!syncState.isOnline && (
                  <span className="text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    Offline Outbox Active
                  </span>
                )}
                {onOpenDraftsModal && (
                  <button
                    type="button"
                    onClick={onOpenDraftsModal}
                    className="text-neutral-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>View Drafts ({syncState.messageDraftsCount + syncState.statusDraftsCount})</span>
                  </button>
                )}
              </div>
            </div>

            {isRecordingVoice ? (
              <div className="flex items-center justify-between bg-neutral-900 border border-rose-500/80 rounded-2xl p-2 px-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-rose-400">Recording Voice Note ({voiceSeconds}s)...</span>
                </div>
                <button
                  onClick={finishVoiceRecording}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Send Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                {/* Safety Check Action Button */}
                <button
                  type="button"
                  id="btn-safety-check-input"
                  onClick={() => {
                    audioHaptics.triggerNavigationClick();
                    setSafetyCheckLocation(undefined);
                    setIsSafetyCheckOpen(true);
                  }}
                  title="Meetup Safety Check: Alert trusted contact with live location"
                  className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-950 to-orange-950 hover:from-amber-900 hover:to-orange-900 text-amber-300 hover:text-white transition-colors border border-amber-500/40 cursor-pointer flex items-center justify-center flex-shrink-0 shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </button>

                {/* AI Smart Opener Action Button */}
                <button
                  type="button"
                  id="btn-smart-opener-input"
                  onClick={() => {
                    audioHaptics.triggerNavigationClick();
                    setIsSmartOpenerOpen(true);
                  }}
                  title="AI Smart Opener: Suggest personalized icebreakers"
                  className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-950 to-purple-950 hover:from-indigo-900 hover:to-purple-900 text-indigo-300 hover:text-white transition-colors border border-indigo-500/40 cursor-pointer flex items-center justify-center flex-shrink-0 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </button>

                {/* Date Night Suggestion Action Button */}
                <button
                  type="button"
                  id="btn-date-night-input"
                  onClick={() => {
                    audioHaptics.triggerNavigationClick();
                    setIsDateNightOpen(true);
                  }}
                  title="Date Night Suggestions: 3 Accessible Local Venues"
                  className="p-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-rose-400 hover:text-rose-300 transition-colors border border-neutral-700 cursor-pointer flex items-center justify-center flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </button>

                {/* Share Location Action Button */}
                <button
                  type="button"
                  id="btn-share-location-input"
                  onClick={() => {
                    audioHaptics.triggerNavigationClick();
                    setIsShareLocationOpen(true);
                  }}
                  title="Share Safe Meetup Location on Google Maps"
                  className="p-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-indigo-400 hover:text-indigo-300 transition-colors border border-neutral-700 cursor-pointer flex items-center justify-center flex-shrink-0"
                >
                  <MapPin className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={startVoiceRecording}
                  title="Record Encrypted Voice Note"
                  className="p-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors border border-neutral-700 cursor-pointer flex-shrink-0"
                >
                  <Mic className="w-4 h-4 text-amber-400" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    !syncState.isOnline
                      ? `Type offline message to ${activeConv.participant.name.split(' ')[0]} (auto-queues)...`
                      : `Send encrypted message to ${activeConv.participant.name.split(' ')[0]}...`
                  }
                  className="flex-1 bg-neutral-800/90 border border-neutral-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors shadow-md flex items-center gap-1 cursor-pointer flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </section>
      ) : null}

      {/* Meetup Safety Check Modal */}
      {activeConv && (
        <SafetyCheckModal
          isOpen={isSafetyCheckOpen}
          onClose={() => setIsSafetyCheckOpen(false)}
          currentUser={currentUser}
          partner={activeConv.participant}
          initialLocation={safetyCheckLocation}
        />
      )}

      {/* AI Smart Opener Modal */}
      {activeConv && (
        <SmartOpenerModal
          isOpen={isSmartOpenerOpen}
          onClose={() => setIsSmartOpenerOpen(false)}
          currentUser={currentUser}
          matchedUser={activeConv.participant}
          onSelectOpener={(openerText) => {
            setInputText(openerText);
          }}
          onSendInstantMessage={(openerText) => {
            onSendMessage(activeConv.id, openerText);
          }}
        />
      )}

      {/* Date Night Suggestions Modal */}
      {activeConv && (
        <DateNightModal
          isOpen={isDateNightOpen}
          onClose={() => setIsDateNightOpen(false)}
          currentUser={currentUser}
          matchedUser={activeConv.participant}
          onSendDateProposal={handleDateNightProposal}
        />
      )}

      {/* Share Location on Google Maps Modal */}
      {activeConv && (
        <ShareLocationModal
          isOpen={isShareLocationOpen}
          onClose={() => setIsShareLocationOpen(false)}
          onShareLocation={handleShareLocationSubmit}
          recipientName={activeConv.participant.name}
        />
      )}

      {/* Cryptographic Key Verification Modal */}
      {showKeyModal && activeConv && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 ring-4 ring-emerald-500/20">
              <KeyRound className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold mb-1">E2EE Cryptographic Key</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Compare this safety fingerprint with {activeConv.participant.name} to guarantee zero eavesdropping.
            </p>

            <div className="bg-black/60 p-3 rounded-2xl border border-neutral-800 font-mono text-xs text-emerald-300 tracking-wider break-all mb-4 select-all">
              {activeConv.encryptionKeyFingerprint}
            </div>

            <button
              onClick={() => setShowKeyModal(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-md"
            >
              Key Verified & Match
            </button>
          </div>
        </div>
      )}

      {/* Message Delivery & Security Details Modal */}
      {selectedDeliveryMessage && activeConv && (
        <DeliveryDetailsModal
          message={selectedDeliveryMessage}
          conversation={activeConv}
          onClose={() => setSelectedDeliveryMessage(null)}
        />
      )}
    </div>
  );
};

