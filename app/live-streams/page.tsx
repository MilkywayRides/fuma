'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LiveStreamsPage() {
  const [streams, setStreams] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/streams')
      .then(res => res.json())
      .then(setStreams);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Live Streams & Classes</h1>
        <Link href="/admin/streams/create">
          <Button>Create Stream</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream) => (
          <Link key={stream.id} href={`/stream/${stream.uuid}`}>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-gray-200 mb-4 rounded flex items-center justify-center">
                {stream.thumbnailUrl ? (
                  <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover rounded" />
                ) : (
                  <span className="text-gray-500">No thumbnail</span>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                {stream.status === 'live' && <Badge variant="destructive">LIVE</Badge>}
                {stream.isClass && <Badge>Class</Badge>}
                {stream.isPaid && <Badge variant="secondary">${stream.price / 100}</Badge>}
              </div>
              <h3 className="font-bold text-lg mb-2">{stream.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{stream.description}</p>
              <p className="text-xs text-gray-500 mt-2">{stream.viewCount} views</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
