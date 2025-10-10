import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { advertisements } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const ads = await db.select().from(advertisements).where(eq(advertisements.active, true)).orderBy(desc(advertisements.createdAt));
  return NextResponse.json(ads);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, link, imageUrl, position } = body;

  const [ad] = await db.insert(advertisements).values({
    title,
    content,
    link,
    imageUrl,
    position: position || 'sidebar',
  }).returning();

  return NextResponse.json(ad);
}
