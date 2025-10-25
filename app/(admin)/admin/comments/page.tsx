import { db } from '@/lib/db';
import { comments, user, blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AdminCommentsList } from '@/components/admin-comments-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comments - Admin',
};

// Avoid build-time prerendering database queries in environments where the
// database (and tables) may not exist. Force dynamic rendering instead.
export const dynamic = 'force-dynamic';

export default async function CommentsPage() {
  const allComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      likes: comments.likes,
      dislikes: comments.dislikes,
      createdAt: comments.createdAt,
      authorName: user.name,
      postTitle: blogPosts.title,
      postId: blogPosts.id,
      parentId: comments.parentId,
    })
    .from(comments)
    .leftJoin(user, eq(comments.authorId, user.id))
    .leftJoin(blogPosts, eq(comments.postId, blogPosts.id))
    .orderBy(comments.createdAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comments</h1>
        <p className="text-muted-foreground">Manage all comments across your blog</p>
      </div>
      <AdminCommentsList initialComments={allComments} />
    </div>
  );
}
