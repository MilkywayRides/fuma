import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function dropAdTables() {
  try {
    await sql`DROP TABLE IF EXISTS "adClicks" CASCADE`;
    await sql`DROP TABLE IF EXISTS "adViews" CASCADE`;
    await sql`DROP TABLE IF EXISTS "advertisements" CASCADE`;
    console.log('✓ Dropped ad tables successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

dropAdTables().then(() => process.exit(0)).catch(() => process.exit(1));
