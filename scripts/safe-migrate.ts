import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import crypto from 'crypto';

config();

const sql = neon(process.env.DATABASE_URL!);

async function safeMigrate() {
  try {
    console.log('Running safe migration...');
    
    // Add UUID columns if they don't exist
    try {
      await sql`ALTER TABLE "paymentGateways" ADD COLUMN IF NOT EXISTS uuid text`;
      await sql`ALTER TABLE "paymentPlans" ADD COLUMN IF NOT EXISTS uuid text`;
      console.log('Added UUID columns');
    } catch (e) {
      console.log('UUID columns already exist or error:', e);
    }
    
    // Add UUIDs to existing records
    const gateways = await sql`SELECT id FROM "paymentGateways" WHERE uuid IS NULL OR uuid = ''`;
    for (const gateway of gateways) {
      const uuid = crypto.randomUUID();
      await sql`UPDATE "paymentGateways" SET uuid = ${uuid} WHERE id = ${gateway.id}`;
    }
    
    const plans = await sql`SELECT id FROM "paymentPlans" WHERE uuid IS NULL OR uuid = ''`;
    for (const plan of plans) {
      const uuid = crypto.randomUUID();
      await sql`UPDATE "paymentPlans" SET uuid = ${uuid} WHERE id = ${plan.id}`;
    }
    
    // Add unique constraints
    try {
      await sql`ALTER TABLE "paymentGateways" ADD CONSTRAINT IF NOT EXISTS "paymentGateways_uuid_unique" UNIQUE (uuid)`;
      await sql`ALTER TABLE "paymentPlans" ADD CONSTRAINT IF NOT EXISTS "paymentPlans_uuid_unique" UNIQUE (uuid)`;
      console.log('Added unique constraints');
    } catch (e) {
      console.log('Constraints already exist or error:', e);
    }
    
    // Add OAuth device flow table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS "oauthDeviceFlow" (
          id serial PRIMARY KEY,
          "deviceCode" text NOT NULL UNIQUE,
          "userCode" text NOT NULL UNIQUE,
          "applicationId" integer NOT NULL REFERENCES "oauthApplications"(id) ON DELETE CASCADE,
          "userId" text REFERENCES "user"(id) ON DELETE CASCADE,
          scope text DEFAULT 'read' NOT NULL,
          verified boolean DEFAULT false NOT NULL,
          "expiresAt" timestamp NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('Created OAuth device flow table');
    } catch (e) {
      console.log('Device flow table already exists or error:', e);
    }
    
    // Add data permissions column
    try {
      await sql`ALTER TABLE "oauthApplications" ADD COLUMN IF NOT EXISTS "dataPermissions" text DEFAULT '{}' NOT NULL`;
      console.log('Added data permissions column');
    } catch (e) {
      console.log('Data permissions column already exists or error:', e);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

safeMigrate();
