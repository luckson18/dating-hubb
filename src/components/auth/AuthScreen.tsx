import React, { useState, useEffect } from 'react';
import { UserProfile, SavedCredential, AccessibilitySettings } from '../../types/dating';
import { 
  Lock, 
  User, 
  Mail, 
  AtSign, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Fingerprint, 
  Trash2, 
  Key, 
  Award,
  Volume2,
  VolumeX,
  Contrast,
  Type
} from 'lucide-react';
import { authService } from '../../services/authService';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';
import { HubbLogo } from '../common/HubbLogo';
import { PhotoUploadInput } from '../common/PhotoUploadInput';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, rawPassword?: string, isNewLogin?: boolean) => void;
  availableProfiles: UserProfile[];
  currentUser: UserProfile;
  accessibilitySettings: AccessibilitySettings;
  onUpdateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
}

const INCLUSIVITY_BADGES = [
  'Screen Reader Advocate',
  'ASL Signer',
  'Deaf / Hard of Hearing',
  'Neurodivergent Ally',
  'Wheelchair Ally / User',
  'Blind / Low Vision Advocate',
  'Tactile & Sensory Friendly',
  'Subtitles Enthusiast'
];

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  availableProfiles,
  currentUser,
  accessibilitySettings,
  onUpdateAccessibility,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Login Form Fields (Clean initial state - zero fake prefill)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form Fields (Clean initial state)
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupPronouns, setSignupPronouns] = useState('');
  const [signupPhotoUrl, setSignupPhotoUrl] = useState('');
  const [signupPhotoDescription, setSignupPhotoDescription] = useState('');
  const [signupBadges, setSignupBadges] = useState<string[]>([]);

  // UI / State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [savedCredentials, setSavedCredentials] = useState<SavedCredential[]>([]);
  const [activeQuickTab, setActiveQuickTab] = useState<'form' | 'saved'>('form');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Load saved credentials on mount without auto-filling the manual input fields
  useEffect(() => {
    const list = authService.getSavedCredentials();
    setSavedCredentials(list);
  }, []);

  const handlePasswordResetSuccess = (email: string, newPasswordRaw: string, resetUser?: UserProfile) => {
    setIdentifier(email);
    setPassword(newPasswordRaw);
    setSuccessNotice(`Password reset successfully! Logged in with ${email}.`);
    
    // Auto-login or prefill for immediate seamless entry
    if (resetUser) {
      setTimeout(() => {
        onLoginSuccess(resetUser, newPasswordRaw, false);
      }, 500);
    } else {
      const refreshed = authService.getSavedCredentials();
      setSavedCredentials(refreshed);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your username or email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    audioHaptics.triggerNavigationClick();

    setTimeout(() => {
      const result = authService.authenticate(
        identifier,
        password,
        rememberMe,
        availableProfiles
      );

      setIsLoading(false);
      if (result.success && result.user) {
        audioHaptics.triggerMatch();
        onLoginSuccess(result.user, result.rawPassword, true);
      } else {
        audioHaptics.triggerPass();
        setErrorMessage(result.message || 'Unable to sign in. Please verify your credentials or create a new account.');
        speechService.speak(result.message || 'Login failed. Please check your credentials.');
      }
    }, 350);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupUsername.trim()) {
      setErrorMessage('Please choose a username.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    audioHaptics.triggerNavigationClick();

    setTimeout(() => {
      const result = authService.register({
        name: signupName,
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        photoUrl: signupPhotoUrl,
        photoDescription: signupPhotoDescription,
        pronouns: signupPronouns,
        accessibilityBadges: signupBadges,
      });

      setIsLoading(false);
      if (result.success && result.user) {
        audioHaptics.triggerMatch();
        onLoginSuccess(result.user, result.rawPassword, true);
      }
    }, 400);
  };

  const handleQuickLoginSaved = (cred: SavedCredential) => {
    audioHaptics.triggerNavigationClick();
    setIsLoading(true);

    setTimeout(() => {
      const result = authService.authenticate(
        cred.username || cred.email,
        cred.passwordRaw || '',
        true,
        availableProfiles
      );

      setIsLoading(false);
      if (result.success && result.user) {
        audioHaptics.triggerMatch();
        onLoginSuccess(result.user, cred.passwordRaw, false);
      } else {
        setErrorMessage('Quick login failed. Please enter credentials manually.');
      }
    }, 250);
  };

  const handleRemoveSavedCred = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    authService.removeSavedCredential(id);
    setSavedCredentials(prev => prev.filter(c => c.id !== id));
    audioHaptics.triggerTap();
  };

  const toggleSignupBadge = (badge: string) => {
    setSignupBadges(prev => 
      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
    );
    audioHaptics.triggerTap();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-[#100305] to-neutral-950 text-white flex flex-col items-center justify-between p-4 sm:p-6 select-none relative overflow-x-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-rose-700/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Accessibility Bar */}
      <header className="w-full max-w-md flex items-center justify-between z-20 pb-4 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            Inclusive Dating Portal
          </span>
        </div>

        {/* Quick Accessibility Controls */}
        <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 p-1 rounded-2xl shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              const modes = ['standard', 'high-contrast-dark', 'high-contrast-light', 'yellow-black'] as const;
              const next = modes[(modes.indexOf(accessibilitySettings.contrastMode as any) + 1) % modes.length];
              onUpdateAccessibility({ contrastMode: next });
              audioHaptics.triggerTap();
            }}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label={`Toggle contrast mode. Current: ${accessibilitySettings.contrastMode}`}
            title="High Contrast Mode"
          >
            <Contrast className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              const scales = ['normal', 'large', 'extra-large'] as const;
              const next = scales[(scales.indexOf(accessibilitySettings.textScale) + 1) % scales.length];
              onUpdateAccessibility({ textScale: next });
              audioHaptics.triggerTap();
            }}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label={`Toggle text scale. Current: ${accessibilitySettings.textScale}`}
            title="Text Size"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !accessibilitySettings.audioCuesEnabled;
              onUpdateAccessibility({ audioCuesEnabled: next });
              audioHaptics.setPreferences(next, accessibilitySettings.hapticEnabled);
            }}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label={`Toggle sound cues. Current: ${accessibilitySettings.audioCuesEnabled ? 'Enabled' : 'Disabled'}`}
            title="Sound Feedback"
          >
            {accessibilitySettings.audioCuesEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
            )}
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative z-10 space-y-6">
        
        {/* App Vector Logo & Branding Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="group cursor-pointer" onClick={() => audioHaptics.triggerTap()}>
            <HubbLogo size="xl" showBadge={true} />
          </div>
          <p className="text-xs text-neutral-400 font-medium">
            Inclusive, accessible & meaningful connections
          </p>
        </div>

        {/* Mode Switcher Tabs (Sign In / Sign Up) */}
        <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
              audioHaptics.triggerTap();
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'login'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60 font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
              audioHaptics.triggerTap();
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60 font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3 rounded-2xl bg-rose-950/70 border border-rose-600/50 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn"
          >
            <span className="font-bold text-rose-400">Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ======================= LOGIN FORM ======================= */}
        {authMode === 'login' && (
          <div className="space-y-4">
            
            {/* Quick Toggle: Form vs Saved Accounts (if any exist) */}
            {savedCredentials.length > 0 && (
              <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-800/80">
                <span className="text-neutral-400 font-medium">Login Method:</span>
                <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setActiveQuickTab('form')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      activeQuickTab === 'form'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Credentials
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveQuickTab('saved')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      activeQuickTab === 'saved'
                        ? 'bg-neutral-800 text-rose-300'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Key className="w-3 h-3 text-rose-400" />
                    <span>Saved ({savedCredentials.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Saved Accounts 1-Tap List */}
            {activeQuickTab === 'saved' && savedCredentials.length > 0 ? (
              <div className="space-y-2.5">
                <div className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-rose-400" />
                  <span>1-Tap Sign In with Saved Accounts:</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {savedCredentials.map((cred) => (
                    <div
                      key={cred.id}
                      onClick={() => handleQuickLoginSaved(cred)}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-rose-500/50 transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {cred.avatar ? (
                          <img
                            src={cred.avatar}
                            alt={cred.name}
                            className="w-10 h-10 rounded-full object-cover border border-rose-500/40"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-700">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white group-hover:text-rose-200 truncate">
                            {cred.name}
                          </h4>
                          <p className="text-[11px] text-neutral-400 truncate">
                            @{cred.username} • {cred.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSavedCred(e, cred.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition-colors"
                          title="Remove saved credential"
                          aria-label={`Remove saved login for ${cred.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="p-1.5 rounded-xl bg-rose-950 text-rose-300 group-hover:bg-rose-600 group-hover:text-white border border-rose-500/40 transition-all">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveQuickTab('form')}
                  className="w-full py-2 text-center text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Or enter credentials manually
                </button>
              </div>
            ) : (
              /* Standard Username / Email Login Form */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Identifier: Username OR Email */}
                <div className="space-y-1.5">
                  <label htmlFor="auth-identifier" className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-rose-400" />
                      Username or Email Address
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="auth-identifier"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter username or email address"
                      className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all pl-10"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      {identifier.includes('@') ? (
                        <Mail className="w-4 h-4 text-rose-400" />
                      ) : (
                        <AtSign className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Success Notice Box */}
                {successNotice && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{successNotice}</span>
                  </div>
                )}

                {/* Password Field with Show/Hide Toggle (show password on login) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="auth-password" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      id="btn-forgot-password-link"
                      onClick={() => {
                        setShowForgotPassword(true);
                        audioHaptics.triggerNavigationClick();
                      }}
                      className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all pl-10 pr-12"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Key className="w-4 h-4 text-amber-400" />
                    </div>
                    {/* Show Password Toggle Button */}
                    <button
                      type="button"
                      id="btn-toggle-show-password"
                      onClick={() => {
                        setShowPassword(!showPassword);
                        audioHaptics.triggerTap();
                      }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-rose-300 cursor-pointer transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-neutral-400 hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                    />
                    <span>Remember me on this device</span>
                  </label>

                  <span className="text-[11px] text-neutral-400">Encrypted Local Vault</span>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-rose-950/70 border border-rose-500/50 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-rose-200" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to hubb</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        )}

        {/* ======================= SIGN UP FORM ======================= */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            
            {/* User Profile Photo Adding */}
            <PhotoUploadInput
              currentPhotoUrl={signupPhotoUrl}
              onPhotoSelected={(dataUrl, alt) => {
                setSignupPhotoUrl(dataUrl);
                if (alt) setSignupPhotoDescription(alt);
              }}
              onRemovePhoto={() => {
                setSignupPhotoUrl('');
                setSignupPhotoDescription('');
              }}
              label="Add Your Profile Photo"
              showAltTextInput={false}
              initialAltText={signupPhotoDescription}
            />

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="signup-name" className="text-xs font-bold text-neutral-300">
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Jordan Taylor"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all"
              />
            </div>

            {/* Username & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="signup-username" className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                  <AtSign className="w-3 h-3 text-rose-400" />
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  required
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="choose_username"
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="signup-email" className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-rose-400" />
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Pronouns */}
            <div className="space-y-1">
              <label htmlFor="signup-pronouns" className="text-xs font-bold text-neutral-300">
                Pronouns
              </label>
              <select
                id="signup-pronouns"
                value={signupPronouns}
                onChange={(e) => setSignupPronouns(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="they/them">they/them</option>
                <option value="she/her">she/her</option>
                <option value="he/him">he/him</option>
                <option value="she/they">she/they</option>
                <option value="he/they">he/they</option>
                <option value="any pronouns">any pronouns</option>
              </select>
            </div>

            {/* Password & Confirm Password (with Show/Hide Toggle) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="signup-pwd" className="text-xs font-bold text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-pwd"
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-3.5 py-2.5 pr-9 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="signup-confirm-pwd" className="text-xs font-bold text-neutral-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm-pwd"
                    type={showSignupConfirmPassword ? 'text' : 'password'}
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-2xl px-3.5 py-2.5 pr-9 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                  >
                    {showSignupConfirmPassword ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-rose-950/70 border border-rose-500/50 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-rose-200" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="w-full max-w-md text-center pt-4 pb-2 z-20">
        <p className="text-[11px] text-neutral-500">
          hubb • Inclusive Dating • Encrypted Biometric & Offline Vault <br /> Naomi & Lucky
        </p>
      </footer>

      {/* Forgot Password Reset Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onPasswordResetSuccess={handlePasswordResetSuccess}
        initialIdentifier={identifier}
      />
    </div>
  );
};
