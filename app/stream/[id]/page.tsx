'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/hooks/use-socket';
import { PageSpinner } from '@/components/ui/spinner';

export default function StreamPage() {
  const params = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    Promise.all([
      fetch(`/api/streams/${params.id}`).then(res => res.json()),
      fetch(`/api/streams/${params.id}/enroll`).then(res => res.json())
    ])
    .then(([streamData, enrollData]) => {
      setStream(streamData);
      setEnrolled(enrollData.enrolled);
    })
    .catch(err => console.error('Error loading stream:', err))
    .finally(() => setLoading(false));

    fetch(`/api/streams/${params.id}/chat`)
      .then(res => res.json())
      .then(setMessages)
      .catch(err => console.error('Error loading chat:', err));
  }, [params.id]);

  useEffect(() => {
    if (!videoRef.current || !stream || stream.status !== 'live') return;

    const video = videoRef.current;
    const hlsUrl = `http://localhost:8000/live/${stream.streamKey}/index.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    }
  }, [stream]);

  useEffect(() => {
    if (!socket) return;

    socket.on('stream:message', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('stream:message');
    };
  }, [socket]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await fetch(`/api/streams/${params.id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    setMessage('');
  };

  const handleEnroll = async () => {
    await fetch(`/api/streams/${params.id}/enroll`, { method: 'POST' });
    setEnrolled(true);
  };

  if (loading) return <PageSpinner />;

  if (!stream) return <div>Stream not found</div>;

  if (stream.isPaid && !enrolled) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{stream.title}</h1>
          <p className="mb-4">{stream.description}</p>
          <p className="text-2xl mb-6">${stream.price / 100}</p>
          <Button onClick={handleEnroll}>Enroll Now</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h1 className="text-2xl font-bold mb-4">{stream.title}</h1>
            {stream.status === 'live' ? (
              <video ref={videoRef} controls className="w-full aspect-video bg-black" autoPlay />
            ) : stream.vodUrl ? (
              <video src={stream.vodUrl} controls className="w-full aspect-video bg-black" />
            ) : (
              <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                <p>Stream not started yet</p>
              </div>
            )}
            <p className="mt-4">{stream.description}</p>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-4 h-[600px] flex flex-col">
            <h2 className="text-xl font-bold mb-4">Live Chat</h2>
            <ScrollArea className="flex-1 mb-4">
              {messages.map((msg, i) => (
                <div key={i} className="mb-2">
                  <span className="font-bold">{msg.user?.name}: </span>
                  <span>{msg.message}</span>
                </div>
              ))}
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
