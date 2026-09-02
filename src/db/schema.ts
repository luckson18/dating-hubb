import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').default('user').notNull(), // 'admin' | 'user'
  age: integer('age').default(0),
  gender: text('gender').default('Non-binary'),
  pronouns: text('pronouns').default(''),
  distanceKm: integer('distance_km').default(0),
  locationCity: text('location_city').default(''),
  coordinates: jsonb('coordinates'), // { lat: number, lng: number }
  verified: boolean('verified').default(true),
  photos: jsonb('photos').default([]), // string[]
  photoDescription: text('photo_description').default(''),
  bio: text('bio').default(''),
  heightCm: integer('height_cm').default(0),
  heightFeet: text('height_feet').default(''),
  weightKg: integer('weight_kg'),
  complexion: text('complexion').default(''),
  raceEthnicity: text('race_ethnicity').default(''),
  religion: text('religion').default(''),
  education: text('education').default(''),
  jobTitle: text('job_title').default(''),
  companyOrField: text('company_or_field').default(''),
  nationality: text('nationality').default(''),
  languages: jsonb('languages').default([]), // string[]
  hobbies: jsonb('hobbies').default([]), // string[]
  lifestyle: jsonb('lifestyle').default({}), // object
  relationshipGoal: text('relationship_goal').default(''),
  accessibilityBadges: jsonb('accessibility_badges').default([]), // string[]
  isBiometricLocked: boolean('is_biometric_locked').default(false),
  isPrivateProfile: boolean('is_private_profile').default(false),
  lastActive: text('last_active').default('Active now'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  adminId: text('admin_id'),
  action: text('action').notNull(),
  targetUserId: text('target_user_id'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type DbUser = typeof users.$inferSelect;
export type DbNewUser = typeof users.$inferInsert;
