import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Sliders, ShieldCheck, User, Bell, FileText, WifiOff, Calendar, LogOut } from 'lucide-react';
import { UserProfile } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { draftSyncService, SyncServiceState } from '../../services/draftSyncService';
import hubbAppIcon from '../../assets/images/hubb-app-icon.jpg';

interface HeaderProps {
  currentUser: UserProfile;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  notificationCount?: number;
  datingRequestsCount?: number;
  onOpenNotifications?: () => void;
  onOpenDrafts?: () => void;
  onOpenDatingRequests?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  notificationCount = 0,
  datingRequestsCount = 0,
  onOpenNotifications,
  onOpenDrafts,
  onOpenDatingRequests,
  onLogout
}) => {
  const [syncState, setSyncState] = useState<SyncServiceState>(draftSyncService.getState());

  useEffect(() => {
    const unsub = draftSyncService.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsub();
  }, []);

  return (
    <header className="bg-neutral-950/80 border-b border-neutral-800/80 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Inclusivity Badge */}
        <div 
          onClick={() => onSelectTab('discover')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-2xl overflow-hidden border border-red-500/50 shadow-md group-hover:scale-105 transition-transform bg-neutral-900 flex-shrink-0">
            <img
              src={hubbAppIcon}
              alt="hubb logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5 leading-none">
              hubb <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-500/40 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Universal</span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium tracking-tight">
              Accessible Dating
            </p>
          </div>
        </div>

        {/* Action Controls & User Mini Profile Badge */}
        <div className="flex items-center gap-2.5">
          {/* Dating Requests Quick Button */}
          <button
            id="btn-header-dating-requests"
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              if (onOpenDatingRequests) {
                onOpenDatingRequests();
              } else {
                onSelectTab('requests');
              }
            }}
            aria-label={`Open dating requests (${datingRequestsCount} pending)`}
            title="Dating Requests & Meetup Plans"
            className={`relative p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40'
                : datingRequestsCount > 0
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900/80'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {datingRequestsCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-600 text-white leading-tight border border-neutral-950">
                {datingRequestsCount}
              </span>
            )}
          </button>

          {/* Drafts / Outbox Quick Trigger */}
          {onOpenDrafts && (
            <button
              id="btn-header-drafts"
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                onOpenDrafts();
              }}
              aria-label={`Drafts and Outbox (${syncState.totalDraftsCount} saved, ${syncState.queuedCount} queued)`}
              title={!syncState.isOnline ? "Offline Mode active - drafts saved locally" : "Saved Drafts & Sync Queue"}
              className={`relative p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                !syncState.isOnline
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  : syncState.totalDraftsCount > 0
                  ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/80'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              {!syncState.isOnline ? (
                <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {syncState.totalDraftsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white leading-tight">
                  {syncState.totalDraftsCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Bell */}
          {onOpenNotifications && (
            <button
              id="btn-open-notifications"
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                onOpenNotifications();
              }}
              aria-label={`Open partner notifications (${notificationCount} unread)`}
              className="relative p-2 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[9px] font-black animate-pulse border border-neutral-950">
                  {notificationCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
            aria-label="View your profile"
          >
            <img
              src={currentUser.photos[0]}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-rose-500/60"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-semibold text-neutral-200 hidden sm:inline">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>

          {onLogout && (
            <button
              id="btn-header-logout"
              onClick={() => {
                audioHaptics.triggerTap();
                onLogout();
              }}
              title="Sign Out / Switch Account"
              aria-label="Sign Out or Switch Account"
              className="p-2 rounded-2xl bg-neutral-900 hover:bg-rose-950/80 hover:text-rose-300 border border-neutral-800 hover:border-rose-500/40 text-neutral-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


