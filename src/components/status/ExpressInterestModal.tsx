import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Heart, 
  ShieldCheck, 
  Lock, 
  Check, 
  SmilePlus,
  MessageSquare,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { StatusUpdate, UserProfile } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface ExpressInterestModalProps {
  isOpen?: boolean;
  status: StatusUpdate;
  currentUser?: UserProfile;
  onClose: () => void;
  onSubmitInterest?: (statusId: string, note?: string) => void;
  onConfirmInterest?: (statusId: string, note?: string) => void;
  onRecallInterest?: (statusId: string) => void;
}

const QUICK_ICEBREAKERS = [
  "I'd love to join you for this! ✨",
  "This sounds amazing, tell me more! ☕",
  "I'm super interested in this vibe! 🥐",
  "Would love to connect and chat about this! 💫"
];

export const ExpressInterestModal: React.FC<ExpressInterestModalProps> = ({
  isOpen = true,
  status,
  currentUser,
  onClose,
  onSubmitInterest,
  onConfirmInterest,
  onRecallInterest
}) => {
  if (isOpen === false) return null;

  const isAlreadyExpressed = status.hasExpressedInterest;
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [hasRecalled, setHasRecalled] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    audioHaptics.triggerInterestSent();

    setTimeout(() => {
      setIsSubmitting(false);
      setHasSent(true);
      if (onConfirmInterest) {
        onConfirmInterest(status.id, note.trim() || undefined);
      } else if (onSubmitInterest) {
        onSubmitInterest(status.id, note.trim() || undefined);
      }
      speechService.speak(`Interest expressed! ${status.userName} has been notified.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 400);
  };

  const handleRecall = () => {
    setHasRecalled(true);
    audioHaptics.triggerRecallInterest();
    if (onRecallInterest) {
      onRecallInterest(status.id);
    }
    speechService.speak(`Interest expression recalled from ${status.userName}'s post.`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="express-interest-title"
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
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="express-interest-title" className="text-sm sm:text-base font-bold text-white">
                {isAlreadyExpressed ? 'Manage Expressed Interest' : 'Express Partner Interest'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isAlreadyExpressed 
                  ? `You expressed interest in ${status.userName}'s post`
                  : `Notify ${status.userName} you're interested`
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              onClose();
            }}
            aria-label="Close interest modal"
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post Preview Card */}
        <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2">
            <img
              src={status.userAvatar}
              alt={status.userName}
              className="w-7 h-7 rounded-full object-cover border border-indigo-500"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-bold text-neutral-200">{status.userName}</span>
            <span className="text-[10px] text-neutral-400">• {status.createdAt}</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-200 italic bg-black/40 p-2.5 rounded-xl border border-neutral-800/80">
            "{status.content}"
          </p>
        </div>

        {hasRecalled ? (
          <div className="py-8 text-center space-y-2 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-sm font-bold text-white">Interest Recalled & Removed</h4>
            <p className="text-xs text-neutral-300">
              Your interest expression was removed. {status.userName} will not see you in the interested partners list.
            </p>
          </div>
        ) : hasSent ? (
          <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Notification Sent!</h4>
              <p className="text-xs text-neutral-300">
                {status.userName} was notified of your interest.
              </p>
            </div>

            {/* Quick Undo / Recall Option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRecall}
                className="px-4 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-2 mx-auto transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sent by accident? Undo / Recall</span>
              </button>
            </div>
          </div>
        ) : isAlreadyExpressed ? (
          <div className="space-y-4 py-2">
            <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-2xl flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-200">Interest Active</p>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  You have expressed interest in {status.userName}'s post. If you sent this expression by accident, you can recall it now.
                </p>
              </div>
            </div>

            {/* Actions: Recall or update */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-recall-interest-modal"
                type="button"
                onClick={handleRecall}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-transform cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recall / Remove My Interest</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-2xl font-semibold text-xs transition-colors"
              >
                Keep Interest Active
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Icebreaker suggestions */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <SmilePlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Optional Quick Icebreaker Note</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ICEBREAKERS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNote(chip);
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                      note === chip
                        ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                        : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:bg-neutral-700 hover:text-white'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom note textarea */}
            <div className="space-y-1">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a personalized message or express instant interest..."
                rows={2}
                maxLength={140}
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-white placeholder-neutral-500 rounded-2xl p-3 resize-none outline-none"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 px-1">
                <span>Direct private notification to {status.userName}</span>
                <span>{note.length}/140</span>
              </div>
            </div>

            {/* Privacy & Instant Send CTA */}
            <div className="pt-1 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-95 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Notify {status.userName} I'm Interested</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 text-center">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Protected by Aura Verified Privacy Controls • Can be recalled anytime</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

