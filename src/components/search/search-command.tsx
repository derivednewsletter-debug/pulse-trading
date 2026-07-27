'use client';

import { useGlobalSearch } from '@/hooks/use-search';
import { cn, getAvatarUrl } from '@/lib/utils';
import { Search, TrendingUp, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
}

export function SearchCommand({ open, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data, isLoading } = useGlobalSearch(query);

  const allResults = [
    ...(data?.stocks ?? []).map((s: any) => ({ ...s, _type: 'stock' as const })),
    ...(data?.users ?? []).map((u: any) => ({ ...u, _type: 'user' as const })),
    ...(data?.posts ?? []).map((p: any) => ({ ...p, _type: 'post' as const })),
  ];

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
     
  }, [open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [data]);

  // Global keyboard shortcut - always active
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [open, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      handleSelect(allResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (result: any) => {
    onClose();
    if (result._type === 'stock') {
      router.push(`/stocks/${result.symbol}`);
    } else if (result._type === 'user') {
      router.push(`/profile/${result.username}`);
    } else if (result._type === 'post') {
      router.push(`/posts/${result.id}`);
    }
  };

  if (!open) return null;

  const grouped = {
    stocks: allResults.filter((r: any) => r._type === 'stock'),
    users: allResults.filter((r: any) => r._type === 'user'),
    posts: allResults.filter((r: any) => r._type === 'post'),
  };

  let globalIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 shadow-2xl animate-in">
        <div className="flex items-center border-b border-white/10 px-4">
          <Search className="h-5 w-5 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search stocks, users, posts..."
            className="flex-1 bg-transparent px-3 py-4 text-sm text-white placeholder:text-white/40 outline-none"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-white/40" />}
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {!query && (
            <div className="p-8 text-center">
              <Search className="mx-auto h-8 w-8 text-white/20 mb-3" />
              <p className="text-sm text-white/40">Start typing to search...</p>
            </div>
          )}

          {query && allResults.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <p className="text-sm text-white/40">
                No results found for {'\u201c'}{query}{'\u201d'}
              </p>
            </div>
          )}

          {query && isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                <span className="text-xs text-white/40">Searching...</span>
              </div>
            </div>
          )}

          {grouped.stocks.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                Stocks
              </div>
              {grouped.stocks.map((item: any) => {
                globalIndex++;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      selectedIndex === globalIndex
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/5'
                    )}
                  >
                    <TrendingUp className="h-4 w-4 shrink-0 text-indigo-400" />
                    <div className="flex-1 text-left">
                      <span className="font-medium">{item.symbol}</span>
                      <span className="ml-2 text-white/40">{item.name}</span>
                    </div>
                    {item.change_percent_24h != null && (
                      <span
                        className={cn(
                          'text-xs font-medium',
                          item.change_percent_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        )}
                      >
                        {item.change_percent_24h >= 0 ? '+' : ''}
                        {item.change_percent_24h.toFixed(2)}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {grouped.users.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                Users
              </div>
              {grouped.users.map((item: any) => {
                globalIndex++;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      selectedIndex === globalIndex
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/5'
                    )}
                  >
                    <img src={getAvatarUrl(item)} alt="" className="h-6 w-6 rounded-full" />
                    <div className="flex-1 text-left">
                      <span className="font-medium">
                        {item.display_name ?? item.username}
                      </span>
                      <span className="ml-2 text-white/40">@{item.username}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {grouped.posts.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                Posts
              </div>
              {grouped.posts.map((item: any) => {
                globalIndex++;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      selectedIndex === globalIndex
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/5'
                    )}
                  >
                    <FileText className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
                    <div className="flex-1 text-left">
                      <p className="line-clamp-1">{item.content}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {item.like_count} likes · {item.comment_count} comments
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {query && allResults.length > 0 && (
          <div className="border-t border-white/10 px-4 py-2">
            <div className="flex items-center gap-4 text-xs text-white/30">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
