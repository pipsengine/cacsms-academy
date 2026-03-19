import { NextResponse } from 'next/server';
import { getAIDecisionSignals } from '@/lib/intelligence/decisions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const thresholdRaw = Number(searchParams.get('minConfidence') ?? 95);
  const minimumConfidence = Number.isFinite(thresholdRaw)
    ? Math.min(99, Math.max(80, Math.round(thresholdRaw)))
    : 95;

  const payload = await getAIDecisionSignals(minimumConfidence);
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}
