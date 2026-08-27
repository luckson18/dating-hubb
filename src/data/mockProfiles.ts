import { 
  UserProfile, 
  StatusUpdate, 
  Conversation, 
  MatchFilter, 
  PartnerNotification,
  CompatibilityInsight,
  DemographicCompatibility,
  HobbyCompatibility
} from '../types/dating';

export const CURRENT_USER: UserProfile = {
  id: 'user-me',
  name: 'Alex Rivera',
  username: 'alex_rivera',
  email: 'alex.rivera@hubb.app',
  age: 28,
  gender: 'Non-binary',
  pronouns: 'they/them',
  distanceKm: 0,
  locationCity: 'San Francisco, CA',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  verified: true,
  photos: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  ],
  videoBio: {
    url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-a-laptop-42999-large.mp4',
    durationSec: 18,
    transcript: "Hey there! I'm Alex. Accessibility researcher by day, amateur pastry baker and indie board gamer by night. Looking for genuine connection with someone who appreciates deep talks, museum visits, and quiet tea sessions.",
    hasAudio: true,
    subtitles: [
      { start: 0, end: 3.5, text: "Hey there! I'm Alex. Accessibility researcher by day..." },
      { start: 3.6, end: 9.0, text: "Amateur pastry baker and indie board gamer by night." },
      { start: 9.1, end: 17.5, text: "Looking for genuine connection, museum visits, and quiet tea sessions!" }
    ]
  },
  bio: 'Advocate for universal design and digital accessibility. Love synthwave, vintage espresso machines, ceramic crafting, and coastal trail walks. ASL learner.',
  heightCm: 173,
  heightFeet: `5'8"`,
  weightKg: 65,
  complexion: 'Warm Beige',
  raceEthnicity: 'Hispanic / Latino',
  religion: 'Spiritual / Eclectic',
  education: "Master's / Graduate",
  jobTitle: 'Senior Accessibility Specialist',
  companyOrField: 'Digital Inclusivity Lab',
  nationality: 'Mexican-American',
  languages: ['English', 'Spanish', 'ASL (Intermediate)'],
  hobbies: ['Baking', 'Pottery', 'Museum Crawls', 'Synth Music', 'Board Games', 'Hiking'],
  lifestyle: {
    diet: 'Vegetarian',
    smoking: 'Non-smoker',
    drinking: 'Socially',
    pets: ['Golden Retriever (Toby)'],
    astrologySign: 'Libra'
  },
  relationshipGoal: 'Meaningful dating',
  accessibilityBadges: ['Screen Reader Advocate', 'ASL Signer', 'Neurodivergent Ally', 'Audio Description Supporter'],
  isBiometricLocked: true,
  isPrivateProfile: false,
  lastActive: 'Active now'
};

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Maya Chen',
    username: 'maya_chen',
    email: 'maya.chen@hubb.app',
    age: 27,
    gender: 'Woman',
    pronouns: 'she/her',
    distanceKm: 3.2,
    locationCity: 'Downtown, 3 km away',
    coordinates: { lat: 37.7915, lng: -122.4035 },
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80'
    ],
    videoBio: {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-a-laptop-42999-large.mp4',
      durationSec: 15,
      transcript: "Hi! I'm Maya. I compose soundtracks for indie games and spend my weekends scouting the best matcha lattes in the city. If you love live jazz, hiking redwoods, or learning new languages, let's connect!",
      hasAudio: true,
      subtitles: [
        { start: 0, end: 4, text: "Hi! I'm Maya. I compose soundtracks for indie video games..." },
        { start: 4.1, end: 9, text: "Weekend matcha scout, jazz enthusiast, and plant parent." },
        { start: 9.1, end: 14.8, text: "Let's grab a warm tea and talk about your favorite albums!" }
      ]
    },
    bio: 'Music composer & sound designer. Hard of hearing (proud cochlear implant user) & fluent in sign language. Lover of rainy day books, acoustic guitar, and architectural photography.',
    heightCm: 165,
    heightFeet: `5'5"`,
    weightKg: 56,
    complexion: 'Fair / Porcelain',
    raceEthnicity: 'Asian / East & SE Asian',
    religion: 'Agnostic',
    education: "Bachelor's Degree",
    jobTitle: 'Game Audio Composer',
    companyOrField: 'Interactive Media Studio',
    nationality: 'Taiwanese-American',
    languages: ['English', 'Mandarin', 'ASL'],
    hobbies: ['Sound Design', 'Matcha Tastings', 'Jazz Jamming', 'Photography', 'Baking', 'Hiking'],
    lifestyle: {
      diet: 'Pescatarian',
      smoking: 'Never',
      drinking: 'Rarely',
      pets: ['Tabby Cat (Mochi)'],
      astrologySign: 'Taurus'
    },
    relationshipGoal: 'Long-term partnership',
    accessibilityBadges: ['Deaf / Hard of Hearing', 'ASL Fluent', 'Subtitles Enthusiast'],
    isBiometricLocked: false,
    lastActive: '12m ago'
  },
  {
    id: 'user-2',
    name: 'Marcus Adebayo',
    username: 'marcus_adebayo',
    email: 'marcus.adebayo@hubb.app',
    age: 31,
    gender: 'Man',
    pronouns: 'he/him',
    distanceKm: 5.8,
    locationCity: 'Mission District, 6 km away',
    coordinates: { lat: 37.7596, lng: -122.4269 },
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
    ],
    videoBio: {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-talking-to-the-camera-in-a-park-41551-large.mp4',
      durationSec: 20,
      transcript: "What's good everyone! Marcus here. High school history teacher and community garden organizer. Passionate about afro-fusion cooking, marathon training, and accessible urban parks. Looking for someone grounded and ambitious.",
      hasAudio: true,
      subtitles: [
        { start: 0, end: 5.0, text: "What's good! Marcus here, high school history educator." },
        { start: 5.1, end: 11.5, text: "Passionate about community gardens, marathon running, and cooking." },
        { start: 11.6, end: 19.5, text: "Excited to meet someone curious, warm, and ready for real connection." }
      ]
    },
    bio: 'Educator, avid marathon runner, and urban gardener. Believer in restorative justice and intentional communication. You will probably find me at the farmers market on Saturday mornings testing hot sauces.',
    heightCm: 188,
    heightFeet: `6'2"`,
    weightKg: 84,
    complexion: 'Deep Brown',
    raceEthnicity: 'African / Black',
    religion: 'Christian',
    education: "Master's / Graduate",
    jobTitle: 'History Department Head',
    companyOrField: 'Unified School District',
    nationality: 'Nigerian-American',
    languages: ['English', 'Yoruba', 'French'],
    hobbies: ['Running', 'Urban Gardening', 'Culinary Arts', 'Historical Non-fiction', 'Vinyl Records'],
    lifestyle: {
      diet: 'Omnivore',
      smoking: 'Never',
      drinking: 'Socially',
      pets: ['Rescue Hound (Miles)'],
      astrologySign: 'Leo'
    },
    relationshipGoal: 'Marriage / Family',
    accessibilityBadges: ['Audio Description Ally', 'Guide Dog Friendly'],
    isBiometricLocked: false,
    lastActive: '1h ago'
  },
  {
    id: 'user-3',
    name: 'Elena Rostova',
    age: 29,
    gender: 'Woman',
    pronouns: 'she/her',
    distanceKm: 8.4,
    locationCity: 'Marina District, 8 km away',
    coordinates: { lat: 37.8015, lng: -122.4385 },
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
    ],
    videoBio: {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-a-laptop-42999-large.mp4',
      durationSec: 16,
      transcript: "Hello! Elena here. Adaptive sports coach and landscape architect. I spend my days designing barrier-free public parks and my evenings rock climbing or watercolor painting.",
      hasAudio: true,
      subtitles: [
        { start: 0, end: 4.5, text: "Hello! Elena here, landscape architect and adaptive sports coach." },
        { start: 4.6, end: 10.0, text: "Designing barrier-free parks and climbing walls for all bodies." },
        { start: 10.1, end: 15.5, text: "Looking for open minds, coffee enthusiasts, and nature explorers!" }
      ]
    },
    bio: 'Landscape architect championing universal accessible public spaces. Wheelchair athlete & paraclimber. Enthusiast of Scandinavian design, loose-leaf teas, and botanical gardens.',
    heightCm: 168,
    heightFeet: `5'6"`,
    weightKg: 60,
    complexion: 'Olive / Honey',
    raceEthnicity: 'White / Caucasian',
    religion: 'Agnostic',
    education: "Master's / Graduate",
    jobTitle: 'Principal Landscape Architect',
    companyOrField: 'EcoUrban Architecture',
    nationality: 'Ukrainian-American',
    languages: ['English', 'Ukrainian', 'Italian'],
    hobbies: ['Paraclimbing', 'Watercolor Painting', 'Botanical Gardens', 'Architecture', 'Tea Brewing'],
    lifestyle: {
      diet: 'Plant-forward',
      smoking: 'Never',
      drinking: 'Socially',
      pets: ['None currently'],
      astrologySign: 'Aquarius'
    },
    relationshipGoal: 'Meaningful dating',
    accessibilityBadges: ['Wheelchair User', 'Adaptive Sports Coach', 'Universal Design Pro'],
    isBiometricLocked: false,
    lastActive: '30m ago'
  },
  {
    id: 'user-4',
    name: 'Devin Thorne',
    age: 32,
    gender: 'Non-binary',
    pronouns: 'they/them',
    distanceKm: 12.0,
    locationCity: 'Oakland Hills, 12 km away',
    coordinates: { lat: 37.8044, lng: -122.2712 },
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
    ],
    videoBio: {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-talking-to-the-camera-in-a-park-41551-large.mp4',
      durationSec: 17,
      transcript: "Hey! I'm Devin. Astronomy professor, low-vision astronomer, and analog synthesizer builder. If you want to stargaze through audio-sonified telescope feeds or talk sci-fi, swipe right!",
      hasAudio: true,
      subtitles: [
        { start: 0, end: 4.8, text: "Hey! I'm Devin, astrophysics lecturer and sound artist." },
        { start: 4.9, end: 11.0, text: "Low-vision astronomer mapping constellations through audio sonification." },
        { start: 11.1, end: 16.8, text: "Let's stargaze and listen to the cosmos together!" }
      ]
    },
    bio: 'Astrophysicist researching data sonification for blind & low-vision astronomers. Lover of modular synths, sci-fi literature, and making homemade sourdough focaccia.',
    heightCm: 180,
    heightFeet: `5'11"`,
    weightKg: 74,
    complexion: 'Caramel / Tan',
    raceEthnicity: 'Multiracial / Mixed',
    religion: 'Atheist',
    education: 'Doctorate / PhD / MD / JD',
    jobTitle: 'Assistant Professor of Astronomy',
    companyOrField: 'University Science Department',
    nationality: 'American',
    languages: ['English', 'German', 'Braille (Literary & Nemeth)'],
    hobbies: ['Stargazing', 'Modular Synthesizers', 'Sourdough Baking', 'Sci-Fi Reading', 'Kayaking'],
    lifestyle: {
      diet: 'Vegetarian',
      smoking: 'Never',
      drinking: 'Rarely',
      pets: ['Black Cat (Cosmo)'],
      astrologySign: 'Sagittarius'
    },
    relationshipGoal: 'Long-term partnership',
    accessibilityBadges: ['Blind / Low Vision User', 'Screen Reader Pro', 'Braille Reader'],
    isBiometricLocked: false,
    lastActive: 'Just now'
  },
  {
    id: 'user-5',
    name: 'Priya Patel',
    age: 26,
    gender: 'Woman',
    pronouns: 'she/her',
    distanceKm: 4.5,
    locationCity: 'South of Market, 4.5 km away',
    coordinates: { lat: 37.7785, lng: -122.3950 },
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
    ],
    videoBio: {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-a-laptop-42999-large.mp4',
      durationSec: 14,
      transcript: "Hi! I'm Priya. Neurodivergent software engineer, pottery fanatic, and chronic podcast listener. Looking for meaningful connection with kind people who value clear communication.",
      hasAudio: true,
      subtitles: [
        { start: 0, end: 4.0, text: "Hi! I'm Priya, neurodivergent engineer and pottery enthusiast." },
        { start: 4.1, end: 9.0, text: "Big fan of honest direct communication and slow weekend mornings." },
        { start: 9.1, end: 13.8, text: "Tell me about your current special interest!" }
      ]
    },
    bio: 'Software engineer building assistive technologies. ADHD & proud. Love tactile pottery on the wheel, bouldering, sensory-friendly coffee spots, and cozy board game nights.',
    heightCm: 162,
    heightFeet: `5'4"`,
    weightKg: 53,
    complexion: 'Caramel / Tan',
    raceEthnicity: 'Asian / South Asian',
    religion: 'Hindu',
    education: "Master's / Graduate",
    jobTitle: 'Assistive Tech Engineer',
    companyOrField: 'HealthTech Collective',
    nationality: 'Indian-American',
    languages: ['English', 'Gujarati', 'Hindi'],
    hobbies: ['Pottery', 'Board Games', 'Bouldering', 'Baking', 'Podcasts', 'Hiking'],
    lifestyle: {
      diet: 'Vegetarian',
      smoking: 'Never',
      drinking: 'Socially',
      pets: ['None (Allergies)'],
      astrologySign: 'Virgo'
    },
    relationshipGoal: 'Meaningful dating',
    accessibilityBadges: ['Neurodivergent (ADHD)', 'Sensory-Friendly Ally'],
    isBiometricLocked: false,
    lastActive: '5m ago'
  },
  {
    id: 'user-6',
    name: 'Zainab Al-Mansoor',
    age: 30,
    gender: 'Woman',
    pronouns: 'she/her',
    distanceKm: 9.1,
    locationCity: 'Berkeley, 9 km away',
    coordinates: { lat: 37.8715, lng: -122.2730 },
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80'
    ],
    videoBio: {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-a-laptop-42999-large.mp4',
      durationSec: 18,
      transcript: "As-salamu alaykum! I'm Zainab. Human rights attorney and documentary photographer. Passionate about ethical storytelling, poetry slams, and Middle Eastern culinary traditions.",
      hasAudio: true,
      subtitles: [
        { start: 0, end: 5.0, text: "As-salamu alaykum! I'm Zainab, human rights attorney." },
        { start: 5.1, end: 11.0, text: "Documentary photographer, poetry lover, and spice enthusiast." },
        { start: 11.1, end: 17.5, text: "Looking for thoughtful conversations and shared life values." }
      ]
    },
    bio: 'Civil rights lawyer working for immigrant and disability rights. Passionate about Arabic calligraphy, film photography, and hosting vibrant family dinners.',
    heightCm: 170,
    heightFeet: `5'7"`,
    weightKg: 62,
    complexion: 'Olive / Honey',
    raceEthnicity: 'Middle Eastern / Arab',
    religion: 'Muslim',
    education: 'Doctorate / PhD / MD / JD',
    jobTitle: 'Civil Rights Attorney',
    companyOrField: 'Justice & Equality Center',
    nationality: 'Syrian-American',
    languages: ['English', 'Arabic', 'French'],
    hobbies: ['Photography', 'Poetry', 'Calligraphy', 'Culinary Arts', 'Volunteering'],
    lifestyle: {
      diet: 'Halal',
      smoking: 'Never',
      drinking: 'Never',
      pets: ['Persian Cat (Zaytoun)'],
      astrologySign: 'Cancer'
    },
    relationshipGoal: 'Marriage / Family',
    accessibilityBadges: ['Disability Rights Advocate', 'Multi-Language Access'],
    isBiometricLocked: false,
    lastActive: '2h ago'
  },
  {
    id: 'user-7',
    name: 'Kofi Mensah',
    age: 30,
    gender: 'Man',
    pronouns: 'he/him',
    distanceKm: 4.1,
    locationCity: 'Oakland, 4 km away',
    coordinates: { lat: 37.8080, lng: -122.2690 },
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'
    ],
    videoBio: {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-talking-to-the-camera-in-a-park-41551-large.mp4',
      durationSec: 19,
      transcript: "Hello! Kofi here. Cloud architect, audio description volunteer, and jazz saxophonist. Looking for someone with warmth, intellectual curiosity, and a love for good live music.",
      hasAudio: true,
      subtitles: [
        { start: 0, end: 5.2, text: "Hello! Kofi here, cloud software architect and volunteer." },
        { start: 5.3, end: 11.8, text: "Passionate about accessible tech, jazz saxophone, and home cooking." },
        { start: 11.9, end: 18.5, text: "Let's explore indie record stores and coffee shops together!" }
      ]
    },
    bio: 'Distributed systems architect & open-source braille software contributor. Tall, dark complexion, loves weekend trail cycling, West African jazz, and tactile woodworking.',
    heightCm: 186,
    heightFeet: `6'1"`,
    weightKg: 82,
    complexion: 'Rich Ebony',
    raceEthnicity: 'African / Black',
    religion: 'Christian',
    education: "Master's / Graduate",
    jobTitle: 'Principal Cloud Architect',
    companyOrField: 'Open Infrastructure Institute',
    nationality: 'Ghanaian-American',
    languages: ['English', 'Twi', 'French'],
    hobbies: ['Jazz Jamming', 'Sound Design', 'Cycling', 'Woodworking', 'Volunteering'],
    lifestyle: {
      diet: 'Omnivore',
      smoking: 'Never',
      drinking: 'Socially',
      pets: ['Labrador Retriever (Duke)'],
      astrologySign: 'Capricorn'
    },
    relationshipGoal: 'Long-term partnership',
    accessibilityBadges: ['Braille Contributor', 'Audio Description Ally', 'Inclusive Design Lead'],
    isBiometricLocked: false,
    lastActive: '15m ago'
  },
  {
    id: 'user-8',
    name: 'Jordan Taylor',
    age: 28,
    gender: 'Non-binary',
    pronouns: 'they/them',
    distanceKm: 6.7,
    locationCity: 'Presidio, 7 km away',
    coordinates: { lat: 37.7985, lng: -122.4660 },
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
    ],
    videoBio: {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-a-laptop-42999-large.mp4',
      durationSec: 16,
      transcript: "Hey everyone! I'm Jordan. Adaptive athlete, ceramicist, and botanical illustrator. Proud warm bronze complexion and warm smile. Looking for kindness and artistic spirit!",
      hasAudio: true,
      subtitles: [
        { start: 0, end: 4.8, text: "Hey! I'm Jordan, ceramic sculptor and wheelchair tennis player." },
        { start: 4.9, end: 10.5, text: "Botanical illustrator, sourdough fan, and lover of ocean breeze." },
        { start: 10.6, end: 15.8, text: "Excited to meet genuine people who celebrate inclusivity!" }
      ]
    },
    bio: 'Wheelchair tennis player and ceramic sculptor. Warm bronze skin tone, creative spirit, passionate about museum accessibility, analog film photography, and sensory gardening.',
    heightCm: 174,
    heightFeet: `5'8"`,
    weightKg: 64,
    complexion: 'Warm Bronze',
    raceEthnicity: 'Multiracial / Mixed',
    religion: 'Spiritual / Eclectic',
    education: "Bachelor's Degree",
    jobTitle: 'Ceramics Instructor & Artist',
    companyOrField: 'Community Arts Center',
    nationality: 'American',
    languages: ['English', 'Spanish', 'ASL (Basic)'],
    hobbies: ['Pottery', 'Photography', 'Botanical Gardens', 'Baking', 'Board Games'],
    lifestyle: {
      diet: 'Vegetarian',
      smoking: 'Never',
      drinking: 'Rarely',
      pets: ['Two Parakeets'],
      astrologySign: 'Gemini'
    },
    relationshipGoal: 'Meaningful dating',
    accessibilityBadges: ['Wheelchair Athlete', 'Sensory-Friendly Ally', 'ASL Learner'],
    isBiometricLocked: false,
    lastActive: '45m ago'
  },
  {
    id: 'user-9',
    name: 'Gabriel Morales',
    age: 33,
    gender: 'Man',
    pronouns: 'he/him',
    distanceKm: 7.3,
    locationCity: 'Mission, 7 km away',
    coordinates: { lat: 37.7525, lng: -122.4180 },
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    ],
    videoBio: {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-talking-to-the-camera-in-a-park-41551-large.mp4',
      durationSec: 18,
      transcript: "Hola! Gabriel here. Bilingual speech-language pathologist and amateur salsa dancer. Tall, deep brown complexion, passionate about communication access for kids.",
      hasAudio: true,
      subtitles: [
        { start: 0, end: 5.0, text: "Hola! Gabriel here, speech-language pathologist." },
        { start: 5.1, end: 11.2, text: "Helping non-verbal children find their voice through AAC devices." },
        { start: 11.3, end: 17.8, text: "Looking for warmth, shared laughter, and good salsa music!" }
      ]
    },
    bio: 'Speech-Language Pathologist working with AAC (Augmentative and Alternative Communication) devices. Tall, deep brown complexion. Love salsa dancing, cooking traditional paella, and beach walks.',
    heightCm: 184,
    heightFeet: `6'0"`,
    weightKg: 80,
    complexion: 'Deep Brown',
    raceEthnicity: 'Hispanic / Latino',
    religion: 'Catholic',
    education: "Master's / Graduate",
    jobTitle: 'Pediatric Speech Pathologist',
    companyOrField: 'Children’s Communication Clinic',
    nationality: 'Colombian-American',
    languages: ['English', 'Spanish', 'Portuguese'],
    hobbies: ['Culinary Arts', 'Salsa Dancing', 'Volunteering', 'Hiking', 'Podcasts'],
    lifestyle: {
      diet: 'Omnivore',
      smoking: 'Never',
      drinking: 'Socially',
      pets: ['Beagle (Luna)'],
      astrologySign: 'Aries'
    },
    relationshipGoal: 'Marriage / Family',
    accessibilityBadges: ['AAC Specialist', 'Speech & Language Advocate', 'Bilingual Access'],
    isBiometricLocked: false,
    lastActive: '10m ago'
  }
];

