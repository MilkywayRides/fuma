import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { getAllBlogPosts } from '@/lib/blog-source';
import type { SearchIndex } from 'fumadocs-core/search/shared';

const searchAPI = createFromSource(source, {
  language: 'english',
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');

  if (!query) {
    return searchAPI.GET(request);
  }

  // Get docs results
  const docsResponse = await searchAPI.GET(request);
  const docsData = await docsResponse.json();

  // Get blog results
  const blogPosts = await getAllBlogPosts();
  const blogResults: SearchIndex = blogPosts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(query.toLowerCase())
    )
    .map((post) => ({
      id: `blog-${post.id}`,
      title: post.title,
      content: post.excerpt || post.content.substring(0, 200),
      url: `/blog/${post.slug}`,
      structured: {
        heading: post.title,
        tag: 'Blog',
      },
    }));

  return Response.json([...docsData, ...blogResults]);
}
