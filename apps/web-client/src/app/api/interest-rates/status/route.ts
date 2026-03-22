import { NextResponse } from 'next/server';
import { getInterestRateStatus } from '@/lib/interest-rates/store';
import { getPendingReleases } from '@/lib/interest-rates/interestRateScheduler';

export async function GET() {
  try {
    const [status, pendingReleases] = await Promise.all([
      getInterestRateStatus(),
      Promise.resolve(getPendingReleases()),
    ]);
    return NextResponse.json({ ...status, pendingReleases }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Interest-rate status GET failed', error);
    return NextResponse.json({ error: 'Failed to load interest-rate status' }, { status: 500 });
  }
}
