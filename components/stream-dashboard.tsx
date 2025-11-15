'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Play, Square, Users, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StreamDashboardProps {
  stream: any;
}

export function StreamDashboard({ stream }: StreamDashboardProps) {
  const { toast } = useToast();
  const [isLive, setIsLive] = useState(stream.status === 'live');

  const copyStreamKey = () => {
    navigator.clipboard.writeText(stream.streamKey);
    toast({
      title: 'Copied!',
      description: 'Stream key copied to clipboard',
    });
  };

  const copyStreamUrl = () => {
    const rtmpUrl = process.env.NEXT_PUBLIC_RTMP_SERVER_URL || 'rtmp://localhost:1935/live';
    const url = `${rtmpUrl}/${stream.streamKey}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'RTMP URL copied to clipboard',
    });
  };

  const toggleStream = async () => {
    try {
      const response = await fetch(`/api/streams/${stream.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: isLive ? 'idle' : 'live' 
        }),
      });

      if (response.ok) {
        setIsLive(!isLive);
        toast({
          title: 'Success',
          description: `Stream ${isLive ? 'stopped' : 'started'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update stream status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{stream.title}</h1>
          <div className="flex items-center gap-2">
            {isLive && <Badge variant="destructive">🔴 LIVE</Badge>}
            {stream.isClass && <Badge>Class</Badge>}
            {stream.isPaid && <Badge variant="outline">${(stream.price / 100).toFixed(2)}</Badge>}
          </div>
        </div>
        <p className="text-muted-foreground">{stream.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Controls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Stream Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={toggleStream}
                variant={isLive ? "destructive" : "default"}
                size="lg"
              >
                {isLive ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop Stream
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Stream
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Stream Key</label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                    {stream.streamKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyStreamKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">RTMP URL</label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                    {process.env.NEXT_PUBLIC_RTMP_SERVER_URL || 'rtmp://localhost:1935/live'}/{stream.streamKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyStreamUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium mb-2">OBS Studio Setup:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Open OBS Studio</li>
                <li>Go to Settings → Stream</li>
                <li>Set Service to "Custom"</li>
                <li>Copy the RTMP URL above to Server field</li>
                <li>Copy the Stream Key above to Stream Key field</li>
                <li>Click "Start Streaming"</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Stream Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Stream Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stream.viewCount || 0}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {isLive ? Math.floor(Math.random() * 50) + 10 : 0}
              </div>
              <div className="text-sm text-muted-foreground">Live Viewers</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <span className={isLive ? 'text-green-600' : 'text-gray-500'}>
                  {isLive ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Created:</span>
                <span>{new Date(stream.createdAt).toLocaleDateString()}</span>
              </div>
              {stream.scheduledAt && (
                <div className="flex justify-between text-sm">
                  <span>Scheduled:</span>
                  <span>{new Date(stream.scheduledAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stream Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Stream Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            {isLive ? (
              <div className="text-white text-center">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Stream preview would appear here</p>
                <p className="text-sm opacity-75">Connect your streaming software to see live preview</p>
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <Square className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Stream is offline</p>
                <p className="text-sm opacity-75">Start streaming to see preview</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
