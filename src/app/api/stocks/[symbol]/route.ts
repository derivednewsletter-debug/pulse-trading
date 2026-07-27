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

  if (!stock) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  return NextResponse.json(stock);
}
