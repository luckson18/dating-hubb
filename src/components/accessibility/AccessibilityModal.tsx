import React from 'react';
import { 
  X, 
  Eye, 
  Type, 
  Mic, 
  Volume2, 
  Vibrate, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles,
  Zap,
  MousePointerClick
} from 'lucide-react';
import { AccessibilitySettings, ContrastMode, TextScale } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  activeTab?: 'settings' | 'voice-commands';
  setActiveTab?: (tab: 'settings' | 'voice-commands') => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  activeTab = 'settings',
  setActiveTab
}) => {
  const [tab, setTab] = React.useState<'settings' | 'voice-commands'>(activeTab);

  React.useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  if (!isOpen) return null;

  const contrastModes: { mode: ContrastMode; name: string; description: string; sample: string }[] = [
    {
      mode: 'standard',
      name: 'Standard Dark/Light Theme',
      description: 'Balanced modern palette with gentle shadows & high readability.',
      sample: 'bg-neutral-900 text-white border-neutral-700'
    },
    {
      mode: 'high-contrast-dark',
      name: 'Ultra High-Contrast Dark',
      description: 'Pure black (#000000) canvas, intense white text & cyan accents.',
      sample: 'bg-black text-white border-2 border-white'
    },
    {
      mode: 'high-contrast-light',
      name: 'Ultra High-Contrast Light',
      description: 'Pure white canvas, pitch black typography & high-density borders.',
      sample: 'bg-white text-black border-2 border-black'
    },
    {
      mode: 'yellow-black',
      name: 'Yellow on Black (Low Vision)',
      description: 'Golden-yellow text on pure dark background for maximum retinal contrast.',
      sample: 'bg-black text-amber-300 border-2 border-amber-300'
    },
    {
      mode: 'dyslexia-friendly',
      name: 'Dyslexia-Friendly Layout',
      description: 'Increased letter & word spacing, distinct character contrast, and tinted backing.',
      sample: 'bg-amber-50/10 text-amber-100 font-sans tracking-wide'
    }
  ];

  const voiceCommands = [
    { command: '"Like" or "Yes" or "Love"', action: 'Likes the current profile (Swipes Right)' },
    { command: '"Pass" or "Next" or "No"', action: 'Passes to next profile (Swipes Left)' },
    { command: '"Super Like" or "Star"', action: 'Sends a priority Super Like to the profile' },
    { command: '"Read Bio" or "Tell me about them"', action: 'Screen reader reads the full bio, attributes, and tags aloud' },
    { command: '"Stop" or "Quiet"', action: 'Immediately stops speech synthesizer narration' },
    { command: '"Video Bio" or "Play Video"', action: 'Opens and plays the user’s video introduction' },
    { command: '"Filter" or "Search Filters"', action: 'Opens match filters (proximity, religion, education, etc.)' },
    { command: '"High Contrast" or "Contrast"', action: 'Cycles between high-contrast color themes' },
    { command: '"Messages" or "Chat"', action: 'Navigates to your encrypted chats inbox' },
    { command: '"Discover" or "Home"', action: 'Returns to main discovery profile deck' },
    { command: '"Status" or "Stories"', action: 'Opens status updates and micro-moments feed' },
    { command: '"Express Interest" or "Interested"', action: 'Expresses partner interest in the current status post' },
    { command: '"Recall Interest" or "Undo Interest"', action: 'Recalls an accidental interest expression from status update' },
    { command: '"Lock" or "Privacy"', action: 'Activates biometric security lock' },
  ];

  return (
    <div 
      id="accessibility-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-accessibility-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-700 text-neutral-100 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-accessibility-title" className="text-lg font-bold text-white">
                Universal Inclusivity & Accessibility
              </h2>
              <p className="text-xs text-neutral-400">
                Tailor Aura to your vision, hearing, motor, and neurodiversity needs.
              </p>
            </div>
          </div>
          <button
            id="btn-close-accessibility-modal"
            onClick={onClose}
            aria-label="Close accessibility modal"
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-neutral-800 px-5 pt-2 gap-2 bg-neutral-950/40">
          <button
            id="tab-btn-settings"
            onClick={() => {
              setTab('settings');
              if (setActiveTab) setActiveTab('settings');
              audioHaptics.triggerNavigationClick();
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              tab === 'settings' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Visual, Auditory & Haptic Settings
          </button>
          <button
            id="tab-btn-voice-commands"
            onClick={() => {
              setTab('voice-commands');
              if (setActiveTab) setActiveTab('voice-commands');
              audioHaptics.triggerNavigationClick();
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'voice-commands' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            Voice Commands Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {tab === 'settings' ? (
            <>
              {/* Contrast Modes */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Color Contrast & Theming
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {contrastModes.map((item) => (
                    <button
                      key={item.mode}
                      id={`btn-contrast-${item.mode}`}
                      onClick={() => {
                        onUpdateSettings({ contrastMode: item.mode });
                        audioHaptics.triggerNavigationClick();
                      }}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        settings.contrastMode === item.mode
                          ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/50'
                          : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border ${item.sample}`} />
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">{item.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Scaling */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Type className="w-4 h-4 text-emerald-400" />
                  Text Size & Readability
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'large', 'extra-large'] as TextScale[]).map((scale) => (
                    <button
                      key={scale}
                      id={`btn-scale-${scale}`}
                      onClick={() => {
                        onUpdateSettings({ textScale: scale });
                        audioHaptics.triggerNavigationClick();
                      }}
                      className={`py-3 px-2 rounded-xl text-center border font-semibold text-xs capitalize transition-all ${
                        settings.textScale === scale
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 ring-2 ring-emerald-500/40'
                          : 'border-neutral-800 bg-neutral-800/40 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {scale === 'normal' ? '100% Default' : scale === 'large' ? '125% Large' : '150% Extra Large'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speech Synthesizer Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-rose-400" />
                    Screen Reader Speech Speed ({settings.speechRate.toFixed(1)}x)
                  </label>
                  <button
                    id="btn-test-speech-speed"
                    onClick={() => {
                      speechService.setSpeechRate(settings.speechRate);
                      speechService.speak(`Testing speech synthesis rate at ${settings.speechRate.toFixed(1)} times speed.`);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                  >
                    Test Voice Sample
                  </button>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.7"
                  step="0.1"
                  value={settings.speechRate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value);
                    speechService.setSpeechRate(rate);
                    onUpdateSettings({ speechRate: rate });
                  }}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <span>0.7x (Slower)</span>
                  <span>1.0x (Standard)</span>
                  <span>1.7x (Fast)</span>
                </div>
              </div>

              {/* Multi-sensory Toggles */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Tactile & Motor Features
                </label>

                {/* Haptic vibration */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-800/30">
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Vibrate className="w-3.5 h-3.5 text-indigo-400" />
                      Haptic Feedback (Vibrations)
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Gentle tactile pulses when swiping, matching, or using voice commands.
                    </p>
                  </div>
                  <button
                    id="toggle-haptic-settings"
                    onClick={() => {
                      const next = !settings.hapticEnabled;
                      audioHaptics.setPreferences(settings.audioCuesEnabled, next);
                      onUpdateSettings({ hapticEnabled: next });
                      if (next) audioHaptics.triggerMatchCelebration();
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.hapticEnabled ? 'bg-indigo-600' : 'bg-neutral-700'}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 left-1 ${settings.hapticEnabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Sound Cues */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-800/30">
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      Tactile Auditory Cues
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Pleasant synthesized chime chords on likes, passes, and screen changes for low-vision navigation.
                    </p>
                  </div>
                  <button
                    id="toggle-audio-cues"
                    onClick={() => {
                      const next = !settings.audioCuesEnabled;
                      audioHaptics.setPreferences(next, settings.hapticEnabled);
                      onUpdateSettings({ audioCuesEnabled: next });
                      if (next) audioHaptics.triggerSuperLike();
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.audioCuesEnabled ? 'bg-indigo-600' : 'bg-neutral-700'}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 left-1 ${settings.audioCuesEnabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Large Touch Targets */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-800/30">
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
                      Expanded Touch Targets & Tactile Borders
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Enlarges all interactive buttons to 48px+ with distinct high-contrast hit boundaries.
                    </p>
                  </div>
                  <button
                    id="toggle-large-touch"
                    onClick={() => {
                      onUpdateSettings({ largeTouchTargets: !settings.largeTouchTargets });
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.largeTouchTargets ? 'bg-indigo-600' : 'bg-neutral-700'}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 left-1 ${settings.largeTouchTargets ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Voice Commands Guide */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <Mic className="w-4 h-4 text-amber-400" />
                  Hands-Free Voice Command System
                </p>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Turn on Voice Nav from the top bar and speak naturally. You can swipe profiles, listen to audio bios, filter matches, and post status updates completely hands-free!
                </p>
              </div>

              <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-xl overflow-hidden bg-neutral-800/20">
                {voiceCommands.map((cmd, i) => (
                  <div key={i} className="p-3 flex items-center justify-between hover:bg-neutral-800/40 transition-colors">
                    <div>
                      <p className="text-xs font-mono font-bold text-indigo-400">{cmd.command}</p>
                      <p className="text-[11px] text-neutral-300 mt-0.5">{cmd.action}</p>
                    </div>
                    <button
                      onClick={() => {
                        speechService.speak(cmd.action);
                        audioHaptics.triggerVoiceCommandAcknowledge();
                      }}
                      className="text-[10px] px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 font-medium"
                    >
                      Hear Action
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 flex justify-end">
          <button
            id="btn-save-accessibility-settings"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
