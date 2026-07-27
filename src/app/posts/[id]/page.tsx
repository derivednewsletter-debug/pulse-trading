'use client';

export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { usePost } from '@/hooks/use-posts';
import { PostCard } from '@/components/posts/post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PostPage() {
  const params = useParams();
  const { data: post, isLoading } = usePost(params.id as string);

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to discussions
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !post ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText className="h-16 w-16 text-white/20 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Post Not Found</h2>
          <p className="text-sm text-white/40">This post may have been removed or doesn&apos;t exist.</p>
        </div>
      ) : (
        <PostCard post={post} />
      )}
    </div>
  );
}
