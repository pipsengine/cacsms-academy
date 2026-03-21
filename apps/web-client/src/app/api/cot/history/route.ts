import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { CotHistoryRange, getCotHistory } from '@/lib/cot/storage';
import { ALL_ASSETS, CotAsset } from '@/lib/cot/types';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `cot-history:${ip}`, limit: 30, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const assetParam = searchParams.get('asset')?.toUpperCase().trim();
    const rangeParam = (searchParams.get('range') ?? 'all').toLowerCase();
    const allowedRanges: CotHistoryRange[] = ['6m', '1y', 'all'];

    if (!assetParam || !(ALL_ASSETS as string[]).includes(assetParam)) {
      return NextResponse.json(
        { error: `Invalid or missing asset. Valid: ${ALL_ASSETS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!(allowedRanges as string[]).includes(rangeParam)) {
      return NextResponse.json(
        { error: 'Invalid range. Valid: 6m, 1y, all' },
        { status: 400 }
      );
    }

    const range = rangeParam as CotHistoryRange;
    const records = await getCotHistory(assetParam as CotAsset, range);
    return NextResponse.json({ asset: assetParam, range, records }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('COT history GET failed', error);
    return NextResponse.json({ error: 'Failed to load COT history' }, { status: 500 });
  }
}
