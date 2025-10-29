import { db } from './db';
import { user, session } from './db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export interface SessionData {
  id: string;
  userId: string;
  expiresAt: Date;
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('better-auth.session_token')?.value;

    if (!token) {
      return null;
    }

    // Get session directly from database using token
    const [userSession] = await db
      .select({
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      })
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (!userSession || new Date(userSession.expiresAt) < new Date()) {
      return null;
    }

    return userSession;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getUser(userId: string) {
  try {
    const [userRecord] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return userRecord || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}