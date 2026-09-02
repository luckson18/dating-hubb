import React from 'react';
import { 
  X, 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  MessageCircle, 
  Clock, 
  CheckCheck,
  Trash2
} from 'lucide-react';
import { PartnerNotification } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';

interface NotificationsModalProps {
  isOpen?: boolean;
  notifications: PartnerNotification[];
  onClose: () => void;
  onMarkAllRead?: () => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  onStartChatWithUser?: (userId: string, userName: string, avatar: string) => void;
  onSelectNotification?: (notification: PartnerNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen = true,
  notifications,
  onClose,
  onMarkAllRead,
  onMarkAllAsRead,
  onClearAll,
  onStartChatWithUser,
  onSelectNotification
}) => {
  if (isOpen === false) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    if (onMarkAllRead) onMarkAllRead();
    else if (onMarkAllAsRead) onMarkAllAsRead();
  };

  const handleClearAll = () => {
    if (onClearAll) onClearAll();
  };

  const handleConnectWithSender = (senderId: string, senderName: string, senderAvatar: string, notif: PartnerNotification) => {
    if (onSelectNotification) {
      onSelectNotification(notif);
    } else if (onStartChatWithUser) {
      onStartChatWithUser(senderId, senderName, senderAvatar);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 id="notifications-title" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Partner Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                    {unreadCount} NEW
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-neutral-400">
                Interested partners & activity alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                onClose();
              }}
              aria-label="Close notifications modal"
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action controls */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between text-xs px-1 text-neutral-400">
            <button
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                handleMarkAllRead();
              }}
              className="hover:text-indigo-400 font-medium flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>

            <button
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                handleClearAll();
              }}
              className="hover:text-rose-400 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="text-center py-10 space-y-2 bg-neutral-950/40 rounded-2xl border border-dashed border-neutral-800">
              <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400 font-medium">
                No new notifications.
              </p>
              <p className="text-[10px] text-neutral-500">
                When partners express interest in your posts, you'll see them here!
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  notif.read
                    ? 'bg-neutral-950/50 border-neutral-800/80'
                    : 'bg-neutral-950 border-indigo-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0">
                      <img
                        src={notif.senderAvatar}
                        alt={notif.senderName}
                        className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">{notif.senderName}</h4>
                        {notif.compatibilityScore && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5 fill-current" />
                            {notif.compatibilityScore}% Match
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-300/90 font-medium">
                        Expressed interest in your post!
                      </p>
                      <span className="text-[9px] text-neutral-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {notif.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Connect CTA */}
                  <button
                    onClick={() => {
                      audioHaptics.triggerInterestSent();
                      handleConnectWithSender(notif.senderId, notif.senderName, notif.senderAvatar, notif);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm flex-shrink-0 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>

                {/* Personal Note */}
                {notif.note && (
                  <div className="bg-neutral-900/80 p-2 rounded-xl border border-neutral-800 text-[11px] text-neutral-200">
                    💬 "{notif.note}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            audioHaptics.triggerNavigationClick();
            onClose();
          }}
          className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-2xl text-xs font-bold transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
