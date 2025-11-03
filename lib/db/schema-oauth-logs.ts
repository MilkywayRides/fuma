import { pgTable, text, timestamp, integer, serial } from 'drizzle-orm/pg-core';
import { oauthApplications } from './schema';

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
