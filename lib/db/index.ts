import 'server-only';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import * as schema from './schema';
import * as paymentSchema from './payment-schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not defined. Please create a .env file with your database configuration.'
  );
}

// Configure Neon with optimizations
const sql: NeonQueryFunction<false, false> = neon(databaseUrl, {
  fetchOptions: {
    cache: 'no-store',
  },
});

export const db = drizzle(sql, { 
  schema: { ...schema, ...paymentSchema },
  logger: process.env.NODE_ENV === 'development',
});
