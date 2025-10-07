// Run this script to set a user as Admin or SuperAdmin
// Usage: npx tsx lib/set-admin.ts <email> <role>

import { db } from './db';
import { user } from './db/schema';
import { eq } from 'drizzle-orm';

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
