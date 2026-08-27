export type ContrastMode = 'standard' | 'high-contrast-dark' | 'high-contrast-light' | 'yellow-black' | 'dyslexia-friendly';

export type TextScale = 'normal' | 'large' | 'extra-large';

export interface AccessibilitySettings {
  contrastMode: ContrastMode;
  textScale: TextScale;
  screenReaderEnabled: boolean;
  voiceCommandsActive: boolean;
  hapticEnabled: boolean;
  audioCuesEnabled: boolean;
  reduceMotion: boolean;
  largeTouchTargets: boolean;
  speechRate: number; // 0.8 to 1.5
  autoReadProfiles: boolean;
}

export type Gender = 'Woman' | 'Man' | 'Non-binary' | 'Agender' | 'Genderfluid' | 'Transgender' | 'Other';

export type Complexion = 'Fair / Porcelain' | 'Warm Beige' | 'Olive / Honey' | 'Caramel / Tan' | 'Warm Bronze' | 'Deep Brown' | 'Rich Ebony';

export type Ethnicity = 
  | 'African / Black'
  | 'Asian / South Asian'
  | 'Asian / East & SE Asian'
  | 'Hispanic / Latino'
  | 'Middle Eastern / Arab'
  | 'Native / Indigenous'
  | 'White / Caucasian'
  | 'Pacific Islander'
  | 'Multiracial / Mixed'
  | 'Other';

export type Religion = 
  | 'Agnostic'
  | 'Atheist'
  | 'Buddhist'
  | 'Christian'
  | 'Catholic'
  | 'Hindu'
  | 'Jewish'
  | 'Muslim'
  | 'Sikh'
  | 'Spiritual / Eclectic'
  | 'Traditional / Indigenous'
  | 'Other';

export type EducationLevel = 
  | 'High School / Secondary'
  | 'Vocational / Trade School'
  | 'Associate Degree'
  | "Bachelor's Degree"
  | "Master's / Graduate"
  | 'Doctorate / PhD / MD / JD'
  | 'Self-Taught / Other';

export type RelationshipGoal = 
  | 'Long-term partnership'
  | 'Marriage / Family'
  | 'Meaningful dating'
  | 'Friendship & Connection'
  | 'Casual dating'
  | 'Open to exploring';

export interface VideoBio {
  url: string;
  thumbnailUrl?: string;
  durationSec: number;
  transcript: string;
  hasAudio: boolean;
  subtitles: { start: number; end: number; text: string }[];
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email?: string;
  age: number;
  gender: Gender;
  pronouns: string;
  distanceKm: number;
  locationCity: string;
  verified: boolean;
  photos: string[];
  photoDescription?: string; // Detailed visual description / Alt-Text for screen readers and low-vision daters
  videoBio?: VideoBio;
  voiceBioUrl?: string;
  bio: string;
  
  // Detailed secured personal attributes
  heightCm: number; // e.g. 175
  heightFeet: string; // e.g. 5'9"
  weightKg?: number; // e.g. 68
  complexion: Complexion;
  raceEthnicity: Ethnicity;
  religion: Religion;
  education: EducationLevel;
  jobTitle: string;
  companyOrField: string;
  nationality: string;
  languages: string[];
  hobbies: string[];
  lifestyle: {
    diet?: string;
    smoking?: string;
    drinking?: string;
    pets?: string[];
    astrologySign?: string;
  };
  relationshipGoal: RelationshipGoal;
  accessibilityBadges: string[]; // e.g. "Screen Reader User", "ASL Signer", "Allies with Disabilites", "Neurodivergent"
  
  coordinates?: { lat: number; lng: number };
  
  // Security & Privacy
  isBiometricLocked?: boolean;
  isPrivateProfile?: boolean;
  lastActive: string;
}

export interface InterestedPartner {
  userId: string;
  userName: string;
  userAvatar: string;
  userAge?: number;
  userPronouns?: string;
  compatibilityScore?: number;
  verified?: boolean;
  expressedAt: string;
  note?: string;
}

export interface PartnerNotification {
  id: string;
  type: 'interest' | 'match' | 'status_reply' | 'message' | 'match_date';
  title?: string;
  body?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  userAge?: number;
  statusId?: string;
  targetStatusId?: string;
  statusContent?: string;
  timestamp: string;
  read: boolean;
  note?: string;
  compatibilityScore?: number;
}

