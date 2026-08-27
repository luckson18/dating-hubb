/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AccessibilitySettings, 
  UserProfile, 
  StatusUpdate, 
  Conversation, 
  Message,
  MatchFilter,
  VideoBio,
  PartnerNotification,
  InterestedPartner,
  SharedLocation,
  DatingRequest,
  AlternativeDateProposal
} from './types/dating';
import { 
  CURRENT_USER, 
  MOCK_PROFILES, 
  INITIAL_STATUS_UPDATES, 
  INITIAL_CONVERSATIONS, 
  INITIAL_NOTIFICATIONS,
  DEFAULT_FILTER,
  calculateCompatibility
} from './data/mockProfiles';
import { INITIAL_DATING_REQUESTS } from './data/mockDatingRequests';
import { audioHaptics } from './services/audioHaptics';
import { speechService } from './services/speechService';
import { matchesDescriptionQuery } from './utils/searchMatching';

// Accessibility & UI Components
import { AccessibilityBar } from './components/accessibility/AccessibilityBar';
import { AccessibilityModal } from './components/accessibility/AccessibilityModal';
import { VoiceCommandHUD } from './components/accessibility/VoiceCommandHUD';
import { BiometricLockModal } from './components/security/BiometricLockModal';
import { Header } from './components/common/Header';
import { Navigation, AppTab } from './components/common/Navigation';
import { NotificationsModal } from './components/common/NotificationsModal';

// Main Views
import { DiscoveryDeck } from './components/discovery/DiscoveryDeck';
import { ExploreGrid } from './components/discovery/ExploreGrid';
import { DatingRequestsHub } from './components/requests/DatingRequestsHub';
import { CreateDatingRequestModal } from './components/requests/CreateDatingRequestModal';
import { FilterDrawer } from './components/discovery/FilterDrawer';
import { VideoBioModal } from './components/video/VideoBioModal';
import { StatusUpdatesBar } from './components/status/StatusUpdatesBar';
import { CreateStatusModal } from './components/status/CreateStatusModal';
import { InterestedPartnersModal } from './components/status/InterestedPartnersModal';
import { ExpressInterestModal } from './components/status/ExpressInterestModal';
import { DateNightModal } from './components/discovery/DateNightModal';
import { SmartOpenerModal } from './components/discovery/SmartOpenerModal';
import { AccessibleVenue, convertVenueToSharedLocation } from './utils/dateNightEngine';
import { ChatView } from './components/messages/ChatView';
import { MyProfileEditor } from './components/profile/MyProfileEditor';
import { LoadingScreen } from './components/common/LoadingScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { SaveCredentialsModal } from './components/auth/SaveCredentialsModal';
import { authService } from './services/authService';
import { DraftsManagerModal } from './components/drafts/DraftsManagerModal';
import { OfflineNetworkBanner } from './components/common/OfflineNetworkBanner';
import { GeolocationManagerModal } from './components/maps/GeolocationManagerModal';
import { LiveLocationStatusBar } from './components/maps/LiveLocationStatusBar';
import { locationService } from './services/locationService';
import { draftSyncService } from './services/draftSyncService';
import { MessageDraft, StatusDraft, GeoCoordinates, ReverseGeocodeResult } from './types/dating';
import { Sparkles, Heart, RotateCcw } from 'lucide-react';
import { InterestRecallToast, RecentInterestState } from './components/status/InterestRecallToast';

