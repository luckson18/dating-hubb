import { UserProfile } from '../types/dating';

/**
 * Common search descriptor pills to help users quickly filter by physical, 
 * lifestyle, accessibility, and background attributes.
 */
export interface SearchDescriptorChip {
  id: string;
  label: string;
  category: 'complexion' | 'accessibility' | 'profession' | 'lifestyle' | 'physical';
  query: string;
  emoji: string;
}

export const SUGGESTED_SEARCH_CHIPS: SearchDescriptorChip[] = [
  { id: 'dark-complexion', label: 'Dark Complexion', category: 'complexion', query: 'dark complexion', emoji: '🏾' },
  { id: 'deep-brown-ebony', label: 'Deep Brown & Ebony', category: 'complexion', query: 'deep brown ebony', emoji: '🏿' },
  { id: 'caramel-bronze', label: 'Caramel / Bronze', category: 'complexion', query: 'caramel bronze', emoji: '🏽' },
  { id: 'olive-honey', label: 'Olive / Honey', category: 'complexion', query: 'olive honey', emoji: '🏽' },
  { id: 'fair-porcelain', label: 'Fair / Porcelain', category: 'complexion', query: 'fair porcelain', emoji: '🏻' },
  { id: 'tall-6ft', label: 'Tall (6ft+)', category: 'physical', query: 'tall 6ft', emoji: '📏' },
  { id: 'wheelchair-user', label: 'Wheelchair User', category: 'accessibility', query: 'wheelchair user', emoji: '♿' },
  { id: 'asl-signer', label: 'ASL / Deaf Friendly', category: 'accessibility', query: 'ASL deaf', emoji: '🤟' },
  { id: 'blind-low-vision', label: 'Blind / Low Vision', category: 'accessibility', query: 'blind low vision screen reader', emoji: '🦯' },
  { id: 'neurodivergent', label: 'Neurodivergent / ADHD', category: 'accessibility', query: 'neurodivergent ADHD', emoji: '🧠' },
  { id: 'vegetarian-vegan', label: 'Vegetarian / Plant Diet', category: 'lifestyle', query: 'vegetarian vegan', emoji: '🥗' },
  { id: 'teacher-educator', label: 'Educator & Teacher', category: 'profession', query: 'teacher educator', emoji: '📚' },
  { id: 'engineer-tech', label: 'Engineer & Tech', category: 'profession', query: 'engineer software tech', emoji: '💻' },
  { id: 'artist-creative', label: 'Artist & Creative', category: 'profession', query: 'artist designer composer', emoji: '🎨' },
  { id: 'video-bio', label: 'With Video Bio', category: 'lifestyle', query: 'video bio', emoji: '🎥' },
  { id: 'cat-dog-pets', label: 'Pet Lovers', category: 'lifestyle', query: 'cat dog pet', emoji: '🐾' }
];

/**
 * Checks if a profile matches a complex natural language / descriptive search query.
 */
