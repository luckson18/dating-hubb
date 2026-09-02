import React from 'react';
import { 
  Mic, 
  MicOff, 
  Eye, 
  Type, 
  Vibrate, 
  Sliders, 
  HelpCircle,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { AccessibilitySettings } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';

interface AccessibilityBarProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onOpenSettingsModal: () => void;
  onOpenHelpModal: () => void;
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
  isBiometricLocked: boolean;
  onToggleBiometricLock: () => void;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettingsModal,
  onOpenHelpModal,
  isListening,
  onToggleListening,
  isBiometricLocked,
  onToggleBiometricLock
}) => {
  const toggleContrast = () => {
    audioHaptics.triggerNavigationClick();
    const modes = ['standard', 'high-contrast-dark', 'high-contrast-light', 'yellow-black', 'dyslexia-friendly'] as const;
    const currentIndex = modes.indexOf(settings.contrastMode as any);
    const nextIndex = (currentIndex + 1) % modes.length;
    onUpdateSettings({ contrastMode: modes[nextIndex] });
  };

  const cycleTextScale = () => {
    audioHaptics.triggerNavigationClick();
    const scales = ['normal', 'large', 'extra-large'] as const;
    const currentIndex = scales.indexOf(settings.textScale);
    const nextIndex = (currentIndex + 1) % scales.length;
    onUpdateSettings({ textScale: scales[nextIndex] });
  };

  return (
    <aside 
      id="accessibility-toolbar"
      aria-label="Accessibility & Voice Controls" 
      className="bg-neutral-900/95 text-white border-b border-neutral-700/80 backdrop-blur-md px-3 py-2 text-xs select-none z-50 sticky top-0 shadow-md"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Quick Inclusivity Actions */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Voice Command Activation */}
          <button
            id="btn-voice-commands"
            onClick={onToggleListening}
            aria-pressed={isListening}
            aria-label={isListening ? "Voice commands active. Click to mute microphone." : "Activate Voice Commands navigation"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all ${
              isListening 
                ? 'bg-amber-400 text-neutral-950 ring-2 ring-amber-300 animate-pulse font-semibold' 
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
          >
            {isListening ? <Mic className="w-3.5 h-3.5 text-neutral-950 animate-bounce" /> : <MicOff className="w-3.5 h-3.5 text-neutral-400" />}
            <span className="hidden sm:inline">{isListening ? 'Voice Nav: ON' : 'Voice Nav'}</span>
            <span className="sm:hidden">{isListening ? 'Voice ON' : 'Voice'}</span>
          </button>

          {/* Contrast Mode Switcher */}
          <button
            id="btn-contrast-mode"
            onClick={toggleContrast}
            aria-label={`Current contrast mode: ${settings.contrastMode}. Click to cycle.`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Mode:</span>
            <span className="capitalize font-medium text-cyan-300">
              {settings.contrastMode === 'standard' ? 'Standard' : settings.contrastMode.replace('-', ' ')}
            </span>
          </button>

          {/* Text Size Scale */}
          <button
            id="btn-text-scale"
            onClick={cycleTextScale}
            aria-label={`Text size: ${settings.textScale}. Click to resize.`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
          >
            <Type className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-300">
              {settings.textScale === 'normal' ? '100%' : settings.textScale === 'large' ? '125%' : '150%'}
            </span>
          </button>

          {/* Haptic & Sound Toggle */}
          <button
            id="btn-haptic-feedback"
            onClick={() => {
              const next = !settings.hapticEnabled;
              audioHaptics.setPreferences(settings.audioCuesEnabled, next);
              onUpdateSettings({ hapticEnabled: next });
              if (next) audioHaptics.triggerNavigationClick();
            }}
            aria-pressed={settings.hapticEnabled}
            aria-label={settings.hapticEnabled ? "Haptic vibration feedback enabled" : "Haptic feedback disabled"}
            className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-md border ${
              settings.hapticEnabled 
                ? 'bg-neutral-800 border-indigo-500/80 text-indigo-300' 
                : 'bg-neutral-800/50 border-neutral-700 text-neutral-400'
            }`}
          >
            <Vibrate className="w-3.5 h-3.5" />
            <span>Haptics {settings.hapticEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Right: Security & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Biometric Security Lock Status */}
          <button
            id="btn-biometric-quick-lock"
            onClick={onToggleBiometricLock}
            aria-label={isBiometricLocked ? "App is biometric locked. Click to authenticate." : "Lock profile with biometrics"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
              isBiometricLocked 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
            }`}
          >
            {isBiometricLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isBiometricLocked ? 'Profile Locked' : 'Biometric Vault'}</span>
          </button>

          {/* Voice Help Modal */}
          <button
            id="btn-voice-help"
            onClick={onOpenHelpModal}
            aria-label="Voice commands cheat sheet"
            className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
            title="Voice Commands Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Full Accessibility Preferences Modal */}
          <button
            id="btn-full-accessibility-settings"
            onClick={onOpenSettingsModal}
            aria-label="Open comprehensive accessibility preferences"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Accessibility</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
