import { drizzle } from 'drizzle-orm/neon-http';
import { unstable_cache } from 'next/cache';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not defined. Please create a .env file with your database configuration.'
  );
}

neonConfig.fetchConnectionCache = true;

const sql = neon(databaseUrl, {
  fetchOptions: {
    cache: 'no-store',
  },
});

export const db = drizzle(sql, { schema });
