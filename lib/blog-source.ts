import { db } from './db';
import { posts } from './db/schema';
import { eq } from 'drizzle-orm';

export async function getBlogTree() {
  const publishedPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(posts.createdAt);

  return {
    name: 'Blog',
    children: publishedPosts.map((post) => ({
      type: 'page' as const,
      name: post.title,
      url: `/blog/${post.slug}`,
      external: false,
    })),
  };
}

export async function getAllBlogPosts() {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      content: posts.content,
      excerpt: posts.excerpt,
    })
    .from(posts)
    .where(eq(posts.published, true));
}
