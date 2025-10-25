import 'katex/dist/katex.css';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { MarkdownContent } from '@/components/markdown-content';
import { AdBanner } from '@/components/ads';
import { Metadata } from 'next';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export const metadata: Metadata = {
  title: 'Blog',
};

export const revalidate = 60;

// Force dynamic rendering to avoid build-time DB queries when the database may
// not be available during CI or local builds.
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const publishedPosts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt))
    .limit(50);

  return (
    <HomeLayout {...baseOptions()}>
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
    </HomeLayout>
  );
}
