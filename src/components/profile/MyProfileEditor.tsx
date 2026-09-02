import React, { useState, useRef } from 'react';
import { 
  UserProfile, 
  Gender, 
  Complexion, 
  Ethnicity, 
  Religion, 
  EducationLevel, 
  RelationshipGoal,
  VideoBio,
  StatusUpdate
} from '../../types/dating';
import { 
  User, 
  Camera, 
  Video, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Check, 
  Plus, 
  X, 
  Award, 
  Heart, 
  MapPin, 
  Globe, 
  Briefcase, 
  GraduationCap,
  Eye,
  TrendingUp,
  ArrowRight,
  LogOut,
  Zap,
  Share2,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Star,
  Image as ImageIcon,
  Database
} from 'lucide-react';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';
import { PersonalAccessibilityReportModal } from './PersonalAccessibilityReportModal';
import { QuickShareStatusCard } from './QuickShareStatusCard';
import { generatePersonalAccessibilityReport } from '../../utils/accessibilityAudit';
import { PhotoUploadInput } from '../common/PhotoUploadInput';

interface MyProfileEditorProps {
  user: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onOpenVideoStudio: () => void;
  onTriggerBiometricLock: () => void;
  onLogout?: () => void;
  onPostStatus?: (status: Omit<StatusUpdate, 'id' | 'createdAt' | 'likesCount'>) => void;
  onNavigateToFeed?: () => void;
  onOpenAdminDb?: () => void;
}

const GENDERS: Gender[] = ['Woman', 'Man', 'Non-binary', 'Agender', 'Genderfluid', 'Transgender', 'Other'];

const COMPLEXIONS: Complexion[] = [
  'Fair / Porcelain',
  'Warm Beige',
  'Olive / Honey',
  'Caramel / Tan',
  'Warm Bronze',
  'Deep Brown',
  'Rich Ebony'
];

const ETHNICITIES: Ethnicity[] = [
  'African / Black',
  'Asian / East & SE Asian',
  'Asian / South Asian',
  'Hispanic / Latino',
  'Middle Eastern / Arab',
  'Native / Indigenous',
  'White / Caucasian',
  'Pacific Islander',
  'Multiracial / Mixed',
  'Other'
];

const RELIGIONS: Religion[] = [
  'Agnostic',
  'Atheist',
  'Buddhist',
  'Catholic',
  'Christian',
  'Hindu',
  'Jewish',
  'Muslim',
  'Sikh',
  'Spiritual / Eclectic',
  'Other'
];

const EDUCATION_LEVELS: EducationLevel[] = [
  'High School / Secondary',
  'Vocational / Trade School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's / Graduate",
  'Doctorate / PhD / MD / JD',
  'Self-Taught / Other'
];

const GOALS: RelationshipGoal[] = [
  'Long-term partnership',
  'Marriage / Family',
  'Meaningful dating',
  'Friendship & Connection',
  'Casual dating',
  'Open to exploring'
];

const BADGE_OPTIONS = [
  'Screen Reader Advocate',
  'ASL Signer',
  'Audio Description Supporter',
  'Neurodivergent Ally',
  'Wheelchair Ally / User',
  'Deaf / Hard of Hearing',
  'Blind / Low Vision Advocate',
  'Tactile & Sensory Friendly'
];

