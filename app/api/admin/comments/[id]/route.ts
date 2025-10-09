import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user.role !== 'Admin' && session.user.role !== 'SuperAdmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(comments).where(eq(comments.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
