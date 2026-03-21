import {
  CotAsset,
  RawCotRow,
  CFTC_MARKET_NAMES,
  CURRENCY_ASSETS,
} from './types';

/**
 * Parse a CFTC CSV text file into raw COT rows.
 *
 * Both FinFutWk.txt and DisaggWk.txt are comma-separated with a header row.
 *
 * FinFutWk.txt relevant columns (0-based):
 *   0  – Market and Exchange Names
 *   2  – Report Date as MM/DD/YYYY
 *   7  – Noncommercial Positions-Long (All)
 *   8  – Noncommercial Positions-Short (All)
 *
 * DisaggWk.txt relevant columns (0-based):
 *   0  – Market and Exchange Names
 *   2  – Report Date as MM/DD/YYYY
 *   9  – Managed Money Positions-Long (All)
 *   10 – Managed Money Positions-Short (All)
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
  longCol: 7,
  shortCol: 8,
};

const DISAGG_COLS: ColMap = {
  marketNameCol: 0,
  dateCol: 2,
  longCol: 9,
  shortCol: 10,
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
  // CFTC uses MM/DD/YYYY
  const parts = raw.trim().split('/');
  if (parts.length !== 3) return null;
  const [mm, dd, yyyy] = parts.map(Number);
  if (!mm || !dd || !yyyy) return null;
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  return isNaN(d.getTime()) ? null : d;
}

function extractRows(csv: string, assets: CotAsset[], cols: ColMap): RawCotRow[] {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  const rows: RawCotRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = parseCsvLine(line);

    const marketName = (cells[cols.marketNameCol] ?? '').toUpperCase();

    let matchedAsset: CotAsset | null = null;
    for (const asset of assets) {
      const needle = CFTC_MARKET_NAMES[asset].toUpperCase();
      if (marketName.includes(needle)) {
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

/** Parse FinFutWk.txt — Non-Commercial positions for currency futures */
export function parseCurrencyCsv(csv: string): RawCotRow[] {
  return extractRows(csv, CURRENCY_ASSETS, FIN_FUT_COLS);
}

/** Parse DisaggWk.txt — Managed Money positions for gold */
export function parseDisaggCsv(csv: string): RawCotRow[] {
  return extractRows(csv, ['XAU'], DISAGG_COLS);
}
