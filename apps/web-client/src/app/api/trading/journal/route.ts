import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { createJournalEntry } from '@/lib/db/trading';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const take = Math.max(1, Math.min(Number(searchParams.get('limit') || 50), 200));

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    include: { tradeExecution: { include: { asset: true } } },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return NextResponse.json({ entries }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const title = String(body.title || '').trim();
  const notes = String(body.notes || '').trim();
  const emotions = body.emotions ? String(body.emotions).trim() : undefined;
  const rating = Number(body.rating);
  const tradeExecutionId = body.tradeExecutionId ? String(body.tradeExecutionId).trim() : undefined;

  if (!title || !notes) {
    return NextResponse.json({ error: 'title and notes are required' }, { status: 400 });
  }

  if (tradeExecutionId) {
    const execution = await prisma.tradeExecution.findUnique({ where: { id: tradeExecutionId }, select: { userId: true } });
    if (!execution || execution.userId !== userId) {
      return NextResponse.json({ error: 'Invalid tradeExecutionId' }, { status: 400 });
    }
  }

  const entry = await createJournalEntry({
    userId,
    title,
    notes,
    emotions,
    rating: Number.isFinite(rating) ? Math.max(1, Math.min(10, Math.round(rating))) : undefined,
    tags: Array.isArray(body.tags) ? body.tags : undefined,
    tradeExecutionId,
  });

  return NextResponse.json({ success: true, entry });
}