export const MyProfileEditor: React.FC<MyProfileEditorProps> = ({
  user,
  onSaveProfile,
  onOpenVideoStudio,
  onTriggerBiometricLock,
  onLogout,
  onPostStatus,
  onNavigateToFeed,
  onOpenAdminDb
}) => {
  const [profile, setProfile] = useState<UserProfile>(user);
  const [newHobby, setNewHobby] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [inlineShareToast, setInlineShareToast] = useState<{ message: string; content: string } | null>(null);

  const isAdmin = (profile.email && profile.email.toLowerCase() === 'simonchikondi8@gmail.com') ||
                  (profile.username && profile.username.toLowerCase() === 'admin');

  const altTextInputRef = useRef<HTMLTextAreaElement>(null);
  const hobbiesInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);

  // Live accessibility report computation
  const auditReport = generatePersonalAccessibilityReport(profile);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSaveSuccess(true);
    audioHaptics.triggerBiometricSuccess();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Instant 1-Tap Quick Share for Relationship Goal
  const handleQuickShareRelationshipGoal = (goal: RelationshipGoal) => {
    if (!onPostStatus) return;
    audioHaptics.triggerTap();
    const statusContent = `💫 Dating Intent Update: Seeking ${goal.toLowerCase()}${profile.locationCity ? ` in ${profile.locationCity}` : ''}! Open to authentic conversations, slow walks, and meaningful coffee dates. ✨`;
    
    onPostStatus({
      userId: profile.id,
      userName: profile.name,
      userAvatar: profile.photos[0] || '',
      content: statusContent,
      moodEmoji: '💫',
      location: profile.locationCity || '',
      expiresInHours: 24,
      audience: 'matches'
    });

    audioHaptics.triggerMatch();
    speechService.speak(`Relationship intent shared as status: Seeking ${goal.toLowerCase()}`);
    setInlineShareToast({
      message: `Posted intent: "${goal}"`,
      content: statusContent
    });
    setTimeout(() => setInlineShareToast(null), 6000);
  };

  // Instant 1-Tap Quick Share for Hobby
  const handleQuickShareHobby = (hobby: string) => {
    if (!onPostStatus) return;
    audioHaptics.triggerTap();
    const statusContent = `🎨 Current Passion: Deeply into ${hobby} lately! Anyone with great recommendations or up for connecting around this?`;

    onPostStatus({
      userId: profile.id,
      userName: profile.name,
      userAvatar: profile.photos[0] || '',
      content: statusContent,
      moodEmoji: '🎨',
      location: profile.locationCity || '',
      expiresInHours: 24,
      audience: 'matches'
    });

    audioHaptics.triggerMatch();
    speechService.speak(`Hobby update for ${hobby} shared to your status feed!`);
    setInlineShareToast({
      message: `Posted hobby update: "${hobby}"`,
      content: statusContent
    });
    setTimeout(() => setInlineShareToast(null), 6000);
  };

  const handleSelectReportAction = (actionKey: string) => {
    if (actionKey === 'edit_alt_text') {
      setTimeout(() => {
        altTextInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        altTextInputRef.current?.focus();
      }, 200);
    } else if (actionKey === 'add_hobbies') {
      setTimeout(() => {
        hobbiesInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        hobbiesInputRef.current?.focus();
      }, 200);
    } else if (actionKey === 'edit_bio') {
      setTimeout(() => {
        bioInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        bioInputRef.current?.focus();
      }, 200);
    } else if (actionKey === 'add_video') {
      onOpenVideoStudio();
    }
  };

  const addHobby = () => {
    if (newHobby.trim() && !profile.hobbies.includes(newHobby.trim())) {
      setProfile({
        ...profile,
        hobbies: [...profile.hobbies, newHobby.trim()]
      });
      setNewHobby('');
      audioHaptics.triggerNavigationClick();
    }
  };

  const removeHobby = (hobby: string) => {
    setProfile({
      ...profile,
      hobbies: profile.hobbies.filter(h => h !== hobby)
    });
    audioHaptics.triggerNavigationClick();
  };

  const toggleBadge = (badge: string) => {
    setProfile({
      ...profile,
      accessibilityBadges: profile.accessibilityBadges.includes(badge)
        ? profile.accessibilityBadges.filter(b => b !== badge)
        : [...profile.accessibilityBadges, badge]
    });
    audioHaptics.triggerNavigationClick();
  };

  return (
    <div id="my-profile-editor" className="w-full max-w-4xl mx-auto p-4 flex-1">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-400" />
            My Secured Dating Profile
          </h2>
          <p className="text-xs text-neutral-400">
            Rich comprehensive attributes & biometric privacy settings for optimal match suggestions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && onOpenAdminDb && (
            <button
              type="button"
              onClick={onOpenAdminDb}
              className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition"
              title="Open Cloud SQL Database Management Console"
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL Database</span>
            </button>
          )}

          <button
            type="button"
            onClick={onTriggerBiometricLock}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Lock Vault</span>
          </button>
        </div>
      </div>

      {/* Personal Accessibility Report Quick Summary Banner */}
      <div 
        id="personal-accessibility-report-banner"
        className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                className="text-neutral-800"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="url(#bannerGaugeGrad)"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 - (auditReport.overallScore / 100) * (2 * Math.PI * 22)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="bannerGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-xs font-black text-white font-mono">{auditReport.overallScore}</span>
              <span className="text-[7px] font-bold text-neutral-400">%</span>
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-rose-400" />
                <span>Personal Accessibility Report</span>
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${auditReport.tierColor}`}>
                {auditReport.tier}
              </span>
            </div>
            <p className="text-xs text-neutral-300 line-clamp-1">
              {auditReport.highPriorityRecommendations.length > 0 
                ? `Tip: ${auditReport.highPriorityRecommendations[0].title}`
                : 'All accessibility & inclusivity criteria fulfilled!'}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-open-accessibility-report"
          onClick={() => {
            audioHaptics.triggerNavigationClick();
            setIsReportModalOpen(true);
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>View Full Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Share Status Card Hub (1-Tap Turn Relationship or Hobby into Status Post) */}
      {onPostStatus && (
        <div className="mb-6">
          <QuickShareStatusCard
            user={profile}
            onPostStatus={onPostStatus}
            onNavigateToFeed={onNavigateToFeed}
          />
        </div>
      )}

      {/* Inline Quick Share Floating/Inline Notification */}
      {inlineShareToast && (
        <div 
          id="profile-inline-share-toast"
          className="mb-4 p-3.5 bg-gradient-to-r from-indigo-950 via-neutral-900 to-rose-950/80 border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xl animate-fadeIn"
        >
          <div className="flex items-center gap-2.5 text-xs text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-indigo-300">{inlineShareToast.message}</p>
              <p className="text-[11px] text-neutral-300 italic line-clamp-1">"{inlineShareToast.content}"</p>
            </div>
          </div>
          {onNavigateToFeed && (
            <button
              type="button"
              onClick={() => {
                audioHaptics.triggerTap();
                onNavigateToFeed();
              }}
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap self-end sm:self-auto"
            >
              <span>View in Feed</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Photo & Video Bio Studio Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Photo Gallery & Photo Upload Studio */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex flex-col shadow-lg relative space-y-4">
            
            {/* Primary Avatar Preview */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-28 h-28 rounded-full overflow-hidden mb-2 border-2 border-rose-500 shadow-md bg-neutral-950 flex items-center justify-center">
                {profile.photos && profile.photos.length > 0 ? (
                  <img
                    src={profile.photos[0]}
                    alt={profile.photoDescription || profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-500">
                    <User className="w-8 h-8 text-neutral-600 mb-1" />
                    <span className="text-[10px]">No Photo</span>
                  </div>
                )}
              </div>
              <h3 className="text-base font-bold text-white">{profile.name}</h3>
              <p className="text-xs text-neutral-400">{profile.jobTitle || 'Member'}</p>
              <span className="mt-1.5 text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified User Profile
              </span>
            </div>

            {/* Photo Gallery Thumbnails (if multiple photos) */}
            {profile.photos && profile.photos.length > 0 && (
              <div className="space-y-1.5 border-t border-neutral-800 pt-3">
                <label className="text-[11px] font-bold text-neutral-300 flex items-center justify-between">
                  <span>Your Photos ({profile.photos.length})</span>
                  <span className="text-[10px] text-neutral-500 font-normal">First photo is primary</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {profile.photos.map((photoUrl, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-neutral-700 bg-neutral-950">
                      <img
                        src={photoUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Primary badge */}
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-md shadow">
                          Main
                        </span>
                      )}

                      {/* Photo Actions Overlay */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const reordered = [photoUrl, ...profile.photos.filter((_, i) => i !== idx)];
                              setProfile({ ...profile, photos: reordered });
                              audioHaptics.triggerTap();
                            }}
                            title="Set as Main Profile Avatar"
                            className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = profile.photos.filter((_, i) => i !== idx);
                            setProfile({ ...profile, photos: filtered });
                            audioHaptics.triggerTap();
                          }}
                          title="Delete photo"
                          className="p-1.5 bg-neutral-800 hover:bg-red-600 text-white rounded-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add / Upload New Photo Component */}
            <div className="border-t border-neutral-800 pt-3">
              <PhotoUploadInput
                onPhotoSelected={(newPhotoUrl, alt) => {
                  const updatedPhotos = [...(profile.photos || []), newPhotoUrl];
                  setProfile({
                    ...profile,
                    photos: updatedPhotos,
                    photoDescription: alt || profile.photoDescription || `Profile photo of ${profile.name}`
                  });
                }}
                label="Add Profile Photo"
                altTextLabel="Photo Description (Alt-Text)"
                initialAltText={profile.photoDescription || ''}
                showAltTextInput={false}
              />
            </div>

            {/* Photo Visual Description (Alt-Text for Screen Readers) */}
            <div className="w-full border-t border-neutral-800 pt-3 space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Photo Alt-Text (Screen Reader Description)</span>
              </label>
              <textarea
                ref={altTextInputRef}
                rows={2}
                placeholder="e.g. Portrait smiling outdoors with warm lighting, wearing a navy jacket and glasses..."
                value={profile.photoDescription || ''}
                onChange={(e) => setProfile({ ...profile, photoDescription: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-sky-500 rounded-xl p-2 text-xs text-white placeholder-neutral-500 resize-none"
              />
              <p className="text-[9px] text-neutral-400">
                Helps blind and low-vision daters visualize your photo accurately.
              </p>
            </div>
          </div>

          {/* Video Bio Studio Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-neutral-900 to-indigo-950/30 border border-indigo-500/30 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4" />
                  Authentic Video Bio (15s Intro)
                </span>
                {profile.videoBio ? (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                    Active Video Bio
                  </span>
                ) : (
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">
                    No Video
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                {profile.videoBio 
                  ? `"${profile.videoBio.transcript}"` 
                  : "Boost your match rate by 3x! Record a short 15-second video introducing your passions, personality, and values."}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                id="btn-open-video-studio-profile"
                onClick={onOpenVideoStudio}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{profile.videoBio ? 'Watch or Re-Record Video Bio' : 'Record Video Bio Studio'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Core Personal Details */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-3">
            <User className="w-4 h-4 text-indigo-400" />
            Core Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Display Name</label>
              <input
                type="text"
                placeholder="Your full or preferred name..."
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Age</label>
              <input
                type="number"
                placeholder="e.g. 26"
                value={profile.age && profile.age > 0 ? profile.age : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setProfile({ ...profile, age: val === '' ? 0 : parseInt(val) || 0 });
                }}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Gender</label>
              <select
                value={profile.gender || ''}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as Gender })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white"
              >
                {!profile.gender && <option value="">Select Gender...</option>}
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Pronouns</label>
              <input
                type="text"
                placeholder="e.g. they/them, she/her, he/him..."
                value={profile.pronouns || ''}
                onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">City / Location</label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={profile.locationCity || ''}
                onChange={(e) => setProfile({ ...profile, locationCity: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-400 font-semibold block">Relationship Goal</label>
                {onPostStatus && profile.relationshipGoal && (
                  <button
                    type="button"
                    id="btn-quick-share-relationship-inline"
                    onClick={() => handleQuickShareRelationshipGoal(profile.relationshipGoal)}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                    title="1-Tap post this relationship goal as a status update"
                  >
                    <Zap className="w-3 h-3 fill-rose-400" />
                    <span>1-Tap Share</span>
                  </button>
                )}
              </div>
              <select
                value={profile.relationshipGoal || ''}
                onChange={(e) => setProfile({ ...profile, relationshipGoal: e.target.value as RelationshipGoal })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white"
              >
                {!profile.relationshipGoal && <option value="">Select Relationship Goal...</option>}
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-semibold block mb-1 text-xs">Bio Introduction</label>
            <textarea
              ref={bioInputRef}
              rows={3}
              placeholder="Tell daters about yourself, what you love, and what you're looking for..."
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Detailed Physical & Background Attributes */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Detailed Physical & Background Attributes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Height (cm & feet)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="cm"
                  value={profile.heightCm && profile.heightCm > 0 ? profile.heightCm : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cm = val === '' ? 0 : parseInt(val) || 0;
                    if (cm > 0) {
                      const ft = Math.floor(cm / 30.48);
                      const inches = Math.round((cm % 30.48) / 2.54);
                      setProfile({ ...profile, heightCm: cm, heightFeet: `${ft}'${inches}"` });
                    } else {
                      setProfile({ ...profile, heightCm: 0, heightFeet: '' });
                    }
                  }}
                  className="w-1/2 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
                />
                <input
                  type="text"
                  placeholder="e.g. 5'9&quot;"
                  value={profile.heightFeet || ''}
                  onChange={(e) => setProfile({ ...profile, heightFeet: e.target.value })}
                  className="w-1/2 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Weight (kg)</label>
              <input
                type="number"
                placeholder="e.g. 68"
                value={profile.weightKg && profile.weightKg > 0 ? profile.weightKg : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setProfile({ ...profile, weightKg: val === '' ? undefined : parseInt(val) || undefined });
                }}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Complexion</label>
              <select
                value={profile.complexion || ''}
                onChange={(e) => setProfile({ ...profile, complexion: e.target.value as Complexion })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white"
              >
                {!profile.complexion && <option value="">Select Complexion...</option>}
                {COMPLEXIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Race / Ethnicity</label>
              <select
                value={profile.raceEthnicity || ''}
                onChange={(e) => setProfile({ ...profile, raceEthnicity: e.target.value as Ethnicity })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white"
              >
                {!profile.raceEthnicity && <option value="">Select Ethnicity...</option>}
                {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Religion / Beliefs</label>
              <select
                value={profile.religion || ''}
                onChange={(e) => setProfile({ ...profile, religion: e.target.value as Religion })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white"
              >
                {!profile.religion && <option value="">Select Religion...</option>}
                {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Level of Education</label>
              <select
                value={profile.education || ''}
                onChange={(e) => setProfile({ ...profile, education: e.target.value as EducationLevel })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white"
              >
                {!profile.education && <option value="">Select Education...</option>}
                {EDUCATION_LEVELS.map(ed => <option key={ed} value={ed}>{ed}</option>)}
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer, Designer..."
                value={profile.jobTitle || ''}
                onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Company / Industry</label>
              <input
                type="text"
                placeholder="e.g. Tech, Healthcare, Non-profit..."
                value={profile.companyOrField || ''}
                onChange={(e) => setProfile({ ...profile, companyOrField: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Nationality</label>
              <input
                type="text"
                placeholder="e.g. American, Nigerian, Global Citizen..."
                value={profile.nationality || ''}
                onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
              />
            </div>
          </div>
        </div>

        {/* Hobbies & Accessibility Badges */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Heart className="w-4 h-4 text-rose-400" />
            Hobbies, Passions & Accessibility Community
          </h3>

          {/* Hobbies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-300 block">My Hobbies & Passions</label>
              {onPostStatus && profile.hobbies.length > 0 && (
                <button
                  type="button"
                  id="btn-quick-share-latest-hobby-inline"
                  onClick={() => handleQuickShareHobby(profile.hobbies[profile.hobbies.length - 1])}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="1-Tap post your latest hobby as a status update"
                >
                  <Zap className="w-3 h-3 fill-amber-400" />
                  <span>1-Tap Share Latest ({profile.hobbies[profile.hobbies.length - 1]})</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.hobbies.map((h, idx) => (
                <span
                  key={h}
                  className="bg-neutral-800 text-neutral-200 border border-neutral-700 px-3 py-1 rounded-xl text-xs flex items-center gap-2 group transition-all hover:border-neutral-600"
                >
                  <span>{h}</span>
                  {onPostStatus && (
                    <button
                      type="button"
                      onClick={() => handleQuickShareHobby(h)}
                      className="text-amber-400/70 hover:text-amber-300 p-0.5 rounded hover:bg-amber-400/10 transition-colors"
                      title={`1-Tap share "${h}" as status`}
                      aria-label={`Share ${h} as status`}
                    >
                      <Zap className="w-3 h-3 fill-amber-400/50 hover:fill-amber-400" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeHobby(h)}
                    className="text-neutral-400 hover:text-rose-400 ml-0.5"
                    title={`Remove ${h}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                ref={hobbiesInputRef}
                type="text"
                placeholder="Add hobby (e.g. Scuba, Chess)..."
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHobby();
                  }
                }}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={addHobby}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Accessibility Badges */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Accessibility & Inclusivity Badges (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_OPTIONS.map((badge) => {
                const isSelected = profile.accessibilityBadges.includes(badge);
                return (
                  <button
                    type="button"
                    key={badge}
                    onClick={() => toggleBadge(badge)}
                    className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800">
          {saveSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-bounce">
              <Check className="w-4 h-4" />
              Profile changes and secured attributes saved successfully!
            </span>
          ) : (
            <span className="text-xs text-neutral-400">
              All profile changes are encrypted & synchronized.
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            Save Profile
          </button>
        </div>

        {/* Account Security & Sign Out Section */}
        {onLogout && (
          <div className="p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Account & Session Security</span>
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Signed in as <span className="text-neutral-200 font-semibold">{user.name}</span> ({user.username ? `@${user.username}` : user.email || 'active session'})
              </p>
            </div>

            <button
              type="button"
              id="btn-profile-signout"
              onClick={() => {
                audioHaptics.triggerTap();
                onLogout();
              }}
              className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        )}
      </form>

      {/* Personal Accessibility Report Modal */}
      <PersonalAccessibilityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        profile={profile}
        onSelectAction={handleSelectReportAction}
      />
    </div>
  );
};