export interface StatusUpdate {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  moodEmoji?: string;
  location?: string;
  createdAt: string;
  expiresInHours: number;
  audience: 'public' | 'matches' | 'close-friends' | 'custom-group';
  targetGroupNames?: string[];
  likesCount: number;
  hasLiked?: boolean;
  interestedCount?: number;
  hasExpressedInterest?: boolean;
  interestedPartners?: InterestedPartner[];
}

export type MessageDeliveryStatus = 'queued' | 'syncing' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageDraft {
  id: string;
  conversationId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  text: string;
  isVoice?: boolean;
  voiceTranscript?: string;
  location?: SharedLocation;
  updatedAt: number;
  isQueuedForSend?: boolean;
  createdAt: number;
}

export interface StatusDraft {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  moodEmoji?: string;
  location?: string;
  expiresInHours: number;
  audience: 'public' | 'matches' | 'close-friends' | 'custom-group';
  targetGroupNames?: string[];
  updatedAt: number;
  isQueuedForPublish?: boolean;
  createdAt: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'message' | 'status_update';
  targetId: string; // conversationId for message, or status id
  payload: any;
  queuedAt: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
}

export interface SharedLocation {
  placeName: string;
  address: string;
  lat: number;
  lng: number;
  category?: 'cafe' | 'park' | 'restaurant' | 'museum' | 'custom' | 'current_location';
  isSafeMeetupSpot?: boolean;
  notes?: string;
  googleMapsUrl?: string;
  rating?: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  encrypted: boolean;
  cipherPreview?: string;
  ephemeralSeconds?: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'voice' | 'video' | 'location';
  voiceDuration?: number;
  voiceTranscript?: string;
  location?: SharedLocation;
  read: boolean;
  status?: MessageDeliveryStatus;
  deliveredAt?: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  participant: UserProfile;
  messages: Message[];
  unreadCount: number;
  lastMessageTime: string;
  encryptionKeyFingerprint: string;
  ephemeralMode: boolean;
  ephemeralDurationSec: number;
}

export interface MatchFilter {
  maxDistanceKm: number;
  minAge: number;
  maxAge: number;
  minHeightCm: number;
  maxHeightCm: number;
  genders: Gender[];
  complexions: Complexion[];
  ethnicities: Ethnicity[];
  religions: Religion[];
  educationLevels: EducationLevel[];
  nationalities: string[];
  jobCategories: string[];
  selectedHobbies: string[];
  requireVideoBio: boolean;
  requireVerified: boolean;
  accessibilityFriendlyOnly: boolean;
  searchQuery: string;
}

export interface DemographicCompatibility {
  ageScore: number;
  ageInsight: string;
  distanceScore: number;
  distanceInsight: string;
  languageScore: number;
  sharedLanguages: string[];
  religionScore: number;
  religionInsight: string;
  educationScore: number;
  educationInsight: string;
  goalsScore: number;
  goalsInsight: string;
  accessibilityScore: number;
  accessibilityInsight: string;
  overallDemographicPercent: number;
}

export interface HobbyCompatibility {
  sharedHobbies: string[];
  totalShared: number;
  hobbyScorePercent: number;
  complementaryHobbies: string[];
  highlight: string;
}

export interface CompatibilityInsight {
  scorePercent: number;
  hobbiesScore: number;
  demographicsScore: number;
  lifestyleScore: number;
  sharedHobbies: string[];
  demographics: DemographicCompatibility;
  hobbiesBreakdown: HobbyCompatibility;
  valuesOverlap: string[];
  complimentaryTraits: string[];
  summary: string;
}

export type SmartOpenerTone = 'all' | 'warm' | 'witty' | 'thoughtful' | 'casual' | 'curious';

export type SmartOpenerCategory = 
  | 'shared_interest' 
  | 'curious_question' 
  | 'playful_warm' 
  | 'accessible_activity'
  | 'lifestyle_vibe';

export interface SmartOpenerSuggestion {
  id: string;
  category: SmartOpenerCategory;
  categoryLabel: string;
  tone: 'warm' | 'witty' | 'thoughtful' | 'casual' | 'curious';
  openerText: string;
  whyItWorks: string;
  highlightedKeywords: string[];
}

