'use client';

import { useStockAISummary } from '@/hooks/use-stock';
import { cn } from '@/lib/utils';
import { Sparkles, Brain, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface AISummaryProps {
  stockId: string;
}

export function AISummary({ stockId }: AISummaryProps) {
  const { data: summary, isLoading } = useStockAISummary(stockId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            AI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            AI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Brain className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-sm text-white/60 font-medium">No AI summary yet</p>
            <p className="text-xs text-white/40 mt-1">
              AI summaries are generated when there is enough community discussion
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const SentimentIcon = summary.sentiment === 'bullish' ? TrendingUp : summary.sentiment === 'bearish' ? TrendingDown : Minus;
  const sentimentColor = summary.sentiment === 'bullish' ? 'text-green-400' : summary.sentiment === 'bearish' ? 'text-red-400' : 'text-yellow-400';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          AI Summary
        </CardTitle>
        <Badge variant={summary.sentiment as any} className="capitalize">
          <SentimentIcon className={`h-3 w-3 mr-1 ${sentimentColor}`} />
          {summary.sentiment}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-white/70 leading-relaxed">
          {summary.summary}
        </p>

        {/* Bull/Bear Meter */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-green-400">
              <TrendingUp className="h-4 w-4" />
              Bullish
            </span>
            <span className="text-green-400 font-semibold">{summary.bullish_score}%</span>
          </div>
          <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${summary.bullish_score}%` }}
            />
            <div
              className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-500 to-red-400 rounded-full transition-all duration-500"
              style={{ width: `${summary.bearish_score}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-red-400">
              <TrendingDown className="h-4 w-4" />
              Bearish
            </span>
            <span className="text-red-400 font-semibold">{summary.bearish_score}%</span>
          </div>
        </div>

        {/* Key Points */}
        {summary.key_points && summary.key_points.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Key Points</h4>
            <ul className="space-y-2">
              {(summary.key_points ?? []).map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
