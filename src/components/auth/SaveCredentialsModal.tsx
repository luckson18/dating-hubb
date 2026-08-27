import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../../types/dating';
import { Key, ShieldCheck, Check, X, Sparkles, Lock, Smartphone, AtSign, Mail } from 'lucide-react';
import hubbAppIcon from '../../assets/images/hubb-app-icon.jpg';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface SaveCredentialsModalProps {
  isOpen: boolean;
  user: UserProfile;
  rawPassword?: string;
  onSave: (biometricEnabled: boolean) => void;
  onSkip: () => void;
}

export const SaveCredentialsModal: React.FC<SaveCredentialsModalProps> = ({
  isOpen,
  user,
  rawPassword = '••••••••••••',
  onSave,
  onSkip,
}) => {
  const [enableBiometrics, setEnableBiometrics] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      audioHaptics.triggerModalOpen();
      speechService.speak('Login successful. Would you like to save your login credentials on this device for 1-tap fast access?');
      setTimeout(() => {
        saveBtnRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSkip]);

  if (!isOpen) return null;

  const handleConfirmSave = () => {
    setIsSaving(true);
    audioHaptics.triggerSaveDraft();
    setTimeout(() => {
      onSave(enableBiometrics);
      setIsSaving(false);
    }, 450);
  };

  const usernameDisplay = user.username ? `@${user.username}` : `@${user.name.toLowerCase().replace(/\s+/g, '_')}`;
  const emailDisplay = user.email || `${user.username || user.name.toLowerCase().replace(/\s+/g, '_')}@hubb.app`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-cred-title"
      aria-describedby="save-cred-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-rose-950/40 text-white space-y-5 overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-600/25 blur-3xl pointer-events-none rounded-full" />

        {/* Header with App Logo Badge */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur-xs opacity-75" />
              <img
                src={hubbAppIcon}
                alt="hubb application logo"
                className="relative w-12 h-12 rounded-2xl object-cover border border-rose-500/50 shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-rose-400" />
                  Credentials Vault
                </span>
              </div>
              <h2 id="save-cred-title" className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Save Login Credentials?
              </h2>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="p-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
            aria-label="Do not save credentials and dismiss modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p id="save-cred-desc" className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Would you like <span className="font-bold text-white">hubb</span> to securely store your sign-in details on this device? You won't need to retype your username, email, or password on your next visit.
        </p>

        {/* Credentials Card Preview */}
        <div className="bg-neutral-950/80 rounded-2xl p-4 border border-neutral-800 space-y-3 shadow-inner">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/80">
            <img
              src={user.photos[0]}
              alt={user.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-rose-500/60"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                {user.name}
                {user.verified && (
                  <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded-full font-bold">
                    Verified
                  </span>
                )}
              </h3>
              <p className="text-xs text-rose-300/90 font-medium truncate flex items-center gap-1">
                <AtSign className="w-3 h-3 text-rose-400 shrink-0" />
                {usernameDisplay}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Email</span>
                <span className="text-neutral-200 truncate font-mono text-[11px] block">{emailDisplay}</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Password</span>
                <span className="text-amber-300/90 font-mono tracking-widest text-[11px] block">
                  {rawPassword ? '••••••••••••' : '••••••••'}
                </span>
              </div>
            </div>
          </div>

          {/* Biometric Toggle */}
          <label className="flex items-center justify-between gap-3 pt-2 text-xs text-neutral-300 cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Enable 1-Tap Biometric / Fast Sign-In</span>
            </div>
            <input
              type="checkbox"
              checked={enableBiometrics}
              onChange={(e) => setEnableBiometrics(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
            />
          </label>
        </div>

        {/* Security Note */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-xl">
          <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Encrypted inside device-level isolated storage. Never sent to untrusted third parties.</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold border border-neutral-700 transition-all cursor-pointer"
          >
            Not Now
          </button>

          <button
            ref={saveBtnRef}
            type="button"
            disabled={isSaving}
            onClick={handleConfirmSave}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black tracking-wide shadow-lg shadow-rose-950/60 border border-rose-500/50 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-rose-200" />
                <span>Saving to Vault...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Credentials</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
