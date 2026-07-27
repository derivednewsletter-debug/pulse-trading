'use client';

import { useAuth } from '@/hooks/use-auth';
import { getAvatarUrl, formatCompactNumber } from '@/lib/utils';
import { Settings, Users, Calendar, Link as LinkIcon, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/types/database';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function ProfileHeader({ profile }: { profile: Profile | null }) {
  const { user, profile: currentProfile } = useAuth();
  const isOwnProfile = user?.id === profile?.id;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden ring-4 ring-indigo-500/20">
            <img
              src={getAvatarUrl(profile ?? {})}
              alt={profile?.display_name ?? profile?.username ?? 'Profile'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {profile?.display_name ?? profile?.username ?? 'User'}
              </h1>
              <p className="text-sm text-white/40">@{profile?.username}</p>
            </div>

            {isOwnProfile ? (
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <FollowButton profileId={profile?.id} />
            )}
          </div>

          {profile?.bio && (
            <p className="text-sm text-white/60 mt-3 max-w-lg">{profile.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/40">
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Website
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Joined{' '}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : 'N/A'}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {formatCompactNumber(profile?.reputation_score ?? 0)} reputation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FollowButton({ profileId }: { profileId?: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if already following
  const { data: isFollowing, isLoading: checkingFollow } = useQuery({
    queryKey: ['is-following', profileId],
    queryFn: async () => {
      if (!user || !profileId) return false;
      const res = await fetch(`/api/users/${profileId}/follow`, {
        method: 'GET',
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.following ?? false;
    },
    enabled: !!user && !!profileId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !profileId) return;
      const res = await fetch(`/api/users/${profileId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isFollowing ? 'unfollow' : 'follow' }),
      });
      if (!res.ok) throw new Error('Failed to toggle follow');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', profileId] });
    },
  });

  if (!user || !profileId) return null;

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'default'}
      size="sm"
      onClick={() => followMutation.mutate()}
      disabled={followMutation.isPending || checkingFollow}
      className="gap-2"
    >
      {followMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
