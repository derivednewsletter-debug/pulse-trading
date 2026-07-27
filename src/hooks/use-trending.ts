'use client';

import { useQuery } from '@tanstack/react-query';

export function useTrendingStocks(category?: string) {
  return useQuery({
    queryKey: ['trending', category],
    queryFn: async () => {
      const params = category ? `?category=${category}` : '';
      const res = await fetch(`/api/trending${params}`);
      if (!res.ok) throw new Error('Failed to fetch trending');
      return res.json();
    },
  });
}

export function useMarketOverview() {
  return useQuery({
    queryKey: ['market-overview'],
    queryFn: async () => {
      const res = await fetch('/api/stocks');
      if (!res.ok) throw new Error('Failed to fetch market overview');
      return res.json();
    },
  });
}

export function useTopTraders() {
  return useQuery({
    queryKey: ['top-traders'],
    queryFn: async () => {
      const res = await fetch('/api/users/top');
      if (!res.ok) throw new Error('Failed to fetch top traders');
      return res.json();
    },
  });
}
