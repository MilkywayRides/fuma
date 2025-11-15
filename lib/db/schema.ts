import { pgTable, text, timestamp, boolean, integer, serial, bigint } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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
  credits: integer('credits').default(0).notNull(),
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
  id: integer('id').primaryKey(),
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
  id: integer('id').primaryKey(),
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

export const circuits = pgTable('circuits', {
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
  id: integer('id').primaryKey(),
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
  id: integer('id').primaryKey(),
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
  id: integer('id').primaryKey(),
  onboardingEnabled: boolean('onboardingEnabled').default(true).notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const siteVisits = pgTable('siteVisits', {
  id: integer('id').primaryKey(),
  userId: text('userId').references(() => user.id),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  path: text('path'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const flowchartEmbeds = pgTable('flowchartEmbeds', {
  id: integer('id').primaryKey(),
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
  id: text('id').primaryKey().$defaultFn(() => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)),
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
  id: serial('id').primaryKey(),
  adId: text('adId').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const adViews = pgTable('adViews', {
  id: serial('id').primaryKey(),
  adId: text('adId').notNull(),
  ipAddress: text('ipAddress'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const apiKeys = pgTable('apiKeys', {
  id: integer('id').primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  lastUsed: timestamp('lastUsed'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const chatMessages = pgTable('chatMessages', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  role: text('role').notNull(), // 'user' or 'assistant'
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  metadata: text('metadata'), // JSON string for additional data
  hypes: integer('hypes').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const directMessages = pgTable('directMessages', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
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
  id: integer('id').primaryKey(),
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
  id: integer('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  address: text('address').notNull().unique(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const emails = pgTable('emails', {
  id: integer('id').primaryKey(),
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

export const subscriptions = pgTable('subscriptions', {
  id: integer('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'polar', 'stripe', etc.
  subscriptionId: text('subscriptionId').notNull().unique(),
  productId: text('productId').notNull(),
  planId: integer('planId').references(() => subscriptionPlans.id),
  status: text('status').notNull(), // 'active', 'canceled', 'expired'
  currentPeriodStart: timestamp('currentPeriodStart').notNull(),
  currentPeriodEnd: timestamp('currentPeriodEnd').notNull(),
  cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').default(false).notNull(),
  emailLimit: integer('emailLimit').default(2).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const books = pgTable('books', {
  id: integer('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  published: boolean('published').default(false).notNull(),
  premium: boolean('premium').default(false).notNull(),
  price: integer('price').default(0).notNull(),
  authorId: text('authorId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const bookPages = pgTable('bookPages', {
  id: integer('id').primaryKey(),
  bookId: integer('bookId')
    .notNull()
    .references(() => books.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const bookPurchases = pgTable('bookPurchases', {
  id: integer('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  bookId: integer('bookId')
    .notNull()
    .references(() => books.id, { onDelete: 'cascade' }),
  creditsSpent: integer('creditsSpent').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const subscriptionPlans = pgTable('subscriptionPlans', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  credits: integer('credits').default(0).notNull(),
  unlimitedBooks: boolean('unlimitedBooks').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const bookReviews = pgTable('bookReviews', {
  id: integer('id').primaryKey(),
  bookId: integer('bookId')
    .notNull()
    .references(() => books.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  review: text('review'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const oauthApplications = pgTable('oauthApplications', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  clientId: text('clientId').notNull().unique(),
  clientSecret: text('clientSecret').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  homepageUrl: text('homepageUrl').notNull(),
  callbackUrl: text('callbackUrl').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  active: boolean('active').default(true).notNull(),
  allowedScopes: text('allowedScopes').default('profile,email').notNull(),
  dataPermissions: text('dataPermissions').default('{}').notNull(), // JSON string of enabled permissions
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const oauthDeviceFlow = pgTable('oauthDeviceFlow', {
  id: serial('id').primaryKey(),
  deviceCode: text('deviceCode').notNull().unique(),
  userCode: text('userCode').notNull().unique(), // 6-character UUID
  applicationId: integer('applicationId')
    .notNull()
    .references(() => oauthApplications.id, { onDelete: 'cascade' }),
  userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
  scope: text('scope').default('read').notNull(),
  verified: boolean('verified').default(false).notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const oauthTokens = pgTable('oauthTokens', {
  id: serial('id').primaryKey(),
  accessToken: text('accessToken').notNull().unique(),
  refreshToken: text('refreshToken').notNull().unique(),
  applicationId: integer('applicationId')
    .notNull()
    .references(() => oauthApplications.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  scope: text('scope').default('read').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  refreshExpiresAt: timestamp('refreshExpiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const oauthAuthorizationCodes = pgTable('oauthAuthorizationCodes', {
  id: serial('id').primaryKey(),
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

export const oauthApiLogs = pgTable('oauthApiLogs', {
  id: serial('id').primaryKey(),
  applicationId: integer('applicationId')
    .notNull()
    .references(() => oauthApplications.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  statusCode: integer('statusCode').notNull(),
  ipAddress: text('ipAddress'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Payment Management Tables
export const paymentGateways = pgTable('paymentGateways', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  name: text('name').notNull(),
  provider: text('provider').notNull(), // 'stripe', 'polar', 'razorpay', etc.
  apiKey: text('apiKey').notNull(),
  webhookSecret: text('webhookSecret'),
  active: boolean('active').default(true).notNull(),
  config: text('config'), // JSON for additional config
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const paymentPlans = pgTable('paymentPlans', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  amount: integer('amount').notNull(), // in cents
  currency: text('currency').default('usd').notNull(),
  interval: text('interval').notNull(), // 'one_time', 'monthly', 'yearly'
  features: text('features'), // JSON array
  gatewayId: integer('gatewayId').references(() => paymentGateways.id),
  externalId: text('externalId'), // ID from payment gateway
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const paymentPages = pgTable('paymentPages', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  planId: integer('planId').references(() => paymentPlans.id),
  customAmount: boolean('customAmount').default(false).notNull(),
  minAmount: integer('minAmount'),
  maxAmount: integer('maxAmount'),
  successUrl: text('successUrl'),
  cancelUrl: text('cancelUrl'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const paymentButtons = pgTable('paymentButtons', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  name: text('name').notNull(),
  planId: integer('planId').references(() => paymentPlans.id),
  buttonText: text('buttonText').default('Pay Now').notNull(),
  buttonStyle: text('buttonStyle'), // JSON for styling
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const paymentLinks = pgTable('paymentLinks', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  name: text('name').notNull(),
  planId: integer('planId').references(() => paymentPlans.id),
  expiresAt: timestamp('expiresAt'),
  maxUses: integer('maxUses'),
  usedCount: integer('usedCount').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // 'percentage', 'fixed'
  value: integer('value').notNull(),
  maxUses: integer('maxUses'),
  usedCount: integer('usedCount').default(0).notNull(),
  expiresAt: timestamp('expiresAt'),
  planIds: text('planIds'), // JSON array of applicable plan IDs
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const paymentTransactions = pgTable('paymentTransactions', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  userId: text('userId').references(() => user.id),
  planId: integer('planId').references(() => paymentPlans.id),
  gatewayId: integer('gatewayId').references(() => paymentGateways.id),
  amount: integer('amount').notNull(),
  currency: text('currency').default('usd').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed', 'refunded'
  gatewayTransactionId: text('gatewayTransactionId'),
  couponId: integer('couponId').references(() => coupons.id),
  metadata: text('metadata'), // JSON
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const webhookLogs = pgTable('webhookLogs', {
  id: serial('id').primaryKey(),
  gatewayId: integer('gatewayId').references(() => paymentGateways.id),
  event: text('event').notNull(),
  payload: text('payload').notNull(), // JSON
  status: text('status').notNull(), // 'success', 'failed'
  error: text('error'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Live Streaming Tables
export const streams = pgTable('streams', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  streamKey: text('streamKey').notNull().unique(),
  status: text('status').default('idle').notNull(), // 'idle', 'live', 'ended'
  isClass: boolean('isClass').default(false).notNull(),
  isPaid: boolean('isPaid').default(false).notNull(),
  price: integer('price').default(0).notNull(),
  scheduledAt: timestamp('scheduledAt'),
  startedAt: timestamp('startedAt'),
  endedAt: timestamp('endedAt'),
  vodUrl: text('vodUrl'),
  thumbnailUrl: text('thumbnailUrl'),
  teacherId: text('teacherId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  viewCount: integer('viewCount').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const streamEnrollments = pgTable('streamEnrollments', {
  id: serial('id').primaryKey(),
  streamId: integer('streamId')
    .notNull()
    .references(() => streams.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  transactionId: integer('transactionId').references(() => paymentTransactions.id),
  attended: boolean('attended').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const streamMessages = pgTable('streamMessages', {
  id: serial('id').primaryKey(),
  streamId: integer('streamId')
    .notNull()
    .references(() => streams.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const papers = pgTable('papers', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: text('authorId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
