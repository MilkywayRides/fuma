'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, ThumbsUp, ThumbsDown, Reply } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  parentId: number | null;
}

export function CommentsSection({ postId, initialComments }: { postId: number; initialComments: Comment[] }) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(searchParams.get('comment') === 'true');
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (searchParams.get('comment') === 'true') {
      setOpen(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content, parentId: replyTo }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments([newComment, ...comments]);
      setContent('');
      setReplyTo(null);
    } else if (res.status === 403) {
      const { error } = await res.json();
      const { toast } = await import('sonner');
      toast.error(error || 'You are banned from commenting');
    }
    setLoading(false);
  };

  const handleLike = async (commentId: number) => {
    const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
    if (res.ok) {
      const { action } = await res.json();
      setComments(comments.map(c => {
        if (c.id === commentId) {
          if (action === 'removed') return { ...c, likes: c.likes - 1 };
          if (action === 'switched') return { ...c, likes: c.likes + 1, dislikes: c.dislikes - 1 };
          return { ...c, likes: c.likes + 1 };
        }
        return c;
      }));
    } else if (res.status === 403) {
      const { error } = await res.json();
      const { toast } = await import('sonner');
      toast.error(error || 'You are banned');
    }
  };

  const handleDislike = async (commentId: number) => {
    const res = await fetch(`/api/comments/${commentId}/dislike`, { method: 'POST' });
    if (res.ok) {
      const { action } = await res.json();
      setComments(comments.map(c => {
        if (c.id === commentId) {
          if (action === 'removed') return { ...c, dislikes: c.dislikes - 1 };
          if (action === 'switched') return { ...c, dislikes: c.dislikes + 1, likes: c.likes - 1 };
          return { ...c, dislikes: c.dislikes + 1 };
        }
        return c;
      }));
    } else if (res.status === 403) {
      const { error } = await res.json();
      const { toast } = await import('sonner');
      toast.error(error || 'You are banned');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">Comments ({comments.length})</span>
      </button>

      {open && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-background border-l shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Comments</h2>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-accent rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No comments yet. Be the first!</p>
            ) : (
              comments.filter(c => !c.parentId).map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {comment.authorName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <button onClick={() => handleLike(comment.id)} className="flex items-center gap-1 hover:text-primary">
                        <ThumbsUp className="h-3 w-3" /> {comment.likes}
                      </button>
                      <button onClick={() => handleDislike(comment.id)} className="flex items-center gap-1 hover:text-destructive">
                        <ThumbsDown className="h-3 w-3" /> {comment.dislikes}
                      </button>
                      {session && (
                        <button onClick={() => setReplyTo(comment.id)} className="flex items-center gap-1 hover:text-primary">
                          <Reply className="h-3 w-3" /> Reply
                        </button>
                      )}
                    </div>
                  </div>
                  {comments.filter(r => r.parentId === comment.id).map((reply) => (
                    <div key={reply.id} className="ml-8 border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                          {reply.authorName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-xs">{reply.authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{reply.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <button onClick={() => handleLike(reply.id)} className="flex items-center gap-1 hover:text-primary">
                          <ThumbsUp className="h-3 w-3" /> {reply.likes}
                        </button>
                        <button onClick={() => handleDislike(reply.id)} className="flex items-center gap-1 hover:text-destructive">
                          <ThumbsDown className="h-3 w-3" /> {reply.dislikes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {session ? (
            <form onSubmit={handleSubmit} className="p-4 border-t space-y-2">
              {replyTo && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Replying to comment</span>
                  <button type="button" onClick={() => setReplyTo(null)} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-center border rounded-full p-1">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                  className="flex-1 px-4 py-2 bg-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 border-t text-center">
              <p className="text-sm text-muted-foreground mb-2">Sign in to comment</p>
              <a href="/sign-in" className="text-sm text-primary hover:underline">
                Sign In
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
