import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, published } = body;

  const [post] = await db
    .insert(posts)
    .values({
      title,
      slug,
      excerpt,
      content,
      published,
      authorId: session.user.id,
    })
    .returning();

  return NextResponse.json(post);
}
