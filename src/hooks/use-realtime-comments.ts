'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

/**
 * Polls for new comments every 10 seconds.
 * Without Supabase Realtime, we fall back to polling via React Query's refetchInterval.
 *
 * This hook invalidates the comments query for the given postId on a timer,
 * which triggers a background refetch. React Query deduplicates rapid
 * invalidations so multiple mounts don't cause a storm of requests.
 */
export function useRealtimeComments(postId: string | undefined) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!postId) return;

    // Poll every 30 seconds
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stock-posts'] });
    }, 30_000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [postId, queryClient]);
}
