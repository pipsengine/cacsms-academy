import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { computeCurrencyAnalytics, getInterestRateSnapshot, getLatestByCurrency } from '@/lib/interest-rates/store';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit({ key: `interest-rates-latest:${ip}`, limit: 60, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } }
      );
    }

    const snapshot = await getInterestRateSnapshot();
    const records = getLatestByCurrency(snapshot);
    const analytics = computeCurrencyAnalytics(snapshot);

    return NextResponse.json(
      {
        records,
        analytics,
        fetchedAt: snapshot.fetchedAt,
        source: snapshot.source,
        stale: snapshot.stale,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Interest rates latest GET failed', error);
    return NextResponse.json({ error: 'Failed to load latest interest-rate data' }, { status: 500 });
  }
}
