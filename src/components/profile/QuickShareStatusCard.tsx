import React, { useState, useMemo } from 'react';
import { 
  UserProfile, 
  RelationshipGoal, 
  StatusUpdate 
} from '../../types/dating';
import { 
  Sparkles, 
  Heart, 
  Zap, 
  Share2, 
  Check, 
  ArrowRight, 
  Users, 
  Globe, 
  Lock, 
  Smile,
  Flame,
  Coffee,
  Compass,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface QuickShareStatusCardProps {
  user: UserProfile;
  onPostStatus: (status: Omit<StatusUpdate, 'id' | 'createdAt' | 'likesCount'>) => void;
  onNavigateToFeed?: () => void;
}

type QuickShareType = 'relationship' | 'hobby' | 'combined';

interface QuickShareTemplate {
  id: string;
  type: QuickShareType;
  title: string;
  badge: string;
  icon: React.ReactNode;
  emoji: string;
  getContent: (user: UserProfile, selectedHobby?: string) => string;
}

const TEMPLATES: QuickShareTemplate[] = [
  {
    id: 'rel-status-1',
    type: 'relationship',
    title: 'Relationship Intent',
    badge: 'Intent Status',
    icon: <Heart className="w-4 h-4 text-rose-400" />,
    emoji: '💫',
    getContent: (u) => 
      `💫 Dating Intent Update: Seeking ${u.relationshipGoal.toLowerCase()} in ${u.locationCity || 'the city'}! Open to authentic conversations, slow walks, and great coffee. ✨`
  },
  {
    id: 'rel-status-2',
    type: 'relationship',
    title: 'Weekend Connection',
    badge: 'Vibe Check',
    icon: <Compass className="w-4 h-4 text-sky-400" />,
    emoji: '✨',
    getContent: (u) => 
      `✨ Relationship Goal: ${u.relationshipGoal}. Ready to meet someone genuine who appreciates real chemistry and meaningful dates.`
  },
  {
    id: 'hobby-latest',
    type: 'hobby',
    title: 'Latest Hobby Update',
    badge: 'Passion Update',
    icon: <Flame className="w-4 h-4 text-amber-400" />,
    emoji: '🎨',
    getContent: (u, selHobby) => {
      const h = selHobby || u.hobbies[u.hobbies.length - 1] || 'Music & Art';
      return `🎨 Current Passion: Deeply into ${h} lately! Anyone with recommendations or up for connecting around this?`;
    }
  },
  {
    id: 'hobby-date',
    type: 'hobby',
    title: 'Hobby Date Idea',
    badge: 'Date Idea',
    icon: <Coffee className="w-4 h-4 text-emerald-400" />,
    emoji: '☕',
    getContent: (u, selHobby) => {
      const h = selHobby || u.hobbies[0] || 'Coffee & Art';
      return `☕ Weekend Activity: Planning a day around ${h} in ${u.locationCity || 'town'}. Let's turn passions into a meetup!`;
    }
  },
  {
    id: 'combined-vibe',
    type: 'combined',
    title: 'Intent & Passions',
    badge: 'Complete Vibe',
    icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
    emoji: '💖',
    getContent: (u) => {
      const topHobbies = u.hobbies.slice(0, 2).join(' & ') || 'good conversations';
      return `💖 Open for ${u.relationshipGoal.toLowerCase()} with someone who also loves ${topHobbies}. Let's chat!`;
    }
  }
];

export const QuickShareStatusCard: React.FC<QuickShareStatusCardProps> = ({
  user,
  onPostStatus,
  onNavigateToFeed
}) => {
  const [selectedType, setSelectedType] = useState<QuickShareType>('relationship');
  const [selectedHobby, setSelectedHobby] = useState<string>(
    user.hobbies[user.hobbies.length - 1] || user.hobbies[0] || 'Art & Coffee'
  );
  const [audience, setAudience] = useState<'matches' | 'close-friends' | 'public'>('matches');
  const [lastPostedContent, setLastPostedContent] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [customText, setCustomText] = useState<string>('');
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Active template based on selected tab
  const activeTemplate = useMemo(() => {
    const matched = TEMPLATES.find(t => t.type === selectedType);
    return matched || TEMPLATES[0];
  }, [selectedType]);

  // Preview content string
  const currentPreviewText = useMemo(() => {
    if (isCustomizing && customText.trim()) {
      return customText;
    }
    return activeTemplate.getContent(user, selectedHobby);
  }, [activeTemplate, user, selectedHobby, isCustomizing, customText]);

  // Handle 1-Tap Quick Publish
  const handleQuickPublish = (customContentToPost?: string, customEmoji?: string) => {
    setIsPosting(true);
    audioHaptics.triggerTap();

    const postContent = customContentToPost || currentPreviewText;
    const emoji = customEmoji || activeTemplate.emoji;

    onPostStatus({
      userId: user.id,
      userName: user.name,
      userAvatar: user.photos[0] || '',
      content: postContent,
      moodEmoji: emoji,
      location: user.locationCity || '',
      expiresInHours: 24,
      audience: audience,
      targetGroupNames: audience === 'close-friends' ? ['Close Friends'] : undefined
    });

    audioHaptics.triggerMatch();
    speechService.speak(`Quick status posted from your ${selectedType === 'relationship' ? 'relationship intent' : selectedType === 'hobby' ? 'hobby update' : 'profile'}!`);
    setLastPostedContent(postContent);
    setIsPosting(false);
    setIsCustomizing(false);

    // Reset feedback toast after 5s
    setTimeout(() => {
      setLastPostedContent(null);
    }, 6000);
  };

  return (
    <div 
      id="quick-share-status-card"
      className="bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden"
    >
      {/* Background Accent Flare */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Quick Share Status</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                1-Tap Post
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Instantly turn your relationship status or hobby update into a Micro-Moment post
            </p>
          </div>
        </div>

        {/* Audience Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-neutral-950/80 border border-neutral-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setAudience('matches')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              audience === 'matches'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Visible to All Matches"
          >
            <Users className="w-3 h-3" />
            <span>Matches</span>
          </button>
          <button
            type="button"
            onClick={() => setAudience('close-friends')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              audience === 'close-friends'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Visible to Close Friends Circle"
          >
            <Lock className="w-3 h-3" />
            <span>Close Friends</span>
          </button>
          <button
            type="button"
            onClick={() => setAudience('public')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              audience === 'public'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Visible to Public Discovery"
          >
            <Globe className="w-3 h-3" />
            <span>Public</span>
          </button>
        </div>
      </div>

      {/* Mode Tabs (Relationship Goal vs. Hobby Update vs. Combined) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          id="btn-quickshare-rel-tab"
          onClick={() => {
            setSelectedType('relationship');
            setIsCustomizing(false);
            audioHaptics.triggerTap();
          }}
          className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
            selectedType === 'relationship'
              ? 'bg-rose-950/40 border-rose-500/50 text-white shadow-md'
              : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <Heart className={`w-3.5 h-3.5 ${selectedType === 'relationship' ? 'text-rose-400 fill-rose-400/30' : 'text-neutral-400'}`} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400">Status</span>
          </div>
          <span className="text-xs font-bold text-white truncate">Relationship Goal</span>
          <span className="text-[10px] text-neutral-400 truncate">{user.relationshipGoal}</span>
        </button>

        <button
          type="button"
          id="btn-quickshare-hobby-tab"
          onClick={() => {
            setSelectedType('hobby');
            setIsCustomizing(false);
            audioHaptics.triggerTap();
          }}
          className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
            selectedType === 'hobby'
              ? 'bg-amber-950/40 border-amber-500/50 text-white shadow-md'
              : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <Flame className={`w-3.5 h-3.5 ${selectedType === 'hobby' ? 'text-amber-400 fill-amber-400/30' : 'text-neutral-400'}`} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Hobby</span>
          </div>
          <span className="text-xs font-bold text-white truncate">Latest Hobby</span>
          <span className="text-[10px] text-neutral-400 truncate">{selectedHobby}</span>
        </button>

        <button
          type="button"
          id="btn-quickshare-combined-tab"
          onClick={() => {
            setSelectedType('combined');
            setIsCustomizing(false);
            audioHaptics.triggerTap();
          }}
          className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
            selectedType === 'combined'
              ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-md'
              : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <Sparkles className={`w-3.5 h-3.5 ${selectedType === 'combined' ? 'text-indigo-400 fill-indigo-400/30' : 'text-neutral-400'}`} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Combined</span>
          </div>
          <span className="text-xs font-bold text-white truncate">Intent + Passions</span>
          <span className="text-[10px] text-neutral-400 truncate">All-in-one Vibe</span>
        </button>
      </div>

      {/* Hobby Selector dropdown if hobby tab is active */}
      {selectedType === 'hobby' && user.hobbies.length > 1 && (
        <div className="flex items-center gap-2 text-xs bg-neutral-950/60 p-2.5 rounded-2xl border border-neutral-800">
          <label className="text-neutral-400 font-semibold text-[11px] whitespace-nowrap">Choose Hobby to Share:</label>
          <div className="flex flex-wrap gap-1.5">
            {user.hobbies.map((h) => (
              <button
                type="button"
                key={h}
                onClick={() => {
                  setSelectedHobby(h);
                  setIsCustomizing(false);
                  audioHaptics.triggerTap();
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                  selectedHobby === h
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-indigo-400" />
            <span>Post Preview ({activeTemplate.badge})</span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (!isCustomizing) {
                setCustomText(currentPreviewText);
                setIsCustomizing(true);
              } else {
                setIsCustomizing(false);
              }
            }}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer"
          >
            {isCustomizing ? 'Reset to Generated' : 'Edit Text'}
          </button>
        </div>

        {isCustomizing ? (
          <textarea
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Customize your status message..."
            className="w-full bg-neutral-950 border border-indigo-500/50 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
          />
        ) : (
          <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-3.5 text-xs text-neutral-200 leading-relaxed font-medium flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">{activeTemplate.emoji}</span>
            <p className="flex-1 italic">{currentPreviewText}</p>
          </div>
        )}
      </div>

      {/* 1-Tap Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 w-full sm:w-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span>Expires in 24 hours • Interested daters can connect in 1 tap</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            id="btn-quick-publish-status"
            disabled={isPosting}
            onClick={() => handleQuickPublish()}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isPosting ? 'Publishing...' : '1-Tap Quick Share'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {lastPostedContent && (
        <div 
          id="quickshare-success-banner"
          className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fadeIn"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="line-clamp-1">Status Published Live: "{lastPostedContent}"</span>
          </div>

          {onNavigateToFeed && (
            <button
              type="button"
              id="btn-view-posted-feed"
              onClick={() => {
                audioHaptics.triggerTap();
                onNavigateToFeed();
              }}
              className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap self-end sm:self-auto"
            >
              <span>View in Feed</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
