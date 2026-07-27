'use client';

import { useTopTraders } from '@/hooks/use-trending';
import { getAvatarUrl, formatCompactNumber } from '@/lib/utils';
import { Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

export function TopTraders() {
  const { data: traders, isLoading } = useTopTraders();
  const rawTraders = (traders ?? []) as Array<{
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    reputation_score: number;
  }>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Traders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : !rawTraders.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 text-white/20 mb-2" />
            <p className="text-sm text-white/40">No traders yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {rawTraders.slice(0, 5).map((trader, index) => (
              <Link
                key={trader.id}
                href={`/profile/${trader.username}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors group"
              >
                <span className={`w-5 text-center text-sm font-bold ${rankColors[index] ?? 'text-white/30'}`}>
                  {index + 1}
                </span>
                <img
                  src={getAvatarUrl(trader)}
                  alt=""
                  className="h-9 w-9 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                    {trader.display_name ?? trader.username}
                  </div>
                  <div className="text-xs text-white/40">@{trader.username}</div>
                </div>
                <div className="text-xs text-white/50">
                  {formatCompactNumber(trader.reputation_score)} pts
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
