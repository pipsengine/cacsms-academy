import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getLiveRankedOpportunities } from '@/lib/intelligence/live';
import { getMarketDataService } from '@/lib/market/service';
import { generateWeeklyAnalysis } from '@/lib/ai/weeklyAnalysis';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `weekly-analysis:${ip}`, limit: 20, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedPair = searchParams.get('pair')?.replace(/[^A-Za-z]/g, '').toUpperCase() ?? '';
    const live = await getLiveRankedOpportunities();
    const selectedOpportunity = requestedPair
      ? live.opportunities.find((item) => item.pair.toUpperCase() === requestedPair)
      : live.opportunities[0];
    const pair = selectedOpportunity?.pair ?? requestedPair;

    if (!pair) {
      return NextResponse.json({ error: 'No pair available for weekly analysis' }, { status: 400 });
    }

    const service = getMarketDataService();
    const [h4Candles, h1Candles] = await Promise.all([
      service.getChartSeries(pair, 'H4', 60),
      service.getChartSeries(pair, 'H1', 60),
    ]);

    const payload = await generateWeeklyAnalysis({
      pair,
      provider: service.providerName,
      h4Candles,
      h1Candles,
      opportunity: selectedOpportunity ?? null,
    });

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Weekly analysis GET failed', error);
    return NextResponse.json({ error: 'Failed to generate weekly analysis' }, { status: 500 });
  }
}