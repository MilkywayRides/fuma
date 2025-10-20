'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
}

export function BlogPostsSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/blog/posts?limit=6', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <section className="mx-[30px] my-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Latest Blog Posts</h2>
        <p className="text-muted-foreground">Discover our latest articles and insights</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))
        ) : (
          posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <Card className="h-full overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt || 'No excerpt available'}
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
