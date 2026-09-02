import { 
  UserProfile, 
  StatusUpdate, 
  Conversation, 
  MatchFilter, 
  PartnerNotification,
  CompatibilityInsight
} from '../types/dating';

// Authentically registered community user template for initial session
export const CURRENT_USER: UserProfile = {
  id: 'user-admin-simon',
  name: 'Simon Chikondi',
  username: 'simonchikondi',
  email: 'simonchikondi8@gmail.com',
  age: 29,
  gender: 'Man',
  pronouns: 'he/him',
  distanceKm: 0,
  locationCity: 'London, UK',
  verified: true,
  photos: [],
  photoDescription: '',
  bio: 'Software architect and accessibility advocate. Building inclusive technology and exploring quiet coffee spots around the city.',
  heightCm: 182,
  heightFeet: `6'0"`,
  weightKg: 78,
  complexion: 'Deep Brown',
  raceEthnicity: 'African / Black',
  religion: 'Spiritual / Eclectic',
  education: "Master's / Graduate",
  jobTitle: 'Lead Software Architect',
  companyOrField: 'Cloud & Inclusive Systems',
  nationality: 'British',
  languages: ['English', 'Chichewa', 'French'],
  hobbies: ['Running', 'Accessibility Tech', 'Vinyl Records', 'Coffee Roasting', 'Photography'],
  lifestyle: {
    diet: 'Omnivore',
    smoking: 'Never',
    drinking: 'Socially',
    exercise: 'Daily active',
    sleepSchedule: 'Early bird (6 AM - 10 PM)'
  },
  relationshipGoal: 'Long-term partnership',
  accessibilityBadges: ['Screen Reader Optimized', 'Voice Navigation Ally', 'Sensory Friendly'],
  coordinates: { lat: 51.5074, lng: -0.1278 },
  isBiometricLocked: false,
  isPrivateProfile: false,
  lastActive: 'Active now'
};

// No fake or sample mock profiles - the feed is strictly populated by accounts created by real users
export const MOCK_PROFILES: UserProfile[] = [];

// No fake or sample status updates - only authentic updates posted by registered users
export const INITIAL_STATUS_UPDATES: StatusUpdate[] = [];

