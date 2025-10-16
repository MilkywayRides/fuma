import { db } from './db';
import { user } from './db/schema';

async function checkUsers() {
  console.log('Checking user status...');
  const users = await db.select().from(user);
  console.log('\nUsers:', users.map(u => ({
    id: u.id,
    email: u.email,
    onboardingCompleted: u.onboardingCompleted,
    role: u.role
  })));
}

checkUsers().catch(console.error);