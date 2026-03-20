import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AssetClass } from '@prisma/client';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { ensureAsset } from '@/lib/db/trading';

function isAdminRole(role: string | undefined) {
  return role === 'Super Admin' || role === 'Administrator';
}

function parseAssetClass(input: unknown): AssetClass | null {
  if (input === 'FOREX' || input === 'CRYPTO' || input === 'COMMODITY' || input === 'INDEX' || input === 'EQUITY') {
    return input;
  }
  return null;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get('includeInactive') === 'true';

  const assets = await prisma.asset.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: [{ assetClass: 'asc' }, { symbol: 'asc' }],
  });

  return NextResponse.json({ assets }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!isAdminRole(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: role ? 403 : 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const symbol = String(body.symbol || '').trim().toUpperCase();
  const name = String(body.name || '').trim();
  const assetClass = parseAssetClass(body.assetClass);
  const baseCurrency = body.baseCurrency ? String(body.baseCurrency).trim().toUpperCase() : undefined;
  const quoteCurrency = body.quoteCurrency ? String(body.quoteCurrency).trim().toUpperCase() : undefined;

  if (!symbol || !name || !assetClass) {
    return NextResponse.json({ error: 'symbol, name and assetClass are required' }, { status: 400 });
  }

  const asset = await ensureAsset({
    symbol,
    name,
    assetClass,
    baseCurrency,
    quoteCurrency,
  });

  return NextResponse.json({ success: true, asset });
}
