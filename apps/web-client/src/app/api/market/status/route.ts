import { NextResponse } from 'next/server';
import { getMarketDataService } from '@/lib/market/service';

export async function GET() {
  const service = getMarketDataService();
  await service.getSnapshot();

  return NextResponse.json(service.getStatus(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
