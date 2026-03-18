import { getForexProviderName, getForexRefreshMs, getTrackedPairs, normalizePair, timeframeToInterval } from './config';
import { MockForexMarketProvider } from './providers/mock';
import { TwelveDataForexMarketProvider } from './providers/twelveData';
import type { BreakoutSignal, ChannelSignal, CurrencyStrength, ForexCandle, ForexMarketProvider, MarketSnapshot } from './types';

type SnapshotCache = {
  snapshot: MarketSnapshot;
  chartSeries: Record<string, ForexCandle[]>;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function stdDev(values: number[]) {
  if (values.length === 0) return 0;
  const avg = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - avg) ** 2)));
}

function minutesAgo(timestamp: string) {
  const deltaMs = Date.now() - Date.parse(timestamp);
  const minutes = Math.max(0, Math.round(deltaMs / 60_000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

function determinePairBias(candles: ForexCandle[]): 'LONG' | 'SHORT' | 'NEUTRAL' {
  if (candles.length < 2) return 'NEUTRAL';
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const move = (last - first) / first;
  if (move > 0.0015) return 'LONG';
  if (move < -0.0015) return 'SHORT';
  return 'NEUTRAL';
}

function determineChannelType(candles: ForexCandle[]) {
  const closes = candles.map((candle) => candle.close);
  const highs = candles.map((candle) => candle.high);
  const lows = candles.map((candle) => candle.low);
  const move = closes[closes.length - 1] - closes[0];
  const width = Math.max(...highs) - Math.min(...lows);
  const noise = stdDev(closes);

  if (Math.abs(move) < width * 0.08) {
    return noise < width * 0.18 ? 'Horizontal' : 'Sym Triangle';
  }

  return move > 0 ? 'Ascending' : 'Descending';
}

function buildCurrencyStrengths(series: Record<string, ForexCandle[]>): CurrencyStrength[] {
  const currencies = new Map<string, number>();

  for (const [pair, candles] of Object.entries(series)) {
    if (pair.length !== 6 || candles.length < 2) continue;
    const base = pair.slice(0, 3);
    const quote = pair.slice(3);
    const first = candles[0].close;
    const last = candles[candles.length - 1].close;
    const changePct = ((last - first) / first) * 100;

    currencies.set(base, (currencies.get(base) ?? 0) + changePct);
    currencies.set(quote, (currencies.get(quote) ?? 0) - changePct);
  }

  const values = [...currencies.values()];
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;

  return [...currencies.entries()]
    .map(([name, raw]) => ({
      name,
      score: Math.round(((raw - min) / range) * 100),
    }))
    .sort((left, right) => right.score - left.score);
}

function buildChannelSignals(series: Record<string, ForexCandle[]>, timeframe: string): ChannelSignal[] {
  return Object.entries(series)
    .map(([pair, candles]) => {
      const closes = candles.map((candle) => candle.close);
      const highs = candles.map((candle) => candle.high);
      const lows = candles.map((candle) => candle.low);
      const meanClose = mean(closes);
      const width = Math.max(...highs) - Math.min(...lows);
      const slope = closes[closes.length - 1] - closes[0];
      const relativeSlope = meanClose ? Math.abs(slope / meanClose) : 0;
      const volatility = meanClose ? width / meanClose : 0;
      const score = clamp(Math.round(55 + relativeSlope * 1200 + volatility * 350), 45, 96);
      const prob = clamp(Math.round(50 + relativeSlope * 1000), 40, 93);
      const bias = determinePairBias(candles);
      const type = determineChannelType(candles);
      const resistanceTouches = clamp(Math.round(2 + prob / 22), 2, 5);
      const supportTouches = clamp(Math.round(2 + score / 26), 2, 5);

      return {
        pair,
        tf: timeframe,
        type,
        touches: `R${resistanceTouches} | S${supportTouches}`,
        score,
        bias,
        prob,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);
}

function buildBreakoutSignals(series: Record<string, ForexCandle[]>, timeframe: string): BreakoutSignal[] {
  return Object.entries(series)
    .map(([pair, candles]) => {
      const latest = candles[candles.length - 1];
      const history = candles.slice(0, -1);
      const previousHigh = Math.max(...history.map((candle) => candle.high));
      const previousLow = Math.min(...history.map((candle) => candle.low));
      const width = previousHigh - previousLow || latest.close * 0.001;
      const highBreak = (latest.close - previousHigh) / width;
      const lowBreak = (previousLow - latest.close) / width;

      let dir: 'LONG' | 'SHORT' = determinePairBias(candles) === 'SHORT' ? 'SHORT' : 'LONG';
      let status: 'ACTIVE' | 'TRIGGERED' | 'MONITORING' = 'MONITORING';
      let conf = 58;

      if (highBreak > 0.05) {
        dir = 'LONG';
        status = highBreak > 0.2 ? 'TRIGGERED' : 'ACTIVE';
        conf = clamp(Math.round(68 + highBreak * 120), 60, 95);
      } else if (lowBreak > 0.05) {
        dir = 'SHORT';
        status = lowBreak > 0.2 ? 'TRIGGERED' : 'ACTIVE';
        conf = clamp(Math.round(68 + lowBreak * 120), 60, 95);
      } else {
        const momentum = Math.abs((latest.close - history[0].close) / history[0].close);
        conf = clamp(Math.round(52 + momentum * 1200), 45, 78);
      }

      return {
        pair,
        tf: timeframe,
        dir,
        conf,
        time: minutesAgo(latest.datetime),
        status,
      };
    })
    .sort((left, right) => right.conf - left.conf)
    .slice(0, 6);
}

async function fetchSeries(provider: ForexMarketProvider, pairs: string[], interval: string, outputsize: number) {
  const entries = await Promise.all(
    pairs.map(async (pair) => [pair, await provider.getCandles(pair, interval, outputsize)] as const)
  );

  return Object.fromEntries(entries);
}

function createProvider(): ForexMarketProvider {
  const providerName = getForexProviderName();
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (providerName === 'twelvedata' && apiKey) {
    return new TwelveDataForexMarketProvider(apiKey);
  }

  return new MockForexMarketProvider();
}

export class MarketDataService {
  private readonly provider = createProvider();
  private readonly refreshMs = getForexRefreshMs();
  private readonly trackedPairs = getTrackedPairs().map(normalizePair);
  private cache: SnapshotCache | null = null;
  private inflight: Promise<SnapshotCache> | null = null;
  private lastRefreshMode: 'live' | 'fallback-cache' | 'fallback-mock' = 'live';
  private lastErrorMessage: string | null = null;

  get providerName() {
    return this.provider.name;
  }

  getStatus() {
    const generatedAt = this.cache?.snapshot.generatedAt ?? null;
    const ageMs = generatedAt ? Date.now() - Date.parse(generatedAt) : null;
    const stale = ageMs !== null ? ageMs > this.refreshMs * 2 : true;

    return {
      provider: this.provider.name,
      snapshotProvider: this.cache?.snapshot.provider ?? null,
      generatedAt,
      refreshMs: this.refreshMs,
      trackedPairs: this.trackedPairs.length,
      stale,
      mode: this.lastRefreshMode,
      lastErrorMessage: this.lastErrorMessage,
    };
  }

  async getSnapshot(options?: { forceRefresh?: boolean }) {
    const shouldRefresh = options?.forceRefresh
      || !this.cache
      || Date.now() - Date.parse(this.cache.snapshot.generatedAt) > this.refreshMs;

    if (!shouldRefresh && this.cache) {
      return this.cache.snapshot;
    }

    const cache = await this.refresh();
    return cache.snapshot;
  }

  async getChartSeries(pair: string, timeframe: string, points = 60) {
    const normalizedPair = normalizePair(pair);
    const interval = timeframeToInterval(timeframe);

    if (interval === '1min' && this.cache?.chartSeries[normalizedPair]?.length) {
      return this.cache.chartSeries[normalizedPair].slice(-points);
    }

    try {
      return await this.provider.getCandles(normalizedPair, interval, points);
    } catch {
      const fallback = new MockForexMarketProvider();
      return fallback.getCandles(normalizedPair, interval, points);
    }
  }

  async refresh() {
    if (this.inflight) return this.inflight;

    this.inflight = (async () => {
      try {
        const series = await fetchSeries(this.provider, this.trackedPairs, '1min', 30);
        const snapshot: MarketSnapshot = {
          provider: this.provider.name,
          generatedAt: new Date().toISOString(),
          currencies: buildCurrencyStrengths(series),
          channels: buildChannelSignals(series, 'M1'),
          breakouts: buildBreakoutSignals(series, 'M1'),
        };

        this.lastRefreshMode = 'live';
        this.lastErrorMessage = null;
        this.cache = { snapshot, chartSeries: series };
        return this.cache;
      } catch (error) {
        this.lastErrorMessage = error instanceof Error ? error.message : 'Unknown market provider error';
        if (this.cache) {
          this.lastRefreshMode = 'fallback-cache';
          return this.cache;
        }

        const fallbackProvider = new MockForexMarketProvider();
        const fallbackSeries = await fetchSeries(fallbackProvider, this.trackedPairs, '1min', 30);
        const snapshot: MarketSnapshot = {
          provider: `${this.provider.name}-fallback`,
          generatedAt: new Date().toISOString(),
          currencies: buildCurrencyStrengths(fallbackSeries),
          channels: buildChannelSignals(fallbackSeries, 'M1'),
          breakouts: buildBreakoutSignals(fallbackSeries, 'M1'),
        };
        this.lastRefreshMode = 'fallback-mock';
        this.cache = { snapshot, chartSeries: fallbackSeries };
        return this.cache;
      } finally {
        this.inflight = null;
      }
    })();

    return this.inflight;
  }
}

declare global {
  var __intelTraderMarketService: MarketDataService | undefined;
}

export function getMarketDataService() {
  if (
    !globalThis.__intelTraderMarketService
    || typeof globalThis.__intelTraderMarketService.getStatus !== 'function'
  ) {
    globalThis.__intelTraderMarketService = new MarketDataService();
  }

  return globalThis.__intelTraderMarketService;
}
