'use client';

import { useStock, useIsFollowingStock, useFollowStock } from '@/hooks/use-stock';
import { formatCurrency, formatPercent, formatNumber, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Users, Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function StockHeader({ symbol }: { symbol: string }) {
  const { data: stock, isLoading } = useStock(symbol);
  const { data: isFollowing } = useIsFollowingStock(stock?.id);
  const followMutation = useFollowStock();

  if (isLoading) {
    return (
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-64" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="h-12 w-12 text-white/20 mb-3" />
        <h2 className="text-lg font-semibold text-white">Stock not found</h2>
        <p className="text-sm text-white/40 mt-1">The symbol {'"'}{symbol}{'"'} could not be found</p>
      </div>
    );
  }

  const isPositive = (stock.change_percent_24h ?? 0) >= 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{stock.symbol}</h1>
          <Badge variant={isPositive ? 'bullish' : 'bearish'} className="text-xs">
            {stock.sector ?? 'N/A'}
          </Badge>
        </div>
        <p className="text-sm text-white/50">{stock.name}</p>
        {stock.description && (
          <p className="text-xs text-white/30 mt-1 max-w-xl line-clamp-1">{stock.description}</p>
        )}
      </div>

      <div className="flex items-center gap-4 sm:text-right">
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {stock.price != null ? formatCurrency(stock.price) : '-'}
          </div>
          {stock.change_percent_24h != null && (
            <div className={`flex items-center gap-1 text-sm font-medium justify-end ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatCurrency(stock.change_24h ?? 0)} ({formatPercent(stock.change_percent_24h)})
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {stock.volume != null && (
            <div className="text-xs text-white/30">
              Vol: {formatNumber(stock.volume)}
            </div>
          )}
          {stock.market_cap != null && (
            <div className="text-xs text-white/30">
              Mkt Cap: {formatNumber(stock.market_cap)}
            </div>
          )}
        </div>
        <Button
          variant={isFollowing ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => {
            if (!stock?.id) return;
            followMutation.mutate({
              stockId: stock.id,
              action: isFollowing ? 'unfollow' : 'follow',
            });
          }}
          disabled={followMutation.isPending}
          className="gap-2"
        >
          {followMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFollowing ? (
            <BellOff className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    </div>
  );
}
