import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments, commentReactions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.banned) {
    return NextResponse.json({ error: 'Your account has been banned' }, { status: 403 });
  }

  const { id } = await params;
  const commentId = parseInt(id);
  const userId = session.user.id;

  const [existing] = await db
    .select()
    .from(commentReactions)
    .where(and(eq(commentReactions.commentId, commentId), eq(commentReactions.userId, userId)));

  if (existing) {
    if (existing.type === 'dislike') {
      await db.delete(commentReactions).where(eq(commentReactions.id, existing.id));
      await db.update(comments).set({ dislikes: sql`${comments.dislikes} - 1` }).where(eq(comments.id, commentId));
      return NextResponse.json({ action: 'removed' });
    } else {
      await db.update(commentReactions).set({ type: 'dislike' }).where(eq(commentReactions.id, existing.id));
      await db.update(comments).set({ dislikes: sql`${comments.dislikes} + 1`, likes: sql`${comments.likes} - 1` }).where(eq(comments.id, commentId));
      return NextResponse.json({ action: 'switched' });
    }
  } else {
    await db.insert(commentReactions).values({ commentId, userId, type: 'dislike' });
    await db.update(comments).set({ dislikes: sql`${comments.dislikes} + 1` }).where(eq(comments.id, commentId));
    return NextResponse.json({ action: 'added' });
  }
}
