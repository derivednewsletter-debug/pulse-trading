import { generateStockSummary } from '@/lib/ai/provider';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withSecurity } from '@/lib/security';

async function handler(request: NextRequest) {
  const { stockId } = await request.json();

  if (!stockId) {
    return NextResponse.json({ error: 'stockId is required' }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get stock info
  const stock = await prisma.stock.findUnique({
    where: { id: stockId },
  });

  if (!stock) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  // Get recent posts
  const posts = await prisma.post.findMany({
    where: { stockId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { content: true },
  });

  // Get recent news
  const news = await prisma.news.findMany({
    where: { stockId },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    select: { title: true, summary: true },
  });

  // Get previous summary for context
  const previousSummary = await prisma.aISummary.findFirst({
    where: { stockId },
    orderBy: { createdAt: 'desc' },
    select: { summary: true },
  });

  // Generate AI summary
  const summary = await generateStockSummary({
    stockSymbol: stock.symbol,
    stockName: stock.name,
    posts: posts.map((p: typeof posts[number]) => p.content),
    news: news.map((n: typeof news[number]) => n.summary || n.title),
    previousSummary: previousSummary?.summary ?? undefined,
  });

  // Save to database
  await prisma.aISummary.create({
    data: {
      stockId,
      title: `AI Summary for ${stock.symbol}`,
      summary: summary.summary,
      sentiment: summary.sentiment as any,
      bullishScore: summary.bullishScore,
      bearishScore: summary.bearishScore,
      keyPoints: summary.keyPoints ?? [],
    },
  });

  return NextResponse.json(summary);
}

export const POST = withSecurity(handler, { csrf: true, requireAuth: true });
