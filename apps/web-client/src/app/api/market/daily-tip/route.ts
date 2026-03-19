import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getMarketDataService } from '@/lib/market/service';
import { generateDailyTradingTip } from '@/lib/ai/dailyTradingTip';
import type { MarketSnapshot } from '@/lib/market/types';

type DailyTipRequestBody = {
  marketSnapshot?: Partial<MarketSnapshot>;
  selectedPairs?: string[];
};

function parsePairsFromSearchParams(url: URL): string[] {
  const explicit = url.searchParams.getAll('pair');
  const csv = url.searchParams.get('pairs');

  const pairs = [
    ...explicit,
    ...(csv ? csv.split(',').map((value) => value.trim()).filter(Boolean) : []),
  ];

  return pairs.slice(0, 6);
}

async function buildMarketSnapshot(input?: Partial<MarketSnapshot>): Promise<Partial<MarketSnapshot>> {
  if (input && Object.keys(input).length > 0) return input;

  const service = getMarketDataService();
  const snapshot = await service.getSnapshot();

  return {
    provider: snapshot.provider,
    generatedAt: snapshot.generatedAt,
    channels: snapshot.channels.slice(0, 8),
    breakouts: snapshot.breakouts.slice(0, 8),
  };
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `daily-tip:${ip}`, limit: 20, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const url = new URL(request.url);
    const selectedPairs = parsePairsFromSearchParams(url);
    const marketSnapshot = await buildMarketSnapshot();
    const payload = await generateDailyTradingTip({ marketSnapshot, selectedPairs });

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Daily tip GET failed', error);
    return NextResponse.json({ error: 'Failed to generate daily tip' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `daily-tip:${ip}`, limit: 20, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const body = (await request.json().catch(() => ({}))) as DailyTipRequestBody;
    const selectedPairs = Array.isArray(body.selectedPairs) ? body.selectedPairs.slice(0, 6) : [];
    const marketSnapshot = await buildMarketSnapshot(body.marketSnapshot);
    const payload = await generateDailyTradingTip({ marketSnapshot, selectedPairs });

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Daily tip POST failed', error);
    return NextResponse.json({ error: 'Failed to generate daily tip' }, { status: 500 });
  }
}
