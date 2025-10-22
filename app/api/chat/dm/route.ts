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
        and(eq(directMessages.senderId, userId), eq(directMessages.receiverId, otherUserId)),
        and(eq(directMessages.senderId, otherUserId), eq(directMessages.receiverId, userId))
      )
    )
    .orderBy(desc(directMessages.createdAt))
    .limit(50);

  return Response.json(messages.reverse());
}
