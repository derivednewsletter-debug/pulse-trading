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

  if (!stock) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const summary = await prisma.aISummary.findFirst({
    where: { stockId: stock.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(summary ?? null);
}
