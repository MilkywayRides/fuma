import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(request: Request) {
  const headersList = await headers();
  const headerEntries = Object.fromEntries(headersList.entries());
  const apiKey = headerEntries['x-api-key'];
  
  let userId: string;
  if (apiKey) {
    const validUserId = await validateApiKey(apiKey);
    if (!validUserId) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    userId = validUserId;
  } else {
    const session = await auth.api.getSession({ headers: headerEntries });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    userId = session.user.id;
  }

  const [userRecord] = await db.select().from(user).where(eq(user.id, userId));
  if (!userRecord || userRecord.banned) {
    return NextResponse.json({ error: 'Account banned' }, { status: 403 });
  }

  const { postId, content, parentId } = await request.json();

  const generatedId = Math.floor(Math.random() * 1_000_000_000);
  const [comment] = await db
    .insert(comments)
    .values({
      id: generatedId,
      postId: parseInt(postId),
      content,
      authorId: userId,
      parentId: parentId ? parseInt(parentId) : null,
      likes: 0,
      dislikes: 0,
    })
    .returning();

  return NextResponse.json({
    ...comment,
    authorName: userRecord.name,
  });
}
