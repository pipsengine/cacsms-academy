import { getForexProviderName, getForexRefreshMs, getTrackedPairs, normalizePair, timeframeToInterval } from './config.ts';
import { TwelveDataForexMarketProvider } from './providers/twelveData.ts';
import { YahooFinanceForexMarketProvider } from './providers/yahoo.ts';
import type { BreakoutSignal, ChannelSignal, CurrencyStrength, ForexCandle, ForexMarketProvider, MarketSnapshot } from './types.ts';

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

type RegressionLine = {
  slope: number;
  intercept: number;
};

type AnalyzedChannel = {
  channel: ChannelSignal;
  breakout: BreakoutSignal;
};

function linearRegression(values: number[]): RegressionLine {
  if (values.length === 0) return { slope: 0, intercept: 0 };

  const xs = values.map((_, index) => index);
  const xMean = mean(xs);
  const yMean = mean(values);
  const numerator = values.reduce((total, value, index) => total + ((xs[index] - xMean) * (value - yMean)), 0);
  const denominator = xs.reduce((total, value) => total + ((value - xMean) ** 2), 0);
  const slope = denominator === 0 ? 0 : numerator / denominator;
  return {
    slope,
    intercept: yMean - (slope * xMean),
  };
}

function project(line: RegressionLine, index: number) {
  return line.intercept + (line.slope * index);
}

function classifyChannelType(upperSlope: number, lowerSlope: number, compression: number, avgWidth: number) {
  const slopeThreshold = Math.max(avgWidth * 0.0008, 0.00001);
  const upperFlat = Math.abs(upperSlope) <= slopeThreshold;
  const lowerFlat = Math.abs(lowerSlope) <= slopeThreshold;

  if (upperFlat && lowerFlat) return 'Horizontal';
  if (upperSlope > slopeThreshold && lowerSlope > slopeThreshold) return 'Ascending';
  if (upperSlope < -slopeThreshold && lowerSlope < -slopeThreshold) return 'Descending';
  if (upperSlope < -slopeThreshold && lowerSlope > slopeThreshold) return 'Sym Triangle';
  if (compression > 0.12 && upperFlat) return 'Ascending Triangle';
  if (compression > 0.12 && lowerFlat) return 'Descending Triangle';
  return compression > 0.08 ? 'Compression Channel' : 'Directional Channel';
}

function getSlopeCoherence(type: string, upperSlope: number, lowerSlope: number) {
  const sameDirection = Math.sign(upperSlope) === Math.sign(lowerSlope);
  if (type.includes('Triangle')) {
    return upperSlope <= 0 && lowerSlope >= 0 ? 1 : 0.55;
  }
  if (type === 'Horizontal') {
    return Math.max(0, 1 - (Math.abs(upperSlope) + Math.abs(lowerSlope)) * 10_000);
  }
  return sameDirection ? 1 : 0.5;
}

