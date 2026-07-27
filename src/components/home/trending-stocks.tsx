'use client';

import { useTrendingStocks } from '@/hooks/use-trending';
import { formatPercent, formatNumber, formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, MessageSquare, Users, Flame } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Stock } from '@/types/database';

export function TrendingStocks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Trending
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="most_discussed">
          <TabsList className="w-full">
            <TabsTrigger value="most_discussed" className="flex-1">Hot</TabsTrigger>
            <TabsTrigger value="fastest_growing" className="flex-1">Rising</TabsTrigger>
            <TabsTrigger value="most_active" className="flex-1">Active</TabsTrigger>
          </TabsList>
          {['most_discussed', 'fastest_growing', 'most_active'].map((category) => (
            <TabsContent key={category} value={category}>
              <TrendingList category={category} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TrendingList({ category }: { category: string }) {
  const { data: trending, isLoading } = useTrendingStocks(category);

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!trending?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <TrendingUp className="h-8 w-8 text-white/20 mb-2" />
        <p className="text-sm text-white/40">No trending stocks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 mt-4">
      {(trending as any[]).map((item, index) => {
        const stock = item.stocks ?? item;
        const isPositive = (stock.change_percent_24h ?? 0) >= 0;

        return (
          <Link
            key={stock.id}
            href={`/stocks/${stock.symbol}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-white/50 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{stock.symbol}</span>
                <span className="text-xs text-white/40 truncate">{stock.name}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-white/50">
                  {stock.price != null ? formatCurrency(stock.price) : '-'}
                </span>
                {stock.change_percent_24h != null && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {formatPercent(stock.change_percent_24h)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {item.post_count_24h}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {item.unique_users_24h}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
