import { UserProfile } from '../types/dating';

export interface AccessibilityCheckItem {
  id: string;
  category: 'visual' | 'audio' | 'bio' | 'hobbies' | 'inclusivity' | 'multimediaBio';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  points: number;
  maxPoints: number;
  passed: boolean;
  actionLabel?: string;
  actionKey?: string;
  improvementTip: string;
}

export interface PersonalAccessibilityReportData {
  overallScore: number; // 0 - 100
  tier: 'Elite Inclusive' | 'Highly Accessible' | 'Accessible' | 'Needs Optimization';
  tierColor: string;
  badgeTitle: string;
  summary: string;
  categoryScores: {
    visualAccessibility: { score: number; max: number; percent: number };
    multimediaBio: { score: number; max: number; percent: number };
    hobbiesAndInterests: { score: number; max: number; percent: number };
    inclusivityBadges: { score: number; max: number; percent: number };
    profileCompleteness: { score: number; max: number; percent: number };
  };
  checklist: AccessibilityCheckItem[];
  highPriorityRecommendations: AccessibilityCheckItem[];
  passedCount: number;
  totalCount: number;
}

export function generatePersonalAccessibilityReport(profile: UserProfile): PersonalAccessibilityReportData {
  const items: AccessibilityCheckItem[] = [];

  // 1. Photo Alt-Text / Visual Descriptions
  const hasPhotoAlt = Boolean(
    profile.photoDescription && 
    profile.photoDescription.trim().length > 15
  );
  items.push({
    id: 'alt_text',
    category: 'visual',
    title: 'Profile Photo Visual Description (Alt-Text)',
    description: 'Detailed description of your photo for visually impaired matches and screen readers.',
    impact: 'high',
    points: hasPhotoAlt ? 20 : 0,
    maxPoints: 20,
    passed: hasPhotoAlt,
    actionLabel: hasPhotoAlt ? 'Edit Alt-Text' : 'Add Photo Alt-Text',
    actionKey: 'edit_alt_text',
    improvementTip: hasPhotoAlt
      ? 'Great job! Screen readers can accurately describe your profile photo.'
      : 'Add a 1-2 sentence visual description of your appearance, clothing, and background so blind and low-vision matches can picture you.'
  });

  // 2. Audio Voice Intro / Pronunciation
  const hasAudioBio = Boolean(profile.voiceBioUrl || profile.pronouns);
  const fullAudioIntro = Boolean(profile.voiceBioUrl);
  items.push({
    id: 'audio_bio',
    category: 'audio',
    title: 'Voice Intro & Audio Bio',
    description: 'Enables matches to hear your voice, tone, and name pronunciation.',
    impact: 'high',
    points: fullAudioIntro ? 20 : (hasAudioBio ? 10 : 0),
    maxPoints: 20,
    passed: fullAudioIntro,
    actionLabel: fullAudioIntro ? 'Update Voice Clip' : 'Record Voice Intro',
    actionKey: 'record_voice',
    improvementTip: fullAudioIntro
      ? 'Your voice intro provides personal warmth and cognitive accessibility.'
      : 'Record a quick 15-second voice snippet introducing yourself.'
  });

  // 3. Completed Hobbies & Shared Interests
  const hobbyCount = profile.hobbies ? profile.hobbies.length : 0;
  const hasEnoughHobbies = hobbyCount >= 4;
  const hobbyPoints = Math.min(20, hobbyCount * 5);
  items.push({
    id: 'hobbies_completion',
    category: 'hobbies',
    title: 'Hobbies & Mutual Passions (Minimum 4)',
    description: 'Allows the inclusive matchmaking algorithm to compute accurate hobby synergy scores.',
    impact: 'medium',
    points: hobbyPoints,
    maxPoints: 20,
    passed: hasEnoughHobbies,
    actionLabel: hasEnoughHobbies ? 'Manage Hobbies' : `Add ${Math.max(0, 4 - hobbyCount)} More Hobbies`,
    actionKey: 'add_hobbies',
    improvementTip: hasEnoughHobbies
      ? `You have ${hobbyCount} hobbies listed, optimizing match compatibility calculations.`
      : `You currently have ${hobbyCount} hobby listed. Add at least 4 hobbies so matches can find shared activities and accessible date ideas.`
  });

  // 4. Accessibility Badges & Inclusive Dating Preferences
  const badgeCount = profile.accessibilityBadges ? profile.accessibilityBadges.length : 0;
  const hasBadges = badgeCount >= 2;
  const badgePoints = Math.min(20, badgeCount * 10);
  items.push({
    id: 'accessibility_badges',
    category: 'inclusivity',
    title: 'Accessibility & Community Badges',
    description: 'Signals support for neurodiversity, sign language, wheelchair accessible dates, or sensory needs.',
    impact: 'high',
    points: badgePoints,
    maxPoints: 20,
    passed: hasBadges,
    actionLabel: hasBadges ? 'Edit Badges' : 'Select Badges',
    actionKey: 'select_badges',
    improvementTip: hasBadges
      ? `You have ${badgeCount} accessibility badges active (${profile.accessibilityBadges.join(', ')}).`
      : 'Select at least 2 community badges (e.g. Sensory-Friendly, ASL/BSL, Step-Free Dates, Ally) to signal welcoming spaces.'
  });

  // 5. Video Bio with Sign Language or Captions
  const hasVideoBio = Boolean(profile.videoBio && profile.videoBio.transcript);
  items.push({
    id: 'video_bio',
    category: 'multimediaBio',
    title: 'Accessible Video Bio',
    description: 'A 10-30 second expressive video clip for deaf, hard of hearing, and visual-oriented daters.',
    impact: 'medium',
    points: hasVideoBio ? 10 : 0,
    maxPoints: 10,
    passed: hasVideoBio,
    actionLabel: hasVideoBio ? 'Review Video' : 'Add Video Bio',
    actionKey: 'add_video',
    improvementTip: hasVideoBio
      ? 'Video bio is live with automatic captioning.'
      : 'Upload a short video bio with captions or sign language to connect on a deeper sensory level.'
  });

  // 6. Comprehensive Bio & Clarity
  const bioLength = profile.bio ? profile.bio.trim().length : 0;
  const hasSubstantialBio = bioLength >= 60;
  items.push({
    id: 'bio_clarity',
    category: 'bio',
    title: 'Expressive Bio & Dating Intentions',
    description: 'Clear statement of relationship goals, interests, and communication preferences.',
    impact: 'medium',
    points: hasSubstantialBio ? 10 : Math.floor((bioLength / 60) * 10),
    maxPoints: 10,
    passed: hasSubstantialBio,
    actionLabel: 'Refine Bio',
    actionKey: 'edit_bio',
    improvementTip: hasSubstantialBio
      ? 'Your written bio provides rich context for text-to-speech narrators.'
      : 'Expand your written bio to at least 60 characters explaining what makes you tick.'
  });

  // Calculate totals
  const totalScore = items.reduce((sum, item) => sum + item.points, 0);
  const maxPossible = items.reduce((sum, item) => sum + item.maxPoints, 0);
  const overallScore = Math.min(100, Math.round((totalScore / maxPossible) * 100));

  let tier: PersonalAccessibilityReportData['tier'] = 'Needs Optimization';
  let tierColor = 'text-amber-400 border-amber-500/40 bg-amber-950/80';
  let badgeTitle = 'Developing Profile';

  if (overallScore >= 90) {
    tier = 'Elite Inclusive';
    tierColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/80';
    badgeTitle = 'Universal Access Champion';
  } else if (overallScore >= 75) {
    tier = 'Highly Accessible';
    tierColor = 'text-rose-400 border-rose-500/40 bg-rose-950/80';
    badgeTitle = 'Inclusive Dating Pioneer';
  } else if (overallScore >= 60) {
    tier = 'Accessible';
    tierColor = 'text-indigo-400 border-indigo-500/40 bg-indigo-950/80';
    badgeTitle = 'Accessible Dater';
  }

  const visualScore = items.find(i => i.id === 'alt_text')?.points || 0;
  const audioScore = (items.find(i => i.id === 'audio_bio')?.points || 0) + (items.find(i => i.id === 'video_bio')?.points || 0);
  const hobbiesScore = items.find(i => i.id === 'hobbies_completion')?.points || 0;
  const badgeScore = items.find(i => i.id === 'accessibility_badges')?.points || 0;
  const bioScore = items.find(i => i.id === 'bio_clarity')?.points || 0;

  const passedCount = items.filter(i => i.passed).length;
  const highPriorityRecommendations = items.filter(i => !i.passed);

  const summary = overallScore >= 85
    ? `Outstanding! Your profile is ${overallScore}% optimized for universal accessibility, supporting screen readers, sensory-friendly dating, and rich compatibility matching.`
    : `Your profile is ${overallScore}% inclusive. Completing key items like photo alt-text and extra hobbies will significantly boost your reach across diverse dating communities.`;

  return {
    overallScore,
    tier,
    tierColor,
    badgeTitle,
    summary,
    categoryScores: {
      visualAccessibility: { score: visualScore, max: 20, percent: Math.round((visualScore / 20) * 100) },
      multimediaBio: { score: audioScore, max: 30, percent: Math.round((audioScore / 30) * 100) },
      hobbiesAndInterests: { score: hobbiesScore, max: 20, percent: Math.round((hobbiesScore / 20) * 100) },
      inclusivityBadges: { score: badgeScore, max: 20, percent: Math.round((badgeScore / 20) * 100) },
      profileCompleteness: { score: bioScore, max: 10, percent: Math.round((bioScore / 10) * 100) }
    },
    checklist: items,
    highPriorityRecommendations,
    passedCount,
    totalCount: items.length
  };
}
