// Run this script to set a user as Admin or SuperAdmin
// Usage: npx tsx lib/set-admin.ts <email> <role>

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { user } from './db/schema';
import { eq } from 'drizzle-orm';

config();
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const email = process.argv[2];
const role = process.argv[3] as 'User' | 'Admin' | 'SuperAdmin';

if (!email || !role) {
  console.error('Usage: npx tsx lib/set-admin.ts <email> <role>');
  console.error('Roles: User, Admin, SuperAdmin');
  process.exit(1);
}

if (!['User', 'Admin', 'SuperAdmin'].includes(role)) {
  console.error('Invalid role. Must be: User, Admin, or SuperAdmin');
  process.exit(1);
}

async function setUserRole() {
  const [updated] = await db
    .update(user)
    .set({ role })
    .where(eq(user.email, email))
    .returning();

  if (updated) {
    console.log(`✓ Updated ${email} to role: ${role}`);
  } else {
    console.error(`✗ User with email ${email} not found`);
  }
  process.exit(0);
}

setUserRole();
