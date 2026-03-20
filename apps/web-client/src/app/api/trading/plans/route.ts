import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { TradeDirection, TradePlanStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { createTradePlan, updateTradePlanStatus } from '@/lib/db/trading';

function parseDirection(input: unknown): TradeDirection | null {
  if (input === 'LONG' || input === 'SHORT') return input;
  return null;
}

function parseStatus(input: unknown): TradePlanStatus | null {
  if (input === 'DRAFT' || input === 'ACTIVE' || input === 'CANCELLED' || input === 'EXECUTED') return input;
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plans = await prisma.tradePlan.findMany({
    where: { userId },
    include: { asset: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ plans }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const assetSymbol = String(body.assetSymbol || '').trim().toUpperCase();
  const timeframe = String(body.timeframe || '').trim();
  const direction = parseDirection(body.direction);
  const riskPercent = Number(body.riskPercent);
  const entryPrice = Number(body.entryPrice);
  const stopLoss = Number(body.stopLoss);
  const takeProfit = Number(body.takeProfit);
  const notes = body.notes ? String(body.notes) : undefined;

  if (!assetSymbol || !timeframe || !direction || !Number.isFinite(riskPercent) || !Number.isFinite(entryPrice) || !Number.isFinite(stopLoss) || !Number.isFinite(takeProfit)) {
    return NextResponse.json({ error: 'Invalid payload for trade plan' }, { status: 400 });
  }

  const plan = await createTradePlan({
    userId,
    assetSymbol,
    timeframe,
    direction,
    riskPercent,
    entryPrice,
    stopLoss,
    takeProfit,
    notes,
  });

  return NextResponse.json({ success: true, plan });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const planId = String(body.planId || '').trim();
  const status = parseStatus(body.status);
  if (!planId || !status) {
    return NextResponse.json({ error: 'planId and valid status are required' }, { status: 400 });
  }

  const existing = await prisma.tradePlan.findUnique({ where: { id: planId }, select: { userId: true } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const plan = await updateTradePlanStatus(planId, status);
  return NextResponse.json({ success: true, plan });
}
