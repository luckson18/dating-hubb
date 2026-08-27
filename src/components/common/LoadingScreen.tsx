import React, { useEffect, useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import hubbAppIcon from '../../assets/images/hubb-app-icon.jpg';

interface LoadingScreenProps {
  onLoaded?: () => void;
  minDurationMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onLoaded,
  minDurationMs = 1800
}) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const intervalTime = 30;
    const step = 100 / (minDurationMs / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              if (onLoaded) onLoaded();
            }, 400);
          }, 200);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [minDurationMs, onLoaded]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading hubb application"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-950 via-[#120508] to-neutral-950 text-white transition-opacity duration-400 select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow matching the heart red motif */}
      <div className="absolute w-80 h-80 rounded-full bg-rose-600/15 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute w-56 h-56 rounded-full bg-red-800/20 blur-[80px] pointer-events-none" />

      {/* Main Content Box */}
      <div className="relative flex flex-col items-center z-10 px-6 max-w-sm w-full text-center">
        {/* App Logo Image with subtle 3D hover/pulse effect */}
        <div className="relative group">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-red-600/40 via-rose-500/20 to-transparent blur-md opacity-75 group-hover:opacity-100 transition duration-500" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-b from-red-500/30 to-red-950/60 border border-red-500/40 shadow-2xl shadow-red-950/80 overflow-hidden flex items-center justify-center">
            <img
              src={hubbAppIcon}
              alt="hubb app logo"
              className="w-full h-full object-cover rounded-[22px] transition-transform duration-700 transform scale-[1.02] hover:scale-105"
            />
          </div>
        </div>

        {/* Text "hubb" below the logo as requested */}
        <div className="mt-6 space-y-1">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white lowercase drop-shadow-md flex items-center justify-center gap-1.5 font-sans">
            <span className="bg-gradient-to-r from-white via-rose-100 to-rose-300 bg-clip-text text-transparent">
              hubb
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-rose-300/80 tracking-wide">
            Inclusive • Accessible • Connected Dating
          </p>
        </div>

        {/* Smooth loading bar with progress percentage */}
        <div className="w-48 sm:w-56 mt-8 space-y-2">
          <div className="w-full h-1.5 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-75 ease-out shadow-sm shadow-rose-500/50"
              style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span className="flex items-center gap-1 text-rose-400 font-sans font-medium">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span>Connecting Hearts</span>
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Accessible Screen Reader Announce */}
      <span className="sr-only">hubb application is loading, please wait.</span>
    </div>
  );
};
