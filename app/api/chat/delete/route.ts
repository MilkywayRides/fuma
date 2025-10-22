import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { messageId } = await request.json();
    
    await db.delete(chatMessages).where(eq(chatMessages.id, messageId));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
