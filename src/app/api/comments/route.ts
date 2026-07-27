import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: { id: true, username: true, displayName: true, image: true },
      },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { post_id, content, parent_id } = body;

  if (!post_id || !content) {
    return NextResponse.json({ error: 'post_id and content are required' }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId: post_id,
      userId: session.user.id,
      content,
      parentId: parent_id,
    },
    include: {
      user: {
        select: { id: true, username: true, displayName: true, image: true },
      },
    },
  });

  // Increment comment count
  await prisma.post.update({
    where: { id: post_id },
    data: { commentCount: { increment: 1 } },
  });

  return NextResponse.json({ comment });
}
