'use client';

import { Search } from 'lucide-react';
import { SearchCommand } from '@/components/search/search-command';
import { useState } from 'react';

export function HeroSearch() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative w-full max-w-2xl"
      >
        <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all duration-300 hover:border-indigo-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/10">
          <Search className="h-5 w-5 text-white/40 group-hover:text-indigo-400 transition-colors" />
          <div className="flex-1">
            <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
              Search any stock ticker or company...
            </p>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/30">
            ⌘K
          </kbd>
        </div>
      </button>

      <SearchCommand open={open} onClose={() => setOpen(false)} />
    </>
  );
}
