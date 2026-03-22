/**
 * Release-aware interest rate scheduler.
 *
 * Maintains a forward-looking G8 central-bank meeting calendar.  On each
 * hourly tick it compares the calendar against the database and surfaces
 * any meetings whose date has passed but whose decision has not yet been
 * recorded as `curated-manual` (i.e., still relying on the forecasted rate
 * from the curated baseline).
 *
 * For USD it attempts an automatic FRED ingest when the API key is available.
 * For all other currencies it logs a structured warning and caches the
 * pending list so the admin page can surface it for human review.
 *
 * Pattern mirrors `exchangeRateScheduler.ts`.
 */

import { prisma } from '../prisma.ts';
import { G8_CURRENCIES, type G8Currency } from './types.ts';
import { upsertManualInterestRateDecision } from './store.ts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
/** Grace period after the scheduled announcement time before flagging as pending. */
const GRACE_PERIOD_MS = 2 * 60 * 60 * 1000; // 2 hours

// ---------------------------------------------------------------------------
// Forward-looking release calendar (April 2026 onwards)
//
// These entries extend beyond the curated baseline series in defaults.ts which
// runs through March 2026 for all G8 currencies.  Dates and announcement times
// are sourced from published central-bank meeting schedules.  Times are UTC.
// ---------------------------------------------------------------------------