function analyzeChannel(pair: string, candles: ForexCandle[], timeframe: string): AnalyzedChannel | null {
  if (candles.length < 20) return null;

  const closes = candles.map((candle) => candle.close);
  const highs = candles.map((candle) => candle.high);
  const lows = candles.map((candle) => candle.low);
  const avgClose = mean(closes);
  const avgRange = mean(candles.map((candle) => candle.high - candle.low));
  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2] ?? latest;
  const upperLine = linearRegression(highs);
  const lowerLine = linearRegression(lows);

  const projected = candles.map((_, index) => {
    let upper = project(upperLine, index);
    let lower = project(lowerLine, index);
    if (upper <= lower) {
      const midpoint = (upper + lower) / 2;
      const padding = Math.max(avgRange * 1.1, avgClose * 0.0012);
      upper = midpoint + (padding / 2);
      lower = midpoint - (padding / 2);
    }
    return { upper, lower, width: upper - lower };
  });

  const widths = projected.map((entry) => entry.width);
  const avgWidth = mean(widths);
  if (!Number.isFinite(avgWidth) || avgWidth <= Math.max(avgClose * 0.00025, 0.00001)) {
    return null;
  }

  const latestProjection = projected[projected.length - 1];
  const tolerance = Math.max(avgWidth * 0.12, avgClose * 0.00035);
  const containment = candles.filter((candle, index) => (
    candle.high <= projected[index].upper + tolerance
    && candle.low >= projected[index].lower - tolerance
  )).length;
  const resistanceTouches = candles.filter((candle, index) => Math.abs(candle.high - projected[index].upper) <= tolerance).length;
  const supportTouches = candles.filter((candle, index) => Math.abs(candle.low - projected[index].lower) <= tolerance).length;

  const containmentPct = clamp(Math.round((containment / candles.length) * 100), 0, 100);
  const widthStability = clamp(1 - (stdDev(widths) / avgWidth), 0, 1);
  const compression = clamp((widths[0] - widths[widths.length - 1]) / widths[0], -1, 1);
  const type = classifyChannelType(upperLine.slope, lowerLine.slope, compression, avgWidth);
  const slopeCoherence = getSlopeCoherence(type, upperLine.slope, lowerLine.slope);
  const noisePenalty = clamp((stdDev(closes) / avgWidth) * 40, 0, 35);
  const touchScore = clamp(Math.round(((supportTouches + resistanceTouches) / 8) * 100), 0, 100);
  const stage: ChannelSignal['stage'] = supportTouches >= 2
    && resistanceTouches >= 2
    && containmentPct >= 68
    && widthStability >= 0.45
      ? 'Confirmed'
      : 'Developing';

  const currentPrice = latest.close;
  const support = latestProjection.lower;
  const resistance = latestProjection.upper;
  const distanceToResistance = (resistance - currentPrice) / avgWidth;
  const distanceToSupport = (currentPrice - support) / avgWidth;
  const proximityScore = clamp(Math.round((1 - Math.min(Math.abs(distanceToResistance), Math.abs(distanceToSupport))) * 100), 0, 100);
  const trendBias = determinePairBias(candles);

  let breakoutBias: ChannelSignal['breakoutBias'] = 'NEUTRAL';
  if (currentPrice >= resistance - (avgWidth * 0.18) && trendBias !== 'SHORT') breakoutBias = 'LONG';
  if (currentPrice <= support + (avgWidth * 0.18) && trendBias !== 'LONG') breakoutBias = 'SHORT';
  if (breakoutBias === 'NEUTRAL' && stage === 'Confirmed') breakoutBias = trendBias;

  const score = clamp(
    Math.round(
      (touchScore * 0.24)
      + (containmentPct * 0.24)
      + (widthStability * 100 * 0.18)
      + (slopeCoherence * 100 * 0.16)
      + (Math.max(0, 100 - noisePenalty) * 0.18)
    ),
    42,
    98
  );
  const prob = clamp(
    Math.round(
      (score * 0.5)
      + (Math.max(0, compression) * 100 * 0.22)
      + (proximityScore * 0.18)
      + ((stage === 'Confirmed' ? 92 : 62) * 0.1)
    ),
    40,
    98
  );

  const touches = `R${Math.max(0, resistanceTouches)} | S${Math.max(0, supportTouches)}`;
  const bias = breakoutBias === 'NEUTRAL' ? trendBias : breakoutBias;
  const channel: ChannelSignal = {
    pair,
    tf: timeframe,
    type,
    touches,
    score,
    bias,
    prob,
    stage,
    support,
    resistance,
    currentPrice,
    widthPct: clamp(Number(((avgWidth / avgClose) * 100).toFixed(2)), 0, 100),
    containmentPct,
    breakoutBias,
  };

  const resistanceExtension = (currentPrice - resistance) / avgWidth;
  const supportExtension = (support - currentPrice) / avgWidth;
  const direction: BreakoutSignal['dir'] = breakoutBias === 'SHORT'
    ? 'SHORT'
    : breakoutBias === 'LONG'
      ? 'LONG'
      : Math.abs(distanceToResistance) <= Math.abs(distanceToSupport)
        ? 'LONG'
        : 'SHORT';
  const boundary: BreakoutSignal['boundary'] = direction === 'LONG' ? 'RESISTANCE' : 'SUPPORT';
  const triggerPrice = boundary === 'RESISTANCE' ? resistance : support;
  const extension = boundary === 'RESISTANCE' ? resistanceExtension : supportExtension;
  const distanceToTriggerPct = Math.abs(((triggerPrice - currentPrice) / currentPrice) * 100);
  const recentReference = candles[Math.max(0, candles.length - 6)].close;
  const momentum = Math.abs((latest.close - recentReference) / recentReference);
  const triggerConfirmed = boundary === 'RESISTANCE'
    ? latest.close > resistance && previous.close <= resistance
    : latest.close < support && previous.close >= support;

  let status: BreakoutSignal['status'] = 'MONITORING';
  if (triggerConfirmed || extension > 0.08) {
    status = 'TRIGGERED';
  } else if (distanceToTriggerPct <= ((avgWidth / currentPrice) * 100 * 0.3) || breakoutBias !== 'NEUTRAL') {
    status = 'ACTIVE';
  }

  const breakoutType: BreakoutSignal['breakoutType'] = type.includes('Triangle') || compression > 0.12
    ? 'Compression Release'
    : trendBias === direction
      ? 'Continuation'
      : 'Channel Reversal';
  const conf = clamp(
    Math.round(
      (score * 0.34)
      + (Math.max(0, compression) * 100 * 0.18)
      + (clamp(Math.round(momentum * 14_000), 0, 100) * 0.14)
      + (Math.max(0, 100 - (distanceToTriggerPct * 220)) * 0.16)
      + ((status === 'TRIGGERED' ? 96 : status === 'ACTIVE' ? 78 : 58) * 0.18)
    ),
    45,
    98
  );

  const breakout: BreakoutSignal = {
    pair,
    tf: timeframe,
    dir: direction,
    conf,
    time: minutesAgo(latest.datetime),
    status,
    boundary,
    triggerPrice,
    currentPrice,
    distanceToTriggerPct: clamp(Number(distanceToTriggerPct.toFixed(3)), 0, 100),
    channelWidthPct: clamp(Number(((avgWidth / currentPrice) * 100).toFixed(2)), 0, 100),
    breakoutType,
    channelStage: stage,
  };

  return { channel, breakout };
}

