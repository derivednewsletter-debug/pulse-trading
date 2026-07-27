'use client';

import { useState } from 'react';
import { useComments, useCreateComment } from '@/hooks/use-comments';
import { useRealtimeComments } from '@/hooks/use-realtime-comments';
import { useAuth } from '@/hooks/use-auth';
import { formatDate, getAvatarUrl, cn } from '@/lib/utils';
import { Heart, Reply, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

export function CommentSection({ postId }: { postId: string }) {
  const { data: comments, isLoading } = useComments(postId);
  const { user, profile } = useAuth();

  // Subscribe to real-time comment changes — new comments appear instantly
  useRealtimeComments(postId);
  const router = useRouter();
  const createComment = useCreateComment();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        post_id: postId,
        content: newComment.trim(),
        parent_id: replyTo?.id,
      });
      setNewComment('');
      setReplyTo(null);
    } catch {
      // Error handled by mutation
    }
  };

  const topLevel = (comments ?? []).filter((c: any) => !c.parent_id);
  const replies = (comments ?? []).filter((c: any) => c.parent_id);

  const getReplies = (parentId: string) =>
    replies.filter((r: any) => r.parent_id === parentId);

  return (
    <div className="p-5">
      {/* Comment Form */}
      <div className="mb-6">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-white/40">
            <Reply className="h-3 w-3" />
            Replying to <span className="text-indigo-400">@{replyTo.username}</span>
            <button
              onClick={() => setReplyTo(null)}
              className="ml-auto text-white/30 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-3">
          {user && (
            <img
              src={getAvatarUrl(profile ?? {})}
              alt=""
              className="h-8 w-8 rounded-full shrink-0 mt-1"
            />
          )}
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={user ? 'Write a comment...' : 'Sign in to comment'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
              className="min-h-[60px] text-sm"
              disabled={!user}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim() || createComment.isPending || !user}
              >
                {createComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Comment'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !topLevel.length ? (
        <div className="py-6 text-center">
          <p className="text-sm text-white/40">
            {user ? 'No comments yet. Be the first to comment!' : 'No comments yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevel.map((comment: any) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              getReplies={getReplies}
              onReply={(id, username) => setReplyTo({ id, username })}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentThread({
  comment,
  replies,
  getReplies,
  onReply,
  depth,
}: {
  comment: any;
  replies: any[];
  getReplies: (parentId: string) => any[];
  onReply: (id: string, username: string) => void;
  depth: number;
}) {
  const [showReplies, setShowReplies] = useState(depth < 2);

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-10 pl-4 border-l border-white/5')}>
      <img
        src={getAvatarUrl(comment.profiles)}
        alt=""
        className="h-8 w-8 rounded-full shrink-0 mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/profile/${comment.profiles?.username}`}
            className="text-sm font-medium text-white hover:text-indigo-400 transition-colors"
          >
            {comment.profiles?.display_name ?? comment.profiles?.username}
          </Link>
          <span className="text-xs text-white/30">{formatDate(comment.created_at)}</span>
        </div>
        <p className="text-sm text-white/70">{comment.content}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <button className="flex items-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors">
            <Heart className="h-3.5 w-3.5" />
            {comment.like_count > 0 && comment.like_count}
          </button>
          <button
            onClick={() => onReply(comment.id, comment.profiles?.username)}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-indigo-400 transition-colors"
          >
            <Reply className="h-3.5 w-3.5" />
            Reply
          </button>
        </div>

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="mt-3">
            {showReplies ? (
              <div className="space-y-3">
                {replies.map((reply: any) => (
                  <CommentThread
                    key={reply.id}
                    comment={reply}
                    replies={getReplies(reply.id)}
                    getReplies={getReplies}
                    onReply={onReply}
                    depth={depth + 1}
                  />
                ))}
              </div>
            ) : (
              <button
                onClick={() => setShowReplies(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
