import { db } from './db';
import { systemSettings } from './db/schema';
import * as dotenv from 'dotenv';

// Load both .env and .env.local
dotenv.config(); // default .env
dotenv.config({ path: '.env.local', override: true }); // override with .env.local

console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');

async function initializeSettings() {
  console.log('Checking system settings...');
  
  const [existing] = await db.select().from(systemSettings).limit(1);
  
  if (!existing) {
    console.log('No settings found. Creating initial settings...');
    await db.insert(systemSettings).values({
      onboardingEnabled: true,
      updatedAt: new Date()
    });
    console.log('Initial settings created successfully.');
  } else {
    console.log('Settings already exist.');
    console.log('Current onboarding status:', existing.onboardingEnabled);
  }
}

initializeSettings().catch(console.error);