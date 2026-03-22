import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { computeDifferentialMatrix, getInterestRateSnapshot } from '@/lib/interest-rates/store';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit({ key: `interest-rates-diff:${ip}`, limit: 30, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } }
      );
    }

    const snapshot = await getInterestRateSnapshot();
    const matrix = computeDifferentialMatrix(snapshot);

    return NextResponse.json(
      {
        matrix,
        fetchedAt: snapshot.fetchedAt,
        source: snapshot.source,
        stale: snapshot.stale,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Interest-rate differential GET failed', error);
    return NextResponse.json({ error: 'Failed to compute differential matrix' }, { status: 500 });
  }
}
