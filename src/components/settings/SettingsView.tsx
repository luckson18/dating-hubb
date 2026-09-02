import React, { useState } from 'react';
import { 
  UserProfile, 
  AccessibilitySettings, 
  SavedCredential 
} from '../../types/dating';
import { 
  Sliders, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Eye, 
  Type, 
  Vibrate, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  MapPin, 
  Compass, 
  FileText, 
  WifiOff, 
  RefreshCw, 
  User, 
  LogOut, 
  Key, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  Check, 
  Zap,
  MoreHorizontal,
  Camera,
  Layers
} from 'lucide-react';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';
import { authService } from '../../services/authService';

interface SettingsViewProps {
  currentUser: UserProfile;
  accessibilitySettings: AccessibilitySettings;
  onUpdateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  isVoiceListening: boolean;
  onToggleVoiceListening: () => void;
  isBiometricLocked: boolean;
  onToggleBiometricLock: () => void;
  liveLocation?: { lat: number; lng: number } | null;
  reverseLocationData?: { formattedAddress: string; city: string; neighborhood?: string } | null;
  onOpenVoiceHelp: () => void;
  onOpenFullAccessibilityModal: () => void;
  onOpenDraftsModal: () => void;
  onOpenGeoModal: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
  onSwitchAccount: (cred: SavedCredential) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  accessibilitySettings,
  onUpdateAccessibility,
  isVoiceListening,
  onToggleVoiceListening,
  isBiometricLocked,
  onToggleBiometricLock,
  liveLocation,
  reverseLocationData,
  onOpenVoiceHelp,
  onOpenFullAccessibilityModal,
  onOpenDraftsModal,
  onOpenGeoModal,
  onNavigateToProfile,
  onLogout,
  onSwitchAccount
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'accessibility' | 'security' | 'location' | 'offline' | 'account'>('all');
  const savedCredentials = authService.getSavedCredentials();

  const contrastModes = [
    { id: 'standard', label: 'Standard Dark' },
    { id: 'high-contrast-dark', label: 'High Contrast Dark' },
    { id: 'high-contrast-light', label: 'High Contrast Light' },
    { id: 'yellow-black', label: 'Yellow / Black (Maximum Contrast)' },
    { id: 'dyslexia-friendly', label: 'Dyslexia Friendly' },
  ] as const;

  const textScales = [
    { id: 'normal', label: '100% (Default)', desc: 'Standard readable UI' },
    { id: 'large', label: '125% (Large)', desc: 'Enhanced size & clarity' },
    { id: 'extra-large', label: '150% (Extra Large)', desc: 'Maximum accessibility' },
  ] as const;

