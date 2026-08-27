import { UserProfile, SavedCredential, AuthSession } from '../types/dating';
import { CURRENT_USER, MOCK_PROFILES } from '../data/mockProfiles';

const SAVED_CREDENTIALS_KEY = 'hubb_saved_credentials_v1';
const AUTH_SESSION_KEY = 'hubb_auth_session_v1';

// Seed demo saved accounts for quick 1-tap test logins
const DEFAULT_SAVED_ACCOUNTS: SavedCredential[] = [
  {
    id: 'cred-1',
    userId: 'user-me',
    username: 'alex_rivera',
    email: 'alex.rivera@hubb.app',
    name: 'Alex Rivera',
    avatar: CURRENT_USER.photos[0],
    passwordMasked: '••••••••••••',
    passwordRaw: 'InclusiveLove2026!',
    savedAt: 'Today',
    lastLoginAt: 'Just now',
    biometricEnabled: true,
  },
  {
    id: 'cred-2',
    userId: 'user-1',
    username: 'maya_chen',
    email: 'maya.chen@hubb.app',
    name: 'Maya Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    passwordMasked: '••••••••••',
    passwordRaw: 'MatchaSound2026!',
    savedAt: 'Yesterday',
    lastLoginAt: '2 hours ago',
    biometricEnabled: true,
  },
  {
    id: 'cred-3',
    userId: 'user-2',
    username: 'marcus_adebayo',
    email: 'marcus.adebayo@hubb.app',
    name: 'Marcus Adebayo',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    passwordMasked: '••••••••••••',
    passwordRaw: 'GardenRun2026!',
    savedAt: '3 days ago',
    lastLoginAt: '1 day ago',
    biometricEnabled: false,
  }
];

