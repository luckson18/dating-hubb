import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { UserProfile, AdminUserData, AdminDatabaseStats, Message } from '../types/dating.js';
import { SEED_HUBB_USERS } from './defaultSeedUsers.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'hubb_users.sqlite');
const SQL_DUMP_PATH = path.join(DATA_DIR, 'hubb_users.sql');

class SqlDatabaseManager {
  private db: Database | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        const SQL = await initSqlJs();

        if (fs.existsSync(DB_PATH)) {
          try {
            const fileBuffer = fs.readFileSync(DB_PATH);
            this.db = new SQL.Database(fileBuffer);
          } catch (readErr) {
            console.warn('Existing SQLite file corrupted or unreadable, creating new SQL database:', readErr);
            this.db = new SQL.Database();
          }
        } else {
          this.db = new SQL.Database();
        }

        this.setupSchema();
        this.cleanLegacyFakeProfiles();
        this.seedInitialUsersIfEmpty();
        this.persist();
        this.isInitialized = true;
      } catch (err) {
        console.error('Failed to initialize SQL database engine:', err);
        throw err;
      }
    })();

    return this.initPromise;
  }

  private cleanLegacyFakeProfiles() {
    if (!this.db) return;
    try {
      this.db.run(`
        DELETE FROM users 
        WHERE email LIKE '%@hubb.app' 
           OR id IN (
             'user-elena-vance', 
             'user-marcus-chen', 
             'user-zara-al-mansoor', 
             'user-kofi-mensah', 
             'user-maya-lin', 
             'user-priya-patel', 
             'user-jordan-rivera', 
             'user-sophia-rossi', 
             'user-lucas-silva', 
             'user-aria-montgomery'
           );
        UPDATE users 
        SET photos = '[]' 
        WHERE photos LIKE '%unsplash.com%';
      `);
    } catch (e) {
      console.warn('Error purging legacy fake profiles from SQL:', e);
    }
  }

  private seedInitialUsersIfEmpty() {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
      let count = 0;
      if (stmt.step()) {
        const row = stmt.getAsObject();
        count = Number(row.count) || 0;
      }
      stmt.free();

      if (count === 0) {
        for (const user of SEED_HUBB_USERS) {
          const cleanUsername = user.username.trim().toLowerCase().replace(/^@/, '');
          const cleanEmail = user.email.trim().toLowerCase();
          const now = new Date().toISOString();
          const role = cleanEmail === 'simonchikondi8@gmail.com' ? 'admin' : 'user';

          const insertStmt = this.db.prepare(`
            INSERT OR REPLACE INTO users (
              id, name, username, email, role, age, gender, pronouns,
              distance_km, location_city, coordinates, verified, photos,
              photo_description, bio, height_cm, height_feet, weight_kg,
              complexion, race_ethnicity, religion, education, job_title,
              company_or_field, nationality, languages, hobbies, lifestyle,
              relationship_goal, accessibility_badges, is_biometric_locked,
              is_private_profile, last_active, created_at, updated_at
            ) VALUES (
              $id, $name, $username, $email, $role, $age, $gender, $pronouns,
              $distance_km, $location_city, $coordinates, $verified, $photos,
              $photo_description, $bio, $height_cm, $height_feet, $weight_kg,
              $complexion, $race_ethnicity, $religion, $education, $job_title,
              $company_or_field, $nationality, $languages, $hobbies, $lifestyle,
              $relationship_goal, $accessibility_badges, $is_biometric_locked,
              $is_private_profile, $last_active, $now, $now
            )
          `);

          insertStmt.bind({
            $id: user.id,
            $name: user.name,
            $username: cleanUsername,
            $email: cleanEmail,
            $role: role,
            $age: user.age ?? 0,
            $gender: user.gender || 'Non-binary',
            $pronouns: user.pronouns || '',
            $distance_km: user.distanceKm ?? 0,
            $location_city: user.locationCity || '',
            $coordinates: user.coordinates ? JSON.stringify(user.coordinates) : null,
            $verified: user.verified ? 1 : 0,
            $photos: JSON.stringify(user.photos || []),
            $photo_description: user.photoDescription || '',
            $bio: user.bio || '',
            $height_cm: user.heightCm ?? 0,
            $height_feet: user.heightFeet || '',
            $weight_kg: user.weightKg ?? null,
            $complexion: user.complexion || '',
            $race_ethnicity: user.raceEthnicity || '',
            $religion: user.religion || '',
            $education: user.education || '',
            $job_title: user.jobTitle || '',
            $company_or_field: user.companyOrField || '',
            $nationality: user.nationality || '',
            $languages: JSON.stringify(user.languages || []),
            $hobbies: JSON.stringify(user.hobbies || []),
            $lifestyle: JSON.stringify(user.lifestyle || {}),
            $relationship_goal: user.relationshipGoal || '',
            $accessibility_badges: JSON.stringify(user.accessibilityBadges || []),
            $is_biometric_locked: user.isBiometricLocked ? 1 : 0,
            $is_private_profile: user.isPrivateProfile ? 1 : 0,
            $last_active: user.lastActive || 'Active now',
            $now: now,
          });

          insertStmt.step();
          insertStmt.free();
        }
      }
    } catch (e) {
      console.warn('Failed to seed initial users into SQL:', e);
    }
  }

  private setupSchema() {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        age INTEGER DEFAULT 0,
        gender TEXT DEFAULT 'Non-binary',
        pronouns TEXT DEFAULT '',
        distance_km INTEGER DEFAULT 0,
        location_city TEXT DEFAULT '',
        coordinates TEXT,
        verified INTEGER DEFAULT 1,
        photos TEXT,
        photo_description TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        height_cm INTEGER DEFAULT 0,
        height_feet TEXT DEFAULT '',
        weight_kg INTEGER,
        complexion TEXT DEFAULT '',
        race_ethnicity TEXT DEFAULT '',
        religion TEXT DEFAULT '',
        education TEXT DEFAULT '',
        job_title TEXT DEFAULT '',
        company_or_field TEXT DEFAULT '',
        nationality TEXT DEFAULT '',
        languages TEXT,
        hobbies TEXT,
        lifestyle TEXT,
        relationship_goal TEXT DEFAULT '',
        accessibility_badges TEXT,
        is_biometric_locked INTEGER DEFAULT 0,
        is_private_profile INTEGER DEFAULT 0,
        last_active TEXT DEFAULT 'Active now',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        admin_id TEXT,
        action TEXT NOT NULL,
        target_user_id TEXT,
        details TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        text TEXT,
        timestamp TEXT NOT NULL,
        encrypted INTEGER DEFAULT 1,
        cipher_preview TEXT,
        media_type TEXT,
        media_url TEXT,
        voice_duration INTEGER,
        voice_transcript TEXT,
        location TEXT,
        read INTEGER DEFAULT 0,
        status TEXT DEFAULT 'sent',
        delivered_at TEXT,
        read_at TEXT,
        created_at TEXT NOT NULL
      );
    `);
  }

  private persist() {
    if (!this.db) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
      this.exportSqlDump();
    } catch (e) {
      console.error('Failed to write SQL database file to disk:', e);
    }
  }

  private exportSqlDump() {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC');
      const usersList: any[] = [];
      while (stmt.step()) {
        usersList.push(stmt.getAsObject());
      }
      stmt.free();

      const sqlLines: string[] = [
        `-- HUBB DATING APP: SQL DATABASE BACKUP FILE`,
        `-- Generated automatically on disk: ${new Date().toISOString()}`,
        ``,
        `CREATE TABLE IF NOT EXISTS users (`,
        `  id TEXT PRIMARY KEY,`,
        `  name TEXT NOT NULL,`,
        `  username TEXT NOT NULL UNIQUE,`,
        `  email TEXT NOT NULL UNIQUE,`,
        `  role TEXT NOT NULL DEFAULT 'user',`,
        `  age INTEGER DEFAULT 0,`,
        `  gender TEXT DEFAULT 'Non-binary',`,
        `  pronouns TEXT DEFAULT '',`,
        `  distance_km INTEGER DEFAULT 0,`,
        `  location_city TEXT DEFAULT '',`,
        `  verified INTEGER DEFAULT 1,`,
        `  photo_description TEXT DEFAULT '',`,
        `  bio TEXT DEFAULT '',`,
        `  height_feet TEXT DEFAULT '',`,
        `  complexion TEXT DEFAULT '',`,
        `  race_ethnicity TEXT DEFAULT '',`,
        `  job_title TEXT DEFAULT '',`,
        `  relationship_goal TEXT DEFAULT '',`,
        `  created_at TEXT NOT NULL,`,
        `  updated_at TEXT NOT NULL`,
        `);`,
        ``,
      ];

      usersList.forEach(u => {
        const esc = (val: any) => (val !== undefined && val !== null ? `'${String(val).replace(/'/g, "''")}'` : "''");
        sqlLines.push(
          `INSERT OR REPLACE INTO users (id, name, username, email, role, age, gender, pronouns, distance_km, location_city, verified, photo_description, bio, height_feet, complexion, race_ethnicity, job_title, relationship_goal, created_at, updated_at) VALUES (` +
          `${esc(u.id)}, ${esc(u.name)}, ${esc(u.username)}, ${esc(u.email)}, ${esc(u.role || 'user')}, ${u.age || 0}, ${esc(u.gender)}, ${esc(u.pronouns)}, ${u.distance_km || 0}, ${esc(u.location_city)}, ${u.verified ? 1 : 0}, ${esc(u.photo_description)}, ${esc(u.bio)}, ${esc(u.height_feet)}, ${esc(u.complexion)}, ${esc(u.race_ethnicity)}, ${esc(u.job_title)}, ${esc(u.relationship_goal)}, ${esc(u.created_at)}, ${esc(u.updated_at)});`
        );
      });

      fs.writeFileSync(SQL_DUMP_PATH, sqlLines.join('\n'), 'utf-8');
    } catch (e) {
      console.warn('Failed to export .sql text file:', e);
    }
  }

  private rowToUserProfile(row: any): UserProfile {
    let coordinates: { lat: number; lng: number } | undefined;
    let photos: string[] = [];
    let languages: string[] = [];
    let hobbies: string[] = [];
    let lifestyle: Record<string, any> = {};
    let accessibilityBadges: string[] = [];

    try { if (row.coordinates) coordinates = JSON.parse(row.coordinates); } catch {}
    try { if (row.photos) photos = JSON.parse(row.photos); } catch {}
    try { if (row.languages) languages = JSON.parse(row.languages); } catch {}
    try { if (row.hobbies) hobbies = JSON.parse(row.hobbies); } catch {}
    try { if (row.lifestyle) lifestyle = JSON.parse(row.lifestyle); } catch {}
    try { if (row.accessibility_badges) accessibilityBadges = JSON.parse(row.accessibility_badges); } catch {}

    return {
      id: row.id,
      name: row.name,
      username: row.username,
      email: row.email,
      age: row.age ?? 0,
      gender: row.gender || '',
      pronouns: row.pronouns || '',
      distanceKm: row.distance_km ?? 0,
      locationCity: row.location_city || '',
      verified: Boolean(row.verified),
      photos: Array.isArray(photos) ? photos : [],
      photoDescription: row.photo_description || '',
      bio: row.bio || '',
      heightCm: row.height_cm ?? 0,
      heightFeet: row.height_feet || '',
      weightKg: row.weight_kg ?? undefined,
      complexion: row.complexion || '',
      raceEthnicity: row.race_ethnicity || '',
      religion: row.religion || '',
      education: row.education || '',
      jobTitle: row.job_title || '',
      companyOrField: row.company_or_field || '',
      nationality: row.nationality || '',
      languages: Array.isArray(languages) ? languages : [],
      hobbies: Array.isArray(hobbies) ? hobbies : [],
      lifestyle: typeof lifestyle === 'object' ? lifestyle : {},
      relationshipGoal: row.relationship_goal || '',
      accessibilityBadges: Array.isArray(accessibilityBadges) ? accessibilityBadges : [],
      coordinates,
      isBiometricLocked: Boolean(row.is_biometric_locked),
      isPrivateProfile: Boolean(row.is_private_profile),
      lastActive: row.last_active || 'Active now',
    };
  }

  public async getAllUsers(): Promise<UserProfile[]> {
    await this.init();
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC');
      const results: UserProfile[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(this.rowToUserProfile(row));
      }
      stmt.free();
      return results;
    } catch (e) {
      console.error('SQL Error in getAllUsers:', e);
      return [];
    }
  }

  public async getAllDbUsers(): Promise<any[]> {
    await this.init();
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC');
      const results: any[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
      }
      stmt.free();
      return results;
    } catch (e) {
      console.error('SQL Error in getAllDbUsers:', e);
      return [];
    }
  }

  public async getUserByIdentifier(identifier: string): Promise<UserProfile | null> {
    await this.init();
    if (!this.db) return null;

    try {
      const clean = identifier.trim().toLowerCase().replace(/^@/, '');
      const stmt = this.db.prepare('SELECT * FROM users WHERE id = $id OR LOWER(username) = $u OR LOWER(email) = $e LIMIT 1');
      stmt.bind({ $id: identifier, $u: clean, $e: clean });
      
      let found: UserProfile | null = null;
      if (stmt.step()) {
        const row = stmt.getAsObject();
        found = this.rowToUserProfile(row);
      }
      stmt.free();
      return found;
    } catch (e) {
      console.error('SQL Error in getUserByIdentifier:', e);
      return null;
    }
  }

  public async upsertUser(profile: Partial<UserProfile> & { id: string; name: string; username: string; email: string }, role: string = 'user'): Promise<UserProfile> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const cleanUsername = profile.username.trim().toLowerCase().replace(/^@/, '');
    const cleanEmail = profile.email.trim().toLowerCase();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO users (
        id, name, username, email, role, age, gender, pronouns,
        distance_km, location_city, coordinates, verified, photos,
        photo_description, bio, height_cm, height_feet, weight_kg,
        complexion, race_ethnicity, religion, education, job_title,
        company_or_field, nationality, languages, hobbies, lifestyle,
        relationship_goal, accessibility_badges, is_biometric_locked,
        is_private_profile, last_active, created_at, updated_at
      ) VALUES (
        $id, $name, $username, $email, $role, $age, $gender, $pronouns,
        $distance_km, $location_city, $coordinates, $verified, $photos,
        $photo_description, $bio, $height_cm, $height_feet, $weight_kg,
        $complexion, $race_ethnicity, $religion, $education, $job_title,
        $company_or_field, $nationality, $languages, $hobbies, $lifestyle,
        $relationship_goal, $accessibility_badges, $is_biometric_locked,
        $is_private_profile, $last_active,
        COALESCE((SELECT created_at FROM users WHERE id = $id), $now),
        $now
      )
    `);

    stmt.bind({
      $id: profile.id,
      $name: profile.name,
      $username: cleanUsername,
      $email: cleanEmail,
      $role: role || (cleanEmail === 'simonchikondi8@gmail.com' ? 'admin' : 'user'),
      $age: profile.age ?? 0,
      $gender: profile.gender || 'Non-binary',
      $pronouns: profile.pronouns || '',
      $distance_km: profile.distanceKm ?? 0,
      $location_city: profile.locationCity || '',
      $coordinates: profile.coordinates ? JSON.stringify(profile.coordinates) : null,
      $verified: profile.verified !== undefined ? (profile.verified ? 1 : 0) : 1,
      $photos: JSON.stringify(profile.photos || []),
      $photo_description: profile.photoDescription || '',
      $bio: profile.bio || '',
      $height_cm: profile.heightCm ?? 0,
      $height_feet: profile.heightFeet || '',
      $weight_kg: profile.weightKg ?? null,
      $complexion: profile.complexion || '',
      $race_ethnicity: profile.raceEthnicity || '',
      $religion: profile.religion || '',
      $education: profile.education || '',
      $job_title: profile.jobTitle || '',
      $company_or_field: profile.companyOrField || '',
      $nationality: profile.nationality || '',
      $languages: JSON.stringify(profile.languages || []),
      $hobbies: JSON.stringify(profile.hobbies || []),
      $lifestyle: JSON.stringify(profile.lifestyle || {}),
      $relationship_goal: profile.relationshipGoal || '',
      $accessibility_badges: JSON.stringify(profile.accessibilityBadges || []),
      $is_biometric_locked: profile.isBiometricLocked ? 1 : 0,
      $is_private_profile: profile.isPrivateProfile ? 1 : 0,
      $last_active: profile.lastActive || 'Active now',
      $now: now,
    });

    stmt.step();
    stmt.free();
    this.persist();

    const updated = await this.getUserByIdentifier(profile.id);
    if (!updated) throw new Error('Failed to retrieve user after insert');
    return updated;
  }

  public async deleteUser(userId: string, adminId?: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    try {
      const stmt = this.db.prepare('DELETE FROM users WHERE id = $id');
      stmt.bind({ $id: userId });
      stmt.step();
      stmt.free();

      if (adminId) {
        this.logAdminAction(adminId, 'DELETE_USER', userId, { deletedAt: new Date().toISOString() });
      }

      this.persist();
      return true;
    } catch (e) {
      console.error('SQL Error in deleteUser:', e);
      return false;
    }
  }

  public async updateUserFields(userId: string, fields: Record<string, any>, adminId?: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    try {
      const keys = Object.keys(fields);
      if (keys.length === 0) return true;

      const setClauses: string[] = [];
      const bindings: Record<string, any> = { $id: userId, $updated_at: new Date().toISOString() };

      keys.forEach((key, i) => {
        const sqlKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        const paramName = `$p_${i}`;
        setClauses.push(`${sqlKey} = ${paramName}`);
        let val = fields[key];
        if (typeof val === 'boolean') val = val ? 1 : 0;
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        bindings[paramName] = val;
      });

      const sql = `UPDATE users SET ${setClauses.join(', ')}, updated_at = $updated_at WHERE id = $id`;
      const stmt = this.db.prepare(sql);
      stmt.bind(bindings);
      stmt.step();
      stmt.free();

      if (adminId) {
        this.logAdminAction(adminId, 'UPDATE_USER_FIELDS', userId, fields);
      }

      this.persist();
      return true;
    } catch (e) {
      console.error('SQL Error in updateUserFields:', e);
      return false;
    }
  }

  public async logAdminAction(adminId: string, action: string, targetUserId?: string, details?: any) {
    await this.init();
    if (!this.db) return;

    try {
      const stmt = this.db.prepare(`
        INSERT INTO activity_logs (id, admin_id, action, target_user_id, details, created_at)
        VALUES ($id, $admin_id, $action, $target_user_id, $details, $created_at)
      `);
      stmt.bind({
        $id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        $admin_id: adminId,
        $action: action,
        $target_user_id: targetUserId || null,
        $details: details ? JSON.stringify(details) : null,
        $created_at: new Date().toISOString(),
      });
      stmt.step();
      stmt.free();
      this.persist();
    } catch (e) {
      console.warn('Failed to log admin action in SQL:', e);
    }
  }

  public async saveMessage(msg: Message, conversationId: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO messages (
          id, conversation_id, sender_id, receiver_id, text, timestamp,
          encrypted, cipher_preview, media_type, media_url, voice_duration,
          voice_transcript, location, read, status, delivered_at, read_at, created_at
        ) VALUES (
          $id, $conversation_id, $sender_id, $receiver_id, $text, $timestamp,
          $encrypted, $cipher_preview, $media_type, $media_url, $voice_duration,
          $voice_transcript, $location, $read, $status, $delivered_at, $read_at, $created_at
        )
      `);

      stmt.bind({
        $id: msg.id,
        $conversation_id: conversationId,
        $sender_id: msg.senderId,
        $receiver_id: msg.receiverId,
        $text: msg.text || '',
        $timestamp: msg.timestamp || 'Just now',
        $encrypted: msg.encrypted ? 1 : 0,
        $cipher_preview: msg.cipherPreview || null,
        $media_type: msg.mediaType || null,
        $media_url: msg.mediaUrl || null,
        $voice_duration: msg.voiceDuration ?? null,
        $voice_transcript: msg.voiceTranscript || null,
        $location: msg.location ? JSON.stringify(msg.location) : null,
        $read: msg.read ? 1 : 0,
        $status: msg.status || 'sent',
        $delivered_at: msg.deliveredAt || null,
        $read_at: msg.readAt || null,
        $created_at: new Date().toISOString(),
      });

      stmt.step();
      stmt.free();
      this.persist();
      return true;
    } catch (e) {
      console.error('Failed to save message to SQL:', e);
      return false;
    }
  }

  public async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    await this.init();
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM messages 
        WHERE conversation_id = $conversation_id 
        ORDER BY created_at ASC
      `);
      stmt.bind({ $conversation_id: conversationId });

      const results: Message[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject() as any;
        results.push({
          id: row.id,
          senderId: row.sender_id,
          receiverId: row.receiver_id,
          text: row.text,
          timestamp: row.timestamp,
          encrypted: Boolean(row.encrypted),
          cipherPreview: row.cipher_preview || undefined,
          mediaType: row.media_type || undefined,
          mediaUrl: row.media_url || undefined,
          voiceDuration: row.voice_duration ? Number(row.voice_duration) : undefined,
          voiceTranscript: row.voice_transcript || undefined,
          location: row.location ? JSON.parse(row.location) : undefined,
          read: Boolean(row.read),
          status: row.status as any,
          deliveredAt: row.delivered_at || undefined,
          readAt: row.read_at || undefined,
        });
      }
      stmt.free();
      return results;
    } catch (e) {
      console.error('Failed to get messages for conversation from SQL:', e);
      return [];
    }
  }

  public async getAllMessagesForUser(userId: string): Promise<{ conversationId: string; messages: Message[] }[]> {
    await this.init();
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM messages 
        WHERE sender_id = $userId OR receiver_id = $userId 
        ORDER BY created_at ASC
      `);
      stmt.bind({ $userId: userId });

      const convMap = new Map<string, Message[]>();
      while (stmt.step()) {
        const row = stmt.getAsObject() as any;
        const convId = row.conversation_id;
        const msg: Message = {
          id: row.id,
          senderId: row.sender_id,
          receiverId: row.receiver_id,
          text: row.text,
          timestamp: row.timestamp,
          encrypted: Boolean(row.encrypted),
          cipherPreview: row.cipher_preview || undefined,
          mediaType: row.media_type || undefined,
          mediaUrl: row.media_url || undefined,
          voiceDuration: row.voice_duration ? Number(row.voice_duration) : undefined,
          voiceTranscript: row.voice_transcript || undefined,
          location: row.location ? JSON.parse(row.location) : undefined,
          read: Boolean(row.read),
          status: row.status as any,
          deliveredAt: row.delivered_at || undefined,
          readAt: row.read_at || undefined,
        };

        if (!convMap.has(convId)) {
          convMap.set(convId, []);
        }
        convMap.get(convId)!.push(msg);
      }
      stmt.free();

      return Array.from(convMap.entries()).map(([conversationId, messages]) => ({
        conversationId,
        messages,
      }));
    } catch (e) {
      console.error('Failed to get user messages from SQL:', e);
      return [];
    }
  }

  public async updateMessageStatus(
    messageId: string,
    status: string,
    deliveredAt?: string,
    readAt?: string
  ): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    try {
      const readVal = status === 'read' ? 1 : 0;
      let sql = `UPDATE messages SET status = $status`;
      if (readVal === 1) sql += `, read = 1`;
      if (deliveredAt) sql += `, delivered_at = $delivered_at`;
      if (readAt) sql += `, read_at = $read_at`;
      sql += ` WHERE id = $id`;

      const stmt = this.db.prepare(sql);
      const params: any = { $status: status, $id: messageId };
      if (deliveredAt) params.$delivered_at = deliveredAt;
      if (readAt) params.$read_at = readAt;

      stmt.bind(params);
      stmt.step();
      stmt.free();
      this.persist();
      return true;
    } catch (e) {
      console.error('Failed to update message status in SQL:', e);
      return false;
    }
  }

  public async markConversationRead(conversationId: string, readerUserId: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    try {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const stmt = this.db.prepare(`
        UPDATE messages 
        SET read = 1, status = 'read', read_at = $read_at
        WHERE conversation_id = $conversation_id AND receiver_id = $reader_user_id AND read = 0
      `);
      stmt.bind({
        $read_at: now,
        $conversation_id: conversationId,
        $reader_user_id: readerUserId,
      });
      stmt.step();
      stmt.free();
      this.persist();
      return true;
    } catch (e) {
      console.error('Failed to mark conversation read in SQL:', e);
      return false;
    }
  }

  public async getStats(): Promise<AdminDatabaseStats> {
    await this.init();
    const all = await this.getAllDbUsers();
    const adminCount = all.filter(u => u.role === 'admin' || u.email === 'simonchikondi8@gmail.com').length;

    return {
      totalUsers: all.length,
      adminUsers: adminCount,
      regularUsers: all.length - adminCount,
      databaseEngine: 'SQL File Database (SQLite / data/hubb_users.sqlite)',
      databaseStatus: 'connected',
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

export const sqlDb = new SqlDatabaseManager();
