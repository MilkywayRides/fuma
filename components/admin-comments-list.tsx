'use client';

import { useState } from 'react';
import { Trash2, ThumbsUp, ThumbsDown, Reply } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
  authorName: string | null;
  postTitle: string | null;
  postId: number | null;
  parentId: number | null;
}

export function AdminCommentsList({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  const handleLike = async (id: number) => {
    const res = await fetch(`/api/comments/${id}/like`, { method: 'POST' });
    if (res.ok) {
      const { action } = await res.json();
      setComments(comments.map(c => {
        if (c.id === id) {
          if (action === 'removed') return { ...c, likes: c.likes - 1 };
          if (action === 'switched') return { ...c, likes: c.likes + 1, dislikes: c.dislikes - 1 };
          return { ...c, likes: c.likes + 1 };
        }
        return c;
      }));
    }
  };

  const handleDislike = async (id: number) => {
    const res = await fetch(`/api/comments/${id}/dislike`, { method: 'POST' });
    if (res.ok) {
      const { action } = await res.json();
      setComments(comments.map(c => {
        if (c.id === id) {
          if (action === 'removed') return { ...c, dislikes: c.dislikes - 1 };
          if (action === 'switched') return { ...c, dislikes: c.dislikes + 1, likes: c.likes - 1 };
          return { ...c, dislikes: c.dislikes + 1 };
        }
        return c;
      }));
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyTo) return;

    const comment = comments.find(c => c.id === replyTo);
    if (!comment?.postId) return;

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: comment.postId, content: replyContent, parentId: replyTo }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments([...comments, newComment]);
      setReplyContent('');
      setReplyTo(null);
    }
  };

  return (
    <div className="space-y-4">
      {comments.filter(c => !c.parentId).map((comment) => (
        <div key={comment.id} className="space-y-2">
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{comment.authorName}</span>
                  <span>•</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>on "{comment.postTitle}"</span>
                </div>
                <p className="text-sm">{comment.content}</p>
                <div className="flex items-center gap-3 text-xs">
                  <button onClick={() => handleLike(comment.id)} className="flex items-center gap-1 hover:text-primary">
                    <ThumbsUp className="h-3 w-3" /> {comment.likes}
                  </button>
                  <button onClick={() => handleDislike(comment.id)} className="flex items-center gap-1 hover:text-destructive">
                    <ThumbsDown className="h-3 w-3" /> {comment.dislikes}
                  </button>
                  <button onClick={() => setReplyTo(comment.id)} className="flex items-center gap-1 hover:text-primary">
                    <Reply className="h-3 w-3" /> Reply
                  </button>
                </div>
              </div>
              <button onClick={() => handleDelete(comment.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {replyTo === comment.id && (
              <form onSubmit={handleReply} className="mt-3 flex gap-2">
                <input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  Send
                </button>
                <button type="button" onClick={() => setReplyTo(null)} className="px-4 py-2 border rounded-md text-sm">
                  Cancel
                </button>
              </form>
            )}
          </div>
          {comments.filter(r => r.parentId === comment.id).map((reply) => (
            <div key={reply.id} className="ml-8 border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{reply.authorName}</span>
                    <span>•</span>
                    <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <button onClick={() => handleLike(reply.id)} className="flex items-center gap-1 hover:text-primary">
                      <ThumbsUp className="h-3 w-3" /> {reply.likes}
                    </button>
                    <button onClick={() => handleDislike(reply.id)} className="flex items-center gap-1 hover:text-destructive">
                      <ThumbsDown className="h-3 w-3" /> {reply.dislikes}
                    </button>
                  </div>
                </div>
                <button onClick={() => handleDelete(reply.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
