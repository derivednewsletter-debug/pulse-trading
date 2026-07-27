import { generateAIAssistantResponse } from '@/lib/ai/provider';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withSecurity } from '@/lib/security';

async function handler(request: NextRequest) {
  const { question, stockSymbol } = await request.json();

  if (!question || !stockSymbol) {
    return NextResponse.json(
      { error: 'question and stockSymbol are required' },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get stock info
  const stock = await prisma.stock.findUnique({
    where: { symbol: stockSymbol.toUpperCase() },
  });

  if (!stock) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  // Get recent posts
  const posts = await prisma.post.findMany({
    where: { stockId: stock.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: {
        select: { username: true, displayName: true },
      },
    },
  });

  // Get latest AI summary
  const aiSummary = await prisma.aISummary.findFirst({
    where: { stockId: stock.id },
    orderBy: { createdAt: 'desc' },
  });

  // Build context
  let context = `Stock: ${stock.symbol} (${stock.name})\n`;
  context += `Current Price: ${stock.price ?? 'N/A'}\n`;
  context += `24h Change: ${stock.changePercent24h != null ? Number(stock.changePercent24h).toFixed(2) + '%' : 'N/A'}\n\n`;

  if (aiSummary) {
    context += `AI Sentiment: ${aiSummary.sentiment}\n`;
    context += `Current Summary: ${aiSummary.summary}\n\n`;
  }

  if (posts.length > 0) {
    context += 'Recent Community Posts:\n';
    posts.slice(0, 5).forEach((post) => {
      context += `- ${post.user?.username}: ${post.content.slice(0, 200)}\n`;
    });
  }

  const content = await generateAIAssistantResponse(question, stockSymbol, context);

  return NextResponse.json({ content });
}

export const POST = withSecurity(handler, { csrf: true, requireAuth: true });