export interface SmartOpenerResponse {
  targetUserId: string;
  targetUserName: string;
  sharedInterests: string[];
  openers: SmartOpenerSuggestion[];
  isAiGenerated: boolean;
}

export type SafetyCheckUrgency = 'routine' | 'scheduled' | 'urgent';

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notifyMethod: 'sms' | 'whatsapp' | 'share' | 'simulated';
  isDefaultEmergencyContact?: boolean;
}

export interface SafetyCheckLog {
  id: string;
  timestamp: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  messageText: string;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  partnerName: string;
  partnerId: string;
  urgency: SafetyCheckUrgency;
  status: 'dispatched' | 'delivered';
  checkInDeadline?: string;
}

// --- Geolocation, Reverse Geocoding & Distance Matrix Types ---
export interface GeoCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  source?: 'gps' | 'google-geolocation' | 'fallback' | 'manual';
}

export interface ReverseGeocodeResult {
  formattedAddress: string;
  streetNumber?: string;
  route?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  placeId?: string;
  plusCode?: string;
  types?: string[];
  displayName: string;
  source?: string;
}

export type TravelMode = 'DRIVE' | 'WALK' | 'TRANSIT' | 'BICYCLE';

export interface DistanceMatrixTravelEstimate {
  originIndex?: number;
  destinationIndex?: number;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  distanceMeters: number;
  distanceKm: number;
  distanceMiles: number;
  distanceText: string;
  durationSeconds: number;
  durationMinutes: number;
  durationText: string;
  travelMode: TravelMode;
  condition?: string;
  status?: string;
  source?: string;
}

export interface DistanceMatrixMultiMode {
  drive?: DistanceMatrixTravelEstimate;
  walk?: DistanceMatrixTravelEstimate;
  transit?: DistanceMatrixTravelEstimate;
  bicycle?: DistanceMatrixTravelEstimate;
}

export type DatingRequestStatus = 'pending' | 'accepted' | 'declined' | 'rescheduled' | 'cancelled' | 'completed';

export type DatingActivityType = 
  | 'coffee_drinks' 
  | 'dining' 
  | 'art_culture' 
  | 'outdoor_nature' 
  | 'games_arcade' 
  | 'live_music' 
  | 'tea_lounge'
  | 'virtual_video' 
  | 'custom';

export interface AlternativeDateProposal {
  proposedDateTime?: string;
  venueName?: string;
  venueAddress?: string;
  note?: string;
  proposedByUserId: string;
}

export interface DatingRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderAge?: number;
  senderPronouns?: string;
  senderJob?: string;
  senderVerified?: boolean;
  
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  recipientAge?: number;
  
  title: string;
  activityType: DatingActivityType;
  venueName: string;
  venueAddress: string;
  venueNeighborhood?: string;
  venuePhotoUrl?: string;
  venueRating?: number;
  venueCategoryLabel?: string;
  venueCoordinates?: { lat: number; lng: number };
  
  proposedDateTime: string; // Human formatted, e.g. "Saturday, Mar 7 • 4:00 PM"
  proposedTimestamp?: number;
  
  accessibilityAccommodations: string[]; // e.g. ["Step-free entrance", "Quiet seating", "ASL friendly", "Braille/Audio menus"]
  dietaryPreferences?: string[]; // e.g. ["Gluten-free available", "Vegan options", "Mocktails & decaf"]
  
  icebreakerMessage?: string;
  compatibilityScore?: number;
  
  status: DatingRequestStatus;
  createdAt: string;
  respondedAt?: string;
  responseNote?: string;
  
  isVerifiedSafeSpot: boolean;
  emergencyContactNotified?: boolean;
  alternativeProposal?: AlternativeDateProposal;
}

export interface SavedCredential {
  id: string;
  userId: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  passwordMasked: string; // e.g. "••••••••"
  passwordRaw?: string; // stored for local 1-tap fast sign-in
  savedAt: string;
  lastLoginAt: string;
  biometricEnabled?: boolean;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: UserProfile;
  token: string;
  rememberMe: boolean;
  loginTime: string;
}

