import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { upsertMarketCandle } from '@/lib/db/trading';

function isAdminRole(role: string | undefined) {
  return role === 'Super Admin' || role === 'Administrator';
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const assetSymbol = String(searchParams.get('assetSymbol') || '').trim().toUpperCase();
  const timeframe = String(searchParams.get('timeframe') || '').trim();
  const limit = Math.max(1, Math.min(Number(searchParams.get('limit') || 200), 1000));

  if (!assetSymbol || !timeframe) {
    return NextResponse.json({ error: 'assetSymbol and timeframe are required' }, { status: 400 });
  }

  const candles = await prisma.marketCandle.findMany({
    where: {
      timeframe,
      asset: { symbol: assetSymbol },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return NextResponse.json({ candles }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!isAdminRole(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: role ? 403 : 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const assetSymbol = String(body.assetSymbol || '').trim().toUpperCase();
  const timeframe = String(body.timeframe || '').trim();
  const timestamp = new Date(body.timestamp);
  const open = Number(body.open);
  const high = Number(body.high);
  const low = Number(body.low);
  const close = Number(body.close);
  const volume = Number(body.volume);

  if (!assetSymbol || !timeframe || Number.isNaN(timestamp.getTime()) || !Number.isFinite(open) || !Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(close)) {
    return NextResponse.json({ error: 'Invalid candle payload' }, { status: 400 });
  }

  const candle = await upsertMarketCandle({
    assetSymbol,
    timeframe,
    timestamp,
    open,
    high,
    low,
    close,
    volume: Number.isFinite(volume) ? volume : undefined,
  });

  return NextResponse.json({ success: true, candle });
}
