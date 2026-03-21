import { prisma } from '../prisma.ts';
import type { CotRecord, CotAsset } from './types.ts';

export type CotHistoryRange = '6m' | '1y' | 'all';

/**
 * Upsert a batch of CotRecord objects into the database.
 * Uses the unique constraint (asset, date) for deduplication.
 */
export async function upsertCotRecords(records: CotRecord[]): Promise<number> {
  if (records.length === 0) return 0;

  let upserted = 0;

  // Process in batches to avoid overwhelming the connection
  const BATCH_SIZE = 50;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((r) =>
        prisma.cotData.upsert({
          where: { asset_date: { asset: r.asset, date: r.date } },
          create: {
            date: r.date,
            asset: r.asset,
            long: r.long,
            short: r.short,
            net: r.net,
            change: r.change,
            zScore: r.zScore,
            percentile: r.percentile,
            velocity: r.velocity,
            acceleration: r.acceleration,
            trend: r.trend,
            extreme: r.extreme,
            phase: r.phase,
            signal: r.signal,
            confidence: r.confidence,
            risk: r.risk,
            weeklyBias: r.weeklyBias,
          },
          update: {
            long: r.long,
            short: r.short,
            net: r.net,
            change: r.change,
            zScore: r.zScore,
            percentile: r.percentile,
            velocity: r.velocity,
            acceleration: r.acceleration,
            trend: r.trend,
            extreme: r.extreme,
            phase: r.phase,
            signal: r.signal,
            confidence: r.confidence,
            risk: r.risk,
            weeklyBias: r.weeklyBias,
          },
        })
      )
    );
    upserted += batch.length;
  }

  return upserted;
}

function rangeToDate(range: CotHistoryRange): Date | undefined {
  if (range === 'all') return undefined;

  const now = new Date();
  const start = new Date(now);
  if (range === '6m') {
    start.setMonth(start.getMonth() - 6);
    return start;
  }

  start.setFullYear(start.getFullYear() - 1);
  return start;
}

/** Fetch records for a given asset and range, sorted newest first */
export async function getCotHistory(asset: CotAsset, range: CotHistoryRange = 'all'): Promise<CotRecord[]> {
  const fromDate = rangeToDate(range);
  const rows = await prisma.cotData.findMany({
    where: {
      asset,
      ...(fromDate ? { date: { gte: fromDate } } : {}),
    },
    orderBy: { date: 'desc' },
  });
  return rows as unknown as CotRecord[];
}

/** Fetch the latest record for every supported asset */
export async function getCotLatest(): Promise<CotRecord[]> {
  // Get the most recent date per asset
  const assets = await prisma.cotData.findMany({
    select: { asset: true },
    distinct: ['asset'],
  });

  const latestRows = await Promise.all(
    assets.map(({ asset }) =>
      prisma.cotData.findFirst({
        where: { asset },
        orderBy: { date: 'desc' },
      })
    )
  );

  return latestRows.filter(Boolean) as unknown as CotRecord[];
}

/** Return the list of assets that have data stored */
export async function getCotAssets(): Promise<string[]> {
  const rows = await prisma.cotData.findMany({
    select: { asset: true },
    distinct: ['asset'],
    orderBy: { asset: 'asc' },
  });
  return rows.map((r) => r.asset);
}