function getCurrencyBiasFromScore(score: number): 'LONG' | 'SHORT' | 'NEUTRAL' {
  if (score >= 62) return 'LONG';
  if (score <= 38) return 'SHORT';
  return 'NEUTRAL';
}

function selectPairsFromCurrencyStrength(
  currencies: CurrencyStrength[],
  pairs: string[],
  maxPairs = 8
) {
  const scoreByCurrency = new Map(currencies.map((entry) => [entry.name, entry.score] as const));

  return pairs
    .map((pair) => {
      if (pair.length !== 6) return null;
      const base = pair.slice(0, 3);
      const quote = pair.slice(3);
      const baseScore = scoreByCurrency.get(base);
      const quoteScore = scoreByCurrency.get(quote);
      if (baseScore == null || quoteScore == null) return null;

      const divergence = Math.abs(baseScore - quoteScore);
      const baseBias = getCurrencyBiasFromScore(baseScore);
      const quoteBias = getCurrencyBiasFromScore(quoteScore);
      const aligned = (baseBias === 'LONG' && quoteBias === 'SHORT') || (baseBias === 'SHORT' && quoteBias === 'LONG');
      const neutralPenalty = baseBias === 'NEUTRAL' || quoteBias === 'NEUTRAL' ? 12 : 0;
      const pairScore = divergence + (aligned ? 18 : 0) - neutralPenalty;

      return {
        pair,
        pairScore,
      };
    })
    .filter((entry): entry is { pair: string; pairScore: number } => Boolean(entry))
    .sort((left, right) => right.pairScore - left.pairScore)
    .slice(0, maxPairs)
    .map((entry) => entry.pair);
}

