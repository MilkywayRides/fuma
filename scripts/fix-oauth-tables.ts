import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function fixOAuthTables() {
  console.log('Dropping existing OAuth tables...');
  
  await sql`DROP TABLE IF EXISTS "oauthTokens" CASCADE`;
  await sql`DROP TABLE IF EXISTS "oauthAuthorizationCodes" CASCADE`;
  await sql`DROP TABLE IF EXISTS "oauthApplications" CASCADE`;
  
  console.log('Creating oauthApplications table...');
  await sql`
    CREATE TABLE "oauthApplications" (
      "id" SERIAL PRIMARY KEY,
      "clientId" TEXT NOT NULL UNIQUE,
      "clientSecret" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "homepageUrl" TEXT NOT NULL,
      "callbackUrl" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "active" BOOLEAN DEFAULT true NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  
  console.log('Creating oauthTokens table...');
  await sql`
    CREATE TABLE "oauthTokens" (
      "id" SERIAL PRIMARY KEY,
      "accessToken" TEXT NOT NULL UNIQUE,
      "refreshToken" TEXT NOT NULL UNIQUE,
      "applicationId" INTEGER NOT NULL REFERENCES "oauthApplications"("id") ON DELETE CASCADE,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "scope" TEXT DEFAULT 'read' NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "refreshExpiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  
  console.log('Creating oauthAuthorizationCodes table...');
  await sql`
    CREATE TABLE "oauthAuthorizationCodes" (
      "id" SERIAL PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "applicationId" INTEGER NOT NULL REFERENCES "oauthApplications"("id") ON DELETE CASCADE,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "redirectUri" TEXT NOT NULL,
      "scope" TEXT DEFAULT 'read' NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "used" BOOLEAN DEFAULT false NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  
  console.log('✅ OAuth tables created successfully!');
}

fixOAuthTables().catch(console.error);
