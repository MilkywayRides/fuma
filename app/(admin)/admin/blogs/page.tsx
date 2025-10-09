import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function AdminPage() {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <p className="text-muted-foreground mt-2">Manage your blog posts</p>
      </div>

      <div className="space-y-4">
        {allPosts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Create your first post!</p>
        ) : (
          allPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-muted-foreground mb-2">{post.excerpt}</p>
                  <div className="flex gap-2 items-center text-sm">
                    <span className={post.published ? 'text-green-600' : 'text-yellow-600'}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="px-3 py-1 text-sm border rounded hover:bg-accent"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
