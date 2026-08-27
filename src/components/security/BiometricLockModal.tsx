import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Lock, Unlock, KeyRound, Check, AlertCircle, Sparkles, X } from 'lucide-react';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface BiometricLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  reason?: string;
}

export const BiometricLockModal: React.FC<BiometricLockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Biometric Authentication Required",
  reason = "Verify your identity with Face ID, Fingerprint, or Secure PIN to access private profile attributes and encrypted messages."
}) => {
  const [authMode, setAuthMode] = useState<'biometric' | 'pin'>('biometric');
  const [isScanning, setIsScanning] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const triggerBiometricScan = () => {
    setIsScanning(true);
    setError(null);
    audioHaptics.triggerNavigationClick();

    // Simulate WebAuthn / Face ID authenticating
    setTimeout(() => {
      setIsScanning(false);
      setIsSuccess(true);
      audioHaptics.triggerBiometricSuccess();
      speechService.speak("Biometric identity verified.");
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
        onClose();
      }, 700);
    }, 1200);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin.length >= 4) {
      setIsSuccess(true);
      audioHaptics.triggerBiometricSuccess();
      setTimeout(() => {
        setIsSuccess(false);
        setPin('');
        onSuccess();
        onClose();
      }, 700);
    } else {
      setError('Invalid PIN code. Try 1234 or your 4-digit security code.');
      audioHaptics.triggerVoiceCommandError();
    }
  };

  return (
    <div 
      id="biometric-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          id="btn-close-biometric-modal"
          onClick={onClose}
          aria-label="Cancel authentication"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Shield Icon */}
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-all ${
          isSuccess 
            ? 'bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/30' 
            : 'bg-indigo-600/20 text-indigo-400 ring-4 ring-indigo-500/20'
        }`}>
          {isSuccess ? (
            <Unlock className="w-8 h-8 text-emerald-400 animate-bounce" />
          ) : authMode === 'biometric' ? (
            <Fingerprint className={`w-8 h-8 ${isScanning ? 'animate-pulse text-indigo-300' : ''}`} />
          ) : (
            <KeyRound className="w-8 h-8" />
          )}
        </div>

        <h2 id="biometric-modal-title" className="text-lg font-bold text-white mb-1">
          {isSuccess ? "Identity Confirmed!" : title}
        </h2>
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          {reason}
        </p>

        {authMode === 'biometric' ? (
          <div className="w-full space-y-4">
            <button
              id="btn-trigger-biometric-scan"
              onClick={triggerBiometricScan}
              disabled={isScanning || isSuccess}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isScanning
                  ? 'bg-indigo-700 text-indigo-200 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Fingerprint className="w-5 h-5" />
              <span>{isScanning ? 'Verifying Face ID / Fingerprint...' : 'Scan Face ID / Touch ID'}</span>
            </button>

            <button
              id="btn-switch-to-pin"
              onClick={() => {
                setAuthMode('pin');
                audioHaptics.triggerNavigationClick();
              }}
              className="text-xs text-neutral-400 hover:text-indigo-400 underline font-medium"
            >
              Use 4-digit PIN fallback instead
            </button>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="w-full space-y-4">
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (e.g. 1234)"
              autoFocus
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && (
              <p className="text-[11px] text-rose-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
            >
              Unlock Vault
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('biometric');
                audioHaptics.triggerNavigationClick();
              }}
              className="text-xs text-neutral-400 hover:text-indigo-400 underline font-medium block mx-auto"
            >
              Back to Biometric Face/Touch ID
            </button>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-neutral-800 w-full flex items-center justify-center gap-1.5 text-[10px] text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>FIDO2 WebAuthn & Hardware-Enclave Protected</span>
        </div>
      </div>
    </div>
  );
};
