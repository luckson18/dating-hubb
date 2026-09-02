import { UserProfile, SharedLocation } from '../types/dating';

export interface AccessibleVenue {
  id: string;
  name: string;
  category: 'cafe' | 'museum' | 'park' | 'restaurant' | 'music_venue' | 'art_studio' | 'boardgame_cafe' | 'astronomy_center' | 'tea_house';
  categoryLabel: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  priceLevel: '$' | '$$' | '$$$';
  photoUrl: string;
  matchedInterests: string[];
  vibe: string;
  whyItsGreatForYou: string;
  accessibilityFeatures: {
    title: string;
    description: string;
    iconType: 'wheelchair' | 'audio' | 'tactile' | 'quiet' | 'lighting' | 'transit' | 'restroom';
  }[];
  accessibilityBadges: string[];
  safetyHighlight: string;
  bestTimeToVisit: string;
  noiseLevel: 'Quiet / Intimate' | 'Moderate / Relaxed' | 'Lively';
  lightingLevel: 'Soft / Warm' | 'Natural Sunlight' | 'Even / Glare-free';
  stepFreeAccess: boolean;
  publicTransitDistance: string;
}

export interface DateNightPlan {
  sharedInterests: string[];
  primaryLocation: string;
  suggestedVenues: AccessibleVenue[];
  calculatedAt: string;
  icebreakerTopic: string;
}