export const INITIAL_STATUS_UPDATES: StatusUpdate[] = [
  {
    id: 'status-my-1',
    userId: 'user-me',
    userName: 'Alex Rivera',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    content: 'Fresh sourdough brioche just out of the oven! 🥐 Planning an accessible afternoon picnic at Dolores Park if anyone wants to join and share baked goodies.',
    moodEmoji: '🥐',
    location: 'Mission District, SF',
    createdAt: '15m ago',
    expiresInHours: 24,
    audience: 'matches',
    likesCount: 9,
    hasLiked: false,
    interestedCount: 3,
    hasExpressedInterest: false,
    interestedPartners: [
      {
        userId: 'user-1',
        userName: 'Maya Chen',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        userAge: 27,
        userPronouns: 'she/her',
        compatibilityScore: 94,
        verified: true,
        expressedAt: '10m ago',
        note: 'I would love to try your brioche and bring some matcha iced tea! 🍵'
      },
      {
        userId: 'user-2',
        userName: 'Marcus Adebayo',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
        userAge: 29,
        userPronouns: 'he/him',
        compatibilityScore: 88,
        verified: true,
        expressedAt: '8m ago',
        note: 'Count me in! I can bring fresh heirloom tomatoes and basil from the community garden.'
      },
      {
        userId: 'user-3',
        userName: 'Elena Rostova',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        userAge: 26,
        userPronouns: 'she/her',
        compatibilityScore: 91,
        verified: true,
        expressedAt: '3m ago'
      }
    ]
  },
  {
    id: 'status-1',
    userId: 'user-1',
    userName: 'Maya Chen',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    content: 'Just wrapped the main theme for our new indie game! Celebrating with iced oat matcha at Blue Bottle 🍵 Anyone nearby want to join?',
    moodEmoji: '🎵',
    location: 'SOMA, San Francisco',
    createdAt: '35m ago',
    expiresInHours: 23,
    audience: 'matches',
    likesCount: 5,
    hasLiked: true,
    interestedCount: 2,
    hasExpressedInterest: false,
    interestedPartners: [
      {
        userId: 'user-2',
        userName: 'Marcus Adebayo',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
        userAge: 29,
        userPronouns: 'he/him',
        compatibilityScore: 82,
        verified: true,
        expressedAt: '25m ago'
      },
      {
        userId: 'user-4',
        userName: 'Devin Thorne',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        userAge: 31,
        userPronouns: 'they/he',
        compatibilityScore: 89,
        verified: true,
        expressedAt: '12m ago',
        note: 'Would love to discuss audio synth design over matcha!'
      }
    ]
  },
  {
    id: 'status-2',
    userId: 'user-3',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    content: 'Training session at the adaptive climbing gym finished! Weather is perfect for the accessible sculpture park today 🧗‍♀️✨',
    moodEmoji: '🧗‍♀️',
    location: 'Mission Rock Park',
    createdAt: '2h ago',
    expiresInHours: 22,
    audience: 'public',
    likesCount: 12,
    hasLiked: false,
    interestedCount: 4,
    hasExpressedInterest: false,
    interestedPartners: [
      {
        userId: 'user-5',
        userName: 'Zara Al-Mansoor',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        userAge: 28,
        userPronouns: 'she/they',
        compatibilityScore: 92,
        verified: true,
        expressedAt: '1h ago'
      }
    ]
  },
  {
    id: 'status-3',
    userId: 'user-2',
    userName: 'Marcus Adebayo',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    content: 'Saturday harvest from the community garden! Giving away fresh organic heirloom tomatoes and basil 🍅🌿',
    moodEmoji: '🌿',
    location: 'Community Garden 24th St',
    createdAt: '3h ago',
    expiresInHours: 21,
    audience: 'close-friends',
    targetGroupNames: ['Close Friends', 'Foodies & Gardeners'],
    likesCount: 8,
    hasLiked: false,
    interestedCount: 3,
    hasExpressedInterest: false,
    interestedPartners: [
      {
        userId: 'user-1',
        userName: 'Maya Chen',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        userAge: 27,
        userPronouns: 'she/her',
        compatibilityScore: 85,
        verified: true,
        expressedAt: '2h ago'
      }
    ]
  },
  {
    id: 'status-4',
    userId: 'user-4',
    userName: 'Devin Thorne',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    content: 'Setting up audio sonification for the Perseid meteor stream tonight! Transmitting live cosmic frequencies 🌌✨',
    moodEmoji: '🔭',
    location: 'Lawrence Hall Observatory',
    createdAt: '4h ago',
    expiresInHours: 20,
    audience: 'custom-group',
    targetGroupNames: ['Astronomy & Tech Circle'],
    likesCount: 14,
    hasLiked: true,
    interestedCount: 6,
    hasExpressedInterest: false,
    interestedPartners: [
      {
        userId: 'user-7',
        userName: 'Kofi Mensah',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        userAge: 30,
        userPronouns: 'he/him',
        compatibilityScore: 95,
        verified: true,
        expressedAt: '3h ago'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: PartnerNotification[] = [
  {
    id: 'notif-1',
    type: 'interest',
    senderId: 'user-1',
    senderName: 'Maya Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    userAge: 27,
    statusId: 'status-my-1',
    statusContent: 'Fresh sourdough brioche just out of the oven! 🥐 Planning an accessible afternoon picnic...',
    timestamp: '10m ago',
    read: false,
    note: 'I would love to try your brioche and bring some matcha iced tea! 🍵',
    compatibilityScore: 94
  },
  {
    id: 'notif-2',
    type: 'interest',
    senderId: 'user-2',
    senderName: 'Marcus Adebayo',
    senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    userAge: 29,
    statusId: 'status-my-1',
    statusContent: 'Fresh sourdough brioche just out of the oven! 🥐 Planning an accessible afternoon picnic...',
    timestamp: '8m ago',
    read: false,
    note: 'Count me in! I can bring fresh heirloom tomatoes and basil from the community garden.',
    compatibilityScore: 88
  },
  {
    id: 'notif-3',
    type: 'interest',
    senderId: 'user-3',
    senderName: 'Elena Rostova',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    userAge: 26,
    statusId: 'status-my-1',
    statusContent: 'Fresh sourdough brioche just out of the oven! 🥐 Planning an accessible afternoon picnic...',
    timestamp: '3m ago',
    read: false,
    compatibilityScore: 91
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participant: MOCK_PROFILES[0], // Maya
    unreadCount: 1,
    lastMessageTime: '10:42 AM',
    encryptionKeyFingerprint: 'E2EE-89A4-F5C1-229B-AE4D',
    ephemeralMode: true,
    ephemeralDurationSec: 86400, // 24h
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-1',
        receiverId: 'user-me',
        text: 'Hi Alex! I saw your video bio mentioning universal accessibility design. I compose game audio and we really need more accessible audio cues in VR!',
        timestamp: '10:30 AM',
        encrypted: true,
        cipherPreview: 'aes-gcm:8ef9302b1f84b4...',
        read: true,
        status: 'read',
        deliveredAt: '10:30 AM',
        readAt: '10:32 AM'
      },
      {
        id: 'msg-2',
        senderId: 'user-me',
        receiverId: 'user-1',
        text: "Hey Maya! That is awesome! Spatial audio cues for screen readers and haptic synchronizations are so important. I'd love to share some guidelines!",
        timestamp: '10:38 AM',
        encrypted: true,
        cipherPreview: 'aes-gcm:1c448a07f31189...',
        read: true,
        status: 'read',
        deliveredAt: '10:38 AM',
        readAt: '10:40 AM'
      },
      {
        id: 'msg-3',
        senderId: 'user-1',
        receiverId: 'user-me',
        text: "That would be wonderful! I'm around SOMA this afternoon grabbing matcha if you'd like to chat in person? 🍵",
        timestamp: '10:42 AM',
        encrypted: true,
        cipherPreview: 'aes-gcm:90ab48df08c5ea...',
        read: true,
        status: 'read',
        deliveredAt: '10:42 AM',
        readAt: '10:43 AM'
      },
      {
        id: 'msg-4',
        senderId: 'user-1',
        receiverId: 'user-me',
        text: "Here is the cafe location! It has a spacious step-free patio and calm ambiance:",
        mediaType: 'location',
        location: {
          placeName: 'Blue Bottle Coffee & Rooftop Garden',
          address: '66 Mint St, San Francisco, CA 94103',
          lat: 37.7825,
          lng: -122.4045,
          category: 'cafe',
          isSafeMeetupSpot: true,
          notes: 'Great quiet corner on the patio with accessible ramp entrance.',
          rating: 4.8,
          googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Blue+Bottle+Coffee+66+Mint+St+San+Francisco'
        },
        timestamp: '10:45 AM',
        encrypted: true,
        cipherPreview: 'aes-gcm:33fa8190d71...',
        read: false,
        status: 'delivered',
        deliveredAt: '10:45 AM'
      }
    ]
  },
  {
    id: 'conv-2',
    participant: MOCK_PROFILES[2], // Elena
    unreadCount: 0,
    lastMessageTime: 'Yesterday',
    encryptionKeyFingerprint: 'E2EE-37D2-88B1-94E0-CC12',
    ephemeralMode: false,
    ephemeralDurationSec: 0,
    messages: [
      {
        id: 'msg-201',
        senderId: 'user-me',
        receiverId: 'user-3',
        text: 'Your video bio showcasing the accessible playground in Marina park was incredible!',
        timestamp: 'Yesterday 3:15 PM',
        encrypted: true,
        cipherPreview: 'aes-gcm:44f128bc9910ed...',
        read: true,
        status: 'read',
        deliveredAt: 'Yesterday 3:15 PM',
        readAt: 'Yesterday 3:30 PM'
      },
      {
        id: 'msg-202',
        senderId: 'user-3',
        receiverId: 'user-me',
        text: 'Thank you so much Alex! We made sure every path and tactile texture was seamless. Are you visiting the botanical garden this weekend?',
        timestamp: 'Yesterday 4:20 PM',
        encrypted: true,
        cipherPreview: 'aes-gcm:5b19ac8820f124...',
        read: true,
        status: 'read',
        deliveredAt: 'Yesterday 4:20 PM',
        readAt: 'Yesterday 4:25 PM'
      }
    ]
  },
  {
    id: 'conv-3',
    participant: MOCK_PROFILES[6], // Kofi Mensah
    unreadCount: 0,
    lastMessageTime: '11:15 AM',
    encryptionKeyFingerprint: 'E2EE-991D-44C2-77EA-BF10',
    ephemeralMode: true,
    ephemeralDurationSec: 86400,
    messages: [
      {
        id: 'msg-301',
        senderId: 'user-me',
        receiverId: 'user-7',
        text: "Hi Kofi! Loved your video bio and your work on braille tech and jazz saxophone.",
        timestamp: '11:05 AM',
        encrypted: true,
        cipherPreview: 'aes-gcm:77aa91ef382b01...',
        read: true,
        status: 'read',
        deliveredAt: '11:05 AM',
        readAt: '11:10 AM'
      },
      {
        id: 'msg-302',
        senderId: 'user-me',
        receiverId: 'user-7',
        text: "Are you planning to check out the West African jazz set at the SF Jazz Center next Thursday?",
        timestamp: '11:15 AM',
        encrypted: true,
        cipherPreview: 'aes-gcm:62dd41cc55ef90...',
        read: false,
        status: 'delivered',
        deliveredAt: '11:15 AM'
      }
    ]
  }
];

export const DEFAULT_FILTER: MatchFilter = {
  maxDistanceKm: 35,
  minAge: 21,
  maxAge: 45,
  minHeightCm: 145,
  maxHeightCm: 210,
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

export function calculateCompatibility(userA: UserProfile, userB: UserProfile): CompatibilityInsight {
  // 1. Shared Hobbies & Interests Score
  const sharedHobbies = userA.hobbies.filter(h => userB.hobbies.includes(h));
  const complementaryHobbies = userB.hobbies.filter(h => !userA.hobbies.includes(h));
  
  // Hobby percentage calculation (shared ratio + shared count bonus)
  let hobbyScore = 45; // baseline interest exploration
  hobbyScore += Math.min(50, sharedHobbies.length * 18);
  if (sharedHobbies.length >= 3) hobbyScore += 5;
  const hobbyScorePercent = Math.min(99, Math.max(45, hobbyScore));

  const hobbyHighlight = sharedHobbies.length > 0
    ? `${sharedHobbies.length} shared ${sharedHobbies.length === 1 ? 'passion' : 'passions'}: ${sharedHobbies.join(', ')}`
    : 'Exciting opportunity to introduce each other to new passions';

  // 2. Demographic & Background Preferences Breakdown
  // Age Synergy
  const ageDiff = Math.abs(userA.age - userB.age);
  let ageScore = 95;
  if (ageDiff > 2) ageScore -= Math.min(30, (ageDiff - 2) * 4);
  const ageInsight = ageDiff === 0 
    ? 'Same age & generational perspective'
    : ageDiff <= 3 
      ? `Close in age (${ageDiff} yr difference)` 
      : `${ageDiff} yr difference (balanced perspectives)`;

  // Distance & Proximity Synergy
  const dist = userB.distanceKm || 5;
  let distanceScore = 98;
  if (dist > 3) distanceScore -= Math.min(35, Math.floor((dist - 3) * 1.5));
  const distanceInsight = dist <= 5 
    ? `Very close (${dist} km away in ${userB.locationCity})`
    : dist <= 15
      ? `Local neighborhood (${dist} km away in ${userB.locationCity})`
      : `${dist} km away in ${userB.locationCity}`;

  // Shared Languages
  const sharedLanguages = userA.languages.filter(l => userB.languages.includes(l));
  const languageScore = sharedLanguages.length > 0 ? 95 : 75;

  // Religion & Beliefs
  const sameReligion = userA.religion === userB.religion;
  const religionScore = sameReligion ? 96 : 82;
  const religionInsight = sameReligion
    ? `Shared worldview (${userA.religion})`
    : `${userA.religion} & ${userB.religion} (mutual respect)`;

  // Education & Intellectual Synergy
  const sameEducation = userA.education === userB.education;
  const educationScore = sameEducation ? 92 : 85;
  const educationInsight = sameEducation
    ? `Similar educational path (${userA.education})`
    : `${userB.education} background`;

  // Relationship Goals
  const sameGoal = userA.relationshipGoal === userB.relationshipGoal;
  const goalsScore = sameGoal ? 98 : 78;
  const goalsInsight = sameGoal
    ? `Both looking for ${userA.relationshipGoal}`
    : `Seeking ${userB.relationshipGoal}`;

  // Accessibility & Inclusivity Alignment
  const sharedBadges = userA.accessibilityBadges.filter(b => userB.accessibilityBadges.includes(b));
  const accessibilityScore = sharedBadges.length > 0 ? 98 : 88;
  const accessibilityInsight = sharedBadges.length > 0
    ? `Shared community ties (${sharedBadges.join(', ')})`
    : 'Universal accessibility & verified ally';

  // Overall Demographic & Preference Score (weighted average)
  const demographicsScore = Math.round(
    ageScore * 0.2 +
    distanceScore * 0.2 +
    goalsScore * 0.25 +
    languageScore * 0.15 +
    religionScore * 0.1 +
    educationScore * 0.1
  );

  // Lifestyle Score
  const lifestyleScore = Math.round((goalsScore * 0.5) + (accessibilityScore * 0.5));

  // Overall Weighted Score Percent
  const overallScorePercent = Math.min(
    99,
    Math.max(
      52,
      Math.round(hobbyScorePercent * 0.45 + demographicsScore * 0.45 + accessibilityScore * 0.1)
    )
  );

  const demographics: DemographicCompatibility = {
    ageScore: Math.min(99, Math.max(50, ageScore)),
    ageInsight,
    distanceScore: Math.min(99, Math.max(50, distanceScore)),
    distanceInsight,
    languageScore: Math.min(99, Math.max(50, languageScore)),
    sharedLanguages,
    religionScore: Math.min(99, Math.max(50, religionScore)),
    religionInsight,
    educationScore: Math.min(99, Math.max(50, educationScore)),
    educationInsight,
    goalsScore: Math.min(99, Math.max(50, goalsScore)),
    goalsInsight,
    accessibilityScore: Math.min(99, Math.max(50, accessibilityScore)),
    accessibilityInsight,
    overallDemographicPercent: demographicsScore
  };

  const hobbiesBreakdown: HobbyCompatibility = {
    sharedHobbies,
    totalShared: sharedHobbies.length,
    hobbyScorePercent,
    complementaryHobbies,
    highlight: hobbyHighlight
  };

  return {
    scorePercent: overallScorePercent,
    hobbiesScore: hobbyScorePercent,
    demographicsScore,
    lifestyleScore,
    sharedHobbies,
    demographics,
    hobbiesBreakdown,
    valuesOverlap: [
      sameGoal ? `Both seeking ${userA.relationshipGoal}` : 'Clear relationship intentions',
      sharedLanguages.length > 0 ? `Shared language fluency in ${sharedLanguages.join(' & ')}` : 'Strong communication synergy',
      accessibilityInsight
    ],
    complimentaryTraits: [
      `${userB.jobTitle} + ${userA.jobTitle}`,
      `${userB.education} background`
    ],
    summary: `${overallScorePercent}% Compatibility: ${hobbyScorePercent}% Hobby Synergy (${sharedHobbies.length} shared) & ${demographicsScore}% Demographic/Values Harmony.`
  };
}

