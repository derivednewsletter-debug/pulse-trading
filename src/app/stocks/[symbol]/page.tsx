'use client';

export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { useStock } from '@/hooks/use-stock';
import { StockHeader } from '@/components/stock/stock-header';
import { TradingViewChart } from '@/components/stock/tradingview-chart';
import { AISummary } from '@/components/stock/ai-summary';
import { StockPosts } from '@/components/stock/stock-posts';
import { StockNews } from '@/components/stock/stock-news';
import { FloatingAIAssistant } from '@/components/stock/floating-ai-assistant';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

export default function StockPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const { data: stock, isLoading } = useStock(symbol);

  return (
    <div className="space-y-6 animate-in">
      {/* Stock Header */}
      <StockHeader symbol={symbol} />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[480px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[300px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      ) : !stock ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <TrendingUp className="h-16 w-16 text-white/20 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Stock Not Found</h2>
          <p className="text-sm text-white/40 max-w-md">
            We couldn{"\u2019"}t find the symbol {symbol}. Please check the ticker and try again.
          </p>
        </div>
      ) : (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chart & Discussions */}
            <div className="lg:col-span-2 space-y-6">
              {/* TradingView Chart */}
              <TradingViewChart symbol={symbol} />

              {/* Discussions */}
              <StockPosts symbol={symbol} stockId={stock.id} />
            </div>

            {/* Right Column - AI Summary & News */}
            <div className="space-y-6">
              {/* AI Summary */}
              <AISummary stockId={stock.id} />

              {/* News */}
              <StockNews stockId={stock.id} />
            </div>
          </div>

          {/* Floating AI Assistant */}
          <FloatingAIAssistant symbol={symbol} />
        </>
      )}
    </div>
  );
}