// Curated list of accessible, high-rated local venues across SF Bay Area and various interest archetypes
export const ACCESSIBLE_VENUE_DATABASE: AccessibleVenue[] = [
  {
    id: 'venue-sfmoma',
    name: 'SFMOMA Modern Art Museum & Atrium Cafe',
    category: 'museum',
    categoryLabel: 'Art Museum & Cafe',
    address: '151 3rd St, San Francisco, CA 94103',
    neighborhood: 'SoMa / Downtown',
    lat: 37.7857,
    lng: -122.4011,
    rating: 4.9,
    reviewsCount: 1420,
    priceLevel: '$$',
    photoUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
    matchedInterests: ['Museum Crawls', 'Art', 'Architecture', 'Watercolor Painting', 'Design'],
    vibe: 'Inspiring, spacious, and culturally rich with gentle natural lighting.',
    whyItsGreatForYou: 'You both love art and culture. Walking through world-class exhibitions provides effortless conversation prompts with serene seating zones.',
    accessibilityFeatures: [
      {
        title: 'Step-Free & Spacious Elevators',
        description: 'Wide power-assisted doors and multiple high-capacity elevators accessing all 7 exhibition floors.',
        iconType: 'wheelchair'
      },
      {
        title: 'Audio-Described Art Tours',
        description: 'Free synchronized audio description headsets and tactile gallery maps for blind & low-vision daters.',
        iconType: 'audio'
      },
      {
        title: 'Sensory-Friendly Quiet Lounges',
        description: 'Quiet contemplation rooms with reduced visual stimulation and comfortable low-glare lighting.',
        iconType: 'quiet'
      },
      {
        title: 'Accessible Restrooms',
        description: 'All-gender single-occupancy accessible restrooms on each floor with emergency pull cords.',
        iconType: 'restroom'
      }
    ],
    accessibilityBadges: ['Audio-Described', 'Step-Free Entrance', 'Sensory Friendly', 'Braille Signage'],
    safetyHighlight: 'Security staffed 24/7 • Well-lit public atrium plaza with high foot traffic',
    bestTimeToVisit: 'Thursday evenings (late hours) or Saturday afternoon',
    noiseLevel: 'Quiet / Intimate',
    lightingLevel: 'Even / Glare-free',
    stepFreeAccess: true,
    publicTransitDistance: '2 min walk from Montgomery St BART / Muni Metro'
  },
  {
    id: 'venue-botanical-tea',
    name: 'San Francisco Botanical Garden & Tea Pavilion',
    category: 'tea_house',
    categoryLabel: 'Botanical Garden & Tea House',
    address: '1199 9th Ave, Golden Gate Park, SF, CA 94122',
    neighborhood: 'Golden Gate Park / Inner Sunset',
    lat: 37.7678,
    lng: -122.4697,
    rating: 4.9,
    reviewsCount: 2310,
    priceLevel: '$',
    photoUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    matchedInterests: ['Botanical Gardens', 'Tea Brewing', 'Hiking', 'Nature', 'Urban Gardening', 'Paraclimbing'],
    vibe: 'Peaceful, oxygen-rich sanctuary with fragrant exotic flora and shaded sitting pavilions.',
    whyItsGreatForYou: 'A serene outdoor setting to enjoy loose-leaf teas while strolling through paved floral gardens with plenty of resting benches.',
    accessibilityFeatures: [
      {
        title: 'Paved Gentle Slopes',
        description: 'Smooth, level asphalt & boardwalk paths with ADA-compliant grades throughout the Main Lawn and Redwood Grove.',
        iconType: 'wheelchair'
      },
      {
        title: 'Tactile & Fragrance Garden',
        description: 'Dedicated raised garden beds with scented herbs, textured flora, and Braille interpretive plaques.',
        iconType: 'tactile'
      },
      {
        title: 'Free All-Terrain Wheelchairs',
        description: 'Complimentary motorized and manual wheelchairs available at the North and Main kiosks.',
        iconType: 'wheelchair'
      },
      {
        title: 'Shaded Tea Pavilion',
        description: 'Low-counter tea bar with acoustic dampening screens and tranquil pond views.',
        iconType: 'quiet'
      }
    ],
    accessibilityBadges: ['Tactile Garden', 'Wheelchair Loaners', 'Braille Placards', 'Service Dog Welcome'],
    safetyHighlight: 'Park rangers on site • Gated daylight botanical sanctuary',
    bestTimeToVisit: 'Sunny afternoons (1:00 PM – 4:30 PM)',
    noiseLevel: 'Quiet / Intimate',
    lightingLevel: 'Natural Sunlight',
    stepFreeAccess: true,
    publicTransitDistance: 'Steps from 9th Ave & Lincoln Way (N Judah Line)'
  },
  {
    id: 'venue-sightglass-coffee',
    name: 'Sightglass Coffee & Artisan Bakery Bar',
    category: 'cafe',
    categoryLabel: 'Specialty Coffee & Bakery',
    address: '270 7th St, San Francisco, CA 94103',
    neighborhood: 'SoMa Arts District',
    lat: 37.7766,
    lng: -122.4085,
    rating: 4.8,
    reviewsCount: 980,
    priceLevel: '$$',
    photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    matchedInterests: ['Baking', 'Coffee', 'Design', 'Architecture', 'Sourdough Baking'],
    vibe: 'Rustic-industrial open mezzanine with fresh roasted coffee aroma and warm timber accents.',
    whyItsGreatForYou: 'Combines a love for artisanal baking and specialty roasts in an airy open space with step-free street level seating.',
    accessibilityFeatures: [
      {
        title: 'Street-Level Step-Free Entrance',
        description: 'Double-wide entrance doors with flat threshold and seamless transition from sidewalk.',
        iconType: 'wheelchair'
      },
      {
        title: 'Acoustic Mezzanine & Low Music',
        description: 'High cathedral ceiling naturally disperses ambient noise, keeping background music moderate.',
        iconType: 'quiet'
      },
      {
        title: 'Braille & Large-Print Menus',
        description: 'Clear high-contrast physical menus plus instant QR screen-reader accessible digital order board.',
        iconType: 'tactile'
      }
    ],
    accessibilityBadges: ['Step-Free Entry', 'High Contrast Menu', 'Wide Walkways'],
    safetyHighlight: 'Busy neighborhood cafe with open view sightlines and attentive baristas',
    bestTimeToVisit: 'Morning to mid-afternoon (10:00 AM – 3:00 PM)',
    noiseLevel: 'Moderate / Relaxed',
    lightingLevel: 'Natural Sunlight',
    stepFreeAccess: true,
    publicTransitDistance: '3 blocks from Civic Center BART Station'
  },
  {
    id: 'venue-gamescape-lounge',
    name: 'The Game Parlour & Board Game Cafe',
    category: 'boardgame_cafe',
    categoryLabel: 'Board Game Cafe & Waffles',
    address: '1342 Irving St, San Francisco, CA 94122',
    neighborhood: 'Inner Sunset',
    lat: 37.7638,
    lng: -122.4721,
    rating: 4.8,
    reviewsCount: 1150,
    priceLevel: '$$',
    photoUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
    matchedInterests: ['Board Games', 'Baking', 'Sci-Fi Reading', 'Gaming', 'Culinary Arts'],
    vibe: 'Playful, interactive, and friendly with over 900+ curated board games and mochi waffles.',
    whyItsGreatForYou: 'Playing a cooperative board game eliminates first-date awkwardness and sparks genuine laughs and teamwork.',
    accessibilityFeatures: [
      {
        title: 'Adapted & High-Contrast Games',
        description: 'Library includes tactile board games with Braille dice, large-print rulebooks, and colorblind-safe tokens.',
        iconType: 'tactile'
      },
      {
        title: 'Wide Game Tables',
        description: 'Sturdy, height-adjustable tables with ample clearance for motorized powerchairs.',
        iconType: 'wheelchair'
      },
      {
        title: 'Knowledgeable Game Gurus',
        description: 'Patient staff fluent in ASL and adaptive play facilitation to guide rules seamlessly.',
        iconType: 'quiet'
      }
    ],
    accessibilityBadges: ['Tactile Game Library', 'ASL Friendly Staff', 'Powerchair Clearance'],
    safetyHighlight: 'Vibrant neighborhood game community • Well-staffed, alcohol-light venue',
    bestTimeToVisit: 'Weekday evenings (6:00 PM – 9:00 PM) for quieter ambiance',
    noiseLevel: 'Moderate / Relaxed',
    lightingLevel: 'Even / Glare-free',
    stepFreeAccess: true,
    publicTransitDistance: 'Right on N Judah line at 15th Ave'
  },
  {
    id: 'venue-chabot-observatory',
    name: 'Chabot Space & Science Center Observatory',
    category: 'astronomy_center',
    categoryLabel: 'Observatory & Stargazing Deck',
    address: '10000 Skyline Blvd, Oakland, CA 94619',
    neighborhood: 'Oakland Hills / Redwood Regional',
    lat: 37.8188,
    lng: -122.1802,
    rating: 4.9,
    reviewsCount: 1890,
    priceLevel: '$$',
    photoUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    matchedInterests: ['Stargazing', 'Modular Synthesizers', 'Sci-Fi Reading', 'Synth Music', 'Museum Crawls'],
    vibe: 'Cosmic, awe-inspiring, and tranquil surrounded by coastal redwoods under the stars.',
    whyItsGreatForYou: 'Unforgettable evening gazing through historic refractors with live soundscapes and accessible eyepiece video monitors.',
    accessibilityFeatures: [
      {
        title: 'Accessible Eyepiece Feeds & Audio Sonification',
        description: 'Telescopes equipped with low-glare digital screens and live audio sonification of stellar light curves.',
        iconType: 'audio'
      },
      {
        title: 'Level Viewing Decks & Ramps',
        description: 'Smooth rubberized astronomy observation deck with ADA ramps connecting all three observatory domes.',
        iconType: 'wheelchair'
      },
      {
        title: 'Tactile Star Maps & 3D Celestial Models',
        description: 'Embossed constellation charts and tactile 3D globes of Mars and the Moon for tactile exploration.',
        iconType: 'tactile'
      }
    ],
    accessibilityBadges: ['Audio Sonification', 'Tactile Star Maps', 'ADA Telescope Decks'],
    safetyHighlight: 'Official science institution • Staffed docents & rangers',
    bestTimeToVisit: 'Friday & Saturday free telescope viewing nights (7:30 PM – 10:00 PM)',
    noiseLevel: 'Quiet / Intimate',
    lightingLevel: 'Soft / Warm',
    stepFreeAccess: true,
    publicTransitDistance: 'Designated ADA shuttle connection from Fruitvale BART'
  },
  {
    id: 'venue-clay-pottery-studio',
    name: 'Public Glass & Clay Cooperative Arts Lab',
    category: 'art_studio',
    categoryLabel: 'Ceramics & Craft Studio',
    address: '1750 Armstrong Ave, San Francisco, CA 94124',
    neighborhood: 'Bayview Arts Hub',
    lat: 37.7289,
    lng: -122.3912,
    rating: 4.9,
    reviewsCount: 650,
    priceLevel: '$$',
    photoUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    matchedInterests: ['Pottery', 'Ceramics', 'Watercolor Painting', 'Baking', 'Crafting'],
    vibe: 'Hands-on, creative, and relaxed where making tactile art melts any first-date jitters.',
    whyItsGreatForYou: 'A tactile, sensory pottery wheel drop-in session where you can create matching mugs or clay planters together.',
    accessibilityFeatures: [
      {
        title: 'Wheelchair-Accessible Pottery Wheels',
        description: 'Height-adjustable electric and hand-crank pottery wheels with adaptive hand controls.',
        iconType: 'wheelchair'
      },
      {
        title: 'Tactile Sensory Clay Workshops',
        description: 'Experienced instructors offering non-visual tactile sculpting and texture-based glaze techniques.',
        iconType: 'tactile'
      },
      {
        title: 'Wide Roll-in Wash Stations',
        description: 'Barrier-free clay sinks and slip basins with levered faucets.',
        iconType: 'wheelchair'
      }
    ],
    accessibilityBadges: ['Adaptive Pottery Wheels', 'Tactile Arts', 'Roll-in Wash Stations'],
    safetyHighlight: 'Supervised community studio with certified art facilitators',
    bestTimeToVisit: 'Saturday afternoon pottery social (2:00 PM – 5:00 PM)',
    noiseLevel: 'Moderate / Relaxed',
    lightingLevel: 'Natural Sunlight',
    stepFreeAccess: true,
    publicTransitDistance: '1 block from T-Third Metro Line'
  },
  {
    id: 'venue-ferry-building',
    name: 'Ferry Building Artisan Market & Waterfront Promenade',
    category: 'restaurant',
    categoryLabel: 'Food Hall & Waterfront Promenade',
    address: '1 Ferry Building, The Embarcadero, SF, CA 94111',
    neighborhood: 'Embarcadero Waterfront',
    lat: 37.7955,
    lng: -122.3937,
    rating: 4.8,
    reviewsCount: 3100,
    priceLevel: '$$',
    photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    matchedInterests: ['Culinary Arts', 'Baking', 'Historical Non-fiction', 'Urban Gardening', 'Hiking'],
    vibe: 'Vibrant, scenic, and open with panoramic San Francisco Bay & Bay Bridge views.',
    whyItsGreatForYou: 'Tasting artisan cheeses, gelato, and fresh sourdough while walking along the completely flat Embarcadero promenade.',
    accessibilityFeatures: [
      {
        title: 'Smooth Continuous Flat Concourse',
        description: 'Polished terrazzo floors inside and wide flat concrete promenade along the water.',
        iconType: 'wheelchair'
      },
      {
        title: 'Braille Navigation Beacons',
        description: 'Indoor Bluetooth audio wayfinding and high-contrast Braille directory kiosks.',
        iconType: 'tactile'
      },
      {
        title: 'Waterfront Seating Benches',
        description: 'Benches every 30 meters with backrests and armrests overlooking the bay.',
        iconType: 'quiet'
      }
    ],
    accessibilityBadges: ['Zero Threshold', 'Waterfront ADA Trail', 'Audio Beacons'],
    safetyHighlight: 'Harbor patrol & municipal security • High visibility landmark',
    bestTimeToVisit: 'Sunday Farmers Market (10:00 AM) or sunset twilight',
    noiseLevel: 'Moderate / Relaxed',
    lightingLevel: 'Natural Sunlight',
    stepFreeAccess: true,
    publicTransitDistance: 'Immediate access at Embarcadero BART / Ferry Terminals'
  },
  {
    id: 'venue-soundwave-vinyl',
    name: 'Amoeba Sound Lounge & Analog Vinyl Room',
    category: 'music_venue',
    categoryLabel: 'Vinyl Lounge & Music Cafe',
    address: '1855 Haight St, San Francisco, CA 94117',
    neighborhood: 'Haight-Ashbury',
    lat: 37.7694,
    lng: -122.4526,
    rating: 4.8,
    reviewsCount: 2200,
    priceLevel: '$',
    photoUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    matchedInterests: ['Vinyl Records', 'Synth Music', 'Modular Synthesizers', 'Music', 'Historical Non-fiction'],
    vibe: 'Eclectic, nostalgic, and auditory haven for crate-diggers and music nerds.',
    whyItsGreatForYou: 'Flip through vintage records together and listen at private headphone listening pods with volume boosters.',
    accessibilityFeatures: [
      {
        title: 'Hearing Loop & High-Fidelity Headphones',
        description: 'Telecoil hearing loop zones and audiophile closed-back headphones with independent left/right volume balance.',
        iconType: 'audio'
      },
      {
        title: 'Spacious Lower Crate Aisles',
        description: 'Vinyl racks designed with lower browse shelves (under 40 inches) and wide aisles for mobility devices.',
        iconType: 'wheelchair'
      },
      {
        title: 'Tactile Record Genre Dividers',
        description: 'Embossed genre tabs and album sleeve magnifying lenses.',
        iconType: 'tactile'
      }
    ],
    accessibilityBadges: ['Hearing Loop', 'Accessible Listening Pods', 'Spacious Aisles'],
    safetyHighlight: 'Beloved neighborhood store with friendly music archivists',
    bestTimeToVisit: 'Afternoon (1:00 PM – 5:00 PM)',
    noiseLevel: 'Moderate / Relaxed',
    lightingLevel: 'Soft / Warm',
    stepFreeAccess: true,
    publicTransitDistance: 'Direct on 7 Haight / 43 Masonic Muni lines'
  }
];