  return (
    <div id="app-settings-view" className="w-full max-w-3xl mx-auto py-4 px-2 sm:px-4 space-y-6 animate-fadeIn select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-neutral-900 border border-rose-500/30 text-rose-400">
            <MoreHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              App Settings & Tools
            </h1>
            <p className="text-xs text-neutral-400">
              Consolidated accessibility, voice navigation, biometric security, location, and account management
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            audioHaptics.triggerTap();
            onOpenVoiceHelp();
          }}
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Voice Help</span>
        </button>
      </div>

      {/* Quick Profile Summary Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-rose-500/60 shadow-md flex-shrink-0 bg-neutral-800 flex items-center justify-center">
            {currentUser.photos[0] ? (
              <img
                src={currentUser.photos[0]}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-7 h-7 text-neutral-400" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white truncate">
                {currentUser.name}
              </h2>
              {currentUser.username && (
                <span className="text-xs text-rose-400 font-mono">
                  @{currentUser.username}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 flex items-center gap-2 truncate">
              <span>{currentUser.pronouns || 'they/them'}</span>
              <span>•</span>
              <span className="text-neutral-300">{currentUser.email || 'Registered User'}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            audioHaptics.triggerNavigationClick();
            onNavigateToProfile();
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Edit Profile & Photos</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Accessibility & Assistive Tools Section */}
      <section className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Accessibility & Inclusivity Tools
            </h2>
          </div>
          <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
            Full Inclusivity Engine
          </span>
        </div>

        {/* Voice Navigation HUD Toggle */}
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Voice Command Navigation</span>
              {isVoiceListening && (
                <span className="text-[10px] bg-amber-400 text-neutral-950 font-black px-2 py-0.2 rounded-full animate-pulse">
                  MIC ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Navigate tabs, trigger likes, inspect profiles, and post statuses with spoken speech.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onToggleVoiceListening}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isVoiceListening
                  ? 'bg-amber-400 text-neutral-950 ring-2 ring-amber-300'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
            >
              {isVoiceListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{isVoiceListening ? 'Mute Mic' : 'Start Voice Nav'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenVoiceHelp}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
              title="View Voice Commands Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* High Contrast Theme Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Display Contrast Mode</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {contrastModes.map((mode) => {
              const isSelected = accessibilitySettings.contrastMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    audioHaptics.triggerNavigationClick();
                    onUpdateAccessibility({ contrastMode: mode.id as any });
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 text-white font-bold ring-1 ring-cyan-500/30'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs">{mode.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Scaling Size */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-emerald-400" />
            <span>Font Size & UI Scaling</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {textScales.map((scale) => {
              const isSelected = accessibilitySettings.textScale === scale.id;
              return (
                <button
                  key={scale.id}
                  type="button"
                  onClick={() => {
                    audioHaptics.triggerNavigationClick();
                    onUpdateAccessibility({ textScale: scale.id as any });
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/30'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-xs block font-bold">{scale.label}</span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5 truncate">{scale.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Haptics & Sound Cues Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Vibrate className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-xs font-bold text-white block">Haptic Vibrations</span>
                <span className="text-[10px] text-neutral-400">Tactile taps for matches & actions</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !accessibilitySettings.hapticEnabled;
                audioHaptics.setPreferences(accessibilitySettings.audioCuesEnabled, next);
                onUpdateAccessibility({ hapticEnabled: next });
                if (next) audioHaptics.triggerNavigationClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                accessibilitySettings.hapticEnabled
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {accessibilitySettings.hapticEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {accessibilitySettings.audioCuesEnabled ? (
                <Volume2 className="w-4 h-4 text-rose-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
              <div>
                <span className="text-xs font-bold text-white block">Audio Sound Cues</span>
                <span className="text-[10px] text-neutral-400">Acoustic tones & chime feedback</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !accessibilitySettings.audioCuesEnabled;
                audioHaptics.setPreferences(next, accessibilitySettings.hapticEnabled);
                onUpdateAccessibility({ audioCuesEnabled: next });
                if (next) audioHaptics.triggerTap();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                accessibilitySettings.audioCuesEnabled
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {accessibilitySettings.audioCuesEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Biometric Privacy & Security Vault */}
      <section className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Biometric Vault & Privacy
            </h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            Local Device Encryption
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isBiometricLocked ? (
                <Lock className="w-4 h-4 text-amber-400" />
              ) : (
                <Unlock className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs font-bold text-white">
                {isBiometricLocked ? 'Profile Vault is Currently LOCKED' : 'Profile Vault is UNLOCKED'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              When locked, sensitive personal attributes and video bios require fingerprint/FaceID or PIN authentication to reveal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              audioHaptics.triggerTap();
              onToggleBiometricLock();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer self-end sm:self-auto ${
              isBiometricLocked
                ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400 font-black'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 font-bold'
            }`}
          >
            {isBiometricLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isBiometricLocked ? 'Authenticate & Unlock' : 'Lock Vault Now'}</span>
          </button>
        </div>
      </section>

      {/* 3. Location & Google Maps Geolocation Manager */}
      <section className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Location & Accessible Venues
            </h2>
          </div>
          <span className="text-[11px] font-bold text-rose-400 bg-rose-950/80 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
            Google Maps Platform
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-rose-400" />
              <span>Current Detected Location</span>
            </span>
            <p className="text-xs text-neutral-300 font-medium">
              {reverseLocationData?.formattedAddress || reverseLocationData?.city || (liveLocation ? `${liveLocation.lat.toFixed(4)}, ${liveLocation.lng.toFixed(4)}` : 'Not detected')}
            </p>
            {liveLocation && (
              <p className="text-[10px] text-neutral-500 font-mono">
                Lat: {liveLocation.lat.toFixed(4)}, Lng: {liveLocation.lng.toFixed(4)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              onOpenGeoModal();
            }}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer self-end sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Manage Location & Safe Spots</span>
          </button>
        </div>
      </section>

      {/* 4. Offline Storage & Outbox Sync Hub */}
      <section className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Offline Drafts & Sync Outbox
            </h2>
          </div>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            IndexedDB Resilient
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white">Local Outbox Queue</span>
            <p className="text-[11px] text-neutral-400">
              Messages and status updates authored while offline are saved securely and synchronized automatically when online.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              onOpenDraftsModal();
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer self-end sm:self-auto shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Open Outbox Manager</span>
          </button>
        </div>
      </section>

      {/* 5. Saved Accounts Switcher & Log Out */}
      <section className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Saved Accounts & Session
            </h2>
          </div>
        </div>

        {savedCredentials.length > 0 ? (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-400">
              Switch between saved accounts on this device:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedCredentials.map((cred) => (
                <div
                  key={cred.id}
                  onClick={() => onSwitchAccount(cred)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    cred.userId === currentUser.id
                      ? 'bg-rose-950/30 border-rose-500/50 text-white'
                      : 'bg-neutral-950 border-neutral-800 hover:border-rose-500/40 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {cred.avatar ? (
                      <img
                        src={cred.avatar}
                        alt={cred.name}
                        className="w-8 h-8 rounded-full object-cover border border-rose-500/40"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-rose-900/60 border border-rose-500/40 flex items-center justify-center text-xs font-bold text-rose-200 flex-shrink-0">
                        {cred.name ? cred.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{cred.name}</h4>
                      <p className="text-[10px] text-neutral-400 truncate">@{cred.username}</p>
                    </div>
                  </div>

                  {cred.userId === currentUser.id ? (
                    <span className="text-[9px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-rose-400 hover:underline">
                      Switch
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Sign Out Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              audioHaptics.triggerTap();
              onLogout();
            }}
            className="px-4 py-2.5 rounded-2xl bg-neutral-950 hover:bg-rose-950/80 border border-neutral-800 hover:border-rose-500/50 text-rose-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Switch User</span>
          </button>
        </div>
      </section>

    </div>
  );
};
