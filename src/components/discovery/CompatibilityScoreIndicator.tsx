import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Users, 
  MapPin, 
  Languages, 
  BookOpen, 
  Target, 
  Smile, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Compass,
  Zap,
  Info
} from 'lucide-react';
import { CompatibilityInsight, UserProfile } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';

interface CompatibilityScoreIndicatorProps {
  compatibility: CompatibilityInsight;
  profile: UserProfile;
  currentUser: UserProfile;
  compact?: boolean;
  onOpenDetails?: () => void;
}

export const CompatibilityScoreIndicator: React.FC<CompatibilityScoreIndicatorProps> = ({
  compatibility,
  profile,
  currentUser,
  compact = false,
  onOpenDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { scorePercent, hobbiesBreakdown, demographics } = compatibility;

  // Determine theme color palette based on match strength
  const getBadgeStyle = (score: number) => {
    if (score >= 90) {
      return {
        bg: 'from-rose-600 via-red-500 to-amber-500',
        text: 'text-rose-400',
        border: 'border-rose-500/50',
        badgeBg: 'bg-rose-950/80',
        label: 'Exceptional Match'
      };
    }
    if (score >= 80) {
      return {
        bg: 'from-indigo-600 via-rose-500 to-amber-400',
        text: 'text-indigo-400',
        border: 'border-indigo-500/50',
        badgeBg: 'bg-indigo-950/80',
        label: 'High Compatibility'
      };
    }
    return {
      bg: 'from-amber-600 to-rose-600',
      text: 'text-amber-400',
      border: 'border-amber-500/50',
      badgeBg: 'bg-amber-950/80',
      label: 'Promising Chemistry'
    };
  };

  const badgeStyle = getBadgeStyle(scorePercent);

  // SVG Circular Gauge calculation
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    audioHaptics.triggerNavigationClick();
    if (onOpenDetails) onOpenDetails();
  };

  if (compact) {
    return (
      <div 
        onClick={toggleExpand}
        className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-neutral-700/80 shadow-md cursor-pointer hover:border-rose-500/50 transition-colors"
        title="View Compatibility Breakdown (Shared Hobbies & Demographics)"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-8 h-8 transform -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="13"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-neutral-800"
              fill="transparent"
            />
            <circle
              cx="16"
              cy="16"
              r="13"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-rose-500 transition-all duration-700"
              strokeDasharray={2 * Math.PI * 13}
              strokeDashoffset={2 * Math.PI * 13 - (scorePercent / 100) * (2 * Math.PI * 13)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute text-[10px] font-black text-white font-mono">
            {scorePercent}%
          </span>
        </div>
        <div className="text-left">
          <div className="text-[10px] font-bold text-neutral-200 leading-tight flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-rose-400" />
            <span>{scorePercent}% Match</span>
          </div>
          <div className="text-[9px] text-neutral-400 flex items-center gap-1">
            <span>{hobbiesBreakdown.totalShared} Hobbies</span>
            <span>•</span>
            <span>{demographics.overallDemographicPercent}% Demo</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`compatibility-indicator-${profile.id}`}
      className="w-full bg-neutral-950/80 rounded-2xl border border-neutral-800 overflow-hidden transition-all shadow-inner"
    >
      {/* Header Bar with Circular Gauge and Primary Breakdown */}
      <div 
        onClick={toggleExpand}
        className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-900/60 transition-colors select-none"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`Overall match: ${scorePercent} percent. ${hobbiesBreakdown.totalShared} shared hobbies, ${demographics.overallDemographicPercent} percent demographic alignment. Click to toggle full breakdown.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-3">
          {/* Radial SVG Gauge */}
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-neutral-800"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="url(#compatGradient)"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="compatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="60%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
              <span className="text-xs font-black text-white font-mono">{scorePercent}</span>
              <span className="text-[7px] font-bold text-neutral-400">%</span>
            </div>
          </div>

          {/* Quick Dual Meters: Hobbies + Demographics */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle.badgeBg} ${badgeStyle.border} ${badgeStyle.text}`}>
                {badgeStyle.label}
              </span>
              <span className="text-[11px] text-neutral-300 font-medium truncate">
                {profile.name} & You
              </span>
            </div>

            {/* Visual Mini Progress Bars */}
            <div className="grid grid-cols-2 gap-2">
              {/* Hobby Meter */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400/40" />
                    <span>Hobbies</span>
                  </span>
                  <span className="font-mono font-bold text-rose-300">{hobbiesBreakdown.hobbyScorePercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${hobbiesBreakdown.hobbyScorePercent}%` }}
                  />
                </div>
              </div>

              {/* Demographic Meter */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Users className="w-2.5 h-2.5 text-indigo-400" />
                    <span>Demographics</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-300">{demographics.overallDemographicPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${demographics.overallDemographicPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Arrow */}
        <div className="ml-2 p-1.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded In-Depth Compatibility Breakdown */}
      {isExpanded && (
        <div className="p-3.5 pt-1 border-t border-neutral-800/80 bg-neutral-950/95 space-y-3.5 animate-in fade-in duration-200">
          {/* 1. Shared Hobbies Section */}
          <div className="bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Shared Hobbies & Passions</span>
              </span>
              <span className="text-[10px] font-bold font-mono text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-500/40">
                {hobbiesBreakdown.hobbyScorePercent}% Synergy
              </span>
            </div>

            {hobbiesBreakdown.sharedHobbies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {hobbiesBreakdown.sharedHobbies.map((hobby, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold bg-rose-950/70 text-rose-200 border border-rose-500/50 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3 h-3 text-rose-400" />
                    {hobby}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-neutral-400 italic">
                Different hobbies provide exciting date topics and mutual discoveries.
              </p>
            )}

            {hobbiesBreakdown.complementaryHobbies.length > 0 && (
              <div className="pt-1 text-[10px] text-neutral-400 flex items-center gap-1 flex-wrap">
                <span className="text-neutral-500 font-medium">Explore with {profile.name}:</span>
                <span className="text-neutral-300">{hobbiesBreakdown.complementaryHobbies.slice(0, 3).join(', ')}</span>
              </div>
            )}
          </div>

          {/* 2. Demographic & Preferences Breakdown Grid */}
          <div className="bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Demographic & Preference Alignment</span>
              </span>
              <span className="text-[10px] font-bold font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/40">
                {demographics.overallDemographicPercent}% Match
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {/* Age & Generation */}
              <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Smile className="w-3 h-3 text-amber-400" />
                    <span>Age & Era</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300">{demographics.ageScore}%</span>
                </div>
                <span className="font-semibold text-neutral-200 text-[10px] leading-tight">
                  {demographics.ageInsight}
                </span>
              </div>

              {/* Distance & Proximity */}
              <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>Proximity</span>
                  </span>
                  <span className="font-mono font-bold text-rose-300">{demographics.distanceScore}%</span>
                </div>
                <span className="font-semibold text-neutral-200 text-[10px] leading-tight">
                  {demographics.distanceInsight}
                </span>
              </div>

              {/* Shared Languages */}
              <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Languages className="w-3 h-3 text-cyan-400" />
                    <span>Languages</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-300">{demographics.languageScore}%</span>
                </div>
                <span className="font-semibold text-neutral-200 text-[10px] leading-tight">
                  {demographics.sharedLanguages.length > 0 
                    ? `Fluency: ${demographics.sharedLanguages.join(', ')}`
                    : `${profile.languages.slice(0, 2).join(', ')}`}
                </span>
              </div>

              {/* Relationship Goals */}
              <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span>Intentions</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-300">{demographics.goalsScore}%</span>
                </div>
                <span className="font-semibold text-neutral-200 text-[10px] leading-tight">
                  {demographics.goalsInsight}
                </span>
              </div>

              {/* Worldview / Religion */}
              <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-purple-400" />
                    <span>Beliefs</span>
                  </span>
                  <span className="font-mono font-bold text-purple-300">{demographics.religionScore}%</span>
                </div>
                <span className="font-semibold text-neutral-200 text-[10px] leading-tight">
                  {demographics.religionInsight}
                </span>
              </div>

              {/* Education / Career */}
              <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-sky-400" />
                    <span>Education</span>
                  </span>
                  <span className="font-mono font-bold text-sky-300">{demographics.educationScore}%</span>
                </div>
                <span className="font-semibold text-neutral-200 text-[10px] leading-tight">
                  {demographics.educationInsight}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Inclusivity & Accessibility Alignment */}
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <div className="text-[10px] text-neutral-300">
              <span className="font-bold text-indigo-300">Community Synergy: </span>
              <span>{demographics.accessibilityInsight}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
