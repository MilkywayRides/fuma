import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not defined. Please create a .env file with your database configuration.'
  );
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
