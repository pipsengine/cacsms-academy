import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getCotLatest } from '@/lib/cot/storage';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `cot-latest:${ip}`, limit: 60, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const records = await getCotLatest();
    return NextResponse.json({ records }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('COT latest GET failed', error);
    return NextResponse.json({ error: 'Failed to load latest COT data' }, { status: 500 });
  }
}
