'use client';

import { useAuth } from '@/hooks/use-auth';
import { useUnreadCount } from '@/hooks/use-notifications';
import { cn, getAvatarUrl } from '@/lib/utils';
import {
  Bell,
  Bookmark,
  MessageSquare,
  Search,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchCommand } from '@/components/search/search-command';

const navItems = [
  { href: '/', label: 'Home', icon: TrendingUp },
  { href: '/?tab=discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/?tab=trending', label: 'Trending', icon: TrendingUp },
];

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Pulse</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
              aria-label="Open search (⌘K)"
            >
              <Search className="h-4 w-4" />
              <span>Search stocks, users...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30">
                ⌘K
              </kbd>
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative rounded-xl p-2 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount != null && unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full transition-opacity hover:opacity-80" aria-label="Profile menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(profile ?? {})} />
                        <AvatarFallback>
                          {profile?.display_name?.charAt(0) ?? user.email?.charAt(0) ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="truncate text-white">
                          {profile?.display_name ?? profile?.username ?? 'User'}
                        </span>
                        <span className="truncate text-xs font-normal text-white/40">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${profile?.username ?? ''}`} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${profile?.username ?? ''}?tab=bookmarks`} className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        Bookmarks
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-red-400">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden rounded-xl p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-gray-950 md:hidden">
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
            </nav>
          </div>
        )}
      </header>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