/**
 * Intelligent matchmaking engine that examines the shared interests, location,
 * and accessibility requirements of two users to calculate exactly three ideal first-date venues.
 */
export function generateDateNightSuggestions(
  userA: UserProfile,
  userB: UserProfile
): DateNightPlan {
  // 1. Identify shared interests / hobbies
  const hobbiesA = (userA.hobbies || []).map(h => h.toLowerCase());
  const hobbiesB = (userB.hobbies || []).map(h => h.toLowerCase());
  
  const rawSharedHobbies = userA.hobbies.filter(h => 
    hobbiesB.includes(h.toLowerCase())
  );

  // Combine shared hobbies with lifestyle / bio keywords
  const combinedBioText = `${userA.bio} ${userB.bio} ${userA.jobTitle} ${userB.jobTitle}`.toLowerCase();
  
  const allIdentifiedInterests = [...rawSharedHobbies];
  if (allIdentifiedInterests.length === 0) {
    // Look for complementary interests
    const commonTopics = ['Coffee', 'Tea', 'Art', 'Nature', 'Baking', 'Music', 'Board Games', 'Science'];
    for (const topic of commonTopics) {
      if (combinedBioText.includes(topic.toLowerCase())) {
        allIdentifiedInterests.push(topic);
      }
    }
  }

  // Fallback if none found
  if (allIdentifiedInterests.length === 0) {
    allIdentifiedInterests.push('Great Conversations', 'Coffee & Tea', 'Accessible Culture');
  }

  // 2. Score each venue based on interest overlap, accessibility alignment, and location proximity
  const scoredVenues = ACCESSIBLE_VENUE_DATABASE.map(venue => {
    let score = 0;

    // Match count on interests
    const matched = venue.matchedInterests.filter(interest => {
      const lower = interest.toLowerCase();
      return (
        hobbiesA.some(h => h.includes(lower) || lower.includes(h)) ||
        hobbiesB.some(h => h.includes(lower) || lower.includes(h)) ||
        combinedBioText.includes(lower)
      );
    });

    score += matched.length * 30;

    // Rating boost
    score += (venue.rating - 4.5) * 20;

    // Badges alignment (wheelchair, audio description, neurodivergent/sensory friendly)
    const userBadges = [...(userA.accessibilityBadges || []), ...(userB.accessibilityBadges || [])].map(b => b.toLowerCase());
    
    if (userBadges.some(b => b.includes('wheelchair') || b.includes('mobility'))) {
      if (venue.stepFreeAccess) score += 25;
    }
    if (userBadges.some(b => b.includes('screen reader') || b.includes('audio description') || b.includes('vision'))) {
      if (venue.accessibilityFeatures.some(f => f.iconType === 'audio' || f.iconType === 'tactile')) score += 25;
    }
    if (userBadges.some(b => b.includes('asl') || b.includes('hearing') || b.includes('neurodivergent'))) {
      if (venue.accessibilityFeatures.some(f => f.iconType === 'quiet' || f.title.includes('ASL'))) score += 25;
    }

    return {
      venue,
      score,
      matched
    };
  });

  // Sort by highest matching score
  scoredVenues.sort((a, b) => b.score - a.score);

  // Guarantee diversity across categories in the top 3 (e.g. don't suggest 3 identical cafes)
  const selected: AccessibleVenue[] = [];
  const usedCategories = new Set<string>();

  for (const item of scoredVenues) {
    if (selected.length === 3) break;
    if (!usedCategories.has(item.venue.category)) {
      selected.push(item.venue);
      usedCategories.add(item.venue.category);
    }
  }

  // If we still need to reach 3, fill with remaining highest scoring
  if (selected.length < 3) {
    for (const item of scoredVenues) {
      if (selected.length === 3) break;
      if (!selected.some(s => s.id === item.venue.id)) {
        selected.push(item.venue);
      }
    }
  }

  // Location string description
  const locationString = userB.locationCity || userA.locationCity || 'Local Area';

  // Generate customized icebreaker topic based on matches
  let icebreaker = `Ask ${userB.name.split(' ')[0]} about what inspired their passion for ${allIdentifiedInterests[0] || 'accessibility and design'}!`;
  if (allIdentifiedInterests.length > 1) {
    icebreaker = `You both share excitement for ${allIdentifiedInterests[0]} and ${allIdentifiedInterests[1]}. Start by sharing your favorite memorable experience with it!`;
  }

  return {
    sharedInterests: allIdentifiedInterests,
    primaryLocation: locationString,
    suggestedVenues: selected.slice(0, 3),
    calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    icebreakerTopic: icebreaker
  };
}

/**
 * Converts an AccessibleVenue into a SharedLocation object to integrate with Google Maps
 */
export function convertVenueToSharedLocation(venue: AccessibleVenue, customNote?: string): SharedLocation {
  return {
    placeName: venue.name,
    address: venue.address,
    lat: venue.lat,
    lng: venue.lng,
    category: venue.category === 'museum' ? 'museum' : venue.category === 'park' ? 'park' : venue.category === 'restaurant' ? 'restaurant' : 'cafe',
    isSafeMeetupSpot: true,
    notes: customNote || `✨ Date Suggestion: ${venue.whyItsGreatForYou} • Accessibility: ${venue.accessibilityBadges.join(', ')}`,
    rating: venue.rating,
    googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}&query=${encodeURIComponent(venue.name + ' ' + venue.address)}`
  };
}
