import React, { useState, useEffect, useRef } from 'react';
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
  Trash2,
  Image as ImageIcon,
  Camera,
  Upload,
  Eye,
  ImagePlus
} from 'lucide-react';
import { StatusUpdate, StatusDraft } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { draftSyncService, SyncServiceState } from '../../services/draftSyncService';

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
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoDescription, setPhotoDescription] = useState<string>('');
  const [showPhotoSection, setShowPhotoSection] = useState<boolean>(false);
  const [photoInputUrl, setPhotoInputUrl] = useState<string>('');
  const [mood, setMood] = useState('✨ Feeling Creative');
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState<'public' | 'matches' | 'close-friends' | 'custom-group'>('matches');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['Close Friends']);
  const [expiresHours, setExpiresHours] = useState<number>(24);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [syncState, setSyncState] = useState<SyncServiceState>(draftSyncService.getState());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load draft or initial state on open
  useEffect(() => {
    if (!isOpen) return;

    const unsub = draftSyncService.subscribe((state) => {
      setSyncState(state);
    });

    if (initialDraft) {
      setContent(initialDraft.content || '');
      if (initialDraft.photoUrl || initialDraft.mediaUrl) {
        setPhotoUrl(initialDraft.photoUrl || initialDraft.mediaUrl || '');
        setPhotoDescription(initialDraft.photoDescription || '');
        setShowPhotoSection(true);
      }
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
      if (latestDraft && (latestDraft.content || latestDraft.photoUrl)) {
        setContent(latestDraft.content || '');
        if (latestDraft.photoUrl || latestDraft.mediaUrl) {
          setPhotoUrl(latestDraft.photoUrl || latestDraft.mediaUrl || '');
          setPhotoDescription(latestDraft.photoDescription || '');
          setShowPhotoSection(true);
        }
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

  // Auto-save draft when content or photo changes
  useEffect(() => {
    if (!isOpen) return;
    if (!content.trim() && !photoUrl) return;

    const timer = setTimeout(() => {
      draftSyncService.saveStatusDraft({
        userId: 'user-me',
        userName: currentUserName,
        userAvatar: currentUserAvatar,
        content: content.trim(),
        photoUrl: photoUrl || undefined,
        photoDescription: photoDescription || undefined,
        mediaUrl: photoUrl || undefined,
        mediaType: photoUrl ? 'image' : undefined,
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
  }, [content, photoUrl, photoDescription, mood, location, audience, selectedGroups, expiresHours, isOpen, currentUserName, currentUserAvatar]);

  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoUrl(compressed);
          setShowPhotoSection(true);
          audioHaptics.triggerSuccessChime();
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSaveDraftManually = () => {
    if (!content.trim() && !photoUrl) return;
    draftSyncService.saveStatusDraft({
      userId: 'user-me',
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      content: content.trim(),
      photoUrl: photoUrl || undefined,
      photoDescription: photoDescription || undefined,
      mediaUrl: photoUrl || undefined,
      mediaType: photoUrl ? 'image' : undefined,
      moodEmoji: mood.split(' ')[0],
      location: location.trim(),
      expiresInHours: expiresHours,
      audience,
      targetGroupNames: audience === 'custom-group' ? selectedGroups : undefined
    });
    audioHaptics.triggerSuccessChime();
    onClose();
  };

  const handleDiscardDraft = () => {
    draftSyncService.clearAllStatusDrafts();
    setContent('');
    setPhotoUrl('');
    setPhotoDescription('');
    setShowPhotoSection(false);
    audioHaptics.triggerNavigationClick();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !photoUrl) return;

    const finalContent = content.trim() || (photoDescription ? photoDescription : `${mood.split(' ')[0]} Sharing a photo`);

    const payload: Omit<StatusUpdate, 'id' | 'createdAt' | 'likesCount'> = {
      userId: 'user-me',
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      content: finalContent,
      photoUrl: photoUrl || undefined,
      photoDescription: photoDescription || undefined,
      mediaUrl: photoUrl || undefined,
      mediaType: photoUrl ? 'image' : undefined,
      moodEmoji: mood.split(' ')[0],
      location: location.trim(),
      expiresInHours: expiresHours,
      audience,
      targetGroupNames: audience === 'custom-group' ? selectedGroups : undefined
    };

    if (!syncState.isOnline) {
      // Queue offline status update
      draftSyncService.queueStatusUpdate(payload);
    } else {
      // Clear draft on successful post
      draftSyncService.clearAllStatusDrafts();
      onPostStatus(payload);
      audioHaptics.triggerMessageSent();
    }

    setContent('');
    setPhotoUrl('');
    setPhotoDescription('');
    setShowPhotoSection(false);
    onClose();
  };

  const toggleGroup = (grp: string) => {
    setSelectedGroups(prev => prev.includes(grp) ? prev.filter(g => g !== grp) : [...prev, grp]);
  };

  if (!isOpen) return null;

  const canSubmit = Boolean(content.trim() || photoUrl);

  return (
    <div 
      id="create-status-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-status-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl w-full max-w-lg max-h-[min(90vh,780px)] shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Top Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60 flex-shrink-0">
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
          <div className="px-4 py-2 bg-amber-950/60 border-b border-amber-500/30 flex items-center gap-2 text-xs text-amber-200 flex-shrink-0">
            <CloudOff className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <span>You are offline. Your status will be saved in local drafts and automatically published when you reconnect.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Status Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Status Caption & Thoughts
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
              placeholder="What's happening right now? (e.g., Working on ceramic mugs at the studio, fresh cold brew in hand...)"
              autoFocus
              className="w-full bg-neutral-800/80 border border-neutral-700 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Photo Attachment Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Photo Attachment</span>
                {photoUrl && (
                  <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                    Photo Added
                  </span>
                )}
              </label>
              {!photoUrl && !showPhotoSection && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPhotoSection(true);
                    audioHaptics.triggerTap();
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>+ Attach Photo</span>
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processUploadedFile(file);
              }}
            />

            {/* Active Photo Preview */}
            {photoUrl ? (
              <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-2.5 animate-fadeIn">
                <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 max-h-48 flex items-center justify-center">
                  <img
                    src={photoUrl}
                    alt={photoDescription || "Status update photo"}
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover object-center"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 bg-black/70 hover:bg-black text-white rounded-lg text-xs font-semibold backdrop-blur-sm cursor-pointer"
                      title="Change photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('');
                        setPhotoDescription('');
                        audioHaptics.triggerTap();
                      }}
                      className="p-1.5 bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-500/40 rounded-lg text-xs font-semibold backdrop-blur-sm cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Alt-text visual description for accessibility */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1 mb-1">
                    <Eye className="w-3 h-3 text-indigo-400" />
                    <span>Visual Alt-Text Description (Screen Reader Accessible)</span>
                  </label>
                  <input
                    type="text"
                    value={photoDescription}
                    onChange={(e) => setPhotoDescription(e.target.value)}
                    placeholder="Describe what's in your photo for screen reader users..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : showPhotoSection ? (
              <div className="p-3.5 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-3 animate-fadeIn">
                {/* Upload & URL Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-rose-400" />
                    <span>Choose Local Image</span>
                  </button>
                </div>

                {/* Direct Image URL input */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={photoInputUrl}
                    onChange={(e) => setPhotoInputUrl(e.target.value)}
                    placeholder="Or paste an image URL (https://...)"
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    disabled={!photoInputUrl.trim()}
                    onClick={() => {
                      if (photoInputUrl.trim()) {
                        setPhotoUrl(photoInputUrl.trim());
                        setPhotoInputUrl('');
                        audioHaptics.triggerSuccessChime();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ) : null}
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
              placeholder="e.g. City, neighborhood, or venue"
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
          <div className="pt-3 sticky bottom-0 bg-neutral-900/95 backdrop-blur-md -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              {canSubmit && (
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
                disabled={!canSubmit}
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
                disabled={!canSubmit}
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
