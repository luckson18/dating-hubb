import React, { useEffect, useState } from 'react';
import { Mic, CheckCircle2, AlertCircle, Volume2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceCommandHUDProps {
  isListening: boolean;
  transcript: string;
  lastCommand: { command: string; text: string; timestamp: number } | null;
  onDismiss?: () => void;
  onOpenHelp?: () => void;
}

export const VoiceCommandHUD: React.FC<VoiceCommandHUDProps> = ({
  isListening,
  transcript,
  lastCommand,
  onDismiss,
  onOpenHelp
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (lastCommand) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 3200);
      return () => clearTimeout(timer);
    }
  }, [lastCommand]);

  if (!isListening && !showFeedback) return null;

  const getCommandLabel = (cmd: string) => {
    switch (cmd) {
      case 'LIKE': return 'Liked Profile (Swipe Right)';
      case 'PASS': return 'Passed Profile (Swipe Left)';
      case 'SUPER_LIKE': return 'Super Liked!';
      case 'READ_PROFILE': return 'Reading Profile Details Aloud...';
      case 'STOP_SPEAKING': return 'Narration Stopped';
      case 'VIDEO_BIO': return 'Playing Video Bio...';
      case 'OPEN_FILTERS': return 'Opening Search Filters';
      case 'NAV_MESSAGES': return 'Navigating to Messages';
      case 'NAV_DISCOVERY': return 'Navigating to Discovery Deck';
      case 'NAV_STATUS': return 'Navigating to Status Feed';
      case 'NAV_PROFILE': return 'Navigating to My Profile';
      case 'TOGGLE_CONTRAST': return 'Switched Contrast Mode';
      case 'LOCK_APP': return 'Profile Biometrically Secured';
      case 'HELP': return 'Opening Voice Commands Guide';
      default: return `Heard: "${lastCommand?.text}"`;
    }
  };

  const isRecognized = lastCommand && lastCommand.command !== 'UNKNOWN';

  return (
    <div 
      id="voice-command-hud"
      role="status" 
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-md w-[92%] sm:w-auto"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          className="bg-neutral-900/95 text-white border border-neutral-700/80 rounded-2xl shadow-2xl backdrop-blur-xl px-4 py-3 flex items-center gap-3 ring-1 ring-white/10"
        >
          {/* Pulsing Mic Indicator */}
          <div className="relative flex-shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isListening ? 'bg-amber-400 text-neutral-950 ring-4 ring-amber-400/20' : 'bg-neutral-800 text-neutral-300'
            }`}>
              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
            </div>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {/* Transcript / Action Text */}
          <div className="flex-1 min-w-0 pr-1">
            {showFeedback && lastCommand ? (
              <div className="flex items-center gap-1.5">
                {isRecognized ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span className={`text-xs font-semibold truncate ${isRecognized ? 'text-emerald-300' : 'text-amber-200'}`}>
                  {getCommandLabel(lastCommand.command)}
                </span>
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Voice Nav Active
                </p>
                <p className="text-xs text-neutral-200 font-medium truncate italic mt-0.5">
                  {transcript ? `"${transcript}"` : 'Say "Like", "Pass", "Read Bio", or "Filter"...'}
                </p>
              </div>
            )}
          </div>

          {/* Guide / Close buttons */}
          <div className="flex items-center gap-1">
            {onOpenHelp && (
              <button
                id="btn-hud-voice-help"
                onClick={onOpenHelp}
                className="text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded-md font-medium"
              >
                Cheat Sheet
              </button>
            )}
            {onDismiss && (
              <button
                id="btn-hud-dismiss"
                onClick={onDismiss}
                className="p-1 text-neutral-400 hover:text-white rounded-md"
                aria-label="Dismiss voice bar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
