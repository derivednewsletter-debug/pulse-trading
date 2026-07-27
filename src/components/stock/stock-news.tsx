'use client';

import { useStockNews } from '@/hooks/use-stock';
import { formatDate } from '@/lib/utils';
import { ExternalLink, Newspaper, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const sentimentStyles: Record<string, string> = {
  positive: 'bg-green-500/10 text-green-400 border-green-500/20',
  negative: 'bg-red-500/10 text-red-400 border-red-500/20',
  neutral: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export function StockNews({ stockId }: { stockId: string }) {
  const { data: news, isLoading } = useStockNews(stockId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-indigo-400" />
          News
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !news?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Newspaper className="h-8 w-8 text-white/20 mb-2" />
            <p className="text-sm text-white/40">No news articles yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(news as any[]).map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors group"
              >
                <ExternalLink className="h-4 w-4 text-white/20 mt-0.5 group-hover:text-indigo-400 transition-colors shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-white/40 font-medium">{item.source}</span>
                    {item.sentiment && (
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sentimentStyles[item.sentiment] ?? ''}`}>
                        {item.sentiment}
                      </Badge>
                    )}
                    <span className="text-[10px] text-white/30 ml-auto">{formatDate(item.published_at)}</span>
                  </div>
                  <p className="text-sm text-white/70 group-hover:text-white transition-colors line-clamp-2">
                    {item.title}
                  </p>
                  {item.summary && (
                    <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{item.summary}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
