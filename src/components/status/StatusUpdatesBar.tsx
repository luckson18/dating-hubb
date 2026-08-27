import React, { useState } from 'react';
import { 
  Plus, 
  Heart, 
  MapPin, 
  Volume2, 
  ShieldCheck, 
  Users, 
  Lock, 
  Globe, 
  Sparkles, 
  X, 
  MessageCircle,
  Check,
  RotateCcw
} from 'lucide-react';
import { StatusUpdate, UserProfile } from '../../types/dating';
import { InterestedPartnersModal } from './InterestedPartnersModal';
import { ExpressInterestModal } from './ExpressInterestModal';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface StatusUpdatesBarProps {
  statuses: StatusUpdate[];
  currentUser: UserProfile;
  onOpenCreateStatus: () => void;
  onLikeStatus: (statusId: string) => void;
  onReplyToStatus: (userName: string, content: string) => void;
  onExpressInterest: (statusId: string, note?: string) => void;
  onRecallInterest?: (statusId: string) => void;
  onStartChatWithUser: (userId: string, userName: string, avatar: string) => void;
}

export const StatusUpdatesBar: React.FC<StatusUpdatesBarProps> = ({
  statuses,
  currentUser,
  onOpenCreateStatus,
  onLikeStatus,
  onReplyToStatus,
  onExpressInterest,
  onRecallInterest,
  onStartChatWithUser
}) => {
  const [activeStatus, setActiveStatus] = useState<StatusUpdate | null>(null);
  const [showInterestedModal, setShowInterestedModal] = useState<StatusUpdate | null>(null);
  const [showExpressModal, setShowExpressModal] = useState<StatusUpdate | null>(null);

  const handleDirectRecall = (statusId: string) => {
    audioHaptics.triggerRecallInterest();
    if (onRecallInterest) {
      onRecallInterest(statusId);
    }
    if (activeStatus && activeStatus.id === statusId) {
      setActiveStatus({
        ...activeStatus,
        hasExpressedInterest: false,
        interestedCount: Math.max(0, (activeStatus.interestedCount || 1) - 1),
        interestedPartners: (activeStatus.interestedPartners || []).filter(p => p.userId !== currentUser.id && p.userId !== 'user-me')
      });
    }
  };

  const getAudienceBadge = (audience: StatusUpdate['audience'], targetGroups?: string[]) => {
    switch (audience) {
      case 'close-friends':
        return { label: 'Close Friends', icon: <Lock className="w-3 h-3 text-emerald-400" />, color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' };
      case 'custom-group':
        return { label: targetGroups?.[0] || 'Selected Circle', icon: <Users className="w-3 h-3 text-amber-400" />, color: 'bg-amber-950/60 text-amber-300 border-amber-500/40' };
      case 'public':
        return { label: 'Public Nearby', icon: <Globe className="w-3 h-3 text-cyan-400" />, color: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40' };
      default:
        return { label: 'Matches Only', icon: <ShieldCheck className="w-3 h-3 text-indigo-400" />, color: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40' };
    }
  };

  const handleReadStatusAloud = (st: StatusUpdate) => {
    const interestedText = st.interestedCount ? `, ${st.interestedCount} partners interested` : '';
    const text = `Status by ${st.userName}, posted ${st.createdAt}. Location: ${st.location || 'Local'}. Content: ${st.content}${interestedText}`;
    speechService.speak(text);
  };

  return (
    <div id="status-updates-bar" className="w-full bg-neutral-900/60 border-b border-neutral-800 py-3 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {/* Create My Status Button */}
        <button
          id="btn-open-create-status"
          onClick={() => {
            onOpenCreateStatus();
            audioHaptics.triggerNavigationClick();
          }}
          className="flex-shrink-0 flex flex-col items-center gap-1 group cursor-pointer"
        >
          <div className="relative w-14 h-14 rounded-full p-0.5 border-2 border-dashed border-indigo-500 hover:border-indigo-400 transition-colors flex items-center justify-center bg-neutral-800">
            <img
              src={currentUser.photos[0]}
              alt="My Avatar"
              className="w-full h-full rounded-full object-cover opacity-85 group-hover:opacity-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 p-1 rounded-full bg-indigo-600 text-white shadow-md">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[10px] font-semibold text-neutral-300 group-hover:text-white max-w-[64px] truncate">
            My Status
          </span>
        </button>

        {/* List of Status Updates */}
        {statuses.map((status) => {
          return (
            <button
              key={status.id}
              onClick={() => {
                setActiveStatus(status);
                audioHaptics.triggerNavigationClick();
                handleReadStatusAloud(status);
              }}
              className="flex-shrink-0 flex flex-col items-center gap-1 group text-left cursor-pointer"
            >
              <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 via-rose-500 to-amber-400 group-hover:scale-105 transition-transform shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 p-0.5">
                  <img
                    src={status.userAvatar}
                    alt={status.userName}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {status.moodEmoji && (
                  <span className="absolute -top-1 -right-1 text-xs bg-neutral-900 border border-neutral-700 rounded-full w-5 h-5 flex items-center justify-center shadow">
                    {status.moodEmoji}
                  </span>
                )}
                {status.interestedCount && status.interestedCount > 0 ? (
                  <span className="absolute -bottom-1 -right-1 text-[9px] font-bold bg-amber-500 text-black rounded-full px-1 py-0.2 shadow-sm border border-neutral-900">
                    ✨{status.interestedCount}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-semibold text-neutral-300 group-hover:text-white max-w-[68px] truncate">
                {status.userName.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Viewer Story Modal */}
      {activeStatus && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
            {/* Top Bar with Progress & Close */}
            <div className="p-4 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeStatus.userAvatar}
                  alt={activeStatus.userName}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {activeStatus.userName}
                    {activeStatus.moodEmoji && <span>{activeStatus.moodEmoji}</span>}
                  </h3>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                    {activeStatus.location && (
                      <>
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span className="truncate max-w-[120px]">{activeStatus.location}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{activeStatus.createdAt}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleReadStatusAloud(activeStatus)}
                  className="p-1.5 rounded-lg bg-neutral-800 text-cyan-300 hover:text-white"
                  title="Read Aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveStatus(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audience Badge & Interested Partners Link */}
            <div className="px-4 pt-3 flex justify-between items-center gap-2">
              {(() => {
                const aud = getAudienceBadge(activeStatus.audience, activeStatus.targetGroupNames);
                return (
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${aud.color}`}>
                    {aud.icon}
                    <span>{aud.label}</span>
                  </span>
                );
              })()}

              {/* Interested Partners Count Button */}
              <button
                type="button"
                onClick={() => {
                  audioHaptics.triggerNavigationClick();
                  setShowInterestedModal(activeStatus);
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 hover:bg-amber-900 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{activeStatus.interestedCount || (activeStatus.interestedPartners?.length || 0)} Interested</span>
              </button>
            </div>

            {/* Status Content */}
            <div className="p-5 my-1">
              <p className="text-sm font-medium text-neutral-100 leading-relaxed bg-black/40 p-4 rounded-2xl border border-neutral-800">
                "{activeStatus.content}"
              </p>
            </div>

            {/* Action Bar: Interested Button, Like & Reply */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950/90 space-y-2">
              {/* Primary "Interested" Button on Post */}
              {activeStatus.userId !== currentUser.id && (
                <div className="space-y-1.5">
                  {activeStatus.hasExpressedInterest ? (
                    <div className="space-y-1.5">
                      <div className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 shadow-sm">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Interest Active • {activeStatus.userName.split(' ')[0]} Notified</span>
                      </div>
                      
                      <button
                        id="btn-status-recall-interest"
                        type="button"
                        onClick={() => handleDirectRecall(activeStatus.id)}
                        className="w-full py-2 px-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Sent by accident? Recall / Undo Interest</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      id="btn-status-interested"
                      onClick={() => setShowExpressModal(activeStatus)}
                      className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-95 text-white active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>I'm Interested • Notify {activeStatus.userName.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => {
                    onLikeStatus(activeStatus.id);
                    audioHaptics.triggerSwipeRight();
                    setActiveStatus({
                      ...activeStatus,
                      hasLiked: !activeStatus.hasLiked,
                      likesCount: activeStatus.hasLiked ? activeStatus.likesCount - 1 : activeStatus.likesCount + 1
                    });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    activeStatus.hasLiked
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${activeStatus.hasLiked ? 'fill-current' : ''}`} />
                  <span>{activeStatus.likesCount}</span>
                </button>

                <button
                  onClick={() => {
                    onReplyToStatus(activeStatus.userName, activeStatus.content);
                    setActiveStatus(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interested Partners Modal */}
      {showInterestedModal && (
        <InterestedPartnersModal
          status={showInterestedModal}
          currentUserId={currentUser.id}
          onClose={() => setShowInterestedModal(null)}
          onStartChatWithPartner={(userId, userName, avatar) => {
            onStartChatWithUser(userId, userName, avatar);
            setActiveStatus(null);
          }}
          onRecallInterest={(statusId) => {
            handleDirectRecall(statusId);
          }}
        />
      )}

      {/* Express Interest Modal with Icebreaker & Recall */}
      {showExpressModal && (
        <ExpressInterestModal
          status={showExpressModal}
          currentUser={currentUser}
          onClose={() => setShowExpressModal(null)}
          onSubmitInterest={(statusId, note) => {
            onExpressInterest(statusId, note);
            if (activeStatus && activeStatus.id === statusId) {
              setActiveStatus({
                ...activeStatus,
                hasExpressedInterest: true,
                interestedCount: (activeStatus.interestedCount || 0) + 1
              });
            }
          }}
          onRecallInterest={(statusId) => {
            handleDirectRecall(statusId);
          }}
        />
      )}
    </div>
  );
};

