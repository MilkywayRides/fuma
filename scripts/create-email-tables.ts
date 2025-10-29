import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

async function createTables() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "emailAddresses" (
        "id" integer PRIMARY KEY,
        "uuid" text NOT NULL UNIQUE,
        "address" text NOT NULL UNIQUE,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "active" boolean DEFAULT true NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "emails" (
        "id" integer PRIMARY KEY,
        "emailAddressId" integer NOT NULL REFERENCES "emailAddresses"("id") ON DELETE CASCADE,
        "from" text NOT NULL,
        "to" text NOT NULL,
        "subject" text NOT NULL,
        "body" text NOT NULL,
        "html" text,
        "read" boolean DEFAULT false NOT NULL,
        "starred" boolean DEFAULT false NOT NULL,
        "folder" text DEFAULT 'inbox' NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sentEmails" (
        "id" integer PRIMARY KEY,
        "emailAddressId" integer NOT NULL REFERENCES "emailAddresses"("id") ON DELETE CASCADE,
        "to" text NOT NULL,
        "subject" text NOT NULL,
        "body" text NOT NULL,
        "html" text,
        "status" text DEFAULT 'sent' NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      )
    `);

    console.log('✅ Email tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createTables();