function buildCurrencyStrengths(series: Record<string, ForexCandle[]>): CurrencyStrength[] {
  const currencies = new Map<string, number>();
  const currencyCounts = new Map<string, number>();

  for (const [pair, candles] of Object.entries(series)) {
    if (pair.length !== 6 || candles.length < 2) continue;
    const base = pair.slice(0, 3);
    const quote = pair.slice(3);
    const first = candles[0].close;
    const last = candles[candles.length - 1].close;
    const changePct = ((last - first) / first) * 100;

    currencies.set(base, (currencies.get(base) ?? 0) + changePct);
    currencies.set(quote, (currencies.get(quote) ?? 0) - changePct);
    currencyCounts.set(base, (currencyCounts.get(base) ?? 0) + 1);
    currencyCounts.set(quote, (currencyCounts.get(quote) ?? 0) + 1);
  }

  const averaged = [...currencies.entries()].map(([name, total]) => {
    const count = currencyCounts.get(name) ?? 1;
    return [name, total / count] as const;
  });

  const values = averaged.map(([, value]) => value);
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    return averaged
      .map(([name]) => ({ name, score: 50, bias: 'NEUTRAL' as const }))
      .sort((left, right) => right.score - left.score);
  }

  return averaged
    .map(([name, raw]) => ({
      name,
      score: clamp(Math.round(((raw - min) / range) * 100), 0, 100),
      bias: getCurrencyBiasFromScore(clamp(Math.round(((raw - min) / range) * 100), 0, 100)),
    }))
    .sort((left, right) => right.score - left.score);
}

const CURRENCY_STRENGTH_TIMEFRAMES: Array<{ interval: string; points: number; weight: number }> = [
  { interval: '1week', points: 52, weight: 0.5 },
  { interval: '1day', points: 90, weight: 0.3 },
  { interval: '4h', points: 90, weight: 0.2 },
];

async function buildWeightedCurrencyStrengths(
  provider: ForexMarketProvider,
  pairs: string[]
): Promise<CurrencyStrength[]> {
  const weighted = new Map<string, number>();
  const weights = new Map<string, number>();

  for (const { interval, points, weight } of CURRENCY_STRENGTH_TIMEFRAMES) {
    const tfSeries = await fetchSeries(provider, pairs, interval, points);
    const tfStrengths = buildCurrencyStrengths(tfSeries);

    for (const strength of tfStrengths) {
      weighted.set(strength.name, (weighted.get(strength.name) ?? 0) + strength.score * weight);
      weights.set(strength.name, (weights.get(strength.name) ?? 0) + weight);
    }
  }

  return [...weighted.entries()]
    .map(([name, value]) => {
      const totalWeight = weights.get(name) ?? 1;
      const score = clamp(Math.round(value / totalWeight), 0, 100);
      return {
        name,
        score,
        bias: getCurrencyBiasFromScore(score),
      };
    })
    .sort((left, right) => right.score - left.score);
}

function buildStructuredSignals(series: Record<string, ForexCandle[]>, timeframe: string) {
  const analyzed = Object.entries(series)
    .map(([pair, candles]) => analyzeChannel(pair, candles, timeframe))
    .filter((entry): entry is AnalyzedChannel => entry !== null);

  return {
    channels: analyzed
      .map((entry) => entry.channel)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6),
    breakouts: analyzed
      .map((entry) => entry.breakout)
      .sort((left, right) => right.conf - left.conf)
      .slice(0, 6),
  };
}

async function fetchSeries(provider: ForexMarketProvider, pairs: string[], interval: string, outputsize: number) {
  const entries = await Promise.all(
    pairs.map(async (pair) => {
      try {
        const candles = await provider.getCandles(pair, interval, outputsize);
        if (!candles.length) return null;
        return [pair, candles] as const;
      } catch {
        return null;
      }
    })
  );

  const validEntries = entries.filter((entry): entry is readonly [string, ForexCandle[]] => entry !== null);
  return Object.fromEntries(validEntries);
}

const CHANNEL_TIMEFRAMES: Array<{ label: string; interval: string; points: number }> = [
  { label: 'D',     interval: '1day',  points: 100 },
  { label: 'H4',    interval: '4h',    points: 60 },
  { label: 'H1',    interval: '1h',    points: 60 },
  { label: '30min', interval: '30min', points: 60 },
  { label: '15min', interval: '15min', points: 60 },
];

