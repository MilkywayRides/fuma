import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { streams } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // TODO: Upload to Cloudflare R2 or S3
  // For now, we'll just store a placeholder URL
  const vodUrl = `/vod/${id}/${file.name}`;

  await db.update(streams)
    .set({ vodUrl, status: 'ended', endedAt: new Date() })
    .where(and(eq(streams.uuid, id), eq(streams.teacherId, session.user.id)));

  return NextResponse.json({ vodUrl });
}
