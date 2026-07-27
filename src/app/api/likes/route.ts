import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId, commentId, action } = await request.json();
  const userId = session.user.id;

  if (action === 'like') {
    try {
      await prisma.like.create({
        data: {
          userId,
          postId: postId ?? null,
          commentId: commentId ?? null,
        },
      });
      if (postId) {
        await prisma.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        });
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
        return NextResponse.json({ alreadyLiked: true });
      }
      throw err;
    }
  } else {
    await prisma.like.deleteMany({
      where: {
        userId,
        ...(postId ? { postId } : {}),
        ...(commentId ? { commentId } : {}),
      },
    });
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
    }
  }

  return NextResponse.json({ success: true });
}
