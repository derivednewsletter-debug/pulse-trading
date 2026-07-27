'use client';

import { useMarketOverview } from '@/hooks/use-trending';
import { formatPercent, formatCurrency, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Stock } from '@/types/database';

export function MarketOverview() {
  const { data: stocks, isLoading } = useMarketOverview();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : !stocks?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-8 w-8 text-white/20 mb-2" />
            <p className="text-sm text-white/40">No market data available</p>
          </div>
        ) : (
          <div className="space-y-1">
            {(stocks as Stock[]).map((stock) => {
              const isPositive = (stock.change_percent_24h ?? 0) >= 0;
              return (
                <Link
                  key={stock.id}
                  href={`/stocks/${stock.symbol}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{stock.symbol}</span>
                      <span className="text-xs text-white/40 truncate">{stock.name}</span>
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">
                      Vol: {stock.volume ? formatNumber(stock.volume) : '-'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {stock.price != null ? formatCurrency(stock.price) : '-'}
                    </div>
                    {stock.change_percent_24h != null && (
                      <div className={`flex items-center gap-0.5 text-xs font-medium justify-end ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatPercent(stock.change_percent_24h)}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
