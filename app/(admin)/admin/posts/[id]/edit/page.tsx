'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then((res) => res.json())
      .then((data) => setPost(data));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      published: formData.get('published') === 'on',
    };

    const res = await fetch(`/api/posts/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      alert('Failed to update post');
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const res = await fetch(`/api/posts/${params.id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      alert('Failed to delete post');
    }
  }

  if (!post) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={post.title}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-2">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            defaultValue={post.slug}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={post.excerpt || ''}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={15}
            defaultValue={post.content}
            className="w-full px-3 py-2 border rounded-md font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            name="published"
            defaultChecked={post.published}
          />
          <label htmlFor="published" className="text-sm font-medium">
            Published
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Post'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 ml-auto"
          >
            Delete Post
          </button>
        </div>
      </form>
    </div>
  );
}
