import { db } from './db';
import { user, session, account } from './db/schema';
import { eq } from 'drizzle-orm';

async function dropUser(email: string) {
  try {
    const [userRecord] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    
    if (!userRecord) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    await db.delete(session).where(eq(session.userId, userRecord.id));
    await db.delete(account).where(eq(account.userId, userRecord.id));
    await db.delete(user).where(eq(user.id, userRecord.id));

    console.log(`✅ User ${email} deleted successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error dropping user:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run drop-user <email>');
  process.exit(1);
}

dropUser(email);
