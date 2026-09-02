import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  Heart, 
  Lightbulb, 
  Smile, 
  Compass, 
  Coffee, 
  MessageSquareQuote, 
  CheckCircle2, 
  UserCheck, 
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { UserProfile, SmartOpenerSuggestion, SmartOpenerTone, SmartOpenerCategory } from '../../types/dating';
import { smartOpenerService } from '../../services/smartOpenerService';
import { audioHaptics } from '../../services/audioHaptics';

interface SmartOpenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  matchedUser: UserProfile;
  onSelectOpener: (openerText: string) => void;
  onSendInstantMessage?: (openerText: string) => void;
}

export const SmartOpenerModal: React.FC<SmartOpenerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  matchedUser,
  onSelectOpener,
  onSendInstantMessage,
}) => {
  const [selectedTone, setSelectedTone] = useState<SmartOpenerTone>('all');
  const [customVibe, setCustomVibe] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openers, setOpeners] = useState<SmartOpenerSuggestion[]>([]);
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [selectedOpenerText, setSelectedOpenerText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load openers on modal open
  useEffect(() => {
    if (isOpen) {
      loadOpeners('all');
    }
  }, [isOpen, matchedUser.id]);

  const loadOpeners = async (tone: SmartOpenerTone, customPrompt?: string) => {
    setIsLoading(true);
    audioHaptics.triggerNavigationClick();
    try {
      const res = await smartOpenerService.generateOpeners(currentUser, matchedUser, {
        tone,
        customVibe: customPrompt || customVibe,
      });
      setOpeners(res.openers);
      setSharedInterests(res.sharedInterests);
      setIsAiGenerated(res.isAiGenerated);
      if (res.openers.length > 0) {
        setSelectedOpenerText(res.openers[0].openerText);
      }
    } catch (err) {
      console.error('Error generating openers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneChange = (tone: SmartOpenerTone) => {
    setSelectedTone(tone);
    loadOpeners(tone);
  };

  const handleCustomRegenerate = (e: React.FormEvent) => {
    e.preventDefault();
    loadOpeners(selectedTone, customVibe);
  };

  const handleCopyOpener = (opener: SmartOpenerSuggestion) => {
    navigator.clipboard.writeText(opener.openerText);
    setCopiedId(opener.id);
    audioHaptics.triggerNavigationClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseOpener = (text: string) => {
    audioHaptics.triggerMatchSuccess();
    onSelectOpener(text);
    onClose();
  };

  const handleInstantSend = (text: string) => {
    audioHaptics.triggerMessageSent();
    if (onSendInstantMessage) {
      onSendInstantMessage(text);
    } else {
      onSelectOpener(text);
    }
    onClose();
  };

  if (!isOpen) return null;

  const getCategoryIcon = (category: SmartOpenerCategory) => {
    switch (category) {
      case 'shared_interest':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'curious_question':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-400" />;
      case 'playful_warm':
        return <Smile className="w-3.5 h-3.5 text-emerald-400" />;
      case 'accessible_activity':
        return <Coffee className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-opener-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="smart-opener-modal"
        className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-950 via-indigo-950/40 to-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="smart-opener-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  AI Smart Opener
                </h2>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Bot className="w-3 h-3 text-indigo-300" />
                  {isAiGenerated ? 'Gemini 3.7 AI' : 'Smart Context'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Personalized ice-breakers crafted for <strong className="text-white">{matchedUser.name}</strong> ({matchedUser.age}, {matchedUser.locationCity})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
              }}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mutual Match Anchors Bar */}
        <div className="bg-neutral-950/90 border-b border-neutral-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-400 font-semibold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Shared Passions & Hooks:
            </span>
            {sharedInterests.map((interest, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-lg bg-indigo-950/80 text-indigo-200 border border-indigo-500/30 text-[11px] font-medium"
              >
                {interest}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <span className="text-neutral-300 font-medium">Job: {matchedUser.jobTitle || 'Creative'}</span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* Tone Filter Buttons & Custom Prompt Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs text-neutral-400 font-semibold flex items-center gap-1 mr-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                  Tone:
                </span>
                {(
                  [
                    { id: 'all', label: 'All Styles' },
                    { id: 'warm', label: 'Warm & Friendly 💛' },
                    { id: 'witty', label: 'Witty & Playful 😄' },
                    { id: 'thoughtful', label: 'Thoughtful & Deep 💡' },
                    { id: 'casual', label: 'Casual & Relaxed ☕' },
                  ] as const
                ).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToneChange(t.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedTone === t.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => loadOpeners(selectedTone, customVibe)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-indigo-300 border border-neutral-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Generating...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Custom AI prompt / context modifier */}
            <form onSubmit={handleCustomRegenerate} className="flex items-center gap-2">
              <input
                type="text"
                value={customVibe}
                onChange={e => setCustomVibe(e.target.value)}
                placeholder={`Ask AI to mention ${matchedUser.name.split(' ')[0]}'s dog, pottery, or coffee preference...`}
                className="flex-1 bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isLoading || !customVibe.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </form>
          </div>

          {/* Opener Suggestions Cards */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-neutral-300">
                Gemini AI is analyzing shared passions with {matchedUser.name}...
              </p>
              <p className="text-xs text-neutral-500">Creating authentic, non-generic conversation starters</p>
            </div>
          ) : openers.length === 0 ? (
            <div className="py-8 text-center bg-neutral-950/50 rounded-2xl border border-neutral-800 p-4">
              <p className="text-sm text-neutral-400">No openers found for this tone.</p>
              <button
                onClick={() => handleToneChange('all')}
                className="mt-2 text-xs text-indigo-400 font-bold hover:underline"
              >
                Show all styles
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {openers.map((opener, idx) => {
                const isSelected = selectedOpenerText === opener.openerText;
                const isCopied = copiedId === opener.id;

                return (
                  <div
                    key={opener.id || idx}
                    id={`smart-opener-card-${idx}`}
                    className={`p-4 rounded-2xl border transition-all relative ${
                      isSelected
                        ? 'bg-neutral-800/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                        : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="p-1 rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-700">
                          {getCategoryIcon(opener.category)}
                        </span>
                        <span className="text-xs font-bold text-white">{opener.categoryLabel}</span>
                        <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md font-medium border border-neutral-700 capitalize">
                          {opener.tone}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyOpener(opener)}
                          title="Copy to Clipboard"
                          className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Main Opener Text */}
                    <div
                      onClick={() => setSelectedOpenerText(opener.openerText)}
                      className="cursor-pointer group"
                    >
                      <p className="text-sm sm:text-base font-medium text-neutral-100 leading-relaxed group-hover:text-white">
                        "{opener.openerText}"
                      </p>
                    </div>

                    {/* Why this works insight & keyword badges */}
                    <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <p className="text-[11px] text-neutral-400 italic">
                        💡 <strong className="text-neutral-300 not-italic">Match Hook:</strong> {opener.whyItWorks}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                        {opener.highlightedKeywords.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="text-[10px] bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar on Opener */}
                    <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/50">
                      <button
                        type="button"
                        onClick={() => handleUseOpener(opener.openerText)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-neutral-700"
                      >
                        <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Insert in Chat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInstantSend(opener.openerText)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Selected Opener Preview & Fine-Tune Editor */}
          {selectedOpenerText && (
            <div className="bg-gradient-to-r from-indigo-950/50 via-neutral-950 to-indigo-950/50 border border-indigo-500/40 rounded-3xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fine-Tune Before Sending to {matchedUser.name.split(' ')[0]}</span>
                </label>
                <span className="text-[10px] text-neutral-400">Encrypted transmission</span>
              </div>

              <textarea
                rows={2}
                value={selectedOpenerText}
                onChange={e => setSelectedOpenerText(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-indigo-500 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleUseOpener(selectedOpenerText)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-neutral-700"
                >
                  <MessageSquareQuote className="w-4 h-4 text-indigo-400" />
                  <span>Insert Into Chat Bar</span>
                </button>

                <button
                  type="button"
                  id="btn-send-smart-opener-instant"
                  onClick={() => handleInstantSend(selectedOpenerText)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to {matchedUser.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
