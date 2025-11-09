import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { user } from './schema';

export const oauthApplications = pgTable('oauthApplications', {
  id: integer('id').notNull().primaryKey(),
  uuid: text('uuid').notNull().unique(),
  clientId: text('clientId').notNull().unique(),
  clientSecret: text('clientSecret').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  homepageUrl: text('homepageUrl').notNull(),
  callbackUrl: text('callbackUrl').notNull(),
  applicationType: text('applicationType').default('web').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  active: boolean('active').default(true).notNull(),
  allowedScopes: text('allowedScopes').default('profile,email').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const oauthTokens = pgTable('oauthTokens', {
  id: integer('id').notNull().primaryKey(),
  accessToken: text('accessToken').notNull().unique(),
  refreshToken: text('refreshToken').notNull().unique(),
  applicationId: integer('applicationId')
    .notNull()
    .references(() => oauthApplications.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  scope: text('scope').default('read').notNull(),
  deviceType: text('deviceType').default('web').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  refreshExpiresAt: timestamp('refreshExpiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const oauthAuthorizationCodes = pgTable('oauthAuthorizationCodes', {
  id: integer('id').notNull().primaryKey(),
  code: text('code').notNull().unique(),
  applicationId: integer('applicationId')
    .notNull()
    .references(() => oauthApplications.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  redirectUri: text('redirectUri').notNull(),
  scope: text('scope').default('read').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const oauthDeviceCodes = pgTable('oauthDeviceCodes', {
  id: integer('id').notNull().primaryKey(),
  deviceCode: text('deviceCode').notNull().unique(),
  userCode: text('userCode').notNull().unique(),
  applicationId: integer('applicationId')
    .notNull()
    .references(() => oauthApplications.id, { onDelete: 'cascade' }),
  userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
  scope: text('scope').default('read').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  approved: boolean('approved').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