export function matchesDescriptionQuery(profile: UserProfile, rawQuery: string): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;

  const normalized = rawQuery.toLowerCase().trim();

  // 1. Complexion Specific Semantic Queries
  const isDarkComplexionQuery = 
    normalized.includes('dark complexion') || 
    normalized.includes('dark skin') || 
    normalized.includes('dark tone') ||
    normalized.includes('melanin') ||
    (normalized.includes('dark') && !normalized.includes('darkness'));

  if (isDarkComplexionQuery) {
    const darkComplexions = ['deep brown', 'rich ebony', 'warm bronze'];
    const matchesDarkComplexion = darkComplexions.some(dc => profile.complexion.toLowerCase().includes(dc));
    
    // Check if query is ONLY dark complexion or has additional tokens
    const remainingQuery = normalized
      .replace('dark complexion', '')
      .replace('dark skin', '')
      .replace('dark tone', '')
      .replace('dark', '')
      .trim();

    if (!remainingQuery) {
      return matchesDarkComplexion;
    }
    if (!matchesDarkComplexion) {
      return false;
    }
    // If it matched dark complexion and has remaining tokens, test remaining tokens
    return matchGeneralAttributes(profile, remainingQuery);
  }

  // Fair / Light Complexion Query
  const isFairComplexionQuery = 
    normalized.includes('fair complexion') || 
    normalized.includes('fair skin') || 
    normalized.includes('light complexion') ||
    normalized.includes('porcelain') ||
    normalized.includes('fair');

  if (isFairComplexionQuery) {
    const fairComplexions = ['fair / porcelain', 'warm beige'];
    const matchesFairComplexion = fairComplexions.some(fc => profile.complexion.toLowerCase().includes(fc));
    const remainingQuery = normalized
      .replace('fair complexion', '')
      .replace('fair skin', '')
      .replace('light complexion', '')
      .replace('porcelain', '')
      .replace('fair', '')
      .trim();

    if (!remainingQuery) return matchesFairComplexion;
    if (!matchesFairComplexion) return false;
    return matchGeneralAttributes(profile, remainingQuery);
  }

  // Olive / Honey Complexion
  if (normalized.includes('olive') || normalized.includes('honey')) {
    const matchesOlive = profile.complexion.toLowerCase().includes('olive') || profile.complexion.toLowerCase().includes('honey');
    const remaining = normalized.replace('olive', '').replace('honey', '').replace('complexion', '').trim();
    if (!remaining) return matchesOlive;
    if (!matchesOlive) return false;
    return matchGeneralAttributes(profile, remaining);
  }

  // Caramel / Tan / Bronze Complexion
  if (normalized.includes('caramel') || normalized.includes('tan') || normalized.includes('bronze')) {
    const matchesCaramel = 
      profile.complexion.toLowerCase().includes('caramel') || 
      profile.complexion.toLowerCase().includes('tan') || 
      profile.complexion.toLowerCase().includes('bronze');
    const remaining = normalized.replace('caramel', '').replace('tan', '').replace('bronze', '').replace('complexion', '').trim();
    if (!remaining) return matchesCaramel;
    if (!matchesCaramel) return false;
    return matchGeneralAttributes(profile, remaining);
  }

  // Ebony / Deep Brown specific
  if (normalized.includes('ebony') || normalized.includes('deep brown')) {
    const matchesEbony = profile.complexion.toLowerCase().includes('ebony') || profile.complexion.toLowerCase().includes('deep brown');
    const remaining = normalized.replace('ebony', '').replace('deep brown', '').replace('complexion', '').trim();
    if (!remaining) return matchesEbony;
    if (!matchesEbony) return false;
    return matchGeneralAttributes(profile, remaining);
  }

  // Tall / Height queries
  if (normalized.includes('tall') || normalized.includes('6ft') || normalized.includes("6'0") || normalized.includes("6'1") || normalized.includes("6'2") || normalized.includes('>6ft')) {
    const isTall = profile.heightCm >= 180 || profile.heightFeet.startsWith("6'");
    const remaining = normalized
      .replace('tall', '')
      .replace('6ft', '')
      .replace("6'0", '')
      .replace("6'1", '')
      .replace("6'2", '')
      .replace('>6ft', '')
      .replace('height', '')
      .trim();
    if (!remaining) return isTall;
    if (!isTall) return false;
    return matchGeneralAttributes(profile, remaining);
  }

  // Short / Petite queries
  if (normalized.includes('short') || normalized.includes('petite') || normalized.includes('<5\'5') || normalized.includes("5'4") || normalized.includes("5'3")) {
    const isPetite = profile.heightCm <= 165;
    const remaining = normalized
      .replace('short', '')
      .replace('petite', '')
      .replace("<5'5", '')
      .replace("5'4", '')
      .replace("5'3", '')
      .trim();
    if (!remaining) return isPetite;
    if (!isPetite) return false;
    return matchGeneralAttributes(profile, remaining);
  }

  // Video Bio query
  if (normalized.includes('video bio') || normalized.includes('with video') || normalized.includes('has video')) {
    const hasVideo = Boolean(profile.videoBio);
    const remaining = normalized
      .replace('video bio', '')
      .replace('with video', '')
      .replace('has video', '')
      .replace('video', '')
      .trim();
    if (!remaining) return hasVideo;
    if (!hasVideo) return false;
    return matchGeneralAttributes(profile, remaining);
  }

  // General multi-word token attribute matching
  return matchGeneralAttributes(profile, normalized);
}

/**
 * Helper to match tokens across all descriptive textual and categorical fields of a profile.
 */
