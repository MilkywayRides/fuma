import { db } from '@/lib/db'
import { comments, user, blogPosts } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default async function CommentsPage() {
  const allComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
      postTitle: blogPosts.title,
      postSlug: blogPosts.slug,
    })
    .from(comments)
    .leftJoin(user, eq(comments.authorId, user.id))
    .leftJoin(blogPosts, eq(comments.postId, blogPosts.id))
    .orderBy(desc(comments.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comments</h1>
        <p className="text-muted-foreground">Manage all comments from your blog posts</p>
      </div>

      <div className="space-y-4">
        {allComments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No comments yet
            </CardContent>
          </Card>
        ) : (
          allComments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.userImage || ''} />
                      <AvatarFallback>{comment.userName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{comment.userName || 'Anonymous'}</CardTitle>
                      <CardDescription>{comment.userEmail}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{comment.content}</p>
                {comment.postTitle && (
                  <div className="text-xs text-muted-foreground">
                    On post: <a href={`/blog/${comment.postSlug}`} className="text-primary hover:underline">{comment.postTitle}</a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
