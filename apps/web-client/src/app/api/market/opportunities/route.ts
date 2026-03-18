import { NextResponse } from 'next/server';
import { getLiveRankedOpportunities } from '@/lib/intelligence/live';

export async function GET() {
  const payload = await getLiveRankedOpportunities();
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}
