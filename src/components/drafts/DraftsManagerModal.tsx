import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Trash2, 
  Send, 
  Sparkles, 
  MapPin, 
  Mic, 
  Clock, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Check, 
  Copy, 
  ArrowUpRight, 
  AlertCircle,
  MessageSquare,
  Globe,
  Lock,
  Users,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { MessageDraft, StatusDraft, SyncQueueItem, SharedLocation } from '../../types/dating';
import { draftSyncService, SyncServiceState } from '../../services/draftSyncService';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface DraftsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMessageDraft: (draft: MessageDraft) => void;
  onSelectStatusDraft: (draft: StatusDraft) => void;
  onForceSync: () => void;
}

export const DraftsManagerModal: React.FC<DraftsManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectMessageDraft,
  onSelectStatusDraft,
  onForceSync
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'statuses' | 'queue'>('all');
  const [syncState, setSyncState] = useState<SyncServiceState>(draftSyncService.getState());
  const [messageDrafts, setMessageDrafts] = useState<MessageDraft[]>([]);
  const [statusDrafts, setStatusDrafts] = useState<StatusDraft[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Refresh drafts data on mount / service event
  const refreshData = () => {
    setSyncState(draftSyncService.getState());
    setMessageDrafts(draftSyncService.getAllMessageDrafts());
    setStatusDrafts(draftSyncService.getAllStatusDrafts());
    setSyncQueue(draftSyncService.getQueuedItems());
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshData();

    const unsubscribe = draftSyncService.subscribe((state) => {
      setSyncState(state);
      setMessageDrafts(draftSyncService.getAllMessageDrafts());
      setStatusDrafts(draftSyncService.getAllStatusDrafts());
      setSyncQueue(draftSyncService.getQueuedItems());
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteMessageDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    draftSyncService.deleteMessageDraft(draftId);
    audioHaptics.triggerNavigationClick();
    refreshData();
  };

  const handleDeleteStatusDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    draftSyncService.deleteStatusDraft(draftId);
    audioHaptics.triggerNavigationClick();
    refreshData();
  };

  const handleRemoveQueueItem = (queueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    draftSyncService.removeQueuedItem(queueId);
    audioHaptics.triggerNavigationClick();
    refreshData();
  };

  const handleCopyText = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    audioHaptics.triggerNavigationClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSimulatedOffline = () => {
    draftSyncService.setSimulatedOffline(!syncState.isSimulatedOffline);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const totalItemCount = messageDrafts.length + statusDrafts.length + syncQueue.length;

  return (
    <div 
      id="drafts-manager-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drafts-manager-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="drafts-manager-title" className="text-base font-bold text-white">
                  Drafts & Offline Outbox
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                  {totalItemCount} total
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Locally saved content & offline items waiting for auto-sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Network Status Toggle Button */}
            <button
              onClick={handleToggleSimulatedOffline}
              title={syncState.isSimulatedOffline ? "Turn Offline Mode OFF" : "Simulate Offline Mode (Airplane Mode)"}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                syncState.isOnline
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/70 border-amber-500/50 text-amber-300 hover:bg-amber-900/70'
              }`}
            >
              {syncState.isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Offline Mode</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offline Sync Banner if offline or items pending */}
        {(!syncState.isOnline || syncQueue.length > 0) && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-950/80 via-neutral-900 to-indigo-950/80 border-b border-amber-500/30 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
              <span className="text-amber-200">
                {!syncState.isOnline 
                  ? 'Device is offline. All changes are saved locally and will auto-sync once connected.' 
                  : `${syncQueue.length} item${syncQueue.length > 1 ? 's' : ''} queued for auto-sync`}
              </span>
            </div>

            {syncState.isOnline && syncQueue.length > 0 && (
              <button
                onClick={() => {
                  onForceSync();
                  refreshData();
                }}
                disabled={syncState.isSyncing}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                <span>{syncState.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            )}
          </div>
        )}

        {/* Tabs Filter */}
        <div className="p-2 border-b border-neutral-800 bg-neutral-950/40 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
              {totalItemCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Drafts</span>
            {messageDrafts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                {messageDrafts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('statuses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'statuses'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Status Drafts</span>
            {statusDrafts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                {statusDrafts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Sync Queue</span>
            {syncQueue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-mono">
                {syncQueue.length}
              </span>
            )}
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[60vh]">
          {/* Empty State */}
          {totalItemCount === 0 && (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center border border-neutral-700">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-300">No Saved Drafts</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                  When you type messages or compose status updates offline, they are automatically stored here and synced when connection returns.
                </p>
              </div>
            </div>
          )}

          {/* Sync Queue Items Section */}
          {(activeTab === 'all' || activeTab === 'queue') && syncQueue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Offline Sync Queue ({syncQueue.length})
                </h3>
                <button
                  onClick={() => {
                    draftSyncService.clearEntireQueue();
                    refreshData();
                  }}
                  className="text-[11px] text-neutral-500 hover:text-rose-400 cursor-pointer"
                >
                  Clear Queue
                </button>
              </div>

              {syncQueue.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/30 via-neutral-900 to-neutral-900 border border-amber-500/40 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                        {item.type === 'message' ? '💬 Chat Message' : '🌟 Status Update'}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Queued {formatTimeAgo(item.queuedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'syncing' 
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                          : item.status === 'failed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {item.status === 'syncing' ? 'Syncing...' : item.status === 'failed' ? 'Failed' : 'Pending Auto-Sync'}
                      </span>

                      <button
                        onClick={(e) => handleRemoveQueueItem(item.id, e)}
                        title="Remove from queue"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-200 line-clamp-2">
                    {item.type === 'message' ? item.payload?.message?.text : item.payload?.status?.content}
                  </p>

                  {item.type === 'message' && item.payload?.recipient && (
                    <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                      <img 
                        src={item.payload.recipient.avatar} 
                        alt={item.payload.recipient.name} 
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>To: {item.payload.recipient.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message Drafts Section */}
          {(activeTab === 'all' || activeTab === 'messages') && messageDrafts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Message Drafts ({messageDrafts.length})
              </h3>

              {messageDrafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => {
                    onSelectMessageDraft(draft);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 hover:border-indigo-500/50 hover:bg-neutral-800/40 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={draft.recipientAvatar} 
                        alt={draft.recipientName}
                        className="w-6 h-6 rounded-full object-cover border border-neutral-700" 
                      />
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {draft.recipientName}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        • {formatTimeAgo(draft.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleCopyText(draft.id, draft.text, e)}
                        title="Copy draft text"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      >
                        {copiedId === draft.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => handleDeleteMessageDraft(draft.id, e)}
                        title="Delete draft"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="p-1.5 rounded-lg text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed bg-neutral-900/80 p-2 rounded-xl border border-neutral-800/80">
                    {draft.text}
                  </p>

                  {draft.location && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>Meetup attached: {draft.location.placeName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Status Drafts Section */}
          {(activeTab === 'all' || activeTab === 'statuses') && statusDrafts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Status Update Drafts ({statusDrafts.length})
              </h3>

              {statusDrafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => {
                    onSelectStatusDraft(draft);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{draft.moodEmoji || '✨'}</span>
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        Status Draft
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        • {formatTimeAgo(draft.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {draft.audience}
                      </span>

                      <button
                        onClick={(e) => handleCopyText(draft.id, draft.content, e)}
                        title="Copy status text"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      >
                        {copiedId === draft.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => handleDeleteStatusDraft(draft.id, e)}
                        title="Delete draft"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="p-1.5 rounded-lg text-amber-400 group-hover:translate-x-0.5 transition-transform">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed bg-neutral-900/80 p-2 rounded-xl border border-neutral-800/80">
                    {draft.content}
                  </p>

                  {draft.location && (
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{draft.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Encrypted local storage on this device</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
