import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  Mic, 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Share2, 
  HelpCircle,
  TrendingUp,
  FileText,
  Video
} from 'lucide-react';
import { UserProfile } from '../../types/dating';
import { generatePersonalAccessibilityReport, AccessibilityCheckItem } from '../../utils/accessibilityAudit';
import { audioHaptics } from '../../services/audioHaptics';

interface PersonalAccessibilityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSelectAction?: (actionKey: string) => void;
}

export const PersonalAccessibilityReportModal: React.FC<PersonalAccessibilityReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSelectAction
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'checklist'>('overview');
  const [copiedBadge, setCopiedBadge] = useState(false);

  if (!isOpen) return null;

  const report = generatePersonalAccessibilityReport(profile);
  const { overallScore, tier, tierColor, badgeTitle, summary, categoryScores, checklist, highPriorityRecommendations } = report;

  // Circular gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const handleActionClick = (actionKey?: string) => {
    audioHaptics.triggerNavigationClick();
    if (actionKey && onSelectAction) {
      onSelectAction(actionKey);
      onClose();
    }
  };

  const handleShareScore = () => {
    audioHaptics.triggerSuccessCheck();
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-report-title"
    >
      <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-400 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                <Award className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <h2 id="accessibility-report-title" className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Personal Accessibility Report
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40">
                  hubb Audit
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Inclusive profile optimization for diverse daters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Close Button */}
            <button
              onClick={() => {
                onClose();
              }}
              className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
              aria-label="Close report"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800/80 bg-neutral-900/50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Score & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'recommendations'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Recommendations</span>
            {highPriorityRecommendations.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center">
                {highPriorityRecommendations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Full Checklist ({report.passedCount}/{report.totalCount})</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Score Hero Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 shadow-inner relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="absolute top-0 right-0 w-36 h-36 bg-rose-600/10 blur-3xl pointer-events-none" />
                
                {/* Radial Score Gauge */}
                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-neutral-800"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke="url(#reportGaugeGrad)"
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="reportGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-2xl font-black text-white font-mono">{overallScore}</span>
                    <span className="text-[10px] font-bold text-neutral-400">%</span>
                  </div>
                </div>

                {/* Score Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    <span className={tierColor}>{tier}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-300 font-semibold">{badgeTitle}</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>

              {/* Category Breakdown Progress Meters */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                  <span>Accessibility Dimensions</span>
                  <span className="text-[10px] text-neutral-500">Weight Adjusted</span>
                </h3>

                <div className="space-y-2.5 bg-neutral-900/60 border border-neutral-800/80 p-3.5 rounded-2xl">
                  {/* 1. Visual Alt-Text */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>Photo Visual Description (Alt-Text)</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold text-sky-300">
                        {categoryScores.visualAccessibility.percent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full transition-all duration-700"
                        style={{ width: `${categoryScores.visualAccessibility.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. Voice & Audio Intro */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                        <Mic className="w-3.5 h-3.5 text-rose-400" />
                        <span>Voice Clip & Multimedia Bio</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold text-rose-300">
                        {categoryScores.multimediaBio.percent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-red-400 rounded-full transition-all duration-700"
                        style={{ width: `${categoryScores.multimediaBio.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. Hobbies & Passions */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                        <Heart className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hobbies & Synergy Depth</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold text-amber-300">
                        {categoryScores.hobbiesAndInterests.percent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
                        style={{ width: `${categoryScores.hobbiesAndInterests.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Inclusivity Badges */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Inclusive Community Badges</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold text-indigo-300">
                        {categoryScores.inclusivityBadges.percent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-700"
                        style={{ width: `${categoryScores.inclusivityBadges.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions / Share Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
                <div className="flex items-center gap-2 text-xs text-rose-200">
                  <Sparkles className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>
                    {highPriorityRecommendations.length > 0 
                      ? `${highPriorityRecommendations.length} suggested actions available to reach 100%`
                      : 'Your profile has achieved full universal accessibility!'}
                  </span>
                </div>
                
                {highPriorityRecommendations.length > 0 ? (
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Improvements</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleShareScore}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedBadge ? 'Badge Copied!' : 'Share Champion Badge'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Priority Improvement Actions
                </h3>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {highPriorityRecommendations.length} remaining
                </span>
              </div>

              {highPriorityRecommendations.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900/50 border border-neutral-800 rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">All Accessibility Goals Met!</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Your profile provides photo alt-text descriptions, voice bios, rich hobbies, and community accessibility badges.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {highPriorityRecommendations.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 p-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400">
                            {item.category === 'visual' && <Eye className="w-4 h-4" />}
                            {item.category === 'audio' && <Mic className="w-4 h-4" />}
                            {item.category === 'hobbies' && <Heart className="w-4 h-4" />}
                            {item.category === 'inclusivity' && <ShieldCheck className="w-4 h-4" />}
                            {item.category === 'bio' && <FileText className="w-4 h-4" />}
                            {item.category === 'multimediaBio' && <Video className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              {item.title}
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                                +{item.maxPoints - item.points} pts
                              </span>
                            </h4>
                            <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                              {item.improvementTip}
                            </p>
                          </div>
                        </div>
                      </div>

                      {item.actionKey && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleActionClick(item.actionKey)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                          >
                            <span>{item.actionLabel || 'Fix Now'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Inclusion Tip Box */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-neutral-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-indigo-300">Why does Alt-Text & Audio matter?</strong> Dating apps with sensory descriptions enable blind, low vision, and neurodivergent daters to experience authentic connections equally.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Full Inclusivity Audit Checklist
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {report.passedCount} of {report.totalCount} Complete
                </span>
              </div>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-colors flex items-center justify-between gap-3 ${
                      item.passed
                        ? 'bg-neutral-900/60 border-neutral-800/80 text-neutral-300'
                        : 'bg-rose-950/20 border-rose-900/40 text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                          <span className={item.passed ? 'text-white' : 'text-rose-200'}>
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        item.passed 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}>
                        {item.points}/{item.maxPoints} pts
                      </span>

                      {!item.passed && item.actionKey && (
                        <button
                          onClick={() => handleActionClick(item.actionKey)}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
          <div className="text-neutral-400 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Audited against WCAG & Universal Dating standards</span>
          </div>

          <button
            onClick={() => {
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
