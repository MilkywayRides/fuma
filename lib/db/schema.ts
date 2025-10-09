import { pgTable, text, timestamp, boolean, serial, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  role: text('role').default('User').notNull(),
  banned: boolean('banned').default(false).notNull(),
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

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
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
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('postId')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  authorId: text('authorId')
    .notNull()
    .references(() => user.id),
  parentId: integer('parentId'),
  likes: integer('likes').default(0).notNull(),
  dislikes: integer('dislikes').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const commentReactions = pgTable('commentReactions', {
  id: serial('id').primaryKey(),
  commentId: integer('commentId')
    .notNull()
    .references(() => comments.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  type: text('type').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
