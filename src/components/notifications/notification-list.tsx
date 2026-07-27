'use client';

import { useNotifications, useMarkAsRead } from '@/hooks/use-notifications';
import { formatDate, getAvatarUrl, cn } from '@/lib/utils';
import { Heart, MessageSquare, UserPlus, AtSign, Bell, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const notificationConfig: Record<string, { icon: any; color: string; href: (n: any) => string }> = {
  like: { icon: Heart, color: 'text-red-400 bg-red-500/10', href: (n: any) => `/posts/${n.entity_id}` },
  comment: { icon: MessageSquare, color: 'text-blue-400 bg-blue-500/10', href: (n: any) => `/posts/${n.entity_id}` },
  reply: { icon: MessageSquare, color: 'text-indigo-400 bg-indigo-500/10', href: (n: any) => `/posts/${n.entity_id}` },
  follow: { icon: UserPlus, color: 'text-green-400 bg-green-500/10', href: (n: any) => `/profile/${n.actor?.username}` },
  mention: { icon: AtSign, color: 'text-purple-400 bg-purple-500/10', href: (n: any) => `/posts/${n.entity_id}` },
  stock_activity: { icon: TrendingUp, color: 'text-cyan-400 bg-cyan-500/10', href: () => '/?tab=trending' },
};

export function NotificationList() {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();

  const rawNotifications = (notifications ?? []) as any[];
  const unreadIds = rawNotifications.filter((n: any) => !n.read).map((n: any) => n.id);

  const handleMarkAllRead = () => {
    if (unreadIds.length > 0) {
      markAsRead.mutate(unreadIds);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl">
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        {unreadIds.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={markAsRead.isPending}>
            {markAsRead.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Mark all read'
            )}
          </Button>
        )}
      </div>

      <div className="divide-y divide-white/5">
        {isLoading ? (
          <div className="p-5 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !rawNotifications.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-white/20 mb-3" />
            <p className="text-sm text-white/60 font-medium">No notifications yet</p>
            <p className="text-xs text-white/40 mt-1">
              When someone likes, comments, or follows you, it will show up here
            </p>
          </div>
        ) : (
          rawNotifications.map((notification: any) => {
            const config = notificationConfig[notification.type] ?? notificationConfig.stock_activity;
            const Icon = config.icon;

            return (
              <Link
                key={notification.id}
                href={config.href(notification)}
                className={cn(
                  'flex items-start gap-3 px-5 py-4 transition-colors hover:bg-white/5',
                  !notification.read && 'bg-indigo-500/[0.03]'
                )}
              >
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl shrink-0', config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {notification.actor && (
                      <img
                        src={getAvatarUrl(notification.actor)}
                        alt=""
                        className="h-5 w-5 rounded-full"
                      />
                    )}
                    <p className="text-sm text-white/70">
                      {notification.type === 'like' && 'Someone liked your post'}
                      {notification.type === 'comment' && 'Someone commented on your post'}
                      {notification.type === 'reply' && 'Someone replied to your comment'}
                      {notification.type === 'follow' && 'Someone followed you'}
                      {notification.type === 'mention' && 'Someone mentioned you'}
                      {notification.type === 'stock_activity' && 'Activity in a stock you follow'}
                    </p>
                  </div>
                  <p className="text-xs text-white/30 mt-1">{formatDate(notification.created_at)}</p>
                </div>
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
