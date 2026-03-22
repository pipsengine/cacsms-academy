import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getHistoryForCurrency, getInterestRateSnapshot } from '@/lib/interest-rates/store';
import { G8_CURRENCIES, type G8Currency, type HistoryRange } from '@/lib/interest-rates/types';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit({ key: `interest-rates-history:${ip}`, limit: 30, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get('currency') ?? '').toUpperCase().trim();
    const range = (searchParams.get('range') ?? 'all').toLowerCase();
    const allowedRanges: HistoryRange[] = ['6m', '1y', 'all'];

    if (!(G8_CURRENCIES as readonly string[]).includes(currency)) {
      return NextResponse.json(
        { error: `Invalid or missing currency. Valid: ${G8_CURRENCIES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!(allowedRanges as readonly string[]).includes(range)) {
      return NextResponse.json({ error: 'Invalid range. Valid: 6m, 1y, all' }, { status: 400 });
    }

    const snapshot = await getInterestRateSnapshot();
    const records = getHistoryForCurrency(snapshot, currency as G8Currency, range as HistoryRange);

    return NextResponse.json(
      {
        currency,
        range,
        records,
        fetchedAt: snapshot.fetchedAt,
        source: snapshot.source,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Interest rates history GET failed', error);
    return NextResponse.json({ error: 'Failed to load interest-rate history' }, { status: 500 });
  }
}
