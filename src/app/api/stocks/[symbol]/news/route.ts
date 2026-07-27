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

  if (!stock) return NextResponse.json([]);

  const news = await prisma.news.findMany({
    where: { stockId: stock.id },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  return NextResponse.json(news);
}
