import { prisma } from '../prisma.ts';
import { runIngestion } from './ingestor.ts';

export const COT_LAST_SYNC_KEY = 'cot:lastScheduledSyncLagosDate';
const CHECK_INTERVAL_MS = 60_000;
export const LAGOS_TIMEZONE = 'Africa/Lagos';

let isRunning = false;

function getLagosParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: LAGOS_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    weekday: map.weekday ?? '',
    year: map.year ?? '0000',
    month: map.month ?? '00',
    day: map.day ?? '00',
    hour: map.hour ?? '00',
    minute: map.minute ?? '00',
  };
}

function getLagosDateKey(now = new Date()) {
  const p = getLagosParts(now);
  return `${p.year}-${p.month}-${p.day}`;
}

function shouldRunNow(now = new Date()) {
  const p = getLagosParts(now);
  return p.weekday.toLowerCase().startsWith('sun') && p.hour === '00' && p.minute === '00';
}

async function getLastScheduledSyncDate(): Promise<string | null> {
  const record = await prisma.platformSetting.findUnique({ where: { key: COT_LAST_SYNC_KEY } });
  return record?.value ?? null;
}

async function setLastScheduledSyncDate(dateKey: string): Promise<void> {
  await prisma.platformSetting.upsert({
    where: { key: COT_LAST_SYNC_KEY },
    update: { value: dateKey },
    create: { key: COT_LAST_SYNC_KEY, value: dateKey },
  });
}

async function tryRunScheduledSync() {
  if (isRunning) return;
  if (!shouldRunNow()) return;

  const todayLagos = getLagosDateKey();
  const lastRun = await getLastScheduledSyncDate();
  if (lastRun === todayLagos) return;

  isRunning = true;
  try {
    console.info(`[cot][scheduler] Starting weekly sync for Lagos date ${todayLagos}`);
    const result = await runIngestion();
    if (!result.success) {
      console.error('[cot][scheduler] Weekly sync completed with errors', result);
      return;
    }

    await setLastScheduledSyncDate(todayLagos);
    console.info('[cot][scheduler] Weekly sync completed successfully', {
      processed: result.recordsProcessed,
      upserted: result.recordsUpserted,
      durationMs: result.durationMs,
    });
  } catch (error) {
    console.error('[cot][scheduler] Weekly sync failed', error);
  } finally {
    isRunning = false;
  }
}

export function startCotWeeklyScheduler() {
  const enabled = process.env.COT_AUTO_SYNC_ENABLED !== 'false';
  if (!enabled) {
    console.info('[cot][scheduler] Disabled via COT_AUTO_SYNC_ENABLED=false');
    return;
  }

  console.info('[cot][scheduler] Enabled: Sunday 00:00 Africa/Lagos');

  // Check immediately on start in case the process starts exactly at run time.
  void tryRunScheduledSync();

  setInterval(() => {
    void tryRunScheduledSync();
  }, CHECK_INTERVAL_MS);
}
