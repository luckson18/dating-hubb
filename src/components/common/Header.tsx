import React, { useState, useEffect } from 'react';
import { Bell, FileText, WifiOff, Calendar, LogOut, User, Database, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { draftSyncService, SyncServiceState } from '../../services/draftSyncService';
import { HubbLogo } from './HubbLogo';

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
  const isAdmin = (currentUser.email && currentUser.email.toLowerCase() === 'simonchikondi8@gmail.com') ||
                  (currentUser.username && currentUser.username.toLowerCase() === 'admin');

  useEffect(() => {
    const unsub = draftSyncService.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsub();
  }, []);

  return (
    <header className="bg-neutral-950/85 border-b border-neutral-800/80 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Vector Logo & Inclusivity Badge */}
        <div 
          onClick={() => onSelectTab('discover')}
          className="cursor-pointer group select-none"
        >
          <HubbLogo size="md" showBadge={true} />
        </div>

        {/* Action Controls & User Mini Profile Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Admin Cloud SQL Console Access */}
          {isAdmin && (
            <button
              id="btn-header-admin-db"
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                onSelectTab('admin-db');
              }}
              title="Cloud SQL Database Management (Admin Only)"
              className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admin-db'
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-purple-950/70 hover:bg-purple-900/80 border-purple-500/40 text-purple-300'
              }`}
            >
              <Database className="w-4 h-4 text-purple-300" />
              <span className="text-[11px] font-bold hidden sm:inline">SQL DB</span>
            </button>
          )}

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

          {/* User Mini Profile Avatar */}
          <button
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
            aria-label="View or edit your profile"
          >
            {currentUser.photos && currentUser.photos[0] ? (
              <img
                src={currentUser.photos[0]}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-rose-500/60"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-700">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-xs font-semibold text-neutral-200 hidden sm:inline">
              {currentUser.name ? currentUser.name.split(' ')[0] : 'Profile'}
            </span>
          </button>

          {/* Logout / Switch User */}
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
