import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withSecurity } from '@/lib/security';

async function getHandler(
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ following: false });
  }

  const params = await context?.params;
  const followingId = params?.id;
  if (!followingId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  const follow = await prisma.follower.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId,
      },
    },
  });

  return NextResponse.json({ following: !!follow });
}

async function postHandler(
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context?.params;
  const followingId = params?.id;
  if (!followingId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  const { action } = await request.json();

  if (action === 'follow') {
    await prisma.follower.create({
      data: {
        followerId: session.user.id,
        followingId,
      },
    });
  } else if (action === 'unfollow') {
    await prisma.follower.deleteMany({
      where: {
        followerId: session.user.id,
        followingId,
      },
    });
  } else {
    return NextResponse.json({ error: 'Invalid action. Use "follow" or "unfollow".' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export const GET = withSecurity(getHandler, { csrf: false, requireAuth: false });
export const POST = withSecurity(postHandler, { csrf: true, requireAuth: true });
