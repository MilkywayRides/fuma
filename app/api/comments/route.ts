import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId, content, parentId } = await request.json();

  const [comment] = await db
    .insert(comments)
    .values({
      postId: parseInt(postId),
      content,
      authorId: session.user.id,
      parentId: parentId ? parseInt(parentId) : null,
      likes: 0,
      dislikes: 0,
    })
    .returning();

  const [author] = await db.select().from(user).where(eq(user.id, session.user.id));

  return NextResponse.json({
    ...comment,
    authorName: author.name,
  });
}
