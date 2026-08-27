import React, { useEffect, useState } from 'react';
import { RotateCcw, X, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { audioHaptics } from '../../services/audioHaptics';

export interface RecentInterestState {
  statusId: string;
  targetUserName: string;
  targetUserAvatar: string;
  contentSnippet?: string;
  expressedAt: number;
}

interface InterestRecallToastProps {
  recentInterest: RecentInterestState | null;
  onRecall: (statusId: string) => void;
  onDismiss: () => void;
  durationSec?: number;
}

export const InterestRecallToast: React.FC<InterestRecallToastProps> = ({
  recentInterest,
  onRecall,
  onDismiss,
  durationSec = 10,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [isRecalled, setIsRecalled] = useState(false);

  useEffect(() => {
    if (!recentInterest) {
      setTimeLeft(durationSec);
      setIsRecalled(false);
      return;
    }

    setTimeLeft(durationSec);
    setIsRecalled(false);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [recentInterest, durationSec, onDismiss]);

  if (!recentInterest) return null;

  const progressPercent = Math.max(0, (timeLeft / durationSec) * 100);

  const handleRecallClick = () => {
    setIsRecalled(true);
    audioHaptics.triggerRecallInterest();
    onRecall(recentInterest.statusId);

    setTimeout(() => {
      onDismiss();
    }, 1500);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-4 sm:right-8 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div className="bg-neutral-900/95 backdrop-blur-md border border-amber-500/40 shadow-2xl rounded-2xl p-4 text-white overflow-hidden relative ring-1 ring-amber-400/30">
        {/* Top Progress bar */}
        {!isRecalled && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {isRecalled ? (
          <div className="flex items-center gap-3 py-1 text-emerald-300 animate-in zoom-in-95">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Interest Recalled & Removed</p>
              <p className="text-[11px] text-neutral-300">
                {recentInterest.targetUserName} was not notified.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <img
                  src={recentInterest.targetUserAvatar}
                  alt={recentInterest.targetUserName}
                  className="w-10 h-10 rounded-full object-cover border border-amber-400 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-black shadow">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white truncate">
                    Interest Sent to {recentInterest.targetUserName.split(' ')[0]}
                  </p>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold">
                    ({timeLeft}s)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate">
                  Sent by accident? You can recall this expression.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="btn-recall-interest-toast"
                onClick={handleRecallClick}
                aria-label={`Recall interest sent to ${recentInterest.targetUserName}`}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recall Expression</span>
              </button>

              <button
                onClick={onDismiss}
                aria-label="Dismiss recall banner"
                className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
