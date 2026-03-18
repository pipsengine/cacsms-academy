import { NextResponse } from 'next/server';
import { getMarketDataService } from '@/lib/market/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = searchParams.get('pair');
  const timeframe = searchParams.get('timeframe') || 'M1';

  if (!pair) {
    return NextResponse.json({ error: 'pair is required' }, { status: 400 });
  }

  const service = getMarketDataService();
  const candles = await service.getChartSeries(pair, timeframe, 60);

  return NextResponse.json(
    {
      provider: service.providerName,
      candles,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
