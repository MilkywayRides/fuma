'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      alert('Failed to create post');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
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
            className="w-full px-3 py-2 border rounded-md font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" name="published" />
          <label htmlFor="published" className="text-sm font-medium">
            Publish immediately
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