const RELEASE_CALENDAR: Record<G8Currency, Array<{ date: string; timeUtc: string }>> = {
  // RBA – Reserve Bank of Australia (8 meetings/year, ~4-5 week cycle)
  AUD: [
    { date: '2026-05-05', timeUtc: '04:30:00' },
    { date: '2026-07-07', timeUtc: '04:30:00' },
    { date: '2026-08-04', timeUtc: '04:30:00' },
    { date: '2026-09-08', timeUtc: '04:30:00' },
    { date: '2026-11-03', timeUtc: '04:30:00' },
    { date: '2026-12-01', timeUtc: '04:30:00' },
  ],
  // BoC – Bank of Canada (8 meetings/year)
  CAD: [
    { date: '2026-04-15', timeUtc: '14:45:00' },
    { date: '2026-06-03', timeUtc: '14:45:00' },
    { date: '2026-07-15', timeUtc: '14:45:00' },
    { date: '2026-09-09', timeUtc: '14:45:00' },
    { date: '2026-10-28', timeUtc: '14:45:00' },
    { date: '2026-12-09', timeUtc: '15:45:00' },
  ],
  // SNB – Swiss National Bank (quarterly meetings: March, June, September, December)
  CHF: [
    { date: '2026-06-18', timeUtc: '08:30:00' },
    { date: '2026-09-17', timeUtc: '08:30:00' },
    { date: '2026-12-10', timeUtc: '09:30:00' },
  ],
  // ECB – European Central Bank (~8 meetings/year, every 6-7 weeks)
  EUR: [
    { date: '2026-04-30', timeUtc: '13:15:00' },
    { date: '2026-06-04', timeUtc: '13:15:00' },
    { date: '2026-07-23', timeUtc: '13:15:00' },
    { date: '2026-09-10', timeUtc: '13:15:00' },
    { date: '2026-10-29', timeUtc: '14:15:00' },
    { date: '2026-12-17', timeUtc: '14:15:00' },
  ],
  // BoE – Bank of England (8 meetings/year)
  GBP: [
    { date: '2026-05-07', timeUtc: '12:00:00' },
    { date: '2026-06-18', timeUtc: '12:00:00' },
    { date: '2026-08-06', timeUtc: '12:00:00' },
    { date: '2026-09-17', timeUtc: '12:00:00' },
    { date: '2026-11-05', timeUtc: '13:00:00' },
    { date: '2026-12-17', timeUtc: '13:00:00' },
  ],
  // BoJ – Bank of Japan (8 meetings/year)
  JPY: [
    { date: '2026-04-30', timeUtc: '04:00:00' },
    { date: '2026-06-16', timeUtc: '04:00:00' },
    { date: '2026-07-30', timeUtc: '04:00:00' },
    { date: '2026-09-17', timeUtc: '04:00:00' },
    { date: '2026-10-29', timeUtc: '04:00:00' },
    { date: '2026-12-17', timeUtc: '04:00:00' },
  ],
  // RBNZ – Reserve Bank of New Zealand (7 meetings/year)
  NZD: [
    { date: '2026-04-08', timeUtc: '02:00:00' },
    { date: '2026-05-27', timeUtc: '02:00:00' },
    { date: '2026-07-08', timeUtc: '02:00:00' },
    { date: '2026-08-19', timeUtc: '02:00:00' },
    { date: '2026-10-07', timeUtc: '02:00:00' },
    { date: '2026-11-25', timeUtc: '02:00:00' },
  ],
  // Fed – US Federal Reserve (8 meetings/year)
  USD: [
    { date: '2026-05-06', timeUtc: '19:00:00' },
    { date: '2026-06-17', timeUtc: '19:00:00' },
    { date: '2026-07-29', timeUtc: '19:00:00' },
    { date: '2026-09-16', timeUtc: '19:00:00' },
    { date: '2026-11-04', timeUtc: '20:00:00' },
    { date: '2026-12-16', timeUtc: '20:00:00' },
  ],
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PendingReleaseKind =
  /** Calendar date has passed and no DB row exists at all. */
  | 'missing'
  /** DB row exists but is still `curated-baseline` (forecast, not confirmed actual). */
  | 'unverified';

export interface PendingRelease {
  currency: G8Currency;
  date: string;
  scheduledTimeUtc: string;
  /** Hours elapsed since grace-period cutoff. */
  hoursOverdue: number;
  kind: PendingReleaseKind;
  /** Current DB rate, if any (for `unverified` entries). */
  currentRate?: number;
}

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let schedulerInterval: NodeJS.Timeout | null = null;
let cachedPendingReleases: PendingRelease[] = [];

// ---------------------------------------------------------------------------
// Core detection
// ---------------------------------------------------------------------------

async function detectPendingReleases(): Promise<PendingRelease[]> {
  const now = Date.now();
  const pending: PendingRelease[] = [];

  // Load all existing decision rows (date + source) from the database.
  const dbRows = await prisma.interestRateDecision.findMany({
    select: { currency: true, date: true, rate: true, source: true },
    orderBy: [{ currency: 'asc' }, { date: 'asc' }],
  });

  // Build lookup maps: currency → Set<dateStr> for confirmed rows, and a
  // separate map for baseline-only rows.
  const confirmedDates = new Map<G8Currency, Set<string>>();
  const baselineOnlyRows = new Map<string, number>(); // key: "CURRENCY:date" → rate

  for (const row of dbRows) {
    const currency = row.currency as G8Currency;
    const dateStr = row.date.toISOString().slice(0, 10);
    const key = `${currency}:${dateStr}`;

    if (row.source === 'curated-manual' || row.source === 'scheduled-ingest' || row.source === 'fred') {
      if (!confirmedDates.has(currency)) confirmedDates.set(currency, new Set());
      confirmedDates.get(currency)!.add(dateStr);
      // Remove from baseline-only if previously added by earlier sort order.
      baselineOnlyRows.delete(key);
    } else if (row.source === 'curated-baseline' || row.source === 'baseline') {
      // Only mark as baseline if not already confirmed by a later row.
      if (!confirmedDates.get(currency)?.has(dateStr)) {
        baselineOnlyRows.set(key, row.rate);
      }
    }
  }

  // Evaluate the release calendar.
  for (const currency of G8_CURRENCIES) {
    const meetings = RELEASE_CALENDAR[currency] ?? [];
    for (const meeting of meetings) {
      const meetingMs = new Date(`${meeting.date}T${meeting.timeUtc}Z`).getTime();
      const cutoffMs = meetingMs + GRACE_PERIOD_MS;
      if (now < cutoffMs) continue; // not yet overdue

      const key = `${currency}:${meeting.date}`;
      const isConfirmed = confirmedDates.get(currency)?.has(meeting.date) ?? false;
      const baselineRate = baselineOnlyRows.get(key);

      if (isConfirmed) continue; // already ingested as actual

      const hoursOverdue = Math.floor((now - cutoffMs) / (60 * 60 * 1000));

      if (baselineRate !== undefined) {
        pending.push({
          currency,
          date: meeting.date,
          scheduledTimeUtc: meeting.timeUtc,
          hoursOverdue,
          kind: 'unverified',
          currentRate: baselineRate,
        });
      } else {
        pending.push({
          currency,
          date: meeting.date,
          scheduledTimeUtc: meeting.timeUtc,
          hoursOverdue,
          kind: 'missing',
        });
      }
    }
  }

  // Sort: most overdue first, then alphabetically.
  pending.sort((a, b) => b.hoursOverdue - a.hoursOverdue || a.currency.localeCompare(b.currency));
  return pending;
}

// ---------------------------------------------------------------------------
// USD FRED auto-ingest
// ---------------------------------------------------------------------------

async function tryFredAutoIngest(pending: PendingRelease[]): Promise<void> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return;

  const usdPending = pending.filter((p) => p.currency === 'USD');
  if (!usdPending.length) return;

  for (const entry of usdPending) {
    try {
      // FEDFUNDS is monthly; fetch observations around the decision date.
      const obsStart = entry.date;
      const obsEnd = entry.date;
      const url =
        `https://api.stlouisfed.org/fred/series/observations` +
        `?series_id=FEDFUNDS&observation_start=${obsStart}&observation_end=${obsEnd}` +
        `&api_key=${apiKey}&file_type=json`;

      const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) {
        console.warn(`[interest-rate-scheduler] FRED fetch for USD ${entry.date} returned ${response.status}`);
        continue;
      }

      const json = await response.json() as { observations?: Array<{ date: string; value: string }> };
      const obs = json.observations?.find((o) => o.date === entry.date && o.value !== '.');
      if (!obs) {
        console.warn(`[interest-rate-scheduler] FRED has no observation for USD ${entry.date}`);
        continue;
      }

      const rate = parseFloat(obs.value);
      if (!Number.isFinite(rate)) continue;

      await upsertManualInterestRateDecision({
        currency: 'USD',
        date: entry.date,
        decisionTimestamp: `${entry.date}T${entry.scheduledTimeUtc}Z`,
        rate,
        source: 'fred',
      } as Parameters<typeof upsertManualInterestRateDecision>[0]);

      console.log(`[interest-rate-scheduler] Auto-ingested USD ${entry.date} @ ${rate}% via FRED`);
    } catch (err) {
      console.error(`[interest-rate-scheduler] FRED auto-ingest failed for USD ${entry.date}:`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Main scheduler tick
// ---------------------------------------------------------------------------

async function runCheck(): Promise<void> {
  const pending = await detectPendingReleases();
  cachedPendingReleases = pending;

  if (pending.length === 0) {
    console.log('[interest-rate-scheduler] All calendar entries are up-to-date.');
    return;
  }

  console.warn(
    `[interest-rate-scheduler] ${pending.length} pending release(s):\n` +
      pending
        .map((p) => `  ${p.currency} ${p.date}  kind=${p.kind}  overdue=${p.hoursOverdue}h`)
        .join('\n')
  );

  await tryFredAutoIngest(pending);

  // Re-run detection after auto-ingest so the cache reflects any resolved USD entries.
  const updated = await detectPendingReleases();
  cachedPendingReleases = updated;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start the hourly interest-rate release check scheduler.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function startInterestRateScheduler(): void {
  if (schedulerInterval !== null) {
    console.warn('[interest-rate-scheduler] Already running, skipping initialization');
    return;
  }

  console.log('[interest-rate-scheduler] Release-aware scheduler started (interval: 1 h)');

  void runCheck().catch((err) => {
    console.error('[interest-rate-scheduler] Initial check failed:', err);
  });

  schedulerInterval = setInterval(() => {
    void runCheck().catch((err) => {
      console.error('[interest-rate-scheduler] Scheduled check failed:', err);
    });
  }, CHECK_INTERVAL_MS);

  if (schedulerInterval.unref) {
    schedulerInterval.unref();
  }
}

/**
 * Stop the scheduler. Calling when not running is a no-op.
 */
export function stopInterestRateScheduler(): void {
  if (schedulerInterval !== null) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[interest-rate-scheduler] Stopped');
  }
}

/**
 * Returns the cached list of pending releases from the last scheduler run.
 * Safe to call synchronously from API routes without hitting the database.
 */
export function getPendingReleases(): PendingRelease[] {
  return cachedPendingReleases;
}
