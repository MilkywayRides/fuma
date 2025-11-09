import { pgTable, text, timestamp, boolean, integer, serial, jsonb } from 'drizzle-orm/pg-core';
import { user } from './schema';

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  currency: text('currency').default('usd').notNull(),
  interval: text('interval').notNull(), // 'monthly', 'yearly', 'lifetime'
  features: jsonb('features').$type<string[]>().notNull(),
  permissions: jsonb('permissions').$type<{
    maxFlows?: number;
    maxExecutions?: number;
    maxApiCalls?: number;
    maxEmailAddresses?: number;
    maxBooks?: number;
    unlimitedBooks?: boolean;
    prioritySupport?: boolean;
    customDomain?: boolean;
    apiAccess?: boolean;
    [key: string]: any;
  }>().notNull(),
  allowedRoles: jsonb('allowedRoles').$type<string[]>().default(['User']).notNull(),
  active: boolean('active').default(true).notNull(),
  popular: boolean('popular').default(false).notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const userSubscriptions = pgTable('userSubscriptions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  planId: integer('planId').notNull().references(() => plans.id),
  status: text('status').notNull(), // 'active', 'canceled', 'expired', 'trialing'
  currentPeriodStart: timestamp('currentPeriodStart').notNull(),
  currentPeriodEnd: timestamp('currentPeriodEnd').notNull(),
  cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').default(false).notNull(),
  gatewaySubscriptionId: text('gatewaySubscriptionId'),
  gatewayCustomerId: text('gatewayCustomerId'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const paymentTriggers = pgTable('paymentTriggers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  event: text('event').notNull(), // 'payment.success', 'subscription.created', 'subscription.canceled', etc.
  planId: integer('planId').references(() => plans.id),
  actions: jsonb('actions').$type<{
    type: string; // 'webhook', 'email', 'credits', 'role', 'flow'
    config: any;
  }[]>().notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id),
  planId: integer('planId').references(() => plans.id),
  amount: integer('amount').notNull(),
  currency: text('currency').default('usd').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed', 'refunded'
  gateway: text('gateway').notNull(), // 'stripe', 'polar', etc.
  gatewayPaymentId: text('gatewayPaymentId'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
