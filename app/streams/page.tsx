'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Calendar, DollarSign } from 'lucide-react';

export default function StreamsPage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/streams')
      .then(res => res.json())
      .then(data => {
        setStreams(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading streams...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Live Streams & Classes</h1>
          <p className="text-muted-foreground">Watch live streams and join educational classes</p>
        </div>
        <Link href="/streams/create">
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Create Stream
          </Button>
        </Link>
      </div>

      {streams.length === 0 ? (
        <div className="text-center py-12">
          <Play className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No streams available</h3>
          <p className="text-muted-foreground mb-4">Be the first to create a stream!</p>
          <Link href="/streams/create">
            <Button>Create Your First Stream</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <Link key={stream.id} href={`/stream/${stream.uuid}`}>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 mb-4 rounded-lg flex items-center justify-center">
                  {stream.thumbnailUrl ? (
                    <img 
                      src={stream.thumbnailUrl} 
                      alt={stream.title} 
                      className="w-full h-full object-cover rounded-lg" 
                    />
                  ) : (
                    <Play className="h-12 w-12 text-primary/60" />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {stream.status === 'live' && (
                    <Badge variant="destructive" className="animate-pulse">
                      🔴 LIVE
                    </Badge>
                  )}
                  {stream.isClass && (
                    <Badge variant="secondary">
                      <Users className="mr-1 h-3 w-3" />
                      Class
                    </Badge>
                  )}
                  {stream.isPaid && (
                    <Badge variant="outline">
                      <DollarSign className="mr-1 h-3 w-3" />
                      ${(stream.price / 100).toFixed(2)}
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {stream.title}
                </h3>
                
                {stream.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {stream.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{stream.viewCount || 0} views</span>
                  {stream.scheduledAt && (
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(stream.scheduledAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
