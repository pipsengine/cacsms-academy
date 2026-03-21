import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getCotHistory } from '@/lib/cot/storage';
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

    if (!assetParam || !(ALL_ASSETS as string[]).includes(assetParam)) {
      return NextResponse.json(
        { error: `Invalid or missing asset. Valid: ${ALL_ASSETS.join(', ')}` },
        { status: 400 }
      );
    }

    const records = await getCotHistory(assetParam as CotAsset);
    return NextResponse.json({ asset: assetParam, records }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('COT history GET failed', error);
    return NextResponse.json({ error: 'Failed to load COT history' }, { status: 500 });
  }
}
