import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { reputationScore: 'desc' },
    take: 10,
    select: {
      id: true,
      username: true,
      displayName: true,
      image: true,
      reputationScore: true,
    },
  });

  return NextResponse.json(users);
}