export default function App() {
  // --- Loading Screen State ---
  const [isLoading, setIsLoading] = useState(true);

  // --- Accessibility Global State ---
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    contrastMode: 'standard',
    textScale: 'normal',
    screenReaderEnabled: true,
    voiceCommandsActive: false,
    hapticEnabled: true,
    audioCuesEnabled: true,
    reduceMotion: false,
    largeTouchTargets: false,
    speechRate: 1.0,
    autoReadProfiles: false,
  });

  // --- Voice Commands & Speech HUD ---
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [lastVoiceCommand, setLastVoiceCommand] = useState<{ command: string; text: string; timestamp: number } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- Modals State ---
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [accessibilityModalTab, setAccessibilityModalTab] = useState<'settings' | 'voice-commands'>('settings');
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [videoModalUser, setVideoModalUser] = useState<UserProfile | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [dateNightModalUser, setDateNightModalUser] = useState<UserProfile | null>(null);
  const [smartOpenerModalUser, setSmartOpenerModalUser] = useState<UserProfile | null>(null);
  const [isCreateStatusOpen, setIsCreateStatusOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [activeInterestedModalStatus, setActiveInterestedModalStatus] = useState<StatusUpdate | null>(null);
  const [activeExpressModalStatus, setActiveExpressModalStatus] = useState<StatusUpdate | null>(null);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [editingStatusDraft, setEditingStatusDraft] = useState<StatusDraft | null>(null);
  const [recentExpressedInterest, setRecentExpressedInterest] = useState<RecentInterestState | null>(null);

  // --- Core Application State ---
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>(INITIAL_STATUS_UPDATES);
  const [notifications, setNotifications] = useState<PartnerNotification[]>(INITIAL_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [datingRequests, setDatingRequests] = useState<DatingRequest[]>(INITIAL_DATING_REQUESTS);
  const [isGlobalCreateDateModalOpen, setIsGlobalCreateDateModalOpen] = useState(false);
  const [createDateModalPartner, setCreateDateModalPartner] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('discover');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [filters, setFilters] = useState<MatchFilter>(DEFAULT_FILTER);
  const [isBiometricVaultLocked, setIsBiometricVaultLocked] = useState(false);

  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = authService.getStoredSession();
    return session ? session.isAuthenticated : true;
  });
  const [isSaveCredentialsModalOpen, setIsSaveCredentialsModalOpen] = useState(false);
  const [pendingSaveCreds, setPendingSaveCreds] = useState<{ user: UserProfile; rawPassword?: string } | null>(null);

  // --- Geolocation & Google Maps Platform State ---
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [liveLocation, setLiveLocation] = useState<GeoCoordinates | null>(CURRENT_USER.coordinates || { lat: 37.7749, lng: -122.4194 });
  const [reverseLocationData, setReverseLocationData] = useState<ReverseGeocodeResult | null>({
    formattedAddress: 'San Francisco, CA 94103, USA',
    displayName: 'San Francisco, CA',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
  });

  const unreadNotificationCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const pendingDatingRequestsCount = useMemo(() => 
    datingRequests.filter(r => r.recipientId === currentUser.id && r.status === 'pending').length, 
    [datingRequests, currentUser.id]
  );

  // Initial Geolocation & Distance Matrix Initialization
  useEffect(() => {
    const initLocation = async () => {
      try {
        const coords = await locationService.getCurrentLocation({ enableHighAccuracy: false, timeout: 5000 });
        setLiveLocation(coords);
        const rev = await locationService.reverseGeocode(coords.lat, coords.lng);
        setReverseLocationData(rev);

        // Update user profile location and batch recalculate distances
        setCurrentUser(prev => ({
          ...prev,
          coordinates: coords,
          locationCity: rev.displayName || rev.city || prev.locationCity,
        }));

        const updatedProfiles = await locationService.updateProfilesWithMatrix(coords, MOCK_PROFILES);
        setProfiles(updatedProfiles);
      } catch (err) {
        console.warn('Initial geolocation setup error:', err);
      }
    };
    initLocation();
  }, []);

  const handleLocationUpdatedFromModal = async (coords: GeoCoordinates, revData: ReverseGeocodeResult) => {
    setLiveLocation(coords);
    setReverseLocationData(revData);

    setCurrentUser(prev => ({
      ...prev,
      coordinates: coords,
      locationCity: revData.displayName || revData.city || prev.locationCity,
    }));

    try {
      const updatedProfiles = await locationService.updateProfilesWithMatrix(coords, profiles);
      setProfiles(updatedProfiles);
    } catch (e) {
      console.warn('Profile distance recalculation error:', e);
    }
  };

  // Update speech synthesis speech rate
  useEffect(() => {
    speechService.setSpeechRate(accessibilitySettings.speechRate);
  }, [accessibilitySettings.speechRate]);

  // Sync haptic and sound preferences
  useEffect(() => {
    audioHaptics.setPreferences(accessibilitySettings.audioCuesEnabled, accessibilitySettings.hapticEnabled);
  }, [accessibilitySettings.audioCuesEnabled, accessibilitySettings.hapticEnabled]);

  // Voice Command Handler
  const handleVoiceCommand = useCallback((command: string, rawText: string) => {
    setLastVoiceCommand({ command, text: rawText, timestamp: Date.now() });

    switch (command) {
      case 'LIKE':
      case 'PASS':
      case 'SUPER_LIKE':
        // Routed within deck when active
        break;
      case 'READ_PROFILE':
        if (profiles.length > 0) {
          const p = profiles[0];
          speechService.speak(`${p.name}, age ${p.age}. ${p.bio}. Height: ${p.heightFeet}. Hobbies: ${p.hobbies.join(', ')}.`);
        }
        break;
      case 'STOP_SPEAKING':
        speechService.stopSpeaking();
        setIsSpeaking(false);
        break;
      case 'VIDEO_BIO':
        if (profiles.length > 0 && profiles[0].videoBio) {
          setVideoModalUser(profiles[0]);
          setIsVideoModalOpen(true);
        }
        break;
      case 'OPEN_FILTERS':
        setIsFilterDrawerOpen(true);
        break;
      case 'SEARCH_QUERY': {
        const cleanQuery = rawText.replace(/^(search|find|filter by)\s+/i, '').trim();
        if (cleanQuery) {
          setFilters(prev => ({ ...prev, searchQuery: cleanQuery }));
          speechService.speak(`Filtering profiles for ${cleanQuery}`);
        }
        break;
      }
      case 'NAV_MESSAGES':
        setActiveTab('messages');
        break;
      case 'NAV_DISCOVERY':
        setActiveTab('discover');
        break;
      case 'NAV_REQUESTS':
        setActiveTab('requests');
        speechService.speak("Opening dating requests hub.");
        break;
      case 'PROPOSE_DATE':
        setIsGlobalCreateDateModalOpen(true);
        speechService.speak("Opening date proposal composer.");
        break;
      case 'ACCEPT_DATE': {
        const firstPending = datingRequests.find(r => r.recipientId === currentUser.id && r.status === 'pending');
        if (firstPending) {
          handleAcceptDatingRequest(firstPending);
        } else {
          speechService.speak("No pending date invitations found.");
        }
        break;
      }
      case 'NAV_STATUS':
        setActiveTab('status');
        break;
      case 'NAV_PROFILE':
        setActiveTab('profile');
        break;
      case 'TOGGLE_CONTRAST':
        setAccessibilitySettings(prev => {
          const modes = ['standard', 'high-contrast-dark', 'high-contrast-light', 'yellow-black', 'dyslexia-friendly'] as const;
          const next = modes[(modes.indexOf(prev.contrastMode as any) + 1) % modes.length];
          return { ...prev, contrastMode: next };
        });
        break;
      case 'RECALL_INTEREST': {
        const lastInterested = statusUpdates.find(s => s.hasExpressedInterest);
        if (lastInterested) {
          handleRecallInterest(lastInterested.id);
        } else {
          speechService.speak("No active interest expressions to recall.");
        }
        break;
      }
      case 'EXPRESS_INTEREST': {
        const firstAvailable = statusUpdates.find(s => s.userId !== currentUser.id && !s.hasExpressedInterest);
        if (firstAvailable) {
          handleExpressInterest(firstAvailable.id);
        } else {
          speechService.speak("No new status posts found to express interest in.");
        }
        break;
      }
      case 'LOCK_APP':
        setIsBiometricVaultLocked(true);
        audioHaptics.triggerBiometricLocked();
        break;
      case 'HELP':
        setAccessibilityModalTab('voice-commands');
        setIsAccessibilityModalOpen(true);
        break;
      default:
        break;
    }
  }, [profiles]);

  // Toggle Voice Recognition Navigation
  const toggleVoiceListening = () => {
    if (isVoiceListening) {
      speechService.stopListening();
      setIsVoiceListening(false);
      audioHaptics.triggerNavigationClick();
    } else {
      const started = speechService.startListening(
        handleVoiceCommand,
        (listening) => setIsVoiceListening(listening),
        (transcript) => setVoiceTranscript(transcript)
      );
      if (started) {
        audioHaptics.triggerVoiceCommandAcknowledge();
        speechService.speak("Voice navigation enabled. Speak any command.");
      }
    }
  };

  // Filtered Profiles calculation
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Proximity distance filter
      if (filters.maxDistanceKm < 100 && p.distanceKm > filters.maxDistanceKm) return false;

      // Age filter
      if (p.age < filters.minAge || p.age > filters.maxAge) return false;

      // Height filter
      if (p.heightCm < filters.minHeightCm || p.heightCm > filters.maxHeightCm) return false;

      // Gender filter
      if (filters.genders.length > 0 && !filters.genders.includes(p.gender)) return false;

      // Complexion filter
      if (filters.complexions.length > 0 && !filters.complexions.includes(p.complexion)) return false;

      // Ethnicity filter
      if (filters.ethnicities.length > 0 && !filters.ethnicities.includes(p.raceEthnicity)) return false;

      // Religion filter
      if (filters.religions.length > 0 && !filters.religions.includes(p.religion)) return false;

      // Education filter
      if (filters.educationLevels.length > 0 && !filters.educationLevels.includes(p.education)) return false;

      // Hobbies matching
      if (filters.selectedHobbies.length > 0) {
        const hasMatchingHobby = filters.selectedHobbies.some(h => p.hobbies.includes(h));
        if (!hasMatchingHobby) return false;
      }

      // Video Bio requirement
      if (filters.requireVideoBio && !p.videoBio) return false;

      // Verified requirement
      if (filters.requireVerified && !p.verified) return false;

      // Descriptive & Keyword Search Filter (Complexion, Height, Profession, Background, Lifestyle, Hobbies)
      if (filters.searchQuery.trim()) {
        if (!matchesDescriptionQuery(p, filters.searchQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [profiles, filters]);

  // Handle Post New Status Update
  const handlePostStatus = (newStatus: Omit<StatusUpdate, 'id' | 'createdAt' | 'likesCount'>) => {
    const created: StatusUpdate = {
      ...newStatus,
      id: `status-${Date.now()}`,
      createdAt: 'Just now',
      likesCount: 0
    };
    setStatusUpdates([created, ...statusUpdates]);
    speechService.speak("Status update published with your selected privacy audience.");
  };

  // Handle Like Status
  const handleLikeStatus = (statusId: string) => {
    setStatusUpdates(prev => prev.map(s => {
      if (s.id === statusId) {
        const hasLiked = !s.hasLiked;
        return {
          ...s,
          hasLiked,
          likesCount: hasLiked ? s.likesCount + 1 : s.likesCount - 1
        };
      }
      return s;
    }));
  };

  // Handle Recall / Undo an Expressed Interest
  const handleRecallInterest = (statusId: string) => {
    let targetUserName = '';
    setStatusUpdates(prev => prev.map(s => {
      if (s.id === statusId) {
        targetUserName = s.userName;
        const currentPartners = s.interestedPartners || [];
        const updatedPartners = currentPartners.filter(p => p.userId !== currentUser.id && p.userId !== 'user-me');
        return {
          ...s,
          hasExpressedInterest: false,
          interestedCount: Math.max(0, (s.interestedCount || 1) - 1),
          interestedPartners: updatedPartners
        };
      }
      return s;
    }));

    if (recentExpressedInterest && recentExpressedInterest.statusId === statusId) {
      setRecentExpressedInterest(null);
    }

    audioHaptics.triggerRecallInterest();
    speechService.speak(`Interest expression recalled from ${targetUserName || 'post'}.`);
  };

  // Handle Express Interest on a post
  const handleExpressInterest = (statusId: string, note?: string) => {
    const targetStatus = statusUpdates.find(s => s.id === statusId);

    if (targetStatus && targetStatus.hasExpressedInterest) {
      handleRecallInterest(statusId);
      return;
    }

    setStatusUpdates(prev => prev.map(s => {
      if (s.id === statusId) {
        const currentPartners = s.interestedPartners || [];
        const newPartner: InterestedPartner = {
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.photos[0],
          userAge: currentUser.age,
          userPronouns: currentUser.pronouns,
          compatibilityScore: 92,
          verified: currentUser.verified,
          expressedAt: 'Just now',
          note: note
        };
        const updatedPartners = [newPartner, ...currentPartners.filter(p => p.userId !== currentUser.id && p.userId !== 'user-me')];
        return {
          ...s,
          hasExpressedInterest: true,
          interestedCount: (s.interestedCount || 0) + 1,
          interestedPartners: updatedPartners
        };
      }
      return s;
    }));

    if (targetStatus && targetStatus.userId !== currentUser.id) {
      audioHaptics.triggerInterestSent();
      speechService.speak(`Interest expressed! ${targetStatus.userName} has been notified.`);
      setRecentExpressedInterest({
        statusId,
        targetUserName: targetStatus.userName,
        targetUserAvatar: targetStatus.userAvatar,
        contentSnippet: targetStatus.content,
        expressedAt: Date.now()
      });
    }
  };

  // Notification Actions
  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    speechService.speak("All notifications marked as read.");
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    speechService.speak("Notifications cleared.");
  };

  // Connect / Chat with an Interested Partner
  const handleStartChatWithPartner = (userId: string, userName: string, avatar: string, initialMessage?: string) => {
    const existingConv = conversations.find(c => 
      c.participant.id === userId || c.participant.name.toLowerCase() === userName.toLowerCase()
    );
    if (existingConv) {
      if (initialMessage) {
        handleSendMessage(existingConv.id, initialMessage);
      }
      setActiveConversationId(existingConv.id);
    } else {
      const matchedProfile: UserProfile = profiles.find(p => p.id === userId || p.name.toLowerCase() === userName.toLowerCase()) || {
        id: userId,
        name: userName,
        age: 28,
        gender: 'Woman',
        pronouns: 'she/her',
        distanceKm: 2.5,
        locationCity: 'San Francisco, CA',
        verified: true,
        photos: [avatar],
        bio: 'Connected via mutual status update interest.',
        heightCm: 170,
        heightFeet: `5'7"`,
        weightKg: 60,
        complexion: 'Warm Beige',
        raceEthnicity: 'Multiracial / Mixed',
        religion: 'Spiritual / Eclectic',
        education: "Bachelor's Degree",
        jobTitle: 'Creative Designer',
        companyOrField: 'Design Studio',
        nationality: 'American',
        languages: ['English'],
        hobbies: ['Art', 'Coffee', 'Music'],
        lifestyle: { diet: 'Omnivore' },
        relationshipGoal: 'Meaningful dating',
        accessibilityBadges: ['Accessibility Ally'],
        lastActive: 'Active now'
      };

      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        participant: matchedProfile,
        unreadCount: 0,
        lastMessageTime: 'Just now',
        encryptionKeyFingerprint: `E2EE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-F9C0`,
        ephemeralMode: true,
        ephemeralDurationSec: 86400,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: 'user-me',
            receiverId: userId,
            text: initialMessage || `Hi ${userName.split(' ')[0]}! Saw your interest on the post — excited to connect! ✨`,
            timestamp: 'Just now',
            encrypted: true,
            read: true,
            status: 'sent'
          }
        ]
      };
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
    }
    setActiveTab('messages');
  };

  // Handle Reply to Status -> opens chat
  const handleReplyToStatus = (userName: string, statusContent: string) => {
    const existingConv = conversations.find(c => c.participant.name.toLowerCase().includes(userName.toLowerCase()));
    if (existingConv) {
      setActiveConversationId(existingConv.id);
    } else {
      const targetUser = profiles.find(p => p.name.toLowerCase().includes(userName.toLowerCase())) || profiles[0];
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        participant: targetUser,
        unreadCount: 0,
        lastMessageTime: 'Just now',
        encryptionKeyFingerprint: `E2EE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-F9C0`,
        ephemeralMode: true,
        ephemeralDurationSec: 86400,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: 'user-me',
            receiverId: targetUser.id,
            text: `Replying to your status: "${statusContent}"`,
            timestamp: 'Just now',
            encrypted: true,
            read: true
          }
        ]
      };
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
    }
    setActiveTab('messages');
  };

  // Select Conversation & mark read
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          unreadCount: 0,
          messages: c.messages.map(m => m.senderId !== 'user-me' ? { ...m, read: true, status: 'read' as const, readAt: m.readAt || 'Just now' } : m)
        };
      }
      return c;
    }));
  };

  // Handle Send Message with dynamic delivery & read receipt status progression
  const handleSendMessage = (conversationId: string, text: string, isVoice = false, voiceTranscript?: string) => {
    const messageId = `msg-${Date.now()}`;
    const newMsg: Message = {
      id: messageId,
      senderId: 'user-me',
      receiverId: '',
      text,
      timestamp: 'Just now',
      encrypted: true,
      cipherPreview: `aes-256-gcm:${Math.random().toString(36).substring(2, 10)}...`,
      mediaType: isVoice ? ('voice' as const) : undefined,
      voiceTranscript,
      read: false,
      status: 'sent'
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        newMsg.receiverId = conv.participant.id;
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessageTime: 'Just now'
        };
      }
      return conv;
    }));

    // Simulate 1: Delivered to recipient's encrypted device after 800ms
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(m => {
              if (m.id === messageId && m.status === 'sent') {
                return {
                  ...m,
                  status: 'delivered' as const,
                  deliveredAt: 'Just now'
                };
              }
              return m;
            })
          };
        }
        return conv;
      }));
    }, 800);

    // Simulate 2: Decrypted & Seen / Read by recipient after 2500ms
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(m => {
              if (m.id === messageId) {
                return {
                  ...m,
                  status: 'read' as const,
                  read: true,
                  readAt: 'Just now'
                };
              }
              return m;
            })
          };
        }
        return conv;
      }));
    }, 2500);
  };

  // Handle Send Location on Google Maps
  const handleSendLocation = (conversationId: string, location: SharedLocation, text?: string) => {
    const messageId = `msg-${Date.now()}`;
    const newMsg: Message = {
      id: messageId,
      senderId: 'user-me',
      receiverId: '',
      text: text || `📍 Meetup Spot: ${location.placeName}`,
      timestamp: 'Just now',
      encrypted: true,
      cipherPreview: `aes-256-gcm:${Math.random().toString(36).substring(2, 10)}...`,
      mediaType: 'location' as const,
      location,
      read: false,
      status: 'sent'
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        newMsg.receiverId = conv.participant.id;
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessageTime: 'Just now'
        };
      }
      return conv;
    }));

    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(m => {
              if (m.id === messageId && m.status === 'sent') {
                return {
                  ...m,
                  status: 'delivered' as const,
                  deliveredAt: 'Just now'
                };
              }
              return m;
            })
          };
        }
        return conv;
      }));
    }, 800);

    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(m => {
              if (m.id === messageId) {
                return {
                  ...m,
                  status: 'read' as const,
                  read: true,
                  readAt: 'Just now'
                };
              }
              return m;
            })
          };
        }
        return conv;
      }));
    }, 2500);
  };

  // Auto-sync callbacks for messages & status updates
  const handleSyncMessageReceived = useCallback((conversationId: string, syncedMsg: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const exists = conv.messages.some(m => m.id === syncedMsg.id);
        const updatedMessages = exists
          ? conv.messages.map(m => m.id === syncedMsg.id ? syncedMsg : m)
          : [...conv.messages, syncedMsg];
        return {
          ...conv,
          messages: updatedMessages,
          lastMessageTime: 'Just now'
        };
      }
      return conv;
    }));

    // Realistic delivery progression after auto-sync
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(m => {
              if (m.id === syncedMsg.id && m.status === 'sent') {
                return {
                  ...m,
                  status: 'delivered' as const,
                  deliveredAt: 'Just now'
                };
              }
              return m;
            })
          };
        }
        return conv;
      }));
    }, 800);
  }, []);

  const handleSyncStatusReceived = useCallback((syncedStatus: StatusUpdate) => {
    setStatusUpdates(prev => {
      const filtered = prev.filter(s => !s.id.startsWith('status-queued-'));
      return [syncedStatus, ...filtered];
    });
  }, []);

  const handleForceSync = useCallback(async () => {
    await draftSyncService.syncAllPending(handleSyncMessageReceived, handleSyncStatusReceived);
  }, [handleSyncMessageReceived, handleSyncStatusReceived]);

  // Network restoration auto-sync listener
  useEffect(() => {
    const unsub = draftSyncService.subscribe((state) => {
      if (state.isOnline && state.queuedCount > 0 && !state.isSyncing) {
        draftSyncService.syncAllPending(handleSyncMessageReceived, handleSyncStatusReceived);
      }
    });
    return () => unsub();
  }, [handleSyncMessageReceived, handleSyncStatusReceived]);

  // Draft selection actions
  const handleSelectMessageDraftFromModal = (draft: MessageDraft) => {
    setIsDraftsModalOpen(false);
    setActiveConversationId(draft.conversationId);
    setActiveTab('messages');
  };

  const handleSelectStatusDraftFromModal = (draft: StatusDraft) => {
    setIsDraftsModalOpen(false);
    setEditingStatusDraft(draft);
    setIsCreateStatusOpen(true);
  };

  // Start Chat with a Matched Profile
  const handleStartChatWith = (profile: UserProfile) => {
    const existing = conversations.find(c => c.participant.id === profile.id);
    if (existing) {
      handleSelectConversation(existing.id);
    } else {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        participant: profile,
        unreadCount: 0,
        lastMessageTime: 'Just now',
        encryptionKeyFingerprint: `E2EE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        ephemeralMode: true,
        ephemeralDurationSec: 86400,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: 'user-me',
            receiverId: profile.id,
            text: `Hi ${profile.name}! Excited to connect with you on Aura.`,
            timestamp: 'Just now',
            encrypted: true,
            status: 'delivered',
            deliveredAt: 'Just now',
            read: false
          }
        ]
      };
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
    }
    setActiveTab('messages');
  };

  // Send Date Night proposal from Discovery Deck or Explore Grid into Chat
  const handleSendDateProposalFromApp = (venue: AccessibleVenue, customMessage?: string) => {
    if (!dateNightModalUser) return;
    const targetUser = dateNightModalUser;
    const sharedLoc = convertVenueToSharedLocation(venue);
    const textMsg = customMessage || `✨ Date Night Idea: ${venue.name} (${venue.categoryLabel}). ${venue.whyItsGreatForYou}`;

    // Also record as a formal DatingRequest
    const newReq: DatingRequest = {
      id: `req-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.photos[0],
      senderAge: currentUser.age,
      senderPronouns: currentUser.pronouns,
      senderJob: currentUser.jobTitle,
      senderVerified: currentUser.verified,
      recipientId: targetUser.id,
      recipientName: targetUser.name,
      recipientAvatar: targetUser.photos[0],
      recipientAge: targetUser.age,
      title: `${venue.name} Meetup`,
      activityType: venue.category === 'cafe' ? 'coffee_drinks' : venue.category === 'museum' ? 'art_culture' : venue.category === 'park' ? 'outdoor_nature' : 'dining',
      venueName: venue.name,
      venueAddress: venue.address,
      venueNeighborhood: venue.neighborhood,
      venuePhotoUrl: venue.photoUrl,
      venueRating: venue.rating,
      venueCategoryLabel: venue.categoryLabel,
      venueCoordinates: { lat: venue.lat, lng: venue.lng },
      proposedDateTime: 'This Weekend • 6:00 PM',
      accessibilityAccommodations: venue.accessibilityBadges,
      dietaryPreferences: ['Sensory-friendly atmosphere', 'Gluten-free / Vegan options'],
      icebreakerMessage: textMsg,
      compatibilityScore: calculateCompatibility(currentUser, targetUser).scorePercent,
      status: 'pending',
      createdAt: 'Just now',
      isVerifiedSafeSpot: true,
      emergencyContactNotified: true
    };
    setDatingRequests(prev => [newReq, ...prev]);

    let targetConv = conversations.find(c => c.participant.id === targetUser.id);
    let convId = targetConv?.id;

    if (!targetConv) {
      convId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        participant: targetUser,
        unreadCount: 0,
        lastMessageTime: 'Just now',
        encryptionKeyFingerprint: `E2EE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        ephemeralMode: true,
        ephemeralDurationSec: 86400,
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
    }

    if (convId) {
      handleSendLocation(convId, sharedLoc, textMsg);
      setActiveConversationId(convId);
      setActiveTab('messages');
    }
  };

  // Dating Request Handlers
  const handleAcceptDatingRequest = (request: DatingRequest) => {
    setDatingRequests(prev => prev.map(r => {
      if (r.id === request.id) {
        return {
          ...r,
          status: 'accepted' as const,
          respondedAt: 'Just now',
          responseNote: "Can't wait! Date invitation accepted ✨"
        };
      }
      return r;
    }));

    // Add confirmation notification
    const newNotif: PartnerNotification = {
      id: `notif-date-${Date.now()}`,
      senderId: request.senderId,
      senderName: request.senderName,
      senderAvatar: request.senderAvatar,
      type: 'match_date',
      title: '🎉 Date Confirmed!',
      body: `You accepted ${request.senderName}’s date invitation for ${request.venueName} (${request.proposedDateTime})!`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Open or initiate chat with confirmation message
    handleStartChatWithPartner(
      request.senderId,
      request.senderName,
      request.senderAvatar,
      `🎉 Date Confirmed! I'm so excited to meet up at ${request.venueName} on ${request.proposedDateTime}! ✨`
    );
  };

  const handleDeclineDatingRequest = (requestId: string, reasonNote?: string) => {
    setDatingRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'declined' as const,
          respondedAt: 'Just now',
          responseNote: reasonNote || 'Declined politely.'
        };
      }
      return r;
    }));
  };

  const handleRescheduleDatingRequest = (requestId: string, alternative: AlternativeDateProposal) => {
    setDatingRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rescheduled' as const,
          alternativeProposal: alternative
        };
      }
      return r;
    }));
  };

  const handleCreateDatingRequest = (newRequest: DatingRequest) => {
    setDatingRequests(prev => [newRequest, ...prev]);

    const targetUserId = newRequest.recipientId;
    let targetConv = conversations.find(c => c.participant.id === targetUserId);
    let convId = targetConv?.id;

    if (!targetConv) {
      const recipientProfile = profiles.find(p => p.id === targetUserId) || {
        id: targetUserId,
        name: newRequest.recipientName,
        photos: [newRequest.recipientAvatar],
        age: newRequest.recipientAge || 28,
        bio: 'Matched Dater',
        verified: true,
        gender: 'All',
        pronouns: 'They/Them',
        locationCity: 'San Francisco, CA',
        heightFeet: "5'8\"",
        jobTitle: 'Partner',
        education: 'University',
        hobbies: ['Art', 'Coffee'],
        lifestyle: { smoking: false, drinking: 'socially', exercise: 'active', pets: 'dogs' },
        accessibility: { mobility: 'Standard', visual: 'Standard', auditory: 'Standard', sensory: 'Sensory-Friendly' },
        relationshipIntent: 'Long-term relationship'
      };

      convId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        participant: recipientProfile,
        unreadCount: 0,
        lastMessageTime: 'Just now',
        encryptionKeyFingerprint: `E2EE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        ephemeralMode: true,
        ephemeralDurationSec: 86400,
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
    }

    if (convId) {
      const inviteMsg = `💌 Date Invitation: ${newRequest.title} at ${newRequest.venueName} (${newRequest.proposedDateTime}). "${newRequest.icebreakerMessage}"`;
      handleSendMessage(convId, inviteMsg);
    }
  };

  // Select Smart Opener from Discovery Deck or Explore Grid into Chat
  const handleSelectSmartOpenerFromApp = (openerText: string) => {
    if (!smartOpenerModalUser) return;
    const targetUser = smartOpenerModalUser;
    let targetConv = conversations.find(c => c.participant.id === targetUser.id);
    let convId = targetConv?.id;

    if (!targetConv) {
      convId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        participant: targetUser,
        unreadCount: 0,
        lastMessageTime: 'Just now',
        encryptionKeyFingerprint: `E2EE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        ephemeralMode: true,
        ephemeralDurationSec: 86400,
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
    }

    if (convId) {
      setActiveConversationId(convId);
      setActiveTab('messages');
    }
    setSmartOpenerModalUser(null);
  };

  // Send Instant Smart Opener from Discovery Deck or Explore Grid into Chat
  const handleSendSmartOpenerFromApp = (openerText: string) => {
    if (!smartOpenerModalUser) return;
    const targetUser = smartOpenerModalUser;
    let targetConv = conversations.find(c => c.participant.id === targetUser.id);
    let convId = targetConv?.id;

    if (!targetConv) {
      convId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        participant: targetUser,
        unreadCount: 0,
        lastMessageTime: 'Just now',
        encryptionKeyFingerprint: `E2EE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        ephemeralMode: true,
        ephemeralDurationSec: 86400,
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
    }

    if (convId) {
      handleSendMessage(convId, openerText);
      setActiveConversationId(convId);
      setActiveTab('messages');
    }
    setSmartOpenerModalUser(null);
  };

  // Video Bio Save from My Profile Studio
  const handleSaveVideoBio = (newVideoBio: VideoBio) => {
    setCurrentUser(prev => ({
      ...prev,
      videoBio: newVideoBio
    }));
    speechService.speak("New authentic Video Bio saved to your profile.");
  };

  // --- Authentication Handlers ---
  const handleLoginSuccess = (user: UserProfile, rawPassword?: string, isNewLogin: boolean = true) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    speechService.speak(`Welcome back, ${user.name.split(' ')[0]}!`);

    if (isNewLogin) {
      setPendingSaveCreds({ user, rawPassword });
      setIsSaveCredentialsModalOpen(true);
    }
  };

  const handleSaveCredentials = (biometricEnabled: boolean) => {
    if (pendingSaveCreds) {
      const usernameClean = pendingSaveCreds.user.username || pendingSaveCreds.user.name.toLowerCase().replace(/\s+/g, '_');
      const emailClean = pendingSaveCreds.user.email || `${usernameClean}@hubb.app`;

      authService.saveCredential({
        userId: pendingSaveCreds.user.id,
        username: usernameClean,
        email: emailClean,
        name: pendingSaveCreds.user.name,
        avatar: pendingSaveCreds.user.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        password: pendingSaveCreds.rawPassword,
        biometricEnabled,
      });
    }
    setIsSaveCredentialsModalOpen(false);
    setPendingSaveCreds(null);
    speechService.speak('Login credentials successfully saved to device vault.');
  };

  const handleSkipSaveCredentials = () => {
    setIsSaveCredentialsModalOpen(false);
    setPendingSaveCreds(null);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    audioHaptics.triggerTap();
    speechService.speak('You have been signed out. Welcome back anytime.');
  };

  // Calculate theme class names
  const themeClass = `theme-${accessibilitySettings.contrastMode} ${
    accessibilitySettings.textScale === 'large' ? 'text-scale-large' : accessibilitySettings.textScale === 'extra-large' ? 'text-scale-extra-large' : ''
  } ${accessibilitySettings.largeTouchTargets ? 'large-touch-targets' : ''}`;

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white ${themeClass}`}>
      {/* App Initial Loading Page with hubb logo and text */}
      {isLoading && (
        <LoadingScreen
          onLoaded={() => setIsLoading(false)}
          minDurationMs={1800}
        />
      )}

      {!isAuthenticated ? (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          availableProfiles={profiles}
          currentUser={currentUser}
          accessibilitySettings={accessibilitySettings}
          onUpdateAccessibility={(newSettings) => setAccessibilitySettings(prev => ({ ...prev, ...newSettings }))}
        />
      ) : (
        <>
          {/* Top Accessibility & Voice Quick Bar */}
          <AccessibilityBar
        settings={accessibilitySettings}
        onUpdateSettings={(newSettings) => setAccessibilitySettings(prev => ({ ...prev, ...newSettings }))}
        onOpenSettingsModal={() => {
          setAccessibilityModalTab('settings');
          setIsAccessibilityModalOpen(true);
        }}
        onOpenHelpModal={() => {
          setAccessibilityModalTab('voice-commands');
          setIsAccessibilityModalOpen(true);
        }}
        isListening={isVoiceListening}
        onToggleListening={toggleVoiceListening}
        isSpeaking={speechService.isSpeaking()}
        onStopSpeaking={() => {
          speechService.stopSpeaking();
          setIsSpeaking(false);
        }}
        isBiometricLocked={isBiometricVaultLocked}
        onToggleBiometricLock={() => {
          if (isBiometricVaultLocked) {
            setIsBiometricModalOpen(true);
          } else {
            setIsBiometricVaultLocked(true);
            audioHaptics.triggerBiometricLocked();
            speechService.speak("Biometric vault locked.");
          }
        }}
      />

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          audioHaptics.triggerNavigationClick();
        }}
        notificationCount={unreadNotificationCount}
        datingRequestsCount={pendingDatingRequestsCount}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenDrafts={() => setIsDraftsModalOpen(true)}
        onOpenDatingRequests={() => setActiveTab('requests')}
        onLogout={handleLogout}
      />

      {/* Global Offline / Outbox Network Banner */}
      <OfflineNetworkBanner
        onOpenDraftsModal={() => setIsDraftsModalOpen(true)}
        onForceSync={handleForceSync}
      />

      {/* Google Maps Live Location & Distance Matrix Status Bar */}
      <LiveLocationStatusBar
        currentLocation={liveLocation}
        reverseData={reverseLocationData}
        onOpenGeoModal={() => setIsGeoModalOpen(true)}
      />

      {/* Status Stories Bar (Shown in Discover, Explore, Status tabs) */}
      {(activeTab === 'discover' || activeTab === 'explore' || activeTab === 'status') && (
        <StatusUpdatesBar
          statuses={statusUpdates}
          currentUser={currentUser}
          onOpenCreateStatus={() => setIsCreateStatusOpen(true)}
          onLikeStatus={handleLikeStatus}
          onReplyToStatus={handleReplyToStatus}
          onExpressInterest={handleExpressInterest}
          onRecallInterest={handleRecallInterest}
          onStartChatWithUser={handleStartChatWithPartner}
        />
      )}

      {/* Live Voice Navigation HUD */}
      <VoiceCommandHUD
        isListening={isVoiceListening}
        transcript={voiceTranscript}
        lastCommand={lastVoiceCommand}
        onOpenHelp={() => {
          setAccessibilityModalTab('voice-commands');
          setIsAccessibilityModalOpen(true);
        }}
        onDismiss={() => setIsVoiceListening(false)}
      />

      {/* Main Routed Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col pb-24 max-w-7xl w-full mx-auto px-2 sm:px-4">
        {activeTab === 'discover' && (
          viewMode === 'deck' ? (
            <DiscoveryDeck
              profiles={filteredProfiles}
              currentUser={currentUser}
              onOpenVideoBio={(p) => {
                setVideoModalUser(p);
                setIsVideoModalOpen(true);
              }}
              onOpenDateNight={(p) => setDateNightModalUser(p)}
              onOpenSmartOpener={(p) => setSmartOpenerModalUser(p)}
              onOpenFilters={() => setIsFilterDrawerOpen(true)}
              onStartChatWith={handleStartChatWith}
              isBiometricLocked={isBiometricVaultLocked}
              onResetDeck={() => setFilters(DEFAULT_FILTER)}
              onToggleViewMode={() => setViewMode('grid')}
              viewMode="deck"
              searchQuery={filters.searchQuery}
              onSearchChange={(q) => setFilters(prev => ({ ...prev, searchQuery: q }))}
            />
          ) : (
            <ExploreGrid
              profiles={filteredProfiles}
              currentUser={currentUser}
              onSelectProfile={(p) => {
                setVideoModalUser(p);
                setIsVideoModalOpen(true);
              }}
              onOpenVideoBio={(p) => {
                setVideoModalUser(p);
                setIsVideoModalOpen(true);
              }}
              onOpenDateNight={(p) => setDateNightModalUser(p)}
              onOpenSmartOpener={(p) => setSmartOpenerModalUser(p)}
              onOpenFilters={() => setIsFilterDrawerOpen(true)}
              onToggleViewMode={() => setViewMode('deck')}
              searchQuery={filters.searchQuery}
              onSearchChange={(q) => setFilters(prev => ({ ...prev, searchQuery: q }))}
            />
          )
        )}

        {activeTab === 'explore' && (
          <ExploreGrid
            profiles={filteredProfiles}
            currentUser={currentUser}
            onSelectProfile={(p) => {
              setVideoModalUser(p);
              setIsVideoModalOpen(true);
            }}
            onOpenVideoBio={(p) => {
              setVideoModalUser(p);
              setIsVideoModalOpen(true);
            }}
            onOpenDateNight={(p) => setDateNightModalUser(p)}
            onOpenSmartOpener={(p) => setSmartOpenerModalUser(p)}
            onOpenFilters={() => setIsFilterDrawerOpen(true)}
            onToggleViewMode={() => {
              setActiveTab('discover');
              setViewMode('deck');
            }}
            searchQuery={filters.searchQuery}
            onSearchChange={(q) => setFilters(prev => ({ ...prev, searchQuery: q }))}
          />
        )}

        {activeTab === 'requests' && (
          <DatingRequestsHub
            currentUser={currentUser}
            datingRequests={datingRequests}
            availableProfiles={profiles}
            onAcceptRequest={handleAcceptDatingRequest}
            onDeclineRequest={handleDeclineDatingRequest}
            onRescheduleRequest={handleRescheduleDatingRequest}
            onCreateNewRequest={handleCreateDatingRequest}
            onOpenChatWithPartner={(userId, name, avatar) => {
              handleStartChatWithPartner(userId, name, avatar);
            }}
          />
        )}

        {activeTab === 'status' && (
          <div className="w-full max-w-2xl mx-auto py-4 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-lg font-black text-white">Audience Circles & Micro-Moments</h2>
                <p className="text-xs text-neutral-400">Share updates with specific circles and connect with interested partners</p>
              </div>
              <button
                onClick={() => setIsCreateStatusOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
              >
                + Post Status
              </button>
            </div>
            {statusUpdates.map((st) => {
              const isOwnStatus = st.userId === currentUser.id;
              const interestedCount = st.interestedCount || 0;

              return (
                <div
                  key={st.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.userAvatar}
                        alt={st.userName}
                        className="w-10 h-10 rounded-full object-cover border border-indigo-500"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {st.userName}
                          {st.moodEmoji && <span>{st.moodEmoji}</span>}
                          {isOwnStatus && (
                            <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded-full">
                              You
                            </span>
                          )}
                        </h3>
                        <p className="text-[10px] text-neutral-400">
                          {st.location ? `${st.location} • ` : ''}{st.createdAt}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700 px-2.5 py-1 rounded-full font-medium">
                      {st.audience === 'close-friends' ? '🔒 Close Friends' : st.audience === 'custom-group' ? '🎯 Selected Circles' : '👥 Matches'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-black/30 p-3.5 rounded-2xl border border-neutral-800">
                    "{st.content}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Like button */}
                      <button
                        onClick={() => {
                          audioHaptics.triggerLike();
                          handleLikeStatus(st.id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                          st.hasLiked
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                        }`}
                        aria-label={`Like status (${st.likesCount} likes)`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${st.hasLiked ? 'fill-white' : ''}`} />
                        <span>{st.likesCount}</span>
                      </button>

                      {/* Interested Count / View Partners Button */}
                      <button
                        onClick={() => setActiveInterestedModalStatus(st)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          interestedCount > 0
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                            : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                        }`}
                        aria-label={`View interested partners (${interestedCount} interested)`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{interestedCount} {interestedCount === 1 ? 'Interested' : 'Interested'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Express Interest & Recall Actions (For others' posts) */}
                      {!isOwnStatus ? (
                        st.hasExpressedInterest ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setActiveExpressModalStatus(st)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm hover:bg-emerald-900/80 transition-all cursor-pointer"
                              aria-label="Manage your expressed interest"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Interested ✓</span>
                            </button>

                            <button
                              id="btn-recall-status-feed"
                              onClick={() => handleRecallInterest(st.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-all shadow-sm cursor-pointer"
                              aria-label={`Recall interest from ${st.userName}'s post`}
                              title="Sent by accident? Recall interest"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Recall</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveExpressModalStatus(st)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/40 hover:from-amber-500 hover:to-rose-500 hover:text-white transition-all shadow-md cursor-pointer"
                            aria-label="Express interest in this post"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>I'm Interested</span>
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => setActiveInterestedModalStatus(st)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 font-bold text-xs cursor-pointer"
                        >
                          <span>Manage Partners ({interestedCount})</span>
                        </button>
                      )}

                      {!isOwnStatus && (
                        <button
                          onClick={() => handleReplyToStatus(st.userName, st.content)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs border border-neutral-700 cursor-pointer"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'messages' && (
          <ChatView
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onSendMessage={handleSendMessage}
            onSendLocation={handleSendLocation}
            onBackToList={() => setActiveConversationId(null)}
            currentUser={currentUser}
            onOpenDraftsModal={() => setIsDraftsModalOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <MyProfileEditor
            user={currentUser}
            onSaveProfile={(updated) => setCurrentUser(updated)}
            onOpenVideoStudio={() => {
              setVideoModalUser(currentUser);
              setIsVideoModalOpen(true);
            }}
            onTriggerBiometricLock={() => {
              setIsBiometricVaultLocked(true);
              audioHaptics.triggerBiometricLocked();
              speechService.speak("Biometric vault locked.");
            }}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Accessible Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          audioHaptics.triggerNavigationClick();
        }}
        unreadCount={conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
        requestsCount={pendingDatingRequestsCount}
      />

      {/* --- Global Modals & Drawers --- */}

      {/* Global Date Proposal Creator Modal */}
      {isGlobalCreateDateModalOpen && (
        <CreateDatingRequestModal
          isOpen={isGlobalCreateDateModalOpen}
          onClose={() => {
            setIsGlobalCreateDateModalOpen(false);
            setCreateDateModalPartner(null);
          }}
          currentUser={currentUser}
          matchedUser={createDateModalPartner}
          availableProfiles={profiles}
          onSubmitRequest={(newReq) => {
            handleCreateDatingRequest(newReq);
            setIsGlobalCreateDateModalOpen(false);
            setCreateDateModalPartner(null);
          }}
        />
      )}

      {/* Accessibility Preferences & Voice Guide Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
        settings={accessibilitySettings}
        onUpdateSettings={(newSettings) => setAccessibilitySettings(prev => ({ ...prev, ...newSettings }))}
        activeTab={accessibilityModalTab}
        setActiveTab={setAccessibilityModalTab}
      />

      {/* Biometric Security Unlock Modal */}
      <BiometricLockModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onSuccess={() => {
          setIsBiometricVaultLocked(false);
          speechService.speak("Biometric vault unlocked.");
        }}
      />

      {/* Personalized Matchmaking Filters Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onUpdateFilters={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
        onResetFilters={() => setFilters(DEFAULT_FILTER)}
        matchCount={filteredProfiles.length}
      />

      {/* Video Bio Recording & Playback Modal */}
      {videoModalUser && (
        <VideoBioModal
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false);
            setVideoModalUser(null);
          }}
          user={videoModalUser}
          isCurrentUser={videoModalUser.id === currentUser.id}
          onSaveVideoBio={handleSaveVideoBio}
        />
      )}

      {/* Create Status Update Modal */}
      <CreateStatusModal
        isOpen={isCreateStatusOpen}
        onClose={() => {
          setIsCreateStatusOpen(false);
          setEditingStatusDraft(null);
        }}
        onPostStatus={handlePostStatus}
        currentUserName={currentUser.name}
        currentUserAvatar={currentUser.photos[0]}
        initialDraft={editingStatusDraft}
      />

      {/* Interested Partners Modal (Viewer for post authors/viewers) */}
      {activeInterestedModalStatus && (
        <InterestedPartnersModal
          isOpen={Boolean(activeInterestedModalStatus)}
          onClose={() => setActiveInterestedModalStatus(null)}
          status={activeInterestedModalStatus}
          currentUserId={currentUser.id}
          onStartChatWithUser={(userId, name, avatar) => {
            setActiveInterestedModalStatus(null);
            handleStartChatWithPartner(userId, name, avatar);
          }}
          onRecallInterest={(statusId) => {
            handleRecallInterest(statusId);
          }}
        />
      )}

      {/* Express Interest Modal (With optional personalized note & Recall) */}
      {activeExpressModalStatus && (
        <ExpressInterestModal
          isOpen={Boolean(activeExpressModalStatus)}
          onClose={() => setActiveExpressModalStatus(null)}
          status={activeExpressModalStatus}
          currentUser={currentUser}
          onConfirmInterest={(statusId, note) => {
            handleExpressInterest(statusId, note);
            setActiveExpressModalStatus(null);
          }}
          onSubmitInterest={(statusId, note) => {
            handleExpressInterest(statusId, note);
            setActiveExpressModalStatus(null);
          }}
          onRecallInterest={(statusId) => {
            handleRecallInterest(statusId);
            setActiveExpressModalStatus(null);
          }}
        />
      )}

      {/* Date Night Suggestions Modal (From Deck or Explore Grid) */}
      {dateNightModalUser && (
        <DateNightModal
          isOpen={Boolean(dateNightModalUser)}
          onClose={() => setDateNightModalUser(null)}
          currentUser={currentUser}
          matchedUser={dateNightModalUser}
          onSendDateProposal={handleSendDateProposalFromApp}
        />
      )}

      {/* AI Smart Opener Modal (From Deck or Explore Grid) */}
      {smartOpenerModalUser && (
        <SmartOpenerModal
          isOpen={Boolean(smartOpenerModalUser)}
          onClose={() => setSmartOpenerModalUser(null)}
          currentUser={currentUser}
          matchedUser={smartOpenerModalUser}
          onSelectOpener={handleSelectSmartOpenerFromApp}
          onSendInstantMessage={handleSendSmartOpenerFromApp}
        />
      )}

      {/* Partner Notifications Center Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
        onStartChatWithUser={(userId, name, avatar) => {
          setIsNotificationsModalOpen(false);
          handleStartChatWithPartner(userId, name, avatar);
        }}
        onSelectNotification={(notification) => {
          setIsNotificationsModalOpen(false);
          if (notification.targetStatusId) {
            const found = statusUpdates.find(s => s.id === notification.targetStatusId);
            if (found) {
              setActiveInterestedModalStatus(found);
            } else {
              setActiveTab('status');
            }
          } else {
            handleStartChatWithPartner(notification.senderId, notification.senderName, notification.senderAvatar);
          }
        }}
      />

      {/* Offline Drafts & Outbox Manager Modal */}
      <DraftsManagerModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        onSelectMessageDraft={handleSelectMessageDraftFromModal}
        onSelectStatusDraft={handleSelectStatusDraftFromModal}
        onForceSync={handleForceSync}
      />

      {/* Google Maps Geolocation, Reverse Geocode & Routes Distance Matrix Modal */}
      <GeolocationManagerModal
        isOpen={isGeoModalOpen}
        onClose={() => setIsGeoModalOpen(false)}
        currentLocation={liveLocation}
        onLocationUpdated={handleLocationUpdatedFromModal}
      />

      {/* Undo / Recall Interest Floating Notification Toast */}
      <InterestRecallToast
        recentInterest={recentExpressedInterest}
        onRecall={handleRecallInterest}
        onDismiss={() => setRecentExpressedInterest(null)}
        durationSec={10}
      />
        </>
      )}

      {/* Save Login Credentials Modal Prompt */}
      {isSaveCredentialsModalOpen && pendingSaveCreds && (
        <SaveCredentialsModal
          isOpen={isSaveCredentialsModalOpen}
          user={pendingSaveCreds.user}
          rawPassword={pendingSaveCreds.rawPassword}
          onSave={handleSaveCredentials}
          onSkip={handleSkipSaveCredentials}
        />
      )}
    </div>
  );
}
