'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-sm text-white/50 max-w-md mb-8">
        An unexpected error occurred. Our team has been notified.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <TrendingUp className="h-4 w-4 mr-2" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
