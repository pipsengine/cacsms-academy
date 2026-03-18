import { NextResponse } from 'next/server';
import { getPricingMatrix } from '@/lib/pricing/store';

export async function GET() {
  const { pricingMatrix, exchangeRate } = await getPricingMatrix();
  return NextResponse.json(
    { pricingMatrix, exchangeRate },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
