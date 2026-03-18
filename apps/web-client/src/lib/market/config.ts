const DEFAULT_SYMBOLS = [
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'AUDUSD',
  'USDCAD',
  'USDCHF',
  'NZDUSD',
  'EURGBP',
  'EURJPY',
  'GBPJPY',
  'AUDJPY',
  'EURAUD',
  'AUDNZD',
  'USDNGN',
];

export function getTrackedPairs() {
  const raw = process.env.FOREX_SYMBOLS;
  if (!raw) return DEFAULT_SYMBOLS;

  const symbols = raw
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  return symbols.length > 0 ? symbols : DEFAULT_SYMBOLS;
}

export function getForexRefreshMs() {
  const value = Number(process.env.FOREX_REFRESH_SECONDS ?? 60);
  if (!Number.isFinite(value) || value <= 0) return 60_000;
  return value * 1000;
}

export function getForexProviderName() {
  return (process.env.FOREX_DATA_PROVIDER || 'twelvedata').trim().toLowerCase();
}

export function normalizePair(pair: string) {
  const compact = pair.replace('/', '').trim().toUpperCase();
  if (compact.length !== 6) return compact;
  return compact;
}

export function providerSymbol(pair: string) {
  const compact = normalizePair(pair);
  if (compact.length !== 6) return compact;
  return `${compact.slice(0, 3)}/${compact.slice(3)}`;
}

export function timeframeToInterval(timeframe: string) {
  const normalized = timeframe.trim().toUpperCase();
  switch (normalized) {
    case 'M1':
      return '1min';
    case 'M5':
      return '5min';
    case 'M15':
      return '15min';
    case 'M30':
      return '30min';
    case 'H1':
      return '1h';
    case 'H4':
      return '4h';
    case 'D1':
      return '1day';
    case 'W1':
      return '1week';
    default:
      return '1min';
  }
}
