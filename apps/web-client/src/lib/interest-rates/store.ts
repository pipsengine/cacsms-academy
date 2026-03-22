import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/security/rateLimit';
import { buildDefaultInterestRateSeries } from './defaults';
import {
  G8_CURRENCIES,
  type CurrencyRateAnalytics,
  type DifferentialEntry,
  type G8Currency,
  type HistoryRange,
  type InterestRateRecord,
  type InterestRateSnapshot,
  type PolicyCycle,
  type PolicyDirection,
} from './types';

const INTEREST_RATE_SERIES_KEY = 'interestRate:g8:series';
const INTEREST_RATE_SYNC_KEY = 'interestRate:g8:lastSyncIso';
const INTEREST_RATE_TTL_MS = 6 * 60 * 60 * 1000;

const FRED_SERIES_BY_CURRENCY: Record<G8Currency, string> = {
  AUD: 'IR3TIB01AUM156N',
  CAD: 'IR3TIB01CAM156N',
  CHF: 'IR3TIB01CHM156N',
  EUR: 'ECBDFR',
  GBP: 'IR3TIB01GBM156N',
  JPY: 'IR3TIB01JPM156N',
  NZD: 'IR3TIB01NZM156N',
  USD: 'FEDFUNDS',
};

function toDirection(changeBps: number): PolicyDirection {
  if (changeBps > 0) return 'Hiking';
  if (changeBps < 0) return 'Cutting';
  return 'Holding';
}

