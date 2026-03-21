import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getCotAssets } from '@/lib/cot/storage';
import { ALL_ASSETS } from '@/lib/cot/types';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `cot-assets:${ip}`, limit: 60, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    // Return stored assets; fall back to the full supported list if DB is empty
    const storedAssets = await getCotAssets();
    const assets = storedAssets.length > 0 ? storedAssets : ALL_ASSETS;
    return NextResponse.json({ assets });
  } catch (error) {
    console.error('COT assets GET failed', error);
    return NextResponse.json({ error: 'Failed to load COT assets' }, { status: 500 });
  }
}