function matchGeneralAttributes(profile: UserProfile, query: string): boolean {
  if (!query || !query.trim()) return true;

  // Split query into significant words (ignoring common stop words)
  const stopWords = new Set(['and', 'with', 'who', 'the', 'is', 'a', 'an', 'in', 'of', 'for', 'or', 'to', 'user', 'people', 'person', 'looking']);
  const tokens = query
    .toLowerCase()
    .split(/[\s,+/]+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !stopWords.has(t));

  if (tokens.length === 0) return true;

  // Aggregate searchable corpus of the profile
  const profileCorpus = [
    profile.name,
    profile.bio,
    profile.complexion,
    profile.raceEthnicity,
    profile.gender,
    profile.pronouns,
    profile.religion,
    profile.education,
    profile.jobTitle,
    profile.companyOrField,
    profile.nationality,
    profile.relationshipGoal,
    profile.locationCity,
    profile.heightFeet,
    `${profile.heightCm}cm`,
    `${profile.weightKg}kg`,
    ...profile.languages,
    ...profile.hobbies,
    ...profile.accessibilityBadges,
    profile.lifestyle?.diet || '',
    profile.lifestyle?.astrologySign || '',
    ...(profile.lifestyle?.pets || []),
    profile.videoBio?.transcript || '',
    ...(profile.videoBio?.subtitles?.map(s => s.text) || [])
  ]
    .join(' ')
    .toLowerCase();

  // If query contains any of the tokens (or all tokens for high precision)
  // For queries with 1 or 2 tokens, enforce ALL must match or have semantic overlap
  return tokens.every(token => {
    // Direct substring check
    if (profileCorpus.includes(token)) return true;

    // Semantic alias expansion
    if (token === 'black' && (profile.raceEthnicity.toLowerCase().includes('african') || profile.raceEthnicity.toLowerCase().includes('black'))) return true;
    if (token === 'asian' && profile.raceEthnicity.toLowerCase().includes('asian')) return true;
    if (token === 'latino' && profile.raceEthnicity.toLowerCase().includes('hispanic')) return true;
    if (token === 'arab' && profile.raceEthnicity.toLowerCase().includes('middle eastern')) return true;
    if (token === 'white' && profile.raceEthnicity.toLowerCase().includes('caucasian')) return true;
    if (token === 'blind' && profile.accessibilityBadges.some(b => b.toLowerCase().includes('blind') || b.toLowerCase().includes('low vision') || b.toLowerCase().includes('braille'))) return true;
    if (token === 'deaf' && profile.accessibilityBadges.some(b => b.toLowerCase().includes('deaf') || b.toLowerCase().includes('hearing') || b.toLowerCase().includes('asl'))) return true;
    if (token === 'asl' && (profile.languages.some(l => l.toLowerCase().includes('asl')) || profile.accessibilityBadges.some(b => b.toLowerCase().includes('asl')))) return true;
    if (token === 'wheelchair' && profile.accessibilityBadges.some(b => b.toLowerCase().includes('wheelchair') || b.toLowerCase().includes('adaptive'))) return true;
    if (token === 'adhd' && (profile.accessibilityBadges.some(b => b.toLowerCase().includes('adhd') || b.toLowerCase().includes('neurodivergent')) || profile.bio.toLowerCase().includes('adhd'))) return true;
    if (token === 'vegan' && profile.lifestyle?.diet?.toLowerCase().includes('plant')) return true;
    if (token === 'doctor' && (profile.education.toLowerCase().includes('doctorate') || profile.education.toLowerCase().includes('phd') || profile.jobTitle.toLowerCase().includes('dr'))) return true;
    if (token === 'lawyer' && (profile.jobTitle.toLowerCase().includes('attorney') || profile.jobTitle.toLowerCase().includes('lawyer'))) return true;
    if (token === 'teacher' && (profile.jobTitle.toLowerCase().includes('educator') || profile.jobTitle.toLowerCase().includes('teacher') || profile.jobTitle.toLowerCase().includes('professor'))) return true;
    if (token === 'tech' && (profile.jobTitle.toLowerCase().includes('engineer') || profile.companyOrField.toLowerCase().includes('tech') || profile.jobTitle.toLowerCase().includes('software'))) return true;

    return false;
  });
}

/**
 * Returns user-facing badge annotations explaining why a profile matched the search description.
 */
export function getSearchMatchReasons(profile: UserProfile, rawQuery: string): string[] {
  if (!rawQuery || !rawQuery.trim()) return [];
  const query = rawQuery.toLowerCase().trim();
  const reasons: string[] = [];

  if (query.includes('dark') || query.includes('ebony') || query.includes('brown')) {
    if (['deep brown', 'rich ebony', 'warm bronze'].some(c => profile.complexion.toLowerCase().includes(c))) {
      reasons.push(`Complexion: ${profile.complexion}`);
    }
  }

  if (query.includes('fair') || query.includes('porcelain') || query.includes('light')) {
    if (['fair / porcelain', 'warm beige'].some(c => profile.complexion.toLowerCase().includes(c))) {
      reasons.push(`Complexion: ${profile.complexion}`);
    }
  }

  if (query.includes('olive') || query.includes('honey')) {
    if (profile.complexion.toLowerCase().includes('olive') || profile.complexion.toLowerCase().includes('honey')) {
      reasons.push(`Complexion: ${profile.complexion}`);
    }
  }

  if (query.includes('caramel') || query.includes('tan') || query.includes('bronze')) {
    if (profile.complexion.toLowerCase().includes('caramel') || profile.complexion.toLowerCase().includes('bronze') || profile.complexion.toLowerCase().includes('tan')) {
      reasons.push(`Complexion: ${profile.complexion}`);
    }
  }

  if (query.includes('tall') || query.includes('6ft')) {
    if (profile.heightCm >= 180) {
      reasons.push(`Height: ${profile.heightFeet} (${profile.heightCm} cm)`);
    }
  }

  // Accessibility badges match
  profile.accessibilityBadges.forEach(badge => {
    if (query.split(' ').some(w => w.length > 2 && badge.toLowerCase().includes(w))) {
      reasons.push(badge);
    }
  });

  // Hobbies match
  profile.hobbies.forEach(hobby => {
    if (query.split(' ').some(w => w.length > 2 && hobby.toLowerCase().includes(w))) {
      reasons.push(`Hobby: ${hobby}`);
    }
  });

  // Profession match
  if (query.split(' ').some(w => w.length > 2 && profile.jobTitle.toLowerCase().includes(w))) {
    reasons.push(`Role: ${profile.jobTitle}`);
  }

  return Array.from(new Set(reasons));
}
