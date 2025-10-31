import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const generatedId = Math.floor(Math.random() * 1_000_000_000);
    const [message] = await db.insert(chatMessages).values({
      id: generatedId,
      content: data.content,
      role: data.role || 'user',
      userId: data.userId,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      createdAt: new Date(),
    }).returning();

    return Response.json(message);
  } catch (error) {
    console.error('Chat send error:', error);
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
