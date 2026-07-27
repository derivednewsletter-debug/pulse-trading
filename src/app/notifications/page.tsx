'use client';

export const dynamic = 'force-dynamic';

import { NotificationList } from '@/components/notifications/notification-list';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
          <Bell className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-white/40">Stay updated with your activity</p>
        </div>
      </div>

      <NotificationList />
    </div>
  );
}
