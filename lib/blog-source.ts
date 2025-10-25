import { db } from './db';
import { blogPosts } from './db/schema';
import { eq } from 'drizzle-orm';

export async function getBlogTree() {
  const publishedPosts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(blogPosts.createdAt);

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
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      content: blogPosts.content,
      excerpt: blogPosts.excerpt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.published, true));
}
