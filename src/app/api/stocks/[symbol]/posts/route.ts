import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const stock = await prisma.stock.findUnique({
    where: { symbol: symbol.toUpperCase() },
  });

  if (!stock) return NextResponse.json({ posts: [], count: 0 });

  const posts = await prisma.post.findMany({
    where: { stockId: stock.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      user: {
        select: { id: true, username: true, displayName: true, image: true },
      },
    },
  });

  return NextResponse.json({ posts, count: posts.length });
}
