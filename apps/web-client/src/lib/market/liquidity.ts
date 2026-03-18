import { getTrackedPairs } from './config.ts';
import { getMarketDataService } from './service.ts';
import type { ForexCandle } from './types.ts';

export type LiquiditySignal = {
  pair: string;
  timeframe: string;
  currentPrice: number;
  sessionHigh: number;
  sessionLow: number;
  rangePercent: number;
  liquidityBias: 'BUY-SIDE' | 'SELL-SIDE' | 'BALANCED';
  nearestPool: string;
  nearestPoolDistancePct: number;
  sweepState: 'SWEEPED-HIGH' | 'SWEEPED-LOW' | 'INSIDE-RANGE';
  displacementScore: number;
  compressionScore: number;
  actionLabel: string;
};

export type LiquidityOverview = {
  provider: string;
  generatedAt: string;
  signals: LiquiditySignal[];
};

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

function buildLiquiditySignal(pair: string, candles: ForexCandle[]): LiquiditySignal | null {
  if (candles.length < 10) return null;

  const latest = candles[candles.length - 1];
  const history = candles.slice(0, -1);
  const highs = history.map((candle) => candle.high);
  const lows = history.map((candle) => candle.low);
  const closes = history.map((candle) => candle.close);

  const sessionHigh = Math.max(...highs);
  const sessionLow = Math.min(...lows);
  const sessionRange = Math.max(sessionHigh - sessionLow, latest.close * 0.0001);
  const currentPrice = latest.close;
  const rangePercent = ((sessionRange / currentPrice) * 100);
  const highDistancePct = Math.abs((sessionHigh - currentPrice) / currentPrice) * 100;
  const lowDistancePct = Math.abs((currentPrice - sessionLow) / currentPrice) * 100;
  const nearestPoolDistancePct = Math.min(highDistancePct, lowDistancePct);
  const nearestPool = highDistancePct <= lowDistancePct ? 'Session High Liquidity' : 'Session Low Liquidity';

  const std = stdDev(closes);
  const compressionScore = clamp(Math.round((1 - Math.min(1, std / Math.max(sessionRange, 0.0001))) * 100), 20, 95);
  const bodySize = Math.abs(latest.close - latest.open);
  const displacementScore = clamp(Math.round((bodySize / sessionRange) * 100 * 3.2), 15, 96);

  let sweepState: LiquiditySignal['sweepState'] = 'INSIDE-RANGE';
  let liquidityBias: LiquiditySignal['liquidityBias'] = 'BALANCED';

  if (latest.high > sessionHigh && latest.close < sessionHigh) {
    sweepState = 'SWEEPED-HIGH';
    liquidityBias = 'SELL-SIDE';
  } else if (latest.low < sessionLow && latest.close > sessionLow) {
    sweepState = 'SWEEPED-LOW';
    liquidityBias = 'BUY-SIDE';
  } else if (currentPrice > mean(closes)) {
    liquidityBias = 'BUY-SIDE';
  } else if (currentPrice < mean(closes)) {
    liquidityBias = 'SELL-SIDE';
  }

  let actionLabel = 'Monitor internal range';
  if (sweepState === 'SWEEPED-HIGH') actionLabel = 'Watch bearish rejection from buy-side liquidity';
  if (sweepState === 'SWEEPED-LOW') actionLabel = 'Watch bullish reclaim from sell-side liquidity';
  if (sweepState === 'INSIDE-RANGE' && compressionScore >= 70) actionLabel = 'Compression building near liquidity edge';

  return {
    pair,
    timeframe: 'M15',
    currentPrice,
    sessionHigh,
    sessionLow,
    rangePercent: Number(rangePercent.toFixed(2)),
    liquidityBias,
    nearestPool,
    nearestPoolDistancePct: Number(nearestPoolDistancePct.toFixed(3)),
    sweepState,
    displacementScore,
    compressionScore,
    actionLabel,
  };
}

export async function getLiquidityOverview(): Promise<LiquidityOverview> {
  const service = getMarketDataService();
  const pairs = getTrackedPairs().slice(0, 10);

  const entries = await Promise.all(
    pairs.map(async (pair) => [pair, await service.getChartSeries(pair, 'M15', 40)] as const)
  );

  const signals = entries
    .map(([pair, candles]) => buildLiquiditySignal(pair, candles))
    .filter((signal): signal is LiquiditySignal => Boolean(signal))
    .sort((left, right) => {
      const leftPriority = left.sweepState === 'INSIDE-RANGE' ? 0 : 1;
      const rightPriority = right.sweepState === 'INSIDE-RANGE' ? 0 : 1;
      if (leftPriority !== rightPriority) return rightPriority - leftPriority;
      return right.displacementScore - left.displacementScore;
    })
    .slice(0, 6);

  return {
    provider: service.providerName,
    generatedAt: new Date().toISOString(),
    signals,
  };
}
