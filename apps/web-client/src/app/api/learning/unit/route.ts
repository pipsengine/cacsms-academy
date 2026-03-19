import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { generateForexCourseUnit } from '@/lib/ai/forexCourseUnit';

type LearningUnitRequest = {
  topic_title?: string;
  week_number?: number;
  day_of_week?: string;
  topic_type?: string;
};

function fromSearchParams(url: URL): LearningUnitRequest {
  const weekRaw = Number(url.searchParams.get('week_number') ?? 1);
  return {
    topic_title: url.searchParams.get('topic_title') ?? 'Market Structure Basics',
    week_number: Number.isFinite(weekRaw) ? weekRaw : 1,
    day_of_week: url.searchParams.get('day_of_week') ?? 'Monday',
    topic_type: url.searchParams.get('topic_type') ?? 'lesson',
  };
}

function normalizePayload(input: LearningUnitRequest): Required<LearningUnitRequest> {
  return {
    topic_title: (input.topic_title ?? 'Market Structure Basics').trim() || 'Market Structure Basics',
    week_number: Number.isFinite(input.week_number)
      ? Math.min(52, Math.max(1, Math.round(input.week_number as number)))
      : 1,
    day_of_week: (input.day_of_week ?? 'Monday').trim() || 'Monday',
    topic_type: input.topic_type === 'assignment' ? 'assignment' : 'lesson',
  };
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit({ key: `learning-unit:${ip}`, limit: 20, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } }
      );
    }

    const params = fromSearchParams(new URL(request.url));
    const payload = normalizePayload(params);
    const result = await generateForexCourseUnit(payload);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Learning unit GET failed', error);
    return NextResponse.json({ error: 'Failed to generate learning unit' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit({ key: `learning-unit:${ip}`, limit: 20, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } }
      );
    }

    const body = (await request.json().catch(() => ({}))) as LearningUnitRequest;
    const payload = normalizePayload(body);
    const result = await generateForexCourseUnit(payload);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Learning unit POST failed', error);
    return NextResponse.json({ error: 'Failed to generate learning unit' }, { status: 500 });
  }
}
