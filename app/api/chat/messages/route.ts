import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '30');
  const before = url.searchParams.get('before');
  const after = url.searchParams.get('after');

  let query = db
    .select({
      id: chatMessages.id,
      content: chatMessages.content,
      userId: chatMessages.userId,
      userName: chatMessages.userName,
      userImage: chatMessages.userImage,
      hypes: chatMessages.hypes,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);

  if (before) {
    const { lt } = await import('drizzle-orm');
    query = query.where(lt(chatMessages.id, parseInt(before))) as any;
  } else if (after) {
    const { gt } = await import('drizzle-orm');
    query = query.where(gt(chatMessages.id, parseInt(after))) as any;
  }

  const messages = await query;

  return Response.json(messages.reverse(), {
    headers: {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'CDN-Cache-Control': 'no-store',
    },
  });
}
