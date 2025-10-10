import 'katex/dist/katex.css';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { MarkdownContent } from '@/components/markdown-content';
import { AdBanner } from '@/components/ads';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function BlogPage() {
  const publishedPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return (
    <main className="flex min-h-screen flex-col">
      <AdBanner position="banner" />
      <div className="mx-auto px-4 lg:px-[50px] py-12 max-w-7xl">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground mb-8">Latest articles and updates</p>
        <div className="grid gap-6">
          {publishedPosts.length === 0 ? (
            <p className="text-muted-foreground">No posts published yet.</p>
          ) : (
            publishedPosts.map((post) => (
              <div key={post.id} className="rounded-lg border p-6">
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-semibold mb-2 hover:underline">{post.title}</h2>
                </Link>
                {post.excerpt && (
                  <div className="text-muted-foreground mb-3 text-sm">
                    <MarkdownContent content={post.excerpt} />
                  </div>
                )}
                <Link href={`/blog/${post.slug}`} className="text-sm text-muted-foreground hover:underline">
                  {new Date(post.createdAt).toLocaleDateString()} · Read more →
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
