import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId, action } = await request.json();

  if (action === 'bookmark') {
    await prisma.bookmark.create({
      data: { userId: session.user.id, postId },
    });
    await prisma.post.update({
      where: { id: postId },
      data: { bookmarkCount: { increment: 1 } },
    });
  } else {
    await prisma.bookmark.deleteMany({
      where: { userId: session.user.id, postId },
    });
    await prisma.post.update({
      where: { id: postId },
      data: { bookmarkCount: { decrement: 1 } },
    });
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      post: {
        include: {
          user: {
            select: { id: true, username: true, displayName: true, image: true },
          },
        },
      },
    },
  });

  return NextResponse.json(bookmarks);
}