function uniqueByDate(rows: InterestRateRecord[]): InterestRateRecord[] {
  const map = new Map<string, InterestRateRecord>();
  for (const row of rows) map.set(row.date, row);
  return [...map.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function latestOf(series: Record<G8Currency, InterestRateRecord[]>, currency: G8Currency) {
  const rows = series[currency] ?? [];
  return rows.length ? rows[rows.length - 1] : null;
}

function isSnapshotStale(snapshot: InterestRateSnapshot): boolean {
  return Date.now() - new Date(snapshot.fetchedAt).getTime() > INTEREST_RATE_TTL_MS;
}

function normalizeSeries(input: unknown): Record<G8Currency, InterestRateRecord[]> {
  const defaults = buildDefaultInterestRateSeries();
  if (!input || typeof input !== 'object') return defaults;

  return Object.fromEntries(
    G8_CURRENCIES.map((currency) => {
      const value = (input as any)[currency];
      if (!Array.isArray(value)) return [currency, defaults[currency]];

      const rows = value
        .map((row: any): InterestRateRecord | null => {
          const rate = Number(row?.rate);
          const date = typeof row?.date === 'string' ? row.date : null;
          if (!date || !Number.isFinite(rate)) return null;

          const changeBps = Number.isFinite(Number(row?.changeBps)) ? Number(row.changeBps) : 0;
          return {
            currency,
            rate,
            date,
            decisionTimestamp: typeof row?.decisionTimestamp === 'string' ? row.decisionTimestamp : `${date}T10:00:00.000Z`,
            changeBps,
            policyDirection: (row?.policyDirection as PolicyDirection) ?? toDirection(changeBps),
            source: typeof row?.source === 'string' ? row.source : 'cache',
          };
        })
        .filter(Boolean) as InterestRateRecord[];

      return [currency, rows.length ? uniqueByDate(rows) : defaults[currency]];
    })
  ) as Record<G8Currency, InterestRateRecord[]>;
}

async function readSnapshot(): Promise<InterestRateSnapshot> {
  const defaults = buildDefaultInterestRateSeries();
  const record = await prisma.platformSetting.findUnique({ where: { key: INTEREST_RATE_SERIES_KEY } });

  if (!record?.value) {
    return {
      series: defaults,
      fetchedAt: new Date(0).toISOString(),
      source: 'baseline',
      stale: true,
    };
  }

  try {
    const parsed = JSON.parse(record.value);
    const series = normalizeSeries(parsed?.series ?? parsed);
    const fetchedAt = typeof parsed?.fetchedAt === 'string' ? parsed.fetchedAt : new Date(0).toISOString();
    const source = typeof parsed?.source === 'string' ? parsed.source : 'cache';

    return {
      series,
      fetchedAt,
      source,
      stale: isSnapshotStale({ series, fetchedAt, source, stale: false }),
    };
  } catch {
    return {
      series: defaults,
      fetchedAt: new Date(0).toISOString(),
      source: 'baseline',
      stale: true,
    };
  }
}

async function persistSnapshot(snapshot: InterestRateSnapshot) {
  const payload = JSON.stringify({
    series: snapshot.series,
    fetchedAt: snapshot.fetchedAt,
    source: snapshot.source,
  });

  await prisma.platformSetting.upsert({
    where: { key: INTEREST_RATE_SERIES_KEY },
    update: { value: payload },
    create: { key: INTEREST_RATE_SERIES_KEY, value: payload },
  });

  await prisma.platformSetting.upsert({
    where: { key: INTEREST_RATE_SYNC_KEY },
    update: { value: snapshot.fetchedAt },
    create: { key: INTEREST_RATE_SYNC_KEY, value: snapshot.fetchedAt },
  });
}

async function fetchFredSeries(currency: G8Currency): Promise<InterestRateRecord[] | null> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return null;

  const seriesId = FRED_SERIES_BY_CURRENCY[currency];
  const url = new URL('https://api.stlouisfed.org/fred/series/observations');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('sort_order', 'asc');
  url.searchParams.set('limit', '180');

  const response = await fetch(url.toString(), {
    method: 'GET',
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const observations: any[] = Array.isArray(payload?.observations) ? payload.observations : [];

  const rows: InterestRateRecord[] = [];
  let previousRate: number | null = null;

  for (const obs of observations) {
    const value = Number(obs?.value);
    if (!Number.isFinite(value)) continue;

    const date = String(obs?.date || '');
    if (!date) continue;

    const changeBps = previousRate === null ? 0 : Math.round((value - previousRate) * 100);
    rows.push({
      currency,
      rate: value,
      date,
      decisionTimestamp: `${date}T10:00:00.000Z`,
      changeBps,
      policyDirection: toDirection(changeBps),
      source: 'fred',
    });

    previousRate = value;
  }

  return rows.length ? rows : null;
}

async function fetchTradingEconomicsLatest(currency: G8Currency): Promise<number | null> {
  const key = process.env.TRADING_ECONOMICS_API_KEY;
  if (!key) return null;

  const countryByCurrency: Record<G8Currency, string> = {
    AUD: 'australia',
    CAD: 'canada',
    CHF: 'switzerland',
    EUR: 'euro-area',
    GBP: 'united-kingdom',
    JPY: 'japan',
    NZD: 'new-zealand',
    USD: 'united-states',
  };

  const endpoint = `https://api.tradingeconomics.com/historical/country/${countryByCurrency[currency]}/indicator/interest%20rate?c=${key}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : [];
  if (!rows.length) return null;

  const latest = rows
    .map((x: any) => Number(x?.Value))
    .filter((x: number) => Number.isFinite(x))
    .at(-1);

  return Number.isFinite(latest) ? Number(latest) : null;
}

async function refreshWithProviders(cached: InterestRateSnapshot): Promise<InterestRateSnapshot | null> {
  const base = normalizeSeries(cached.series);
  const nextSeries: Record<G8Currency, InterestRateRecord[]> = { ...base } as Record<G8Currency, InterestRateRecord[]>;
  let providerUsed = 'baseline';

  for (const currency of G8_CURRENCIES) {
    const fredRows = await fetchFredSeries(currency);
    if (fredRows?.length) {
      nextSeries[currency] = uniqueByDate(fredRows);
      providerUsed = 'fred';
      continue;
    }

    const teLatest = await fetchTradingEconomicsLatest(currency);
    if (teLatest === null) continue;

    const existing = base[currency] ?? [];
    const prev = existing.length ? existing[existing.length - 1] : null;
    const date = new Date().toISOString().slice(0, 10);
    const changeBps = prev ? Math.round((teLatest - prev.rate) * 100) : 0;

    const merged = uniqueByDate([
      ...existing,
      {
        currency,
        rate: teLatest,
        date,
        decisionTimestamp: new Date().toISOString(),
        changeBps,
        policyDirection: toDirection(changeBps),
        source: 'tradingeconomics',
      },
    ]);

    nextSeries[currency] = merged;
    providerUsed = providerUsed === 'fred' ? providerUsed : 'tradingeconomics';
  }

  return {
    series: nextSeries,
    fetchedAt: new Date().toISOString(),
    source: providerUsed,
    stale: false,
  };
}

export async function getInterestRateSnapshot(options?: { forceRefresh?: boolean }): Promise<InterestRateSnapshot> {
  const cached = await readSnapshot();

  if (!options?.forceRefresh && !cached.stale) {
    return cached;
  }

  const refreshed = await refreshWithProviders(cached);
  if (!refreshed) return cached;

  await persistSnapshot(refreshed);
  return refreshed;
}

export function getLatestByCurrency(snapshot: InterestRateSnapshot): InterestRateRecord[] {
  return G8_CURRENCIES
    .map((currency) => latestOf(snapshot.series, currency))
    .filter(Boolean)
    .map((row) => row as InterestRateRecord);
}

export function getHistoryForCurrency(
  snapshot: InterestRateSnapshot,
  currency: G8Currency,
  range: HistoryRange
): InterestRateRecord[] {
  const rows = [...(snapshot.series[currency] ?? [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (range === 'all') return rows;

  const months = range === '6m' ? 6 : 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return rows.filter((row) => new Date(row.date).getTime() >= cutoff.getTime());
}

function determineTrend(points: InterestRateRecord[]): 'Uptrend' | 'Downtrend' | 'Flat' {
  if (points.length < 3) return 'Flat';
  const recent = points.slice(-3);
  const delta = recent[recent.length - 1].rate - recent[0].rate;
  if (delta > 0.10) return 'Uptrend';
  if (delta < -0.10) return 'Downtrend';
  return 'Flat';
}

function determineCycle(points: InterestRateRecord[]): PolicyCycle {
  const recent = points.slice(-4);
  const positive = recent.filter((x) => x.changeBps > 0).length;
  const negative = recent.filter((x) => x.changeBps < 0).length;

  if (positive >= 2) return 'Hiking Phase';
  if (negative >= 2) return 'Easing Phase';
  return 'Peak / Pause';
}

export function computeCurrencyAnalytics(snapshot: InterestRateSnapshot): CurrencyRateAnalytics[] {
  return G8_CURRENCIES.map((currency) => {
    const points = snapshot.series[currency] ?? [];
    const latest = points[points.length - 1];
    const trend = determineTrend(points);
    const cycle = determineCycle(points);

    const recent = points.slice(-6);
    const momentum = recent.reduce((acc, row) => acc + row.changeBps, 0);
    const strengthScore = Number((latest?.rate ?? 0) * 10 + momentum * 0.35);

    return {
      currency,
      latestRate: latest?.rate ?? 0,
      latestChangeBps: latest?.changeBps ?? 0,
      trend,
      momentum,
      policyCycle: cycle,
      strengthScore,
      signal: strengthScore > 30 ? 'Bullish' : strengthScore < 10 ? 'Bearish' : 'Neutral',
    };
  }).sort((a, b) => b.strengthScore - a.strengthScore);
}

export function computeDifferentialMatrix(snapshot: InterestRateSnapshot): DifferentialEntry[] {
  const latest = new Map<G8Currency, number>();
  for (const currency of G8_CURRENCIES) {
    latest.set(currency, latestOf(snapshot.series, currency)?.rate ?? 0);
  }

  const matrix: DifferentialEntry[] = [];
  for (const base of G8_CURRENCIES) {
    for (const quote of G8_CURRENCIES) {
      if (base === quote) continue;
      matrix.push({
        base,
        quote,
        differential: Number(((latest.get(base) ?? 0) - (latest.get(quote) ?? 0)).toFixed(2)),
      });
    }
  }

  return matrix;
}

export async function getInterestRateStatus() {
  const snapshot = await getInterestRateSnapshot();
  const records = Object.values(snapshot.series).reduce((acc, rows) => acc + rows.length, 0);
  const latest = getLatestByCurrency(snapshot);

  return {
    timezone: 'UTC',
    schedule: 'Daily + Event Driven',
    lastSyncIso: snapshot.fetchedAt,
    trackedCurrencies: G8_CURRENCIES,
    totalRecords: records,
    source: snapshot.source,
    stale: snapshot.stale,
    latestCount: latest.length,
    pipelineMode: process.env.INTEREST_RATE_AUTO_SYNC_ENABLED === 'false' ? 'manual' : 'auto',
  };
}
