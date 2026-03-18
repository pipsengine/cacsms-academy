import { NextResponse } from 'next/server';
import { getLiquidityOverview } from '@/lib/market/liquidity';

export async function GET() {
  const overview = await getLiquidityOverview();

  return NextResponse.json(overview, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
