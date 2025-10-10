import { db } from '@/lib/db';
import { comments, user, posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AdminCommentsList } from '@/components/admin-comments-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comments - Admin',
};

export default async function CommentsPage() {
  const allComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      likes: comments.likes,
      dislikes: comments.dislikes,
      createdAt: comments.createdAt,
      authorName: user.name,
      postTitle: posts.title,
      postId: posts.id,
      parentId: comments.parentId,
    })
    .from(comments)
    .leftJoin(user, eq(comments.authorId, user.id))
    .leftJoin(posts, eq(comments.postId, posts.id))
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
