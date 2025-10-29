import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

async function dropTables() {
  try {
    await db.execute(sql`DROP TABLE IF EXISTS "sentEmails" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "emails" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "emailAddresses" CASCADE`);
    console.log('✅ Email tables dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
}

dropTables();