class AuthService {
  /**
   * Retrieve all saved credentials from local storage
   */
  getSavedCredentials(): SavedCredential[] {
    try {
      const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY);
      if (!raw) {
        // Initialize with default demo accounts so users can immediately test 1-tap login
        localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(DEFAULT_SAVED_ACCOUNTS));
        return DEFAULT_SAVED_ACCOUNTS;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading saved credentials:', e);
      return DEFAULT_SAVED_ACCOUNTS;
    }
  }

  /**
   * Save or update a credential in local storage
   */
  saveCredential(credential: {
    userId: string;
    username: string;
    email: string;
    name: string;
    avatar: string;
    password?: string;
    biometricEnabled?: boolean;
  }): SavedCredential {
    const list = this.getSavedCredentials();
    const existingIndex = list.findIndex(
      c => c.username.toLowerCase() === credential.username.toLowerCase() || 
           c.email.toLowerCase() === credential.email.toLowerCase() ||
           c.userId === credential.userId
    );

    const masked = '••••••••••••';
    const newEntry: SavedCredential = {
      id: existingIndex >= 0 ? list[existingIndex].id : `cred-${Date.now()}`,
      userId: credential.userId,
      username: credential.username.replace(/^@/, '').toLowerCase().trim(),
      email: credential.email.toLowerCase().trim(),
      name: credential.name,
      avatar: credential.avatar,
      passwordMasked: masked,
      passwordRaw: credential.password || (existingIndex >= 0 ? list[existingIndex].passwordRaw : 'SecurePassword2026!'),
      savedAt: 'Just now',
      lastLoginAt: 'Just now',
      biometricEnabled: credential.biometricEnabled !== undefined ? credential.biometricEnabled : true,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newEntry;
    } else {
      list.unshift(newEntry);
    }

    try {
      localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to persist saved credential:', e);
    }

    return newEntry;
  }

  /**
   * Remove a saved credential
   */
  removeSavedCredential(id: string): void {
    const list = this.getSavedCredentials().filter(c => c.id !== id);
    try {
      localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to delete saved credential:', e);
    }
  }

  /**
   * Check if a username or email is already saved
   */
  isCredentialSaved(identifier: string): boolean {
    const list = this.getSavedCredentials();
    const clean = identifier.replace(/^@/, '').toLowerCase().trim();
    return list.some(c => c.username.toLowerCase() === clean || c.email.toLowerCase() === clean);
  }

  /**
   * Retrieve active stored session
   */
  getStoredSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      return parsed;
    } catch (e) {
      console.warn('Failed to parse auth session:', e);
      return null;
    }
  }

  /**
   * Set stored session
   */
  setStoredSession(session: AuthSession | null): void {
    try {
      if (session) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch (e) {
      console.warn('Failed to update auth session:', e);
    }
  }

  /**
   * Authenticate with username or email + password
   */
  authenticate(
    identifier: string,
    password: string,
    rememberMe: boolean = true,
    availableProfiles: UserProfile[] = MOCK_PROFILES,
    currentMe: UserProfile = CURRENT_USER
  ): { success: boolean; user?: UserProfile; message?: string; rawPassword?: string } {
    const cleanId = identifier.replace(/^@/, '').toLowerCase().trim();

    if (!cleanId) {
      return { success: false, message: 'Please enter your username or email address.' };
    }

    if (!password) {
      return { success: false, message: 'Please enter your account password.' };
    }

    // Match against current user
    const currentMatches = 
      (currentMe.username && currentMe.username.toLowerCase() === cleanId) ||
      (currentMe.email && currentMe.email.toLowerCase() === cleanId) ||
      currentMe.name.toLowerCase() === cleanId;

    if (currentMatches) {
      const session: AuthSession = {
        isAuthenticated: true,
        user: currentMe,
        token: `hubb_token_${Date.now()}`,
        rememberMe,
        loginTime: new Date().toISOString(),
      };
      this.setStoredSession(session);
      return { success: true, user: currentMe, rawPassword: password };
    }

    // Match against mock profiles
    const matchedProfile = availableProfiles.find(p => 
      (p.username && p.username.toLowerCase() === cleanId) ||
      (p.email && p.email.toLowerCase() === cleanId) ||
      p.name.toLowerCase() === cleanId
    );

    if (matchedProfile) {
      const session: AuthSession = {
        isAuthenticated: true,
        user: matchedProfile,
        token: `hubb_token_${Date.now()}`,
        rememberMe,
        loginTime: new Date().toISOString(),
      };
      this.setStoredSession(session);
      return { success: true, user: matchedProfile, rawPassword: password };
    }

    // If identifier is well-formed (custom username or email), dynamically support logging in
    const isEmail = cleanId.includes('@');
    const customUser: UserProfile = {
      ...currentMe,
      id: `user-custom-${Date.now()}`,
      name: isEmail ? cleanId.split('@')[0].replace(/[._-]/g, ' ') : cleanId.charAt(0).toUpperCase() + cleanId.slice(1),
      username: isEmail ? cleanId.split('@')[0] : cleanId,
      email: isEmail ? cleanId : `${cleanId}@hubb.app`,
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      ],
      bio: 'New member on hubb. Excited to discover accessible venues and genuine connections.',
    };

    const session: AuthSession = {
      isAuthenticated: true,
      user: customUser,
      token: `hubb_token_${Date.now()}`,
      rememberMe,
      loginTime: new Date().toISOString(),
    };
    this.setStoredSession(session);

    return { success: true, user: customUser, rawPassword: password };
  }

  /**
   * Register a new user with full details
   */
  register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    gender?: string;
    pronouns?: string;
    accessibilityBadges?: string[];
  }): { success: boolean; user: UserProfile; rawPassword: string } {
    const cleanUsername = data.username.replace(/^@/, '').toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();

    const newUser: UserProfile = {
      ...CURRENT_USER,
      id: `user-new-${Date.now()}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      pronouns: data.pronouns || 'they/them',
      gender: (data.gender as any) || 'Non-binary',
      accessibilityBadges: data.accessibilityBadges && data.accessibilityBadges.length > 0 
        ? data.accessibilityBadges 
        : ['Screen Reader Advocate', 'Sensory-Friendly Ally'],
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
      ],
      bio: `Hello! I'm ${data.name.trim()}. Excited to explore inclusive dating and meet wonderful people on hubb.`,
    };

    const session: AuthSession = {
      isAuthenticated: true,
      user: newUser,
      token: `hubb_token_${Date.now()}`,
      rememberMe: true,
      loginTime: new Date().toISOString(),
    };
    this.setStoredSession(session);

    return { success: true, user: newUser, rawPassword: data.password };
  }

  /**
   * Log out and clear session
   */
  logout(): void {
    this.setStoredSession(null);
  }
}

export const authService = new AuthService();
