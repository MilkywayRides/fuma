import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { papers } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await db.update(papers)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(eq(papers.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update paper:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
