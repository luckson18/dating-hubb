import React, { useState } from 'react';
import { 
  Mail, 
  Key, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Sparkles, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Inbox
} from 'lucide-react';
import { authService } from '../../services/authService';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';
import { UserProfile } from '../../types/dating';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordResetSuccess: (email: string, newPasswordRaw: string, user?: UserProfile) => void;
  initialIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onPasswordResetSuccess,
  initialIdentifier = ''
}) => {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [targetEmail, setTargetEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<UserProfile | undefined>(undefined);

  if (!isOpen) return null;

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your account email or username.');
      return;
    }

    setIsLoading(true);
    audioHaptics.triggerNavigationClick();

    setTimeout(() => {
      const res = authService.requestPasswordReset(identifier);
      setIsLoading(false);

      if (res.success && res.email && res.code) {
        setTargetEmail(res.email);
        setMaskedEmail(res.maskedEmail || res.email);
        setSimulatedCode(res.code);
        setStep('verify');
        audioHaptics.triggerSuccessChime();
        speechService.speak(`Password reset code sent to ${res.maskedEmail || res.email}`);
      } else {
        audioHaptics.triggerPass();
        setErrorMessage(res.message);
        speechService.speak(res.message);
      }
    }, 400);
  };

  const handleResendCode = () => {
    setErrorMessage(null);
    setIsLoading(true);
    audioHaptics.triggerTap();

    setTimeout(() => {
      const res = authService.requestPasswordReset(targetEmail || identifier);
      setIsLoading(false);
      if (res.success && res.code) {
        setSimulatedCode(res.code);
        setSuccessMessage(`New 6-digit code dispatched to ${res.maskedEmail || targetEmail}`);
        audioHaptics.triggerSuccessChime();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.message);
      }
    }, 300);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetCode.trim() || resetCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code from your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    audioHaptics.triggerNavigationClick();

    setTimeout(() => {
      const res = authService.resetPassword(targetEmail, resetCode, newPassword);
      setIsLoading(false);

      if (res.success) {
        setResetUser(res.user);
        setStep('success');
        audioHaptics.triggerMatchCelebration();
        speechService.speak("Password reset successful! You can now log in.");
      } else {
        audioHaptics.triggerPass();
        setErrorMessage(res.message);
        speechService.speak(res.message);
      }
    }, 450);
  };

  const handleFinishAndSignIn = () => {
    audioHaptics.triggerMatch();
    onPasswordResetSuccess(targetEmail, newPassword, resetUser);
    onClose();
  };

  return (
    <div 
      id="forgot-password-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 id="forgot-password-title" className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>Account Recovery</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
                  Email Reset
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {step === 'request' && 'Send a secure password reset link to your email'}
                {step === 'verify' && 'Verify code & choose a strong new password'}
                {step === 'success' && 'Password updated successfully'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close recovery modal"
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs flex items-start gap-2 animate-fadeIn">
            <span className="font-bold text-rose-400">Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ================= STEP 1: REQUEST CODE ================= */}
        {step === 'request' && (
          <form onSubmit={handleRequestCode} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="recovery-identifier" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>Your Registered Email or Username</span>
              </label>
              <div className="relative">
                <input
                  id="recovery-identifier"
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. simonchikondi8@gmail.com or @username"
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                We'll dispatch a 6-digit verification code to the registered email address tied to your account.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/60 border border-rose-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-rose-200" />
                    <span>Locating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 2: VERIFY CODE & ENTER NEW PASSWORD ================= */}
        {step === 'verify' && (
          <form onSubmit={handleResetSubmit} className="p-5 space-y-4">
            
            {/* Simulated Email Delivery Alert Banner for Smooth Experience */}
            {simulatedCode && (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-indigo-500/40 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                    Email Notification Sent to {maskedEmail}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setResetCode(simulatedCode);
                      audioHaptics.triggerTap();
                    }}
                    className="text-[11px] font-bold text-rose-300 hover:text-rose-200 underline cursor-pointer"
                  >
                    1-Tap Auto-fill
                  </button>
                </div>
                <div className="flex items-center justify-between bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-[11px] text-neutral-400">Verification Code:</span>
                  <span className="font-mono font-black text-sm tracking-widest text-white bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">
                    {simulatedCode}
                  </span>
                </div>
              </div>
            )}

            {/* 6-Digit Code Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="recovery-code" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>6-Digit Verification Code</span>
                </label>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-[11px] text-neutral-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>
              <input
                id="recovery-code"
                type="text"
                maxLength={6}
                required
                autoFocus
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* New Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="recovery-new-password" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>New Password</span>
              </label>
              <div className="relative">
                <input
                  id="recovery-new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 pl-10 pr-12"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4 text-rose-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="recovery-confirm-password" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Confirm New Password</span>
              </label>
              <div className="relative">
                <input
                  id="recovery-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 pl-10 pr-12"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4 text-rose-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Reset Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="px-4 py-2.5 rounded-xl border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/60 border border-rose-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-rose-200" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset & Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: SUCCESS CONFIRMATION ================= */}
        {step === 'success' && (
          <div className="p-6 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/80">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-white">
                Password Successfully Reset!
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
                Your Hubb account credentials have been updated securely. You can now proceed to your profile.
              </p>
            </div>

            <button
              type="button"
              id="btn-finish-password-reset"
              onClick={handleFinishAndSignIn}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 border border-emerald-400/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
