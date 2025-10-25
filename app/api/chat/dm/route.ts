import { db } from '@/lib/db';
import { directMessages } from '@/lib/db/schema';
import { desc, and, or, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const otherUserId = url.searchParams.get('otherUserId');

  if (!userId || !otherUserId) {
    return Response.json({ error: 'Missing userId or otherUserId' }, { status: 400 });
  }

  const messages = await db
    .select()
    .from(directMessages)
    .where(
      or(
          and(eq(directMessages.fromId, userId), eq(directMessages.toId, otherUserId)),
          and(eq(directMessages.fromId, otherUserId), eq(directMessages.toId, userId))
        )
    )
    .orderBy(desc(directMessages.createdAt))
    .limit(50);

  return Response.json(messages.reverse());
}