const BREAKOUT_TIMEFRAMES: Array<{ label: string; interval: string; points: number }> = [
  { label: 'D',     interval: '1day',  points: 100 },
  { label: 'H4',    interval: '4h',    points: 60 },
  { label: 'H1',    interval: '1h',    points: 60 },
  { label: '30min', interval: '30min', points: 60 },
  { label: '15min', interval: '15min', points: 60 },
];

function extractPrices(series: Record<string, ForexCandle[]>): Record<string, number> {
  const prices: Record<string, number> = {};
  for (const [pair, candles] of Object.entries(series)) {
    if (candles.length > 0) {
      prices[pair] = candles[candles.length - 1].close;
    }
  }
  return prices;
}

function extractPriceTimestamps(series: Record<string, ForexCandle[]>): Record<string, string> {
  const priceTimestamps: Record<string, string> = {};
  for (const [pair, candles] of Object.entries(series)) {
    if (candles.length > 0) {
      priceTimestamps[pair] = candles[candles.length - 1].datetime;
    }
  }
  return priceTimestamps;
}

async function buildMultiTfStructure(
  provider: ForexMarketProvider,
  pairs: string[]
): Promise<{ channels: ChannelSignal[]; breakouts: BreakoutSignal[] }> {
  const channels: ChannelSignal[] = [];
  const breakouts: BreakoutSignal[] = [];
  for (const { label, interval, points } of BREAKOUT_TIMEFRAMES) {
    try {
      const tfSeries = await fetchSeries(provider, pairs, interval, points);
      const structured = buildStructuredSignals(tfSeries, label);
      channels.push(...structured.channels);
      breakouts.push(...structured.breakouts);
    } catch {
      // skip this timeframe if provider fails
    }
  }
  return {
    channels: channels.sort((left, right) => right.score - left.score).slice(0, 18),
    breakouts: breakouts.sort((left, right) => right.conf - left.conf).slice(0, 12),
  };
}

function createProvider(): ForexMarketProvider {
  const providerName = getForexProviderName();
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (providerName === 'twelvedata') {
    if (apiKey) {
      return new TwelveDataForexMarketProvider(apiKey);
    }
    return new YahooFinanceForexMarketProvider();
  }

  return new YahooFinanceForexMarketProvider();
}

export class MarketDataService {
  private readonly provider = createProvider();
  private readonly refreshMs = getForexRefreshMs();
  private readonly trackedPairs = getTrackedPairs().map(normalizePair);
  private cache: SnapshotCache | null = null;
  private inflight: Promise<SnapshotCache> | null = null;
  private lastRefreshMode: 'live' | 'fallback-cache' | 'offline' = 'live';
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
      return [];
    }
  }

  async refresh() {
    if (this.inflight) return this.inflight;

    this.inflight = (async () => {
      try {
        const series = await fetchSeries(this.provider, this.trackedPairs, '1min', 30);
        if (Object.keys(series).length === 0) {
          throw new Error('No live candles returned for tracked major pairs');
        }
        const currencies = await buildWeightedCurrencyStrengths(this.provider, this.trackedPairs);
        const activePairs = selectPairsFromCurrencyStrength(currencies, this.trackedPairs, 8);
        const analysisPairs = activePairs.length > 0 ? activePairs : this.trackedPairs;
        const { channels, breakouts } = await buildMultiTfStructure(this.provider, analysisPairs);
        const snapshot: MarketSnapshot = {
          provider: this.provider.name,
          generatedAt: new Date().toISOString(),
          currencies: currencies.length > 0 ? currencies : buildCurrencyStrengths(series),
          channels,
          breakouts,
          prices: extractPrices(series),
          priceTimestamps: extractPriceTimestamps(series),
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

        const snapshot: MarketSnapshot = {
          provider: `${this.provider.name}-unavailable`,
          generatedAt: new Date().toISOString(),
          currencies: [],
          channels: [],
          breakouts: [],
          prices: {},
          priceTimestamps: {},
        };
        this.lastRefreshMode = 'offline';
        this.cache = { snapshot, chartSeries: {} };
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
