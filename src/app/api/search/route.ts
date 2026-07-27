import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const type = searchParams.get('type') ?? 'all';

  if (!query) {
    return NextResponse.json({ stocks: [], users: [], posts: [] });
  }

  const results: Record<string, any[]> = { stocks: [], users: [], posts: [] };

  try {
    if (type === 'all' || type === 'stocks') {
      results.stocks = await prisma.stock.findMany({
        where: {
          OR: [
            { symbol: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      });
    }

    if (type === 'all' || type === 'users') {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, username: true, displayName: true, image: true },
        take: 5,
      });
    }

    if (type === 'all' || type === 'posts') {
      results.posts = await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          user: { select: { id: true, username: true, displayName: true, image: true } },
        },
        take: 5,
      });
    }
  } catch {}

  return NextResponse.json(results);
}
