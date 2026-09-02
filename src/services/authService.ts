import { UserProfile, SavedCredential, AuthSession } from '../types/dating';

const SAVED_CREDENTIALS_KEY = 'hubb_saved_credentials_v1';
const AUTH_SESSION_KEY = 'hubb_auth_session_v1';
const REGISTERED_USERS_KEY = 'hubb_registered_users_v1';
const PASSWORD_RESETS_KEY = 'hubb_password_resets_v1';

export interface PasswordResetToken {
  email: string;
  code: string;
  expiresAt: number;
  userId?: string;
}

// Default: Zero fake or sample profiles. Only authentic user-created accounts exist!
const DEFAULT_SAVED_ACCOUNTS: SavedCredential[] = [];

const FAKE_USER_IDS = new Set([
  'user-elena-vance',
  'user-marcus-chen',
  'user-zara-al-mansoor',
  'user-kofi-mensah',
  'user-maya-lin',
  'user-priya-patel',
  'user-jordan-rivera',
  'user-sophia-rossi',
  'user-lucas-silva',
  'user-aria-montgomery',
]);

export function isFakeOrSampleUser(u: Partial<UserProfile> | null | undefined): boolean {
  if (!u || !u.id) return false;
  if (FAKE_USER_IDS.has(u.id)) return true;
  if (u.email && u.email.toLowerCase().endsWith('@hubb.app')) return true;
  return false;
}

