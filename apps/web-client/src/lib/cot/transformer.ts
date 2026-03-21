import type { RawCotRow, CotAsset } from './types.ts';

/**
 * Deduplicate and sort raw rows per asset.
 * Returns a map of asset → rows sorted oldest → newest.
 */
export function groupAndSortByAsset(
  rows: RawCotRow[]
): Map<CotAsset, RawCotRow[]> {
  const map = new Map<CotAsset, Map<number, RawCotRow>>();

  for (const row of rows) {
    if (!map.has(row.asset)) map.set(row.asset, new Map());
    const dateKey = row.date.getTime();
    // Last-write wins for same asset+date within the same raw pull
    map.get(row.asset)!.set(dateKey, row);
  }

  const result = new Map<CotAsset, RawCotRow[]>();
  for (const [asset, dateMap] of map.entries()) {
    const sorted = Array.from(dateMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    result.set(asset, sorted);
  }

  return result;
}
