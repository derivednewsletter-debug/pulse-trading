'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface TradingViewChartProps {
  symbol: string;
}

export function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          container_id: containerRef.current!.id,
          symbol: symbol.toUpperCase(),
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          width: '100%',
          height: 480,
          studies: ['STD;RSI', 'STD;MACD', 'STD;SMA_20', 'STD;SMA_50'],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          backgroundColor: 'transparent',
          gridColor: 'rgba(255,255,255,0.05)',
          hide_legend: false,
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      // Clean up script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

  return (
    <Card className="overflow-hidden p-0">
      <div
        id={`tradingview-${symbol}`}
        ref={containerRef}
        className="h-[480px] w-full"
      />
    </Card>
  );
}
