'use client';

import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, Users, Settings, UserPlus, Zap, ArrowDown, Trash2, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatEditor } from '@/components/chat-editor';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: number;
  content: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  createdAt: string;
  hypes?: number;
}

interface DMMessage {
  id: number;
  content: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderImage?: string | null;
  createdAt: string;
}

export default function CommunityPage() {
  const { data: session, isPending } = useSession();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hypedMessages, setHypedMessages] = useState<Set<number>>(new Set());
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [linkToOpen, setLinkToOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDM, setSelectedDM] = useState<{ userId: string; userName: string; userImage?: string | null } | null>(null);
  const [dmMessages, setDmMessages] = useState<DMMessage[]>([]);
  const [dmLoading, setDmLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const oldestMessageId = useRef<number | null>(null);
  const lastLoadTime = useRef<number>(0);

  useEffect(() => {
    if (!isPending && !session) {
      redirect('/sign-in');
    }
  }, [session, isPending]);

  useEffect(() => {
    if (!selectedDM || !session?.user) return;
    
    setDmLoading(true);
    fetch(`/api/chat/dm?userId=${session.user.id}&otherUserId=${selectedDM.userId}`)
      .then(res => res.json())
      .then(data => {
        setDmMessages(data);
        setDmLoading(false);
      })
      .catch(err => {
        console.error('Error loading DMs:', err);
        setDmLoading(false);
      });
  }, [selectedDM, session]);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/chat/messages?limit=30', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          setError('Failed to load messages');
          setLoading(false);
          return;
        }
        setMessages(data);
        const users = Array.from(new Set(data.map((m: Message) => m.userName))) as string[];
        setUniqueUsers(users);
        if (data.length > 0) {
          oldestMessageId.current = data[0].id;
        }
        setHasMore(data.length === 30);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError('Failed to connect to chat');
        }
        setLoading(false);
      });
    
    return () => controller.abort();
  }, []);

  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore || !oldestMessageId.current) return;
    
    setIsLoadingMore(true);
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    const oldScrollHeight = scrollElement?.scrollHeight || 0;
    
    try {
      const res = await fetch(`/api/chat/messages?limit=20&before=${oldestMessageId.current}`);
      if (!res.ok) throw new Error('Failed to fetch more messages');
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        console.error('Invalid data format:', data);
        setHasMore(false);
        return;
      }
      
      if (data.length > 0) {
        setMessages(prev => [...data, ...prev]);
        oldestMessageId.current = data[0].id;
        setHasMore(data.length === 20);
        
        const users = Array.from(new Set(data.map((m: Message) => m.userName)));
        setUniqueUsers(prev => Array.from(new Set([...prev, ...users])));
        
        setTimeout(() => {
          if (scrollElement) {
            const newScrollHeight = scrollElement.scrollHeight;
            scrollElement.scrollTop = newScrollHeight - oldScrollHeight;
          }
        }, 0);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };



  useEffect(() => {
    if (!showScrollButton && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
      }, 100);
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    setShowScrollButton(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }, 0);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    const isNearTop = element.scrollTop < 100;
    
    setShowScrollButton(!isNearBottom);
    
    const now = Date.now();
    if (isNearTop && hasMore && !isLoadingMore && now - lastLoadTime.current > 1000) {
      lastLoadTime.current = now;
      loadMoreMessages();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !session?.user) return;

    const messageData = {
      content: input.trim(),
      userId: session.user.id,
      userName: session.user.name || 'Anonymous',
      userImage: session.user.image || null,
    };
    
    setInput('');
    
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      
      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleHype = async (messageId: number) => {
    if (hypedMessages.has(messageId)) return;
    
    setHypedMessages(prev => new Set(prev).add(messageId));
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, hypes: (msg.hypes || 0) + 250 } : msg
    ));
    
    fetch('/api/chat/hype', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId }),
    }).catch(() => {});
  };

  const handleDeleteMessage = async (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    fetch('/api/chat/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId }),
    }).catch(() => {});
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  useEffect(() => {
    if (!isConnected) return;
    
    const pollMessages = setInterval(() => {
      const lastId = messages[messages.length - 1]?.id;
      if (lastId) {
        fetch(`/api/chat/messages?limit=10&after=${lastId}`)
          .then(res => res.json())
          .then(data => {
            if (data.length > 0) {
              setMessages(prev => [...prev, ...data]);
            }
          })
          .catch(() => {});
      }
    }, 3000);
    
    return () => clearInterval(pollMessages);
  }, [messages, isConnected]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (dmLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Server Sidebar - Hidden on mobile */}
      <div className="hidden md:flex w-[72px] bg-muted/50 flex-col items-center py-3 gap-2 border-r">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-semibold hover:rounded-xl transition-all cursor-pointer">
          BN
        </div>
        <Separator className="w-8" />
        <div className="text-xs text-muted-foreground px-2 text-center">DMs</div>
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-2 px-2">
            {uniqueUsers.filter(u => u !== session?.user?.name).map((user) => {
              const userMessages = messages.filter(m => m.userName === user);
              const latestMessage = userMessages[userMessages.length - 1];
              return (
                <div
                  key={user}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center hover:rounded-xl transition-all cursor-pointer relative group ${
                    selectedDM?.userName === user ? 'bg-primary' : 'bg-muted'
                  }`}
                  title={user}
                  onClick={() => {
                    setSelectedDM({ 
                      userId: latestMessage.userId, 
                      userName: user, 
                      userImage: latestMessage.userImage 
                    });
                  }}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={latestMessage?.userImage || undefined} />
                    <AvatarFallback className="text-xs">{user[0]}</AvatarFallback>
                  </Avatar>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Channel Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex w-60 bg-muted/30 flex-col border-r">
        <div className="h-12 px-4 flex items-center shadow-sm border-b font-semibold">
          BN Community
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
              Text Channels
            </div>
            <div 
              className={`px-2 py-1.5 rounded flex items-center gap-1.5 cursor-pointer ${
                !selectedDM ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedDM(null)}
            >
              <Hash className="w-5 h-5" />
              <span className="text-sm font-medium">general</span>
            </div>
          </div>
        </ScrollArea>
        <div className="h-[52px] bg-muted/50 px-2 flex items-center gap-2 border-t">
          <Avatar className="w-8 h-8">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback className="text-xs">
              {session?.user?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{session?.user?.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-12 px-2 sm:px-4 flex items-center justify-between shadow-sm border-b">
          <div className="flex items-center gap-2">
            {selectedDM ? (
              <>
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                  <AvatarImage src={selectedDM.userImage || undefined} />
                  <AvatarFallback className="text-xs">{selectedDM.userName[0]}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm sm:text-base">{selectedDM.userName}</span>
              </>
            ) : (
              <>
                <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                <span className="font-semibold text-sm sm:text-base">general</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 h-0 relative">
          <ScrollArea ref={scrollAreaRef} className="h-full" onScrollCapture={handleScroll} style={{ willChange: 'scroll-position' }}>
            <div className="px-2 sm:px-4">
            {isLoadingMore && (
              <div className="py-2 flex justify-center">
                <div className="text-sm text-muted-foreground">Loading more messages...</div>
              </div>
            )}
            {loading ? (
              <div className="py-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 space-y-0.5">
            {(selectedDM ? dmMessages.map(dm => ({
              id: dm.id,
              content: dm.content,
              userId: dm.senderId,
              userName: dm.senderName,
              userImage: dm.senderImage,
              createdAt: dm.createdAt,
              hypes: 0,
            })) : messages).map((message, idx) => {
              const displayMessages = selectedDM ? dmMessages.map(dm => ({
                id: dm.id,
                content: dm.content,
                userId: dm.senderId,
                userName: dm.senderName,
                userImage: dm.senderImage,
                createdAt: dm.createdAt,
                hypes: 0,
              })) : messages;
              const prevMessage = displayMessages[idx - 1];
              const showAvatar = !prevMessage || prevMessage.userId !== message.userId;
              const timeDiff = prevMessage ? new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() : Infinity;
              const isGrouped = !showAvatar && timeDiff < 300000;

              return (
                <div key={message.id} className={`group flex gap-2 sm:gap-4 hover:bg-muted/50 px-2 sm:px-4 -mx-2 sm:-mx-4 py-0.5 ${!isGrouped ? 'mt-4' : ''}`}>
                  {showAvatar ? (
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mt-0.5">
                      <AvatarImage src={message.userImage || undefined} />
                      <AvatarFallback className="text-xs">{message.userName[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 sm:w-10 flex-shrink-0 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-1 sm:gap-2 mb-0.5">
                        <span className="font-semibold text-sm sm:text-base hover:underline cursor-pointer truncate">{message.userName}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    <div className="text-sm break-words prose prose-sm dark:prose-invert max-w-none">
                      {(() => {
                        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s]*)?/g;
                        const match = message.content.match(youtubeRegex);
                        if (match) {
                          const videoId = match[0].match(/([a-zA-Z0-9_-]{11})/)?.[1];
                          if (!videoId) return null;
                          const textContent = message.content.replace(youtubeRegex, '').trim();
                          return (
                            <div className="space-y-2">
                              {textContent && (
                                <ReactMarkdown
                                  remarkPlugins={[remarkMath]}
                                  rehypePlugins={[rehypeKatex]}
                                  components={{
                                    p: ({ children }) => <p className="mb-0">{children}</p>,
                                    a: ({ node, ...props }) => {
                                      const href = props.href || '';
                                      return (
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setLinkToOpen(href);
                                          }}
                                          className="text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                          {props.children}
                                          <ExternalLink className="w-3 h-3" />
                                        </button>
                                      );
                                    },
                                    code: ({ children }) => (
                                      <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>
                                    ),
                                    pre: ({ children }) => (
                                      <pre className="bg-muted p-2 rounded my-1 overflow-x-auto">{children}</pre>
                                    ),
                                  }}
                                >
                                  {textContent.replace(/\\\[/g, '$$\n').replace(/\\\]/g, '\n$$').replace(/\\\(/g, '$').replace(/\\\)/g, '$')}
                                </ReactMarkdown>
                              )}
                              <div className="rounded-lg overflow-hidden max-w-md">
                                <iframe
                                  width="100%"
                                  height="240"
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="aspect-video"
                                />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({ children }) => <p className="mb-0">{children}</p>,
                          a: ({ node, ...props }) => {
                            const href = props.href || '';
                            return (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setLinkToOpen(href);
                                }}
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {props.children}
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            );
                          },
                          code: ({ children }) => (
                            <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-muted p-2 rounded my-1 overflow-x-auto">{children}</pre>
                          ),
                          text: ({ children }) => {
                            const text = String(children);
                            const parts = text.split(/(@\w+)/g);
                            return (
                              <>
                                {parts.map((part, i) => 
                                  part.startsWith('@') ? (
                                    <span key={i} className="bg-primary/20 text-primary px-1 rounded font-medium">
                                      {part}
                                    </span>
                                  ) : (
                                    part
                                  )
                                )}
                              </>
                            );
                          },
                        }}
                      >
                        {(() => {
                          const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s]*)?/g;
                          const content = message.content.replace(/\\\[/g, '$$\n').replace(/\\\]/g, '\n$$').replace(/\\\(/g, '$').replace(/\\\)/g, '$');
                          if (youtubeRegex.test(message.content)) {
                            return '';
                          }
                          return content;
                        })()}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 sm:px-2 gap-0.5 sm:gap-1 text-xs"
                      onClick={() => handleHype(message.id)}
                      disabled={hypedMessages.has(message.id)}
                    >
                      <Zap className={`w-3 h-3 ${message.hypes ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      <span className="hidden sm:inline">{message.hypes || 0}</span>
                    </Button>
                    {message.userId === session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
                <div ref={messagesEndRef} />
              </div>
            )}
            </div>
          </ScrollArea>
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="icon"
              className="absolute bottom-4 right-4 rounded-full shadow-lg"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Message Input */}
        <div className="p-2 sm:p-4 border-t">
          <ChatEditor
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            disabled={!isConnected}
            placeholder={isConnected ? (selectedDM ? `Message @${selectedDM.userName}` : "Message #general") : "Connecting..."}
            users={uniqueUsers}
          />
        </div>
      </div>

      {/* Members Sidebar - Hidden on mobile and tablet */}
      <div className="hidden xl:flex w-60 bg-muted/30 flex-col border-l">
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
              Online — {onlineUsers}
            </div>
            <div className="space-y-1">
              <div className="px-2 py-1.5 rounded flex items-center gap-2 hover:bg-muted cursor-pointer">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {session?.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <span className="text-sm">{session?.user?.name}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Link Confirmation Dialog */}
      <Dialog open={!!linkToOpen} onOpenChange={() => setLinkToOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open External Link?</DialogTitle>
            <DialogDescription>
              You are about to visit:
            </DialogDescription>
            <div className="mt-2 p-2 bg-muted rounded text-sm break-all">
              {linkToOpen}
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkToOpen(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (linkToOpen) {
                  window.open(linkToOpen, '_blank', 'noopener,noreferrer');
                  setLinkToOpen(null);
                }
              }}
            >
              Open Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
