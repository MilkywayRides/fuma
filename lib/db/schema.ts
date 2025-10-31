import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  role: text('role').default('User').notNull(),
  banned: boolean('banned').default(false).notNull(),
  developerMode: boolean('developerMode').default(false).notNull(),
  onboardingCompleted: boolean('onboardingCompleted').default(false).notNull(),
  userType: text('userType'),
  phoneNumber: text('phoneNumber'),
  phoneVerified: boolean('phoneVerified').default(false).notNull(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

// Flow scripts table
export const flowScript = pgTable('flowScript', {
  id: text('id').primaryKey(), // 8-character UUID
  title: text('title').notNull(),
  description: text('description'),
  published: boolean('published').default(false).notNull(),
  nodes: text('nodes').notNull(), // JSON string of nodes
  edges: text('edges').notNull(), // JSON string of edges
  createdById: text('createdById')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  lastExecutedAt: timestamp('lastExecutedAt'),
  executionCount: integer('executionCount').default(0).notNull(),
});

export const flowExecution = pgTable('flowExecution', {
  id: integer('id').notNull().primaryKey(),
  flowId: text('flowId')
    .notNull()
    .references(() => flowScript.id),
  status: text('status').notNull(), // 'success', 'error', 'running'
  startedAt: timestamp('startedAt').notNull(),
  completedAt: timestamp('completedAt'),
  error: text('error'),
  logs: text('logs'), // JSON string of execution logs
  triggeredById: text('triggeredById')
    .notNull()
    .references(() => user.id),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
});

export const blogPosts = pgTable('blogPosts', {
  id: integer('id').notNull().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  slug: text('slug').notNull().unique(),
  published: boolean('published').default(false).notNull(),
  authorId: text('authorId')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const flowcharts = pgTable('flowcharts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  data: text('data').notNull(),
  published: boolean('published').default(false).notNull(),
  authorId: text('authorId')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: integer('id').notNull().primaryKey(),
  content: text('content').notNull(),
  postId: integer('postId')
    .notNull()
    .references(() => blogPosts.id, { onDelete: 'cascade' }),
  authorId: text('authorId')
    .notNull()
    .references(() => user.id),
  parentId: integer('parentId'),
  likes: integer('likes').default(0).notNull(),
  dislikes: integer('dislikes').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const commentReactions = pgTable('commentReactions', {
  id: integer('id').notNull().primaryKey(),
  commentId: integer('commentId')
    .notNull()
    .references(() => comments.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  type: text('type').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const systemSettings = pgTable('system_settings', {
  id: integer('id').notNull().primaryKey(),
  onboardingEnabled: boolean('onboardingEnabled').default(true).notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const siteVisits = pgTable('siteVisits', {
  id: integer('id').notNull().primaryKey(),
  userId: text('userId').references(() => user.id),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  path: text('path'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const flowchartEmbeds = pgTable('flowchartEmbeds', {
  id: integer('id').notNull().primaryKey(),
  flowchartId: text('flowchartId')
    .notNull()
    .references(() => flowcharts.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  referrer: text('referrer'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const advertisements = pgTable('advertisements', {
  id: integer('id').notNull().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  link: text('link'),
  imageUrl: text('imageUrl'),
  position: text('position').notNull().default('sidebar'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const adClicks = pgTable('adClicks', {
  id: integer('id').notNull().primaryKey(),
  adId: integer('adId')
    .notNull()
    .references(() => advertisements.id, { onDelete: 'cascade' }),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const adViews = pgTable('adViews', {
  id: integer('id').notNull().primaryKey(),
  adId: integer('adId')
    .notNull()
    .references(() => advertisements.id, { onDelete: 'cascade' }),
  ipAddress: text('ipAddress'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const apiKeys = pgTable('apiKeys', {
  id: integer('id').notNull().primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  lastUsed: timestamp('lastUsed'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const chatMessages = pgTable('chatMessages', {
  id: integer('id').notNull().primaryKey(),
  content: text('content').notNull(),
  role: text('role').notNull(), // 'user' or 'assistant'
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  metadata: text('metadata'), // JSON string for additional data
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const directMessages = pgTable('directMessages', {
  id: integer('id').notNull().primaryKey(),
  content: text('content').notNull(),
  fromId: text('fromId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  toId: text('toId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const sentEmails = pgTable('sentEmails', {
  id: integer('id').notNull().primaryKey(),
  emailAddressId: integer('emailAddressId')
    .notNull()
    .references(() => emailAddresses.id, { onDelete: 'cascade' }),
  to: text('to').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  html: text('html'),
  status: text('status').default('sent').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const emailAddresses = pgTable('emailAddresses', {
  id: integer('id').notNull().primaryKey(),
  uuid: text('uuid').notNull().unique(),
  address: text('address').notNull().unique(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const emails = pgTable('emails', {
  id: integer('id').notNull().primaryKey(),
  emailAddressId: integer('emailAddressId')
    .notNull()
    .references(() => emailAddresses.id, { onDelete: 'cascade' }),
  from: text('from').notNull(),
  to: text('to').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  html: text('html'),
  read: boolean('read').default(false).notNull(),
  starred: boolean('starred').default(false).notNull(),
  folder: text('folder').default('inbox').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
