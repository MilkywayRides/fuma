import 'katex/dist/katex.css';
import { db } from '@/lib/db';
import { posts, comments, user } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { MarkdownContent } from '@/components/markdown-content';
import { CommentsSection } from '@/components/comments-section';
import { AdBanner, AdSidebar } from '@/components/ads';

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

  const postComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      authorName: user.name,
      createdAt: comments.createdAt,
      likes: comments.likes,
      dislikes: comments.dislikes,
      parentId: comments.parentId,
    })
    .from(comments)
    .innerJoin(user, eq(comments.authorId, user.id))
    .where(eq(comments.postId, post.id))
    .orderBy(desc(comments.createdAt));

  return (
    <>
      <AdBanner position="banner" />
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <article className="lg:col-span-2">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <time className="text-sm text-fd-muted-foreground mb-8 block">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
            <MarkdownContent content={post.content} userId={post.authorId} />
          </article>
          
          <aside className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-4">
              <AdSidebar position="sidebar" />
            </div>
          </aside>
        </div>
        
        <div className="mt-8 md:mt-12 lg:col-span-2">
          <CommentsSection postId={post.id} initialComments={postComments} />
        </div>
      </div>
    </>
  );
}
