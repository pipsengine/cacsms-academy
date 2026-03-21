import { fetchCurrencyRaw, fetchDisaggRaw } from './fetcher';
import { parseCurrencyCsv, parseDisaggCsv } from './parser';
import { groupAndSortByAsset } from './transformer';
import { computeMetrics } from './analytics';
import { applySignalEngine } from './signalEngine';
import { upsertCotRecords } from './storage';
import { CotRecord } from './types';

export interface IngestResult {
  success: boolean;
  recordsProcessed: number;
  recordsUpserted: number;
  errors: string[];
  durationMs: number;
}

/**
 * Full ingestion pipeline:
 * 1. Fetch raw CFTC files
 * 2. Parse CSV → RawCotRow[]
 * 3. Group & sort by asset
 * 4. Compute analytics metrics
 * 5. Apply signal engine
 * 6. Upsert to database
 */
export async function runIngestion(): Promise<IngestResult> {
  const start = Date.now();
  const errors: string[] = [];
  const allRecords: CotRecord[] = [];

  // Step 1: Fetch
  let currencyRaw = '';
  let disaggRaw = '';

  try {
    currencyRaw = await fetchCurrencyRaw();
  } catch (err) {
    errors.push(`Currency fetch failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    disaggRaw = await fetchDisaggRaw();
  } catch (err) {
    errors.push(`Disaggregated fetch failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!currencyRaw && !disaggRaw) {
    return {
      success: false,
      recordsProcessed: 0,
      recordsUpserted: 0,
      errors,
      durationMs: Date.now() - start,
    };
  }

  // Step 2: Parse
  const currencyRows = currencyRaw ? parseCurrencyCsv(currencyRaw) : [];
  const disaggRows = disaggRaw ? parseDisaggCsv(disaggRaw) : [];
  const allRaw = [...currencyRows, ...disaggRows];

  // Step 3: Group & sort
  const grouped = groupAndSortByAsset(allRaw);

  // Steps 4+5: Compute metrics and apply signal engine per asset
  for (const [asset, sortedRows] of grouped.entries()) {
    try {
      const partialRecords = computeMetrics(asset, sortedRows);
      const fullRecords = partialRecords.map(applySignalEngine);
      allRecords.push(...fullRecords);
    } catch (err) {
      errors.push(`Analytics failed for ${asset}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Step 6: Upsert
  let upserted = 0;
  try {
    upserted = await upsertCotRecords(allRecords);
  } catch (err) {
    errors.push(`DB upsert failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    success: errors.length === 0,
    recordsProcessed: allRecords.length,
    recordsUpserted: upserted,
    errors,
    durationMs: Date.now() - start,
  };
}
