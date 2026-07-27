import Link from 'next/link';
import { TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-6">
        <Search className="h-8 w-8 text-white/40" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-sm text-white/50 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">
          <TrendingUp className="h-4 w-4 mr-2" />
          Go Home
        </Link>
      </Button>
    </div>
  );
}
