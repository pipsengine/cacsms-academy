import { fetchDisaggHistoricalRaw } from './src/lib/cot/fetcher.ts';
import { parseDisaggCsv } from './src/lib/cot/parser.ts';

const raw = await fetchDisaggHistoricalRaw(2026);
const rows = parseDisaggCsv(raw);
const xauRows = rows.filter(r => r.asset === 'XAU').sort((a, b) => a.date.getTime() - b.date.getTime());
console.log(`Total XAU rows parsed from 2026 disagg: ${xauRows.length}`);
xauRows.forEach(r => {
  console.log(`  ${r.date.toISOString().split('T')[0]}  long=${r.long}  short=${r.short}`);
});
