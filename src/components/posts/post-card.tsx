'use client';

import { useState, useCallback } from 'react';
import { useLikePost, useBookmarkPost } from '@/hooks/use-posts';
import { useAuth } from '@/hooks/use-auth';
import { formatDate, formatCompactNumber, getAvatarUrl, cn } from '@/lib/utils';
import {
  Heart,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  Share2,
  MoreHorizontal,
  TrendingUp,
  BarChart3,
  HelpCircle,
  ChartLine,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommentSection } from '@/components/comments/comment-section';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  discussion: { label: 'Discussion', icon: FileText, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  trade_idea: { label: 'Trade Idea', icon: TrendingUp, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  analysis: { label: 'Analysis', icon: BarChart3, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  question: { label: 'Question', icon: HelpCircle, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  chart: { label: 'Chart', icon: ChartLine, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
};

export function PostCard({ post }: { post: any }) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const likeMutation = useLikePost();
  const bookmarkMutation = useBookmarkPost();

  const config = typeConfig[post.type] ?? typeConfig.discussion;
  const TypeIcon = config.icon;

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    likeMutation.mutate({ postId: post.id, liked: newLiked });
  }, [user, liked, post.id, likeMutation, router]);

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    bookmarkMutation.mutate({ postId: post.id, bookmarked: newBookmarked });
  }, [user, bookmarked, post.id, bookmarkMutation, router]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/posts/${post.id}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [post.id]);

  const handleCopyLink = useCallback(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/posts/${post.id}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [post.id]);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl overflow-hidden transition-all duration-200 hover:border-white/20">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/profile/${post.profiles?.username}`} className="flex items-center gap-3 group">
            <img
              src={getAvatarUrl(post.profiles)}
              alt=""
              className="h-10 w-10 rounded-full"
              loading="lazy"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  {post.profiles?.display_name ?? post.profiles?.username}
                </span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.color}`}>
                  <TypeIcon className="h-3 w-3 mr-0.5" />
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <span>@{post.profiles?.username}</span>
                <span>·</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-lg p-1.5 text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                {linkCopied ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <Check className="h-4 w-4" />
                    Copied!
                  </span>
                ) : (
                  'Copy link'
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {post.title && (
          <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
        )}

        <div className="prose prose-invert prose-sm max-w-none text-white/70">
          {post.is_markdown ? (
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-white/70 prose-a:text-indigo-400 prose-strong:text-white prose-code:text-indigo-300 prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{post.content}</p>
          )}
        </div>

        {post.image_url && (
          <img src={post.image_url} alt="" className="mt-3 rounded-xl w-full object-cover max-h-96" loading="lazy" />
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-1 border-t border-white/5 px-5 py-2">
        <button
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors',
            liked ? 'text-red-400 bg-red-500/10' : 'text-white/30 hover:text-white hover:bg-white/5',
            likeMutation.isPending && 'opacity-50'
          )}
        >
          {likeMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={cn('h-4 w-4', liked && 'fill-red-400')} />
          )}
          {formatCompactNumber(post.like_count + (liked ? 1 : 0))}
        </button>

        <button
          onClick={(e) => { e.preventDefault(); setShowComments(!showComments); }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          {formatCompactNumber(post.comment_count)}
        </button>

        <button
          onClick={handleBookmark}
          disabled={bookmarkMutation.isPending}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors',
            bookmarked ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/30 hover:text-white hover:bg-white/5',
            bookmarkMutation.isPending && 'opacity-50'
          )}
        >
          {bookmarkMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : bookmarked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>

        <button
          onClick={handleShare}
          className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors ml-auto"
        >
          {linkCopied ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-white/5">
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
}