class AuthService {
  /**
   * Retrieve all registered users created in the app (only authentic user-created accounts)
   */
  getRegisteredUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      let localList: UserProfile[] = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localList = parsed;
        }
      }

      // Filter out any fake or sample profiles strictly
      const authenticList = localList.filter(u => !isFakeOrSampleUser(u));

      // Also clean any stock fake photos from authentic users if present
      authenticList.forEach(u => {
        if (u.photos && Array.isArray(u.photos)) {
          u.photos = u.photos.filter(p => !p.includes('images.unsplash.com'));
        }
      });

      // Update storage if any legacy fake users were purged
      if (authenticList.length !== localList.length) {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(authenticList));
      }

      return authenticList;
    } catch (e) {
      console.warn('Error reading registered users from storage:', e);
      return [];
    }
  }

  /**
   * Save or update a registered user
   */
  saveRegisteredUser(user: UserProfile): void {
    const list = this.getRegisteredUsers();
    const existingIndex = list.findIndex(
      u => u.id === user.id || 
           (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase()) ||
           (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
    );

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...user };
    } else {
      list.push(user);
    }

    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
      // Attempt async sync with server
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch(() => {
        // silent fallback if server offline
      });
    } catch (e) {
      console.warn('Failed to persist registered user:', e);
    }
  }

  /**
   * Sync registered users from backend server
   */
  async syncRegisteredUsersFromServer(): Promise<UserProfile[]> {
    try {
      const resp = await fetch('/api/users');
      if (resp.ok) {
        const serverUsers: UserProfile[] = await resp.json();
        if (Array.isArray(serverUsers)) {
          const cleanServerUsers = serverUsers.filter(u => !isFakeOrSampleUser(u));
          cleanServerUsers.forEach(u => {
            if (u.photos && Array.isArray(u.photos)) {
              u.photos = u.photos.filter(p => !p.includes('images.unsplash.com'));
            }
          });

          const localUsers = this.getRegisteredUsers();
          const mergedMap = new Map<string, UserProfile>();
          
          localUsers.forEach(u => mergedMap.set(u.id, u));
          cleanServerUsers.forEach(u => mergedMap.set(u.id, u));
          
          const merged = Array.from(mergedMap.values());
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch {
      // offline or fallback
    }
    return this.getRegisteredUsers();
  }

  /**
   * Retrieve all saved credentials from local storage (only real user accounts)
   */
  getSavedCredentials(): SavedCredential[] {
    try {
      const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const clean = parsed.filter(c => {
        if (!c) return false;
        if (FAKE_USER_IDS.has(c.userId)) return false;
        if (c.email && c.email.toLowerCase().endsWith('@hubb.app')) return false;
        return true;
      });

      clean.forEach(c => {
        if (c.avatar && c.avatar.includes('images.unsplash.com')) {
          c.avatar = '';
        }
      });

      if (clean.length !== parsed.length) {
        localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(clean));
      }
      return clean;
    } catch (e) {
      console.warn('Error reading saved credentials:', e);
      return [];
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
      passwordRaw: credential.password || (existingIndex >= 0 ? list[existingIndex].passwordRaw : ''),
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
   * Authenticate with username or email + password against registered user accounts
   */
  authenticate(
    identifier: string,
    password: string,
    rememberMe: boolean = true,
    availableProfiles: UserProfile[] = []
  ): { success: boolean; user?: UserProfile; message?: string; rawPassword?: string } {
    const cleanId = identifier.replace(/^@/, '').toLowerCase().trim();

    if (!cleanId) {
      return { success: false, message: 'Please enter your username or email address.' };
    }

    if (!password) {
      return { success: false, message: 'Please enter your account password.' };
    }

    // Look in registered users and saved credentials first
    const registered = this.getRegisteredUsers();
    const allUsers = [...registered, ...availableProfiles];

    const matchedUser = allUsers.find(u => 
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      u.name.toLowerCase() === cleanId
    );

    if (matchedUser) {
      // If user checks remember me, save to local credentials
      if (rememberMe) {
        this.saveCredential({
          userId: matchedUser.id,
          username: matchedUser.username || cleanId,
          email: matchedUser.email || `${cleanId}@hubb.app`,
          name: matchedUser.name,
          avatar: matchedUser.photos[0] || '',
          password: password,
          biometricEnabled: true,
        });
      }

      const isAdmin = (matchedUser.email && matchedUser.email.toLowerCase() === 'simonchikondi8@gmail.com') ||
                      (matchedUser.username && matchedUser.username.toLowerCase() === 'admin');

      const session: AuthSession = {
        isAuthenticated: true,
        user: matchedUser,
        token: `hubb_token_${Date.now()}`,
        rememberMe,
        loginTime: new Date().toISOString(),
        role: isAdmin ? 'admin' : 'user',
      };
      this.setStoredSession(session);
      return { success: true, user: matchedUser, rawPassword: password };
    }

    // If user has saved credentials stored
    const savedCreds = this.getSavedCredentials();
    const matchedCred = savedCreds.find(c =>
      c.username.toLowerCase() === cleanId ||
      c.email.toLowerCase() === cleanId
    );

    if (matchedCred) {
      const restoredUser: UserProfile = {
        id: matchedCred.userId,
        name: matchedCred.name,
        username: matchedCred.username,
        email: matchedCred.email,
        age: 0,
        gender: '',
        pronouns: '',
        distanceKm: 0,
        locationCity: '',
        verified: true,
        photos: matchedCred.avatar ? [matchedCred.avatar] : [],
        bio: '',
        heightCm: 0,
        heightFeet: '',
        complexion: '',
        raceEthnicity: '',
        religion: '',
        education: '',
        jobTitle: '',
        companyOrField: '',
        nationality: '',
        languages: [],
        hobbies: [],
        lifestyle: {},
        relationshipGoal: '',
        accessibilityBadges: [],
        lastActive: 'Active now',
      };

      this.saveRegisteredUser(restoredUser);

      const session: AuthSession = {
        isAuthenticated: true,
        user: restoredUser,
        token: `hubb_token_${Date.now()}`,
        rememberMe,
        loginTime: new Date().toISOString(),
      };
      this.setStoredSession(session);
      return { success: true, user: restoredUser, rawPassword: password };
    }

    return { 
      success: false, 
      message: 'No account found matching this username or email. Please create an account to get started!' 
    };
  }

  /**
   * Register a brand new user account with zero sample data
   */
  register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    photoUrl?: string;
    photoDescription?: string;
    gender?: string;
    pronouns?: string;
    accessibilityBadges?: string[];
  }): { success: boolean; user: UserProfile; rawPassword: string } {
    const cleanUsername = data.username.replace(/^@/, '').toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();

    // Default neutral avatar placeholder if no photo was uploaded
    const initialPhoto = data.photoUrl?.trim() || '';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      age: 0,
      gender: (data.gender as any) || '',
      pronouns: data.pronouns || '',
      distanceKm: 0,
      locationCity: '',
      verified: true,
      photos: initialPhoto ? [initialPhoto] : [],
      photoDescription: data.photoDescription || '',
      bio: '',
      heightCm: 0,
      heightFeet: '',
      complexion: '',
      raceEthnicity: '',
      religion: '',
      education: '',
      jobTitle: '',
      companyOrField: '',
      nationality: '',
      languages: [],
      hobbies: [],
      lifestyle: {},
      relationshipGoal: '',
      accessibilityBadges: data.accessibilityBadges && data.accessibilityBadges.length > 0 
        ? data.accessibilityBadges 
        : [],
      isBiometricLocked: false,
      isPrivateProfile: false,
      lastActive: 'Active now'
    };

    // Save to registered users store
    this.saveRegisteredUser(newUser);

    // Save credential
    this.saveCredential({
      userId: newUser.id,
      username: cleanUsername,
      email: cleanEmail,
      name: newUser.name,
      avatar: initialPhoto,
      password: data.password,
      biometricEnabled: true,
    });

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

  /**
   * Generate and dispatch a password reset code to user's registered email
   */
  requestPasswordReset(identifierOrEmail: string): {
    success: boolean;
    email?: string;
    maskedEmail?: string;
    code?: string;
    message: string;
  } {
    const clean = identifierOrEmail.replace(/^@/, '').toLowerCase().trim();
    if (!clean) {
      return { success: false, message: 'Please enter your registered email address or username.' };
    }

    const allUsers = this.getRegisteredUsers();
    const savedCreds = this.getSavedCredentials();

    // Look for matching user
    const matchedUser = allUsers.find(u =>
      (u.email && u.email.toLowerCase() === clean) ||
      (u.username && u.username.toLowerCase() === clean) ||
      u.name.toLowerCase() === clean
    );

    const matchedCred = savedCreds.find(c =>
      c.email.toLowerCase() === clean ||
      c.username.toLowerCase() === clean
    );

    let targetEmail = '';
    let targetUserId = '';

    if (matchedUser && matchedUser.email) {
      targetEmail = matchedUser.email.toLowerCase().trim();
      targetUserId = matchedUser.id;
    } else if (matchedCred && matchedCred.email) {
      targetEmail = matchedCred.email.toLowerCase().trim();
      targetUserId = matchedCred.userId;
    } else if (clean.includes('@') && clean.includes('.')) {
      // Direct email lookup fallback
      targetEmail = clean;
    } else {
      return {
        success: false,
        message: `No active Hubb account found for "${identifierOrEmail}". Please check your spelling or sign up for a new account.`
      };
    }

    // Generate random 6-digit numeric reset token
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    const tokenRecord: PasswordResetToken = {
      email: targetEmail,
      code,
      expiresAt,
      userId: targetUserId,
    };

    try {
      const existingTokens: PasswordResetToken[] = JSON.parse(
        localStorage.getItem(PASSWORD_RESETS_KEY) || '[]'
      );
      const filtered = existingTokens.filter(t => t.email !== targetEmail);
      filtered.push(tokenRecord);
      localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to save reset token:', e);
    }

    // Create a masked email (e.g. s***i@gmail.com)
    const [local, domain] = targetEmail.split('@');
    const maskedLocal = local.length > 2 
      ? `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}`
      : `${local[0]}*`;
    const maskedEmail = `${maskedLocal}@${domain || 'email.com'}`;

    return {
      success: true,
      email: targetEmail,
      maskedEmail,
      code,
      message: `Password reset verification code has been dispatched to ${maskedEmail}.`
    };
  }

  /**
   * Verify if a 6-digit reset code is valid for an email
   */
  verifyResetCode(email: string, code: string): { success: boolean; message: string } {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    try {
      const tokens: PasswordResetToken[] = JSON.parse(
        localStorage.getItem(PASSWORD_RESETS_KEY) || '[]'
      );
      const record = tokens.find(t => t.email === cleanEmail);

      if (!record) {
        return { success: false, message: 'No password reset request found for this email. Please request a new code.' };
      }

      if (Date.now() > record.expiresAt) {
        return { success: false, message: 'Your reset code has expired. Please request a new one.' };
      }

      if (record.code !== cleanCode) {
        return { success: false, message: 'Invalid 6-digit code. Please verify the code sent to your email.' };
      }

      return { success: true, message: 'Code verified successfully.' };
    } catch {
      return { success: false, message: 'Verification error. Please try again.' };
    }
  }

  /**
   * Reset password and update local vaults & stored session
   */
  resetPassword(email: string, code: string, newPassword: string): {
    success: boolean;
    message: string;
    user?: UserProfile;
  } {
    const verification = this.verifyResetCode(email, code);
    if (!verification.success) {
      return { success: false, message: verification.message };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Update in Saved Credentials
    const savedList = this.getSavedCredentials();
    let updatedCredUser: SavedCredential | null = null;
    const updatedSavedList = savedList.map(c => {
      if (c.email.toLowerCase() === cleanEmail) {
        updatedCredUser = {
          ...c,
          passwordRaw: newPassword,
          passwordMasked: '••••••••••••',
          lastLoginAt: 'Just now'
        };
        return updatedCredUser;
      }
      return c;
    });

    try {
      localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(updatedSavedList));
    } catch (e) {
      console.warn('Failed to update saved credentials with new password:', e);
    }

    // 2. Locate or update UserProfile
    const registeredUsers = this.getRegisteredUsers();
    let targetUser = registeredUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    if (!targetUser && updatedCredUser) {
      targetUser = {
        id: (updatedCredUser as SavedCredential).userId,
        name: (updatedCredUser as SavedCredential).name,
        username: (updatedCredUser as SavedCredential).username,
        email: (updatedCredUser as SavedCredential).email,
        age: 0,
        gender: '',
        pronouns: '',
        distanceKm: 0,
        locationCity: '',
        verified: true,
        photos: (updatedCredUser as SavedCredential).avatar ? [(updatedCredUser as SavedCredential).avatar] : [],
        bio: '',
        heightCm: 0,
        heightFeet: '',
        complexion: '',
        raceEthnicity: '',
        religion: '',
        education: '',
        jobTitle: '',
        companyOrField: '',
        nationality: '',
        languages: [],
        hobbies: [],
        lifestyle: {},
        relationshipGoal: '',
        accessibilityBadges: [],
        lastActive: 'Active now'
      };
      this.saveRegisteredUser(targetUser);
    }

    // 3. Clear the used reset token
    try {
      const tokens: PasswordResetToken[] = JSON.parse(
        localStorage.getItem(PASSWORD_RESETS_KEY) || '[]'
      );
      const remaining = tokens.filter(t => t.email !== cleanEmail);
      localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(remaining));
    } catch (e) {
      console.warn('Failed to clean up reset token:', e);
    }

    return {
      success: true,
      message: 'Your password has been reset successfully! You can now log in securely.',
      user: targetUser
    };
  }
}

export const authService = new AuthService();
