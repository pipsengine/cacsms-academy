import { normalizePair } from '../config.ts';
import type { ForexCandle, ForexMarketProvider } from '../types.ts';

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
        }>;
      };
    }>;
    error?: { code: string; description: string } | null;
  };
};

// Maps our TwelveData-style interval strings to Yahoo Finance params
function toYahooParams(interval: string, outputsize: number): { interval: string; period1: number; period2: number } {
  const now = Math.floor(Date.now() / 1000);

  const intervalMap: Record<string, { interval: string; secondsPerCandle: number }> = {
    '1min':  { interval: '1m',   secondsPerCandle: 60 },
    '5min':  { interval: '5m',   secondsPerCandle: 300 },
    '15min': { interval: '15m',  secondsPerCandle: 900 },
    '30min': { interval: '30m',  secondsPerCandle: 1800 },
    '1h':    { interval: '60m',  secondsPerCandle: 3600 },
    '4h':    { interval: '1h',   secondsPerCandle: 14400 },
    '1day':  { interval: '1d',   secondsPerCandle: 86400 },
    '1week': { interval: '1wk',  secondsPerCandle: 604800 },
  };

  const entry = intervalMap[interval] ?? intervalMap['1min'];
  // Request 3× outputsize history to account for weekends/market-closed gaps
  const period1 = now - entry.secondsPerCandle * outputsize * 3;
  return { interval: entry.interval, period1, period2: now };
}

export class YahooFinanceForexMarketProvider implements ForexMarketProvider {
  readonly name = 'yahoo';

  async getCandles(pair: string, interval: string, outputsize: number): Promise<ForexCandle[]> {
    const normalizedPair = normalizePair(pair);
    const symbol = `${normalizedPair}=X`;
    const { interval: yInterval, period1, period2 } = toYahooParams(interval, outputsize);
    const decimals = normalizedPair.endsWith('JPY') ? 3 : 5;

    const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    url.searchParams.set('interval', yInterval);
    url.searchParams.set('period1', String(period1));
    url.searchParams.set('period2', String(period2));

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Cacsms-Academy/1.0)',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned HTTP ${response.status} for ${pair}`);
    }

    const payload = await response.json() as YahooChartResponse;

    if (payload.chart?.error) {
      throw new Error(`Yahoo Finance error for ${pair}: ${payload.chart.error.description}`);
    }

    const result = payload.chart?.result?.[0];
    if (!result?.timestamp?.length) {
      throw new Error(`No data from Yahoo Finance for ${pair}`);
    }

    const timestamps = result.timestamp;
    const quoteBlock = result.indicators?.quote?.[0];
    const { open: opens, high: highs, low: lows, close: closes } = quoteBlock ?? {};

    if (!opens || !highs || !lows || !closes) {
      throw new Error(`Incomplete OHLCV from Yahoo Finance for ${pair}`);
    }

    const candles: ForexCandle[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const o = opens[i];
      const h = highs[i];
      const l = lows[i];
      const c = closes[i];
      if (o == null || h == null || l == null || c == null) continue;
      candles.push({
        datetime: new Date(timestamps[i] * 1000).toISOString(),
        open:  Number(o.toFixed(decimals)),
        high:  Number(h.toFixed(decimals)),
        low:   Number(l.toFixed(decimals)),
        close: Number(c.toFixed(decimals)),
      });
    }

    if (candles.length === 0) {
      throw new Error(`All candles were null/empty from Yahoo Finance for ${pair}`);
    }

    return candles.slice(-outputsize);
  }
}
