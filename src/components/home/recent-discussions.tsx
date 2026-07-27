'use client';

import { usePosts } from '@/hooks/use-posts';
import { formatDate, formatCompactNumber, getAvatarUrl } from '@/lib/utils';
import { MessageSquare, Heart, Bookmark, Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const postTypeConfig = {
  discussion: { label: 'Discussion', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  trade_idea: { label: 'Trade Idea', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  analysis: { label: 'Analysis', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  question: { label: 'Question', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  chart: { label: 'Chart', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
};

export function RecentDiscussions() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts();

  const posts = data?.pages.flatMap((p: any) => p.posts ?? p ?? []) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-400" />
          Recent Discussions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !posts.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-sm text-white/60 font-medium">No discussions yet</p>
            <p className="text-xs text-white/40 mt-1">Be the first to start a conversation</p>
          </div>
        ) : (
          <div className="space-y-1">
            {posts.map((post: any) => {
              const config = postTypeConfig[post.type as keyof typeof postTypeConfig] ?? postTypeConfig.discussion;
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="flex gap-3 rounded-lg px-3 py-3 hover:bg-white/5 transition-colors group"
                >
                  <img
                    src={getAvatarUrl(post.profiles)}
                    alt=""
                    className="h-10 w-10 rounded-full shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {post.profiles?.display_name ?? post.profiles?.username ?? 'User'}
                      </span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.color}`}>
                        {config.label}
                      </Badge>
                      <span className="text-[11px] text-white/30 ml-auto">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    {post.title && (
                      <h4 className="text-sm font-semibold text-white mb-0.5 group-hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h4>
                    )}
                    <p className="text-sm text-white/60 line-clamp-2">
                      {post.content.slice(0, 200)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {formatCompactNumber(post.like_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {formatCompactNumber(post.comment_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatCompactNumber(post.view_count)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {hasNextPage && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