export const INITIAL_NOTIFICATIONS: PartnerNotification[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const DEFAULT_FILTER: MatchFilter = {
  minAge: 18,
  maxAge: 70,
  maxDistanceKm: 100,
  minHeightCm: 140,
  maxHeightCm: 220,
  genders: [],
  complexions: [],
  ethnicities: [],
  religions: [],
  educationLevels: [],
  nationalities: [],
  jobCategories: [],
  selectedHobbies: [],
  requireVideoBio: false,
  requireVerified: false,
  accessibilityFriendlyOnly: false,
  searchQuery: ''
};

/**
 * Calculates a comprehensive multi-factor compatibility breakdown between two profiles
 */
export function calculateCompatibility(userA: UserProfile, userB: UserProfile): CompatibilityInsight {
  if (!userA || !userB) {
    return {
      scorePercent: 75,
      hobbiesScore: 70,
      demographicsScore: 80,
      lifestyleScore: 75,
      sharedHobbies: [],
      demographics: {
        ageScore: 80,
        ageInsight: 'Great age resonance',
        distanceScore: 85,
        distanceInsight: 'Nearby location',
        languageScore: 80,
        sharedLanguages: [],
        religionScore: 80,
        religionInsight: 'Compatible philosophies',
        educationScore: 80,
        educationInsight: 'Aligned background',
        goalsScore: 85,
        goalsInsight: 'Mutual dating intentions',
        accessibilityScore: 90,
        accessibilityInsight: 'Shared accessibility values',
        overallDemographicPercent: 82,
      },
      hobbiesBreakdown: {
        sharedHobbies: [],
        totalShared: 0,
        hobbyScorePercent: 70,
        complementaryHobbies: [],
        highlight: 'Diverse shared interests',
      },
      valuesOverlap: ['Authenticity', 'Respect'],
      complimentaryTraits: ['Thoughtful', 'Curious'],
      summary: 'Strong mutual potential based on shared values and communication style.',
    };
  }

  // 1. Shared Hobbies
  const userAHobbies = (userA.hobbies || []).filter(Boolean);
  const userBHobbies = (userB.hobbies || []).filter(Boolean);
  const hobbiesA = new Set(userAHobbies.map(h => h.toLowerCase()));
  const sharedHobbies = userBHobbies.filter(h => hobbiesA.has(h.toLowerCase()));
  const totalShared = sharedHobbies.length;
  const hobbyScorePercent = (userAHobbies.length > 0 && userBHobbies.length > 0)
    ? Math.min(100, Math.max(50, Math.round((totalShared / Math.max(1, userAHobbies.length)) * 100)))
    : 70;

  // 2. Age Proximity
  const hasAges = Boolean(userA.age && userA.age > 0 && userB.age && userB.age > 0);
  const ageDiff = hasAges ? Math.abs(userA.age - userB.age) : 0;
  const ageScore = hasAges ? Math.max(40, Math.round(100 - ageDiff * 4)) : 75;
  const ageInsight = hasAges 
    ? (ageDiff <= 3 ? 'Close age alignment' : `${ageDiff} years age difference`)
    : (userB.age && userB.age > 0 ? `${userB.age} years old` : 'Not specified');

  // 3. Distance & Location
  const hasDistance = typeof userB.distanceKm === 'number' && userB.distanceKm > 0;
  const distance = hasDistance ? userB.distanceKm : 0;
  const distanceScore = hasDistance ? Math.max(30, Math.round(100 - distance * 1.2)) : 80;
  const distanceInsight = hasDistance 
    ? `${distance} km apart` 
    : (userB.locationCity ? userB.locationCity : 'Not specified');

  // 4. Shared Languages
  const userALangs = (userA.languages || []).filter(Boolean);
  const userBLangs = (userB.languages || []).filter(Boolean);
  const langsA = new Set(userALangs.map(l => l.toLowerCase()));
  const sharedLanguages = userBLangs.filter(l => langsA.has(l.toLowerCase()));
  const hasLangs = userALangs.length > 0 && userBLangs.length > 0;
  const languageScore = hasLangs ? (sharedLanguages.length > 0 ? 95 : 65) : 75;

  // 5. Education & Religion & Goals
  const hasEdu = Boolean(userA.education && userB.education);
  const educationScore = hasEdu ? (userA.education === userB.education ? 95 : 75) : 70;
  const educationInsight = userB.education || 'Not specified';

  const hasRel = Boolean(userA.religion && userB.religion);
  const religionScore = hasRel ? (userA.religion === userB.religion ? 95 : 70) : 70;
  const religionInsight = userB.religion 
    ? (hasRel && userA.religion === userB.religion ? 'Shared spiritual views' : userB.religion) 
    : 'Not specified';

  const hasGoals = Boolean(userA.relationshipGoal && userB.relationshipGoal);
  const goalsScore = hasGoals ? (userA.relationshipGoal === userB.relationshipGoal ? 98 : 78) : 75;
  const goalsInsight = userB.relationshipGoal || 'Not specified';

  const demographicsScore = Math.round(
    (ageScore * 0.25) + (distanceScore * 0.25) + (languageScore * 0.2) + (educationScore * 0.15) + (goalsScore * 0.15)
  );

  const scorePercent = Math.min(99, Math.max(60, Math.round(
    (hobbyScorePercent * 0.4) + (demographicsScore * 0.6)
  )));

  return {
    scorePercent,
    hobbiesScore: hobbyScorePercent,
    demographicsScore,
    lifestyleScore: 85,
    sharedHobbies,
    demographics: {
      ageScore,
      ageInsight,
      distanceScore,
      distanceInsight,
      languageScore,
      sharedLanguages,
      religionScore,
      religionInsight,
      educationScore,
      educationInsight,
      goalsScore,
      goalsInsight,
      accessibilityScore: 92,
      accessibilityInsight: 'Community & accessibility alignment',
      overallDemographicPercent: demographicsScore,
    },
    hobbiesBreakdown: {
      sharedHobbies,
      totalShared,
      hobbyScorePercent,
      complementaryHobbies: userBHobbies.filter(h => !hobbiesA.has(h.toLowerCase())),
      highlight: totalShared > 0 ? `${totalShared} mutual passions` : 'Diverse personal interests',
    },
    valuesOverlap: ['Accessibility Awareness', 'Clear Communication', 'Authenticity'],
    complimentaryTraits: ['Thoughtful', 'Respectful'],
    summary: `${scorePercent}% compatibility score with ${totalShared > 0 ? `${totalShared} shared passions` : 'mutual discovery potential'}.`,
  };
}
