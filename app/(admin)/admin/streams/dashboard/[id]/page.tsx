'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Edit, ExternalLink, Users, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function StreamDashboard() {
  const params = useParams();
  const router = useRouter();
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/streams/${params.id}`)
      .then(res => res.json())
      .then(setStream);
  }, [params.id]);

  const copyStreamKey = () => {
    navigator.clipboard.writeText(stream.streamKey);
    toast.success('Stream key copied!');
  };

  const copyRTMPUrl = () => {
    navigator.clipboard.writeText(`rtmp://localhost:1935/live`);
    toast.success('RTMP URL copied!');
  };

  const startStream = async () => {
    setLoading(true);
    await fetch(`/api/streams/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'live', startedAt: new Date() }),
    });
    setStream({ ...stream, status: 'live', startedAt: new Date() });
    setLoading(false);
    toast.success('Stream started!');
  };

  const endStream = async () => {
    setLoading(true);
    await fetch(`/api/streams/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ended', endedAt: new Date() }),
    });
    setStream({ ...stream, status: 'ended', endedAt: new Date() });
    setLoading(false);
    toast.success('Stream ended!');
  };

  const deleteStream = async () => {
    if (!confirm('Are you sure you want to delete this stream?')) return;
    setLoading(true);
    await fetch(`/api/streams/${params.id}`, { method: 'DELETE' });
    toast.success('Stream deleted!');
    router.push('/admin/streams');
  };

  if (!stream) return <div className="flex items-center justify-center h-96">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{stream.title}</h1>
          <p className="text-muted-foreground mt-1">Manage your stream settings and view analytics</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/stream/${stream.uuid}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Stream
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={deleteStream} disabled={loading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Views</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stream.viewCount || 0}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status</span>
          </div>
          <div className="mt-2">
            <Badge variant={stream.status === 'live' ? 'destructive' : 'secondary'}>
              {stream.status}
            </Badge>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Created</span>
          </div>
          <p className="text-sm font-medium mt-2">{new Date(stream.createdAt).toLocaleDateString()}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Stream Details</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              {stream.isClass && <Badge>Class</Badge>}
              {stream.isPaid && <Badge variant="secondary">${stream.price / 100}</Badge>}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1">{stream.description || 'No description'}</p>
            </div>
            {stream.scheduledAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Scheduled</label>
                <p className="mt-1">{new Date(stream.scheduledAt).toLocaleString()}</p>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              {stream.status === 'idle' && (
                <Button onClick={startStream} disabled={loading}>
                  Start Stream
                </Button>
              )}
              {stream.status === 'live' && (
                <Button onClick={endStream} variant="destructive" disabled={loading}>
                  End Stream
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Streaming Setup</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">RTMP URL</label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                  rtmp://localhost:1935/live
                </code>
                <Button size="sm" variant="outline" onClick={copyRTMPUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Stream Key</label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                  {stream.streamKey}
                </code>
                <Button size="sm" variant="outline" onClick={copyStreamKey}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-sm">OBS Setup:</h3>
              <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Open OBS Studio</li>
                <li>Settings → Stream</li>
                <li>Service: Custom</li>
                <li>Paste RTMP URL and Stream Key</li>
                <li>Start Streaming</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>

      {stream.startedAt && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Timeline</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Started:</span>
              <span className="font-medium">{new Date(stream.startedAt).toLocaleString()}</span>
            </div>
            {stream.endedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ended:</span>
                <span className="font-medium">{new Date(stream.endedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
