import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { getAllBlogPosts } from '@/lib/blog-source';

type SearchIndex = any[];

const searchAPI = createFromSource(source, {
  language: 'english',
});

function calculateRelevanceScore(post: any, query: string): number {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 0);
  let score = 0;

  const title = post.title.toLowerCase();
  const content = post.content.toLowerCase();
  const excerpt = post.excerpt?.toLowerCase() || '';

  // Exact title match (highest priority)
  if (title === lowerQuery) score += 100;
  
  // Title contains exact query
  if (title.includes(lowerQuery)) score += 50;
  
  // Title starts with query
  if (title.startsWith(lowerQuery)) score += 30;
  
  // Count word matches in title (high priority)
  words.forEach(word => {
    if (title.includes(word)) score += 20;
  });
  
  // Excerpt contains query
  if (excerpt.includes(lowerQuery)) score += 15;
  
  // Count word matches in excerpt
  words.forEach(word => {
    if (excerpt.includes(word)) score += 5;
  });
  
  // Content contains query
  if (content.includes(lowerQuery)) score += 10;
  
  // Count word matches in content
  words.forEach(word => {
    const matches = (content.match(new RegExp(word, 'g')) || []).length;
    score += Math.min(matches, 10); // Cap at 10 to avoid spam
  });

  return score;
}

function highlightText(text: string, query: string): string {
  const words = query.split(/\s+/).filter(w => w.length > 0);
  let highlighted = text;
  
  words.forEach(word => {
    const regex = new RegExp(`(${word})`, 'gi');
    highlighted = highlighted.replace(regex, '**$1**');
  });
  
  return highlighted;
}

function extractRelevantSnippet(content: string, query: string, maxLength: number = 200): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Find the first occurrence of the query
  const index = lowerContent.indexOf(lowerQuery);
  
  if (index === -1) {
    // If query not found, try first word
    const firstWord = query.split(/\s+/)[0].toLowerCase();
    const wordIndex = lowerContent.indexOf(firstWord);
    
    if (wordIndex === -1) {
      return content.substring(0, maxLength) + '...';
    }
    
    const start = Math.max(0, wordIndex - 50);
    const end = Math.min(content.length, wordIndex + maxLength - 50);
    return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
  }
  
  // Extract snippet around the query
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + maxLength - 50);
  
  return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');

  if (!query || query.trim().length === 0) {
    return searchAPI.GET(request);
  }

  const trimmedQuery = query.trim();

  // Fetch docs and blog results in parallel for speed
  const [docsResponse, blogPosts] = await Promise.all([
    searchAPI.GET(request),
    getAllBlogPosts()
  ]);

  const docsData = await docsResponse.json();
  
  // Process blog results with advanced scoring
  const scoredBlogPosts = blogPosts
    .map(post => ({
      post,
      score: calculateRelevanceScore(post, trimmedQuery)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const blogResults = scoredBlogPosts.map(({ post }) => {
    const snippet = post.excerpt 
      ? extractRelevantSnippet(post.excerpt, trimmedQuery, 150)
      : extractRelevantSnippet(post.content, trimmedQuery, 150);

    return {
      id: `blog-${post.id}`,
      title: post.title,
      content: snippet,
      url: `/blog/${post.slug}`,
      structured: {
        heading: 'Blog',
        tag: post.title,
      },
    };
  });

  return Response.json([...blogResults, ...docsData]);
}
