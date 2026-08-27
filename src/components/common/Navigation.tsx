import React from 'react';
import { Heart, Grid, MessageCircle, Activity, User, Sliders, Calendar } from 'lucide-react';
import { audioHaptics } from '../../services/audioHaptics';

export type AppTab = 'discover' | 'explore' | 'requests' | 'status' | 'messages' | 'profile';

interface NavigationProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  unreadCount?: number;
  requestsCount?: number;
}

interface TabItem {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unreadCount = 0,
  requestsCount = 0
}) => {
  const tabs: TabItem[] = [
    { id: 'discover', label: 'Discover', icon: Heart },
    { id: 'explore', label: 'Explore', icon: Grid },
    { id: 'requests', label: 'Dates', icon: Calendar, badge: requestsCount },
    { id: 'status', label: 'Statuses', icon: Activity },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav 
      aria-label="Main Application Navigation"
      className="fixed bottom-0 inset-x-0 bg-neutral-950/90 border-t border-neutral-800/80 backdrop-blur-xl z-40 py-1 px-2 select-none"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => {
                onSelectTab(tab.id);
                audioHaptics.triggerNavigationClick();
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all relative min-w-[50px] cursor-pointer ${
                isActive 
                  ? 'text-rose-400 font-bold scale-105' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-rose-400' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[9px] font-black border border-neutral-950 animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-5 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

