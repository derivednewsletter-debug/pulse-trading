'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useStock(symbol: string) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${symbol}`);
      if (!res.ok) throw new Error('Failed to fetch stock');
      return res.json();
    },
    enabled: !!symbol,
  });
}

export function useStockPosts(symbol: string, page = 1) {
  return useQuery({
    queryKey: ['stock-posts', symbol, page],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${symbol}/posts?page=${page}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch stock posts');
      return res.json();
    },
    enabled: !!symbol,
  });
}

export function useStockAISummary(stockId: string | undefined) {
  return useQuery({
    queryKey: ['stock-ai-summary', stockId],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${stockId}/ai`);
      if (!res.ok) throw new Error('Failed to fetch AI summary');
      return res.json();
    },
    enabled: !!stockId,
  });
}

export function useStockNews(stockId: string | undefined) {
  return useQuery({
    queryKey: ['stock-news', stockId],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${stockId}/news`);
      if (!res.ok) throw new Error('Failed to fetch news');
      return res.json();
    },
    enabled: !!stockId,
  });
}

export function useFollowStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stockId, action }: { stockId: string; action: 'follow' | 'unfollow' }) => {
      const res = await fetch(`/api/stocks/${stockId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed to toggle follow');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-followers'] });
    },
  });
}

export function useIsFollowingStock(stockId: string | undefined) {
  return useQuery({
    queryKey: ['stock-followers', stockId],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${stockId}/follow`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.following ?? false;
    },
    enabled: !!stockId,
  });
}
