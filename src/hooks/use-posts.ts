'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

const API_BASE = '/api';

export function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`${API_BASE}/posts?page=${pageParam}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    getNextPageParam: (lastPage: any) => lastPage.nextPage ?? undefined,
    initialPageParam: 0,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/posts/${id}`);
      if (!res.ok) throw new Error('Failed to fetch post');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: {
      content: string;
      type: string;
      stock_id?: string;
      title?: string;
      is_markdown?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (!res.ok) throw new Error('Failed to create post');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stock-posts'] });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      const res = await fetch(`${API_BASE}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: liked ? 'like' : 'unlike' }),
      });
      if (!res.ok) throw new Error('Failed to toggle like');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['stock-posts'] });
    },
  });
}

export function useBookmarkPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, bookmarked }: { postId: string; bookmarked: boolean }) => {
      const res = await fetch(`${API_BASE}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: bookmarked ? 'bookmark' : 'unbookmark' }),
      });
      if (!res.ok) throw new Error('Failed to toggle bookmark');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
