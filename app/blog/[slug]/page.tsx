import 'katex/dist/katex.css';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { MarkdownContent } from '@/components/markdown-content';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)));

  if (!post) {
    notFound();
  }

  return (
    <div className="container py-12">
      <article>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <time className="text-sm text-fd-muted-foreground mb-8 block">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <MarkdownContent content={post.content} />
      </article>
    </div>
  );
}
