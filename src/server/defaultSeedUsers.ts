import { UserProfile } from '../types/dating.js';

export const SEED_HUBB_USERS: (Partial<UserProfile> & { id: string; name: string; username: string; email: string })[] = [
  {
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
  }
];
