import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments, commentReactions, user } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');
  
  let userId: string;
  if (apiKey) {
    const validUserId = await validateApiKey(apiKey);
    if (!validUserId) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    userId = validUserId;
  } else {
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    userId = session.user.id;
  }

  const [userRecord] = await db.select().from(user).where(eq(user.id, userId));
  if (!userRecord || userRecord.banned) {
    return NextResponse.json({ error: 'Account banned' }, { status: 403 });
  }

  const { id } = await params;
  const commentId = parseInt(id);

  const [existing] = await db
    .select()
    .from(commentReactions)
    .where(and(eq(commentReactions.commentId, commentId), eq(commentReactions.userId, userId)));

  if (existing) {
    if (existing.type === 'like') {
      await db.delete(commentReactions).where(eq(commentReactions.id, existing.id));
      await db.update(comments).set({ likes: sql`${comments.likes} - 1` }).where(eq(comments.id, commentId));
      return NextResponse.json({ action: 'removed' });
    } else {
      await db.update(commentReactions).set({ type: 'like' }).where(eq(commentReactions.id, existing.id));
      await db.update(comments).set({ likes: sql`${comments.likes} + 1`, dislikes: sql`${comments.dislikes} - 1` }).where(eq(comments.id, commentId));
      return NextResponse.json({ action: 'switched' });
    }
  } else {
    await db.insert(commentReactions).values({ commentId, userId, type: 'like' });
    await db.update(comments).set({ likes: sql`${comments.likes} + 1` }).where(eq(comments.id, commentId));
    return NextResponse.json({ action: 'added' });
  }
}
