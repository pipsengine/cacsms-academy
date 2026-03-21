import { getLiquidityOverview } from '../market/liquidity.ts';
import { getMarketDataService } from '../market/service.ts';
import type { ForexCandle } from '../market/types.ts';
import type { AssetCorrelation, ConfidenceClass, MarketRegime, RankedOpportunity } from './types.ts';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdDev(values: number[]) {
  if (values.length === 0) return 0;
  const avg = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - avg) ** 2)));
}

function classifyConfidence(score: number): ConfidenceClass {
  if (score >= 90) return 'Institutional Signal';
  if (score >= 75) return 'High Probability';
  if (score >= 60) return 'Moderate Probability';
  return 'Weak Signal';
}

function getCorrelations(pair: string): AssetCorrelation[] {
  if (pair.includes('AUD')) return [{ asset: 'Gold', correlationScore: 0.82 }];
  if (pair.includes('CAD')) return [{ asset: 'Oil', correlationScore: 0.78 }];
  if (pair.includes('JPY')) return [{ asset: 'Bond Yields', correlationScore: -0.85 }];
  if (pair.includes('USD')) return [{ asset: 'Dollar Index (DXY)', correlationScore: 0.95 }];
  return [];
}

function getDirection(candles: ForexCandle[]): 'LONG' | 'SHORT' {
  return candles[candles.length - 1].close >= candles[0].close ? 'LONG' : 'SHORT';
}

function getRegime(candles: ForexCandle[]): MarketRegime {
  const closes = candles.map((candle) => candle.close);
  const highs = candles.map((candle) => candle.high);
  const lows = candles.map((candle) => candle.low);
  const move = Math.abs(closes[closes.length - 1] - closes[0]);
  const width = Math.max(...highs) - Math.min(...lows);
  const noise = stdDev(closes);

  if (noise < width * 0.18) return 'Volatility Compression';
  if (move > width * 0.5) return 'Trending';
  if (noise > width * 0.28) return 'Volatility Expansion';
  return 'Range Bound';
}

function getFractalAlignment(m15: ForexCandle[], h1: ForexCandle[], h4: ForexCandle[]) {
  const directionM15 = getDirection(m15);
  const directionH1 = getDirection(h1);
  const directionH4 = getDirection(h4);
  const aligned = [directionM15 === directionH1, directionH1 === directionH4, directionM15 === directionH4].filter(Boolean).length;
  return clamp(58 + aligned * 13, 55, 97);
}

function getVolatilityExpansion(candles: ForexCandle[]) {
  const ranges = candles.map((candle) => candle.high - candle.low);
  const recent = mean(ranges.slice(-5));
  const baseline = mean(ranges.slice(0, Math.max(1, ranges.length - 5)));
  if (!baseline) return 60;
  return clamp(Math.round((recent / baseline) * 45), 40, 97);
}

function getBreakoutProbability(candles: ForexCandle[]) {
  const latest = candles[candles.length - 1];
  const history = candles.slice(0, -1);
  const high = Math.max(...history.map((candle) => candle.high));
  const low = Math.min(...history.map((candle) => candle.low));
  const width = Math.max(high - low, latest.close * 0.0001);
  const extension = Math.max((latest.close - high) / width, (low - latest.close) / width, 0);
  return clamp(52 + Math.round(extension * 120), 48, 96);
}

function getCurrencyDiff(snapshot: Awaited<ReturnType<ReturnType<typeof getMarketDataService>['getSnapshot']>>, pair: string) {
  const base = pair.slice(0, 3);
  const quote = pair.slice(3);
  const baseScore = snapshot.currencies.find((entry) => entry.name === base)?.score ?? 50;
  const quoteScore = snapshot.currencies.find((entry) => entry.name === quote)?.score ?? 50;
  return clamp(Math.abs(baseScore - quoteScore), 10, 98);
}

export async function getLiveRankedOpportunities(): Promise<{ provider: string; generatedAt: string; opportunities: RankedOpportunity[] }> {
  const service = getMarketDataService();
  const snapshot = await service.getSnapshot();
  const liquidity = await getLiquidityOverview();
  const snapshotPairs = [...new Set([
    ...snapshot.channels.map((entry) => entry.pair),
    ...snapshot.breakouts.map((entry) => entry.pair),
  ])];
  const pairs = (snapshotPairs.length > 0 ? snapshotPairs : [...new Set(snapshot.channels.map((entry) => entry.pair))]).slice(0, 8);

  const opportunities = await Promise.all(
    pairs.map(async (pair) => {
      const [m15, h1, h4] = await Promise.all([
        service.getChartSeries(pair, 'M15', 40),
        service.getChartSeries(pair, 'H1', 40),
        service.getChartSeries(pair, 'H4', 40),
      ]);

      const liquiditySignal = liquidity.signals.find((entry) => entry.pair === pair);
      const fractalScore = getFractalAlignment(m15, h1, h4);
      const breakoutProb = getBreakoutProbability(m15);
      const volatilityExpansion = getVolatilityExpansion(m15);
      const currencyDiff = getCurrencyDiff(snapshot, pair);
      const channelStrength = clamp(Math.round((fractalScore + volatilityExpansion) / 2), 55, 97);
      const liquidityScore = liquiditySignal ? Math.max(liquiditySignal.displacementScore, liquiditySignal.compressionScore) : 55;
      const compositeScore = clamp(
        Math.round((channelStrength * 0.24) + (breakoutProb * 0.24) + (currencyDiff * 0.18) + (fractalScore * 0.18) + (liquidityScore * 0.16)),
        50,
        97
      );

      return {
        rank: 0,
        pair,
        direction: getDirection(m15),
        compositeScore,
        channelStrength,
        breakoutProb,
        currencyDiff,
        fractalScore,
        volatilityExpansion,
        confidenceClass: classifyConfidence(compositeScore),
        regime: getRegime(m15),
        correlations: getCorrelations(pair),
      } satisfies RankedOpportunity;
    })
  );

  const ranked = opportunities
    .sort((left, right) => right.compositeScore - left.compositeScore)
    .slice(0, 6)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    provider: service.providerName,
    generatedAt: new Date().toISOString(),
    opportunities: ranked,
  };
}
