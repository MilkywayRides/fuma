import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { messageId } = await request.json();
    
    await db.update(chatMessages)
      .set({ hypes: sql`${chatMessages.hypes} + 250` })
      .where(eq(chatMessages.id, messageId));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to hype message' }, { status: 500 });
  }
}
