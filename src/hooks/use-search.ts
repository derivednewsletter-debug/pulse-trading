'use client';

import { useQuery } from '@tanstack/react-query';

export function useGlobalSearch(query: string, type: string = 'all') {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: async () => {
      if (!query || query.length < 1) return { stocks: [], users: [], posts: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: query.length >= 1,
  });
}
