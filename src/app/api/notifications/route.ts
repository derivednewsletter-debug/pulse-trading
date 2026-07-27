import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  if (unreadOnly) {
    const count = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });
    return NextResponse.json({ count });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      actor: {
        select: { id: true, username: true, displayName: true, image: true },
      },
    },
  });

  return NextResponse.json(notifications);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ids, read } = await request.json();

  await prisma.notification.updateMany({
    where: { id: { in: ids }, userId: session.user.id },
    data: { read },
  });

  return NextResponse.json({ success: true });
}
