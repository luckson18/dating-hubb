import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  Sliders
} from 'lucide-react';
import { draftSyncService, SyncServiceState } from '../../services/draftSyncService';
import { audioHaptics } from '../../services/audioHaptics';

interface OfflineNetworkBannerProps {
  onOpenDraftsModal: () => void;
  onForceSync: () => void;
}

export const OfflineNetworkBanner: React.FC<OfflineNetworkBannerProps> = ({
  onOpenDraftsModal,
  onForceSync
}) => {
  const [syncState, setSyncState] = useState<SyncServiceState>(draftSyncService.getState());
  const [showSyncSuccessToast, setShowSyncSuccessToast] = useState(false);

  useEffect(() => {
    const unsubscribe = draftSyncService.subscribe((state, eventType) => {
      setSyncState(state);
      if (eventType === 'sync_complete' && state.lastSyncedAt) {
        setShowSyncSuccessToast(true);
        setTimeout(() => setShowSyncSuccessToast(false), 4000);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleOfflineSimulation = () => {
    draftSyncService.setSimulatedOffline(!syncState.isSimulatedOffline);
  };

  // If online, not syncing, no queue, and no recent sync toast, don't show intrusive banner
  const isQuiet = syncState.isOnline && syncState.queuedCount === 0 && !syncState.isSyncing && !showSyncSuccessToast;

  if (isQuiet) {
    return null;
  }

  return (
    <div 
      id="offline-network-banner"
      className={`w-full border-b transition-all duration-300 py-2 px-4 z-30 ${
        showSyncSuccessToast
          ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
          : !syncState.isOnline
          ? 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-md'
          : syncState.isSyncing
          ? 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
          : 'bg-neutral-900/90 border-neutral-700/60 text-neutral-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Side: Status Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          {!syncState.isOnline ? (
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex-shrink-0 animate-pulse">
              <WifiOff className="w-4 h-4" />
            </div>
          ) : syncState.isSyncing ? (
            <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex-shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          ) : showSyncSuccessToast ? (
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700 flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          )}

          <div className="text-xs">
            {!syncState.isOnline ? (
              <div>
                <span className="font-bold text-amber-300">
                  {syncState.isSimulatedOffline ? 'Offline Mode (Simulated)' : 'Device Offline'}
                </span>
                <span className="text-amber-300/80 ml-1.5 hidden sm:inline">
                  — Messages & status posts are saved in local drafts and auto-sync when online.
                </span>
                {syncState.queuedCount > 0 && (
                  <span className="ml-1.5 font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[10px]">
                    {syncState.queuedCount} waiting
                  </span>
                )}
              </div>
            ) : syncState.isSyncing ? (
              <span className="font-bold text-indigo-300">
                Auto-syncing {syncState.queuedCount} pending offline draft{syncState.queuedCount > 1 ? 's' : ''}...
              </span>
            ) : showSyncSuccessToast ? (
              <span className="font-bold text-emerald-300">
                ✓ All offline messages & status drafts synced successfully!
              </span>
            ) : (
              <span>
                {syncState.queuedCount} item{syncState.queuedCount > 1 ? 's' : ''} queued for sync.
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Drafts Manager Button */}
          <button
            id="btn-banner-view-drafts"
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              onOpenDraftsModal();
            }}
            className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-black/60 text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Drafts ({syncState.totalDraftsCount})</span>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
          </button>

          {/* Force Sync Button if Online & has pending items */}
          {syncState.isOnline && syncState.queuedCount > 0 && !syncState.isSyncing && (
            <button
              id="btn-banner-force-sync"
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                onForceSync();
              }}
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Auto-Sync Now</span>
            </button>
          )}

          {/* Toggle Simulator Button */}
          <button
            id="btn-toggle-sim-offline"
            onClick={handleToggleOfflineSimulation}
            title={syncState.isSimulatedOffline ? "Disable simulated offline mode" : "Enable simulated offline mode to test drafting"}
            className="px-2 py-1 rounded-xl bg-black/30 hover:bg-black/50 text-[10px] font-semibold text-neutral-300 hover:text-white border border-white/10 cursor-pointer transition-all"
          >
            {syncState.isSimulatedOffline ? 'Turn Online' : 'Simulate Offline'}
          </button>
        </div>
      </div>
    </div>
  );
};
