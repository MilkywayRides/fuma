import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, published } = body;

  // blogPosts.id is a required numeric primary key in the current schema.
  // Generate a numeric id here so the insert succeeds. Long-term you should
  // make this an auto-increment/identity column or use UUIDs.
  const generatedId = Math.floor(Math.random() * 1_000_000_000);

  const [post] = await db
    .insert(blogPosts)
    .values({
      id: generatedId,
      title,
      slug,
      excerpt,
      content,
      published: !!published,
      authorId: session.user.id,
    })
    .returning();

  revalidatePath('/');
  revalidatePath('/blog');

  return NextResponse.json(post);
}
