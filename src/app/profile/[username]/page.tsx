'use client';

export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProfileHeader } from '@/components/profile/profile-header';
import { PostCard } from '@/components/posts/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Bookmark } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const res = await fetch(`/api/profile?username=${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    enabled: !!username,
  });

  const { data: posts } = useQuery({
    queryKey: ['profile-posts', profile?.id],
    queryFn: async () => {
      const res = await fetch(`/api/posts?userId=${profile!.id}&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      return data.posts ?? data ?? [];
    },
    enabled: !!profile?.id,
  });

  const { data: bookmarks } = useQuery({
    queryKey: ['profile-bookmarks', profile?.id],
    queryFn: async () => {
      const res = await fetch(`/api/bookmarks?userId=${profile!.id}&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch bookmarks');
      const data = await res.json();
      return data.bookmarks ?? data ?? [];
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6 animate-in">
      {isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : (
        <ProfileHeader profile={profile ?? null} />
      )}

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts" className="gap-2">
            <FileText className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {!posts?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-white/20 mb-3" />
              <p className="text-sm text-white/60 font-medium">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(posts as any[]).map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarks">
          {!bookmarks?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bookmark className="h-12 w-12 text-white/20 mb-3" />
              <p className="text-sm text-white/60 font-medium">No bookmarks yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(bookmarks as any[]).map((bookmark: any) => (
                <PostCard key={bookmark.id} post={bookmark.posts ?? bookmark.post ?? bookmark} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
