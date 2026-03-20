import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { TradeDirection } from '@prisma/client';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { closePosition, listOpenPositions, openPosition } from '@/lib/db/trading';

function parseDirection(input: unknown): TradeDirection | null {
  if (input === 'LONG' || input === 'SHORT') return input;
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const positions = await listOpenPositions(userId);
  return NextResponse.json({ positions }, { headers: { 'Cache-Control': 'no-store' } });
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
  const averageEntry = Number(body.averageEntry);

  if (!assetSymbol || !direction || !Number.isFinite(quantity) || !Number.isFinite(averageEntry)) {
    return NextResponse.json({ error: 'assetSymbol, direction, quantity, averageEntry are required' }, { status: 400 });
  }

  const position = await openPosition({
    userId,
    assetSymbol,
    direction,
    quantity,
    averageEntry,
    stopLoss: Number.isFinite(Number(body.stopLoss)) ? Number(body.stopLoss) : undefined,
    takeProfit: Number.isFinite(Number(body.takeProfit)) ? Number(body.takeProfit) : undefined,
  });

  return NextResponse.json({ success: true, position });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const positionId = String(body.positionId || '').trim();
  const closePrice = Number(body.closePrice);
  if (!positionId || !Number.isFinite(closePrice)) {
    return NextResponse.json({ error: 'positionId and closePrice are required' }, { status: 400 });
  }

  const existing = await prisma.position.findUnique({ where: { id: positionId }, select: { userId: true } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const position = await closePosition({ positionId, closePrice });
  return NextResponse.json({ success: true, position });
}
