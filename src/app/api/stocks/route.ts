import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const stocks = await prisma.stock.findMany({
    orderBy: { changePercent24h: 'desc' },
    take: 6,
  });

  return NextResponse.json(stocks);
}
