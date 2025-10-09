import 'katex/dist/katex.css';
import { db } from '@/lib/db';
import { posts, comments, user } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { MarkdownContent } from '@/components/markdown-content';
import { CommentsSection } from '@/components/comments-section';

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
      <CommentsSection postId={post.id} initialComments={postComments} />
    </div>
  );
}
