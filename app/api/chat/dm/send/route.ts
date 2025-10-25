import { db } from '@/lib/db';
import { directMessages } from '@/lib/db/schema';

export async function POST(request: Request) {
  const { senderId, receiverId, senderName, senderImage, content } = await request.json();

  if (!senderId || !receiverId || !content) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const generatedId = Math.floor(Math.random() * 1_000_000_000);

  const [newMessage] = await db
    .insert(directMessages)
    .values({
      id: generatedId,
      fromId: senderId,
      toId: receiverId,
      content,
      createdAt: new Date(),
      read: false,
    })
    .returning();

  return Response.json(newMessage);
}
