import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '0');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const skip = page * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, image: true },
        },
      },
    }),
    prisma.post.count(),
  ]);

  return NextResponse.json({
    posts,
    nextPage: skip + limit < total ? page + 1 : null,
    count: total,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { content, type, stock_id, title, is_markdown } = body;

  if (!content || !type) {
    return NextResponse.json({ error: 'Content and type are required' }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      content,
      type,
      stockId: stock_id,
      title,
      isMarkdown: is_markdown ?? true,
    },
    include: {
      user: {
        select: { id: true, username: true, displayName: true, image: true },
      },
    },
  });

  return NextResponse.json({ post });
}
