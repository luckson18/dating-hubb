import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  Heart, 
  Clock,
  UserCheck,
  CheckCircle2,
  Lock,
  RotateCcw,
  User
} from 'lucide-react';
import { StatusUpdate, InterestedPartner } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';

interface InterestedPartnersModalProps {
  isOpen?: boolean;
  status: StatusUpdate;
  currentUserId?: string;
  onClose: () => void;
  onStartChatWithPartner?: (userId: string, userName: string, avatar: string) => void;
  onStartChatWithUser?: (userId: string, userName: string, avatar: string) => void;
  onRecallInterest?: (statusId: string) => void;
}

export const InterestedPartnersModal: React.FC<InterestedPartnersModalProps> = ({
  isOpen = true,
  status,
  currentUserId = 'user-me',
  onClose,
  onStartChatWithPartner,
  onStartChatWithUser,
  onRecallInterest
}) => {
  if (isOpen === false) return null;

  const isMyStatus = status.userId === currentUserId || status.userId === 'user-me';
  const [partners, setPartners] = useState<InterestedPartner[]>(status.interestedPartners || []);

  const handleStartChat = (userId: string, userName: string, avatar: string) => {
    if (onStartChatWithPartner) {
      onStartChatWithPartner(userId, userName, avatar);
    } else if (onStartChatWithUser) {
      onStartChatWithUser(userId, userName, avatar);
    }
  };

  const handleRecallMyInterest = (userId: string) => {
    audioHaptics.triggerRecallInterest();
    setPartners(prev => prev.filter(p => p.userId !== userId));
    if (onRecallInterest) {
      onRecallInterest(status.id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="interested-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="interested-modal-title" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Interested Partners</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-xs font-bold border border-amber-500/30">
                  {partners.length}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isMyStatus ? 'Partners who expressed interest in your post' : `Partners interested in ${status.userName}'s post`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                onClose();
              }}
              aria-label="Close interested partners dialog"
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Post Snippet */}
        <div className="bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800 flex items-start gap-2.5">
          <img
            src={status.userAvatar}
            alt={status.userName}
            className="w-8 h-8 rounded-full object-cover border border-neutral-700 flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-neutral-400 block">{status.userName}'s Post:</span>
            <p className="text-xs text-neutral-300 line-clamp-2 italic">
              "{status.content}"
            </p>
          </div>
        </div>

        {/* Partners List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {partners.length === 0 ? (
            <div className="text-center py-8 space-y-2 bg-neutral-950/40 rounded-2xl border border-dashed border-neutral-800">
              <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400 font-medium">
                No one has expressed interest yet.
              </p>
              <p className="text-[10px] text-neutral-500">
                Be the first to express interest and notify {status.userName}!
              </p>
            </div>
          ) : (
            partners.map((partner) => {
              const isCurrentUser = partner.userId === currentUserId || partner.userId === 'user-me';

              return (
                <div
                  key={partner.userId}
                  className={`p-3 rounded-2xl transition-all space-y-2 border ${
                    isCurrentUser
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                      : 'bg-neutral-950/60 hover:bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={partner.userAvatar}
                        alt={partner.userName}
                        className={`w-10 h-10 rounded-full object-cover border ${
                          isCurrentUser ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-amber-500/40'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1">
                            {partner.userName}
                            {isCurrentUser && (
                              <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.2 rounded-md font-extrabold">
                                You
                              </span>
                            )}
                          </h4>
                          {partner.userAge && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {partner.userAge}
                            </span>
                          )}
                          {partner.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" title="Verified Profile" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                          {partner.compatibilityScore && (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                              {partner.compatibilityScore}% Match
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {partner.expressedAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action: Recall if own, Connect if someone else */}
                    {isCurrentUser ? (
                      <button
                        onClick={() => handleRecallMyInterest(partner.userId)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Recall your expressed interest"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Recall</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          audioHaptics.triggerInterestSent();
                          handleStartChat(partner.userId, partner.userName, partner.userAvatar);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>

                  {/* Optional Icebreaker Note */}
                  {partner.note && (
                    <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800/80 text-[11px] text-amber-200/90 font-medium">
                      💬 "{partner.note}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Privacy Footer */}
        <div className="flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-800/80 pt-3">
          <div className="flex items-center gap-1 text-emerald-400">
            <Lock className="w-3 h-3" />
            <span>End-to-End Encrypted Mutual Interest</span>
          </div>
          <button
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
