import {
  CotAsset,
  RawCotRow,
  CFTC_MARKET_NAMES,
  ALL_ASSETS,
} from './types';

/**
 * Parse a CFTC CSV text file into raw COT rows.
 *
 * Both the legacy futures-only currency file and the disaggregated file are
 * comma-separated without a header row in the current CFTC exports.
 *
 * deafut.txt relevant columns (0-based):
 *   0  – Market and Exchange Names
 *   2  – Report Date as YYYY-MM-DD
 *   8  – Noncommercial Positions-Long (All)
 *   9  – Noncommercial Positions-Short (All)
 *
 * f_disagg.txt relevant columns (0-based):
 *   0  – Market and Exchange Names
 *   2  – Report Date as YYYY-MM-DD
 *   13 – Managed Money Positions-Long (All)
 *   14 – Managed Money Positions-Short (All)
 */

interface ColMap {
  marketNameCol: number;
  dateCol: number;
  longCol: number;
  shortCol: number;
}

const FIN_FUT_COLS: ColMap = {
  marketNameCol: 0,
  dateCol: 2,
  longCol: 8,
  shortCol: 9,
};

const DISAGG_COLS: ColMap = {
  marketNameCol: 0,
  dateCol: 2,
  // f_disagg.txt uses managed-money positions at 13/14 (futures only)
  longCol: 13,
  shortCol: 14,
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(raw: string): Date | null {
  const value = raw.trim();

  // Newer CFTC files use YYYY-MM-DD.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T00:00:00.000Z`);
    return isNaN(d.getTime()) ? null : d;
  }

  // Legacy CFTC format uses MM/DD/YYYY.
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const [mm, dd, yyyy] = parts.map(Number);
  if (!mm || !dd || !yyyy) return null;
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  return isNaN(d.getTime()) ? null : d;
}

function extractRows(csv: string, assets: CotAsset[], cols: ColMap): RawCotRow[] {
  const lines = csv.split('\n');
  if (lines.length < 1) return [];

  const rows: RawCotRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = parseCsvLine(line);

    const marketName = (cells[cols.marketNameCol] ?? '').toUpperCase();

    let matchedAsset: CotAsset | null = null;
    for (const asset of assets) {
      const needle = CFTC_MARKET_NAMES[asset].toUpperCase();
      if (marketName.startsWith(needle)) {
        matchedAsset = asset;
        break;
      }
    }
    if (!matchedAsset) continue;

    const date = parseDate(cells[cols.dateCol] ?? '');
    if (!date) continue;

    const long = parseFloat((cells[cols.longCol] ?? '').replace(/,/g, ''));
    const short = parseFloat((cells[cols.shortCol] ?? '').replace(/,/g, ''));
    if (isNaN(long) || isNaN(short)) continue;

    rows.push({ asset: matchedAsset, date, long, short });
  }

  return rows;
}

/** Parse deafut.txt — legacy non-commercial positions for tracked futures assets */
export function parseCurrencyCsv(csv: string): RawCotRow[] {
  return extractRows(csv, ALL_ASSETS, FIN_FUT_COLS);
}

/**
 * Disaggregated parsing is intentionally disabled.
 * XAU is sourced from legacy futures-only noncommercial columns in deafut.txt.
 */
export function parseDisaggCsv(_csv: string): RawCotRow[] {
  return [];
}
