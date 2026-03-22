import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { computeCurrencyAnalytics, getLatestByCurrency, upsertManualInterestRateDecision } from '@/lib/interest-rates/store';
import { G8_CURRENCIES, type G8Currency } from '@/lib/interest-rates/types';

function isAdmin(role: string | undefined) {
  return role === 'Super Admin' || role === 'Administrator';
}

function toIsoDecisionTimestamp(date: string, time?: string | null, decisionTimestamp?: string | null): string | null {
  if (typeof decisionTimestamp === 'string' && decisionTimestamp.trim()) {
    const parsed = new Date(decisionTimestamp);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const normalizedTime = typeof time === 'string' && time.trim() ? time.trim() : '10:00:00';
  const parsed = new Date(`${date}T${normalizedTime}.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!isAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: role ? 403 : 401 });
  }

  try {
    const body = await request.json();
    const currency = String(body?.currency ?? '').toUpperCase().trim();
    const date = String(body?.date ?? '').trim();
    const rate = Number(body?.rate);
    const previousRate = body?.previousRate === null || body?.previousRate === undefined || body?.previousRate === ''
      ? undefined
      : Number(body.previousRate);
    const forecastRate = body?.forecastRate === null || body?.forecastRate === undefined || body?.forecastRate === ''
      ? null
      : Number(body.forecastRate);
    const decisionTimestamp = toIsoDecisionTimestamp(date, body?.time, body?.decisionTimestamp);

    if (!(G8_CURRENCIES as readonly string[]).includes(currency)) {
      return NextResponse.json({ error: `Invalid currency. Valid: ${G8_CURRENCIES.join(', ')}` }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date. Expected YYYY-MM-DD.' }, { status: 400 });
    }

    if (!Number.isFinite(rate)) {
      return NextResponse.json({ error: 'Invalid rate.' }, { status: 400 });
    }

    if (previousRate !== undefined && !Number.isFinite(previousRate)) {
      return NextResponse.json({ error: 'Invalid previousRate.' }, { status: 400 });
    }

    if (forecastRate !== null && !Number.isFinite(forecastRate)) {
      return NextResponse.json({ error: 'Invalid forecastRate.' }, { status: 400 });
    }

    if (!decisionTimestamp) {
      return NextResponse.json({ error: 'Invalid decision timestamp/time.' }, { status: 400 });
    }

    const snapshot = await upsertManualInterestRateDecision({
      currency: currency as G8Currency,
      date,
      decisionTimestamp,
      rate,
      previousRate,
      forecastRate,
    });

    return NextResponse.json({
      success: true,
      record: getLatestByCurrency(snapshot).find((row) => row.currency === currency) ?? null,
      records: getLatestByCurrency(snapshot),
      analytics: computeCurrencyAnalytics(snapshot),
      fetchedAt: snapshot.fetchedAt,
      source: snapshot.source,
      stale: snapshot.stale,
    });
  } catch (error) {
    console.error('Interest-rate decision POST failed', error);
    return NextResponse.json({ error: 'Failed to ingest interest-rate decision' }, { status: 500 });
  }
}