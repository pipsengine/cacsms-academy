import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { TradeDirection } from '@prisma/client';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { closeTradeExecution, createTradeExecution } from '@/lib/db/trading';

function parseDirection(input: unknown): TradeDirection | null {
  if (input === 'LONG' || input === 'SHORT') return input;
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const executions = await prisma.tradeExecution.findMany({
    where: { userId },
    include: { asset: true, signal: true, plan: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ executions }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const assetSymbol = String(body.assetSymbol || '').trim().toUpperCase();
  const direction = parseDirection(body.direction);
  const quantity = Number(body.quantity);

  if (!assetSymbol || !direction || !Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: 'assetSymbol, direction and positive quantity are required' }, { status: 400 });
  }

  const execution = await createTradeExecution({
    userId,
    assetSymbol,
    direction,
    quantity,
    openPrice: Number.isFinite(Number(body.openPrice)) ? Number(body.openPrice) : undefined,
    stopLoss: Number.isFinite(Number(body.stopLoss)) ? Number(body.stopLoss) : undefined,
    takeProfit: Number.isFinite(Number(body.takeProfit)) ? Number(body.takeProfit) : undefined,
    signalId: body.signalId ? String(body.signalId) : undefined,
    planId: body.planId ? String(body.planId) : undefined,
    metadata: body.metadata ?? undefined,
  });

  return NextResponse.json({ success: true, execution });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const executionId = String(body.executionId || '').trim();
  const closePrice = Number(body.closePrice);
  const fees = Number(body.fees);

  if (!executionId || !Number.isFinite(closePrice)) {
    return NextResponse.json({ error: 'executionId and closePrice are required' }, { status: 400 });
  }

  const existing = await prisma.tradeExecution.findUnique({ where: { id: executionId }, select: { userId: true } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const execution = await closeTradeExecution({
    executionId,
    closePrice,
    fees: Number.isFinite(fees) ? fees : undefined,
  });

  return NextResponse.json({ success: true, execution });
}
