import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const [message] = await db.insert(chatMessages).values({
      content: data.content,
      userId: data.userId,
      userName: data.userName,
      userImage: data.userImage,
    }).returning();

    return Response.json(message);
  } catch (error) {
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
