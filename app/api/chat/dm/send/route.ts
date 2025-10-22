import { db } from '@/lib/db';
import { directMessages } from '@/lib/db/schema';

export async function POST(request: Request) {
  const { senderId, receiverId, senderName, senderImage, content } = await request.json();

  if (!senderId || !receiverId || !content) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const [newMessage] = await db
    .insert(directMessages)
    .values({
      senderId,
      receiverId,
      senderName,
      senderImage,
      content,
      createdAt: new Date(),
    })
    .returning();

  return Response.json(newMessage);
}
