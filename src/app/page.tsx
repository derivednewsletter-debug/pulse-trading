'use client';

export const dynamic = 'force-dynamic';

import { HeroSearch } from '@/components/home/search-bar';
import { TrendingStocks } from '@/components/home/trending-stocks';
import { MarketOverview } from '@/components/home/market-overview';
import { RecentDiscussions } from '@/components/home/recent-discussions';
import { TopTraders } from '@/components/home/top-traders';
import { CreatePostDialog } from '@/components/posts/create-post-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, TrendingUp, MessageSquare, Brain } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center py-8 sm:py-12 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Trading Community
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-3xl text-balance">
          Where traders discover ideas,
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            discuss stocks, and win together
          </span>
        </h1>
        <p className="text-sm sm:text-base text-white/50 max-w-xl">
          Open any ticker. Understand everything happening in under 30 seconds.
          AI-powered summaries, real-time community discussions, and market insights.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <CreatePostDialog>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Start Discussion
            </Button>
          </CreatePostDialog>
          <Button variant="outline" size="lg" className="gap-2" asChild>
            <a href="#trending">
              <TrendingUp className="h-5 w-5" />
              Explore
            </a>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-center pb-4">
        <HeroSearch />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="trending">
        {/* Left Column - Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <RecentDiscussions />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
              <MessageSquare className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">Live</div>
              <div className="text-[10px] text-white/40">Discussions</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
              <Brain className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">AI</div>
              <div className="text-[10px] text-white/40">Summaries</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
              <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">Real</div>
              <div className="text-[10px] text-white/40">Time Data</div>
            </div>
          </div>

          <TrendingStocks />
          <MarketOverview />
          <TopTraders />
        </div>
      </div>
    </div>
  );
}
