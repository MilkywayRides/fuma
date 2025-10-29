import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, id));

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, slug, excerpt, content, published } = body;

  const [post] = await db
    .update(blogPosts)
    .set({
      title,
      slug,
      excerpt,
      content,
      published,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.slug, id))
    .returning();

  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);

  return NextResponse.json(post);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(blogPosts).where(eq(blogPosts.slug, id));

  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath(`/blog/${id}`);

  return NextResponse.json({ success: true });
}
