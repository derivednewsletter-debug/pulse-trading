import { TrendingUp } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
          <TrendingUp className="h-6 w-6 text-white animate-pulse" />
        </div>
        <p className="text-sm text-white/40">Loading Pulse...</p>
      </div>
    </div>
  );
}
