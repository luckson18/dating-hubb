import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smile, 
  MapPin, 
  Clock, 
  Lock, 
  Users, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Check,
  FileText,
  WifiOff,
  CloudOff,
  Trash2
} from 'lucide-react';
import { StatusUpdate, StatusDraft } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { draftSyncService, SyncServiceState } from '../../services/draftSyncService';
import { speechService } from '../../services/speechService';

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostStatus: (status: Omit<StatusUpdate, 'id' | 'createdAt' | 'likesCount'>) => void;
  currentUserName: string;
  currentUserAvatar: string;
  initialDraft?: StatusDraft | null;
}

const MOODS = ['☕ Relaxing', '🎵 Listening to Music', '🧗‍♀️ Active & Outdoor', '🌿 Gardening', '📚 Reading & Tea', '✨ Feeling Creative', '🔭 Stargazing', '🍕 Food Hunt'];

const PRESET_GROUPS = [
  'Close Friends',
  'All Matches',
  'Accessibility Advocates',
  'Outdoor & Sports Circle',
  'Tech & Gamers',
  'Art & Music Lovers'
];

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  isOpen,
  onClose,
  onPostStatus,
  currentUserName,
  currentUserAvatar,
  initialDraft
}) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('✨ Feeling Creative');
  const [location, setLocation] = useState('San Francisco, CA');
  const [audience, setAudience] = useState<'public' | 'matches' | 'close-friends' | 'custom-group'>('matches');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['Close Friends']);
  const [expiresHours, setExpiresHours] = useState<number>(24);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [syncState, setSyncState] = useState<SyncServiceState>(draftSyncService.getState());

  // Load draft or initial state on open
  useEffect(() => {
    if (!isOpen) return;

    const unsub = draftSyncService.subscribe((state) => {
      setSyncState(state);
    });

    if (initialDraft) {
      setContent(initialDraft.content || '');
      if (initialDraft.moodEmoji) {
        const found = MOODS.find(m => m.startsWith(initialDraft.moodEmoji!));
        if (found) setMood(found);
      }
      if (initialDraft.location) setLocation(initialDraft.location);
      if (initialDraft.audience) setAudience(initialDraft.audience);
      if (initialDraft.targetGroupNames) setSelectedGroups(initialDraft.targetGroupNames);
    } else {
      // Check if there is an unsaved status draft
      const latestDraft = draftSyncService.getLatestStatusDraft();
      if (latestDraft && latestDraft.content) {
        setContent(latestDraft.content);
        if (latestDraft.moodEmoji) {
          const found = MOODS.find(m => m.startsWith(latestDraft.moodEmoji!));
          if (found) setMood(found);
        }
        if (latestDraft.location) setLocation(latestDraft.location);
        if (latestDraft.audience) setAudience(latestDraft.audience);
        if (latestDraft.targetGroupNames) setSelectedGroups(latestDraft.targetGroupNames);
      }
    }

    return () => unsub();
  }, [isOpen, initialDraft]);

  // Auto-save draft when content changes
  useEffect(() => {
    if (!isOpen) return;
    if (!content.trim()) return;

    const timer = setTimeout(() => {
      draftSyncService.saveStatusDraft({
        userId: 'user-me',
        userName: currentUserName,
        userAvatar: currentUserAvatar,
        content: content.trim(),
        moodEmoji: mood.split(' ')[0],
        location: location.trim(),
        expiresInHours: expiresHours,
        audience,
        targetGroupNames: audience === 'custom-group' ? selectedGroups : undefined
      });
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 2000);
    }, 600);

    return () => clearTimeout(timer);
  }, [content, mood, location, audience, selectedGroups, expiresHours, isOpen, currentUserName, currentUserAvatar]);

  if (!isOpen) return null;

  const handleSaveDraftManually = () => {
    if (!content.trim()) return;
    draftSyncService.saveStatusDraft({
      userId: 'user-me',
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      content: content.trim(),
      moodEmoji: mood.split(' ')[0],
      location: location.trim(),
      expiresInHours: expiresHours,
      audience,
      targetGroupNames: audience === 'custom-group' ? selectedGroups : undefined
    });
    audioHaptics.triggerSuccessChime();
    speechService.speak("Status draft saved locally.");
    onClose();
  };

  const handleDiscardDraft = () => {
    draftSyncService.clearAllStatusDrafts();
    setContent('');
    audioHaptics.triggerNavigationClick();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const payload = {
      userId: 'user-me',
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      content: content.trim(),
      moodEmoji: mood.split(' ')[0],
      location: location.trim(),
      expiresInHours: expiresHours,
      audience,
      targetGroupNames: audience === 'custom-group' ? selectedGroups : undefined
    };

    if (!syncState.isOnline) {
      // Queue offline status update
      draftSyncService.queueStatusUpdate(payload);
      speechService.speak("Offline mode. Status draft queued and will auto-publish when online.");
    } else {
      // Clear draft on successful post
      draftSyncService.clearAllStatusDrafts();
      onPostStatus(payload);
      audioHaptics.triggerMessageSent();
    }

    onClose();
  };

  const toggleGroup = (grp: string) => {
    setSelectedGroups(prev => prev.includes(grp) ? prev.filter(g => g !== grp) : [...prev, grp]);
  };

  return (
    <div 
      id="create-status-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-status-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="create-status-title" className="text-sm font-bold text-white">
                  Share a Status Update
                </h2>
                {!syncState.isOnline && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    Offline Outbox
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                Broadcast micro-moments with custom audience circles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline notice bar */}
        {!syncState.isOnline && (
          <div className="px-4 py-2 bg-amber-950/60 border-b border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
            <CloudOff className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <span>You are offline. Your status will be saved in local drafts and automatically published when you reconnect.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Status Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Status Content
              </label>
              {draftSavedToast && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
                  <Check className="w-3 h-3" />
                  Draft auto-saved
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening right now? (e.g., Grabbing matcha in SOMA, going to the accessible art museum...)"
              autoFocus
              className="w-full bg-neutral-800/80 border border-neutral-700 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Mood Selector */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              Current Mood / Activity
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    setMood(m);
                    audioHaptics.triggerNavigationClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    mood === m
                      ? 'bg-amber-400 text-neutral-950 font-bold border-amber-300 shadow-sm'
                      : 'bg-neutral-800/60 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Location Tag */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Location Tag (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Yerba Buena Gardens, Mission District"
              className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Granular Audience & Privacy Controls */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Audience & Sharing Privacy
            </label>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAudience('matches')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  audience === 'matches'
                    ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500 text-white'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Matches Only</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5">Shared with people you've matched with</p>
              </button>

              <button
                type="button"
                onClick={() => setAudience('close-friends')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  audience === 'close-friends'
                    ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500 text-white'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Close Friends</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5">Inner circle and favorite connections</p>
              </button>

              <button
                type="button"
                onClick={() => setAudience('custom-group')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  audience === 'custom-group'
                    ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500 text-white'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>Selected Groups</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5">Choose specific circles & affinity tags</p>
              </button>

              <button
                type="button"
                onClick={() => setAudience('public')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  audience === 'public'
                    ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500 text-white'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public Nearby</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5">Visible to anyone within proximity</p>
              </button>
            </div>

            {/* Custom Group selection if Selected Groups chosen */}
            {audience === 'custom-group' && (
              <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-2">
                <span className="text-[11px] font-semibold text-neutral-300 block">
                  Select Target Affinity Circles:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_GROUPS.map((grp) => {
                    const isSelected = selectedGroups.includes(grp);
                    return (
                      <button
                        type="button"
                        key={grp}
                        onClick={() => toggleGroup(grp)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-neutral-950 font-bold border-amber-300'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {grp}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Expiration Timer */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-800/40 border border-neutral-800">
            <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Expires automatically in 24 hours
            </span>
            <span className="text-[11px] font-mono font-bold text-indigo-400">24h Story</span>
          </div>

          {/* Submit & Draft Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800/80">
            <div className="flex items-center gap-2">
              {content.trim() && (
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  title="Discard this draft"
                  className="p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Discard</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveDraftManually}
                disabled={!content.trim()}
                className="px-3 py-2 rounded-xl border border-neutral-700 hover:border-neutral-600 disabled:opacity-40 text-neutral-300 text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save Draft</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-neutral-700 text-neutral-300 text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!content.trim()}
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  !syncState.isOnline
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                } disabled:opacity-50`}
              >
                {!syncState.isOnline ? (
                  <>
                    <CloudOff className="w-3.5 h-3.5" />
                    <span>Queue Offline Status</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Publish Status</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
