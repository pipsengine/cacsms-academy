import { NextResponse } from 'next/server';
import { getInterestRateStatus } from '@/lib/interest-rates/store';

export async function GET() {
  try {
    const status = await getInterestRateStatus();
    return NextResponse.json(status, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Interest-rate status GET failed', error);
    return NextResponse.json({ error: 'Failed to load interest-rate status' }, { status: 500 });
  }
}
