'use client';

import { useStockPosts } from '@/hooks/use-stock';
import { formatDate, formatCompactNumber, getAvatarUrl } from '@/lib/utils';
import { Heart, MessageSquare, Eye, Plus } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreatePostDialog } from '@/components/posts/create-post-dialog';

const postTypeStyles: Record<string, string> = {
  discussion: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  trade_idea: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  analysis: 'bg-green-500/10 text-green-400 border-green-500/20',
  question: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  chart: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export function StockPosts({ symbol, stockId }: { symbol: string; stockId: string }) {
  const { data, isLoading } = useStockPosts(symbol);

  const posts = (data as any)?.posts ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-400" />
          Discussions
        </CardTitle>
        <CreatePostDialog stockId={stockId} stockSymbol={symbol}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </CreatePostDialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !posts.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-sm text-white/60 font-medium">No discussions yet</p>
            <p className="text-xs text-white/40 mt-1 mb-4">
              Start the conversation about {symbol}
            </p>
            <CreatePostDialog stockId={stockId} stockSymbol={symbol}>
              <Button size="sm">Create Post</Button>
            </CreatePostDialog>
          </div>
        ) : (
          <div className="space-y-1">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="flex gap-3 rounded-lg px-3 py-3 hover:bg-white/5 transition-colors group"
              >
                <img src={getAvatarUrl(post.profiles)} alt="" className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {post.profiles?.display_name ?? post.profiles?.username}
                    </span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${postTypeStyles[post.type] ?? ''}`}>
                      {post.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-[11px] text-white/30 ml-auto">{formatDate(post.created_at)}</span>
                  </div>
                  {post.title && (
                    <h4 className="text-sm font-semibold text-white mb-0.5 group-hover:text-indigo-400 transition-colors">
                      {post.title}
                    </h4>
                  )}
                  <p className="text-sm text-white/60 line-clamp-2">{post.content.slice(0, 200)}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatCompactNumber(post.like_count)}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{formatCompactNumber(post.comment_count)}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatCompactNumber(post.view_count)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
