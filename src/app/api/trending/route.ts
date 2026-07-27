import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const where = category ? { category: category as any } : {};

  const trending = await prisma.trending.findMany({
    where,
    orderBy: { rank: 'asc' },
    take: 10,
    include: { stock: true },
  });

  return NextResponse.json(trending);
}
