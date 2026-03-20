import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { TradeDirection, TradeSignalStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { createTradeSignal, listRecentSignals, markTradeSignalStatus } from '@/lib/db/trading';

function parseDirection(input: unknown): TradeDirection | null {
  if (input === 'LONG' || input === 'SHORT') return input;
  return null;
}

function parseStatus(input: unknown): TradeSignalStatus | null {
  if (input === 'OPEN' || input === 'TRIGGERED' || input === 'INVALIDATED' || input === 'EXPIRED') return input;
  return null;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const assetSymbol = searchParams.get('assetSymbol') || undefined;
  const timeframe = searchParams.get('timeframe') || undefined;
  const limit = Number(searchParams.get('limit') || 50);

  const signals = await listRecentSignals({
    assetSymbol: assetSymbol?.toUpperCase(),
    timeframe,
    limit,
  });

  return NextResponse.json({ signals }, { headers: { 'Cache-Control': 'no-store' } });
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
  const confidence = Number(body.confidence);
  const source = String(body.source || 'manual').trim();

  if (!assetSymbol || !timeframe || !direction || !Number.isFinite(confidence)) {
    return NextResponse.json({ error: 'assetSymbol, timeframe, direction, confidence are required' }, { status: 400 });
  }

  const signal = await createTradeSignal({
    userId,
    assetSymbol,
    timeframe,
    direction,
    confidence,
    source,
    entryPrice: Number.isFinite(Number(body.entryPrice)) ? Number(body.entryPrice) : undefined,
    stopLoss: Number.isFinite(Number(body.stopLoss)) ? Number(body.stopLoss) : undefined,
    takeProfit: Number.isFinite(Number(body.takeProfit)) ? Number(body.takeProfit) : undefined,
    rationale: body.rationale ?? undefined,
  });

  return NextResponse.json({ success: true, signal });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const signalId = String(body.signalId || '').trim();
  const status = parseStatus(body.status);
  if (!signalId || !status) {
    return NextResponse.json({ error: 'signalId and valid status are required' }, { status: 400 });
  }

  const signal = await markTradeSignalStatus(signalId, status);
  return NextResponse.json({ success: true, signal });
}
