import { getTrackedPairs } from '@/lib/market/config';
import { getLiquidityOverview } from '@/lib/market/liquidity';
import { getMarketDataService } from '@/lib/market/service';
import type { ForexCandle } from '@/lib/market/types';
import type { MarketRegime } from './types';

type DecisionHorizon = 'Daily' | 'Weekly' | 'Monthly';

type DecisionPick = {
  pair: string;
  direction: 'LONG' | 'SHORT';
  confidence: number;
  currentPrice: number;
  timeframe: string;
  confirmations: Array<{ timeframe: string; direction: 'LONG' | 'SHORT' }>;
  regime: MarketRegime;
  conditions: {
    trendAligned: boolean;
    breakoutReady: boolean;
    currencyStrengthEdge: boolean;
    regimeSupportive: boolean;
    liquiditySupportive: boolean;
  };
};

type HorizonDecision = {
  horizon: DecisionHorizon;
  timeframe: string;
  picks: DecisionPick[];
};

export type AIDecisionResponse = {
  provider: string;
  generatedAt: string;
  minimumConfidence: number;
  horizons: HorizonDecision[];
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

function getBreakoutProbability(candles: ForexCandle[]) {
  const latest = candles[candles.length - 1];
  const history = candles.slice(0, -1);
  const high = Math.max(...history.map((candle) => candle.high));
  const low = Math.min(...history.map((candle) => candle.low));
  const width = Math.max(high - low, latest.close * 0.0001);
  const extension = Math.max((latest.close - high) / width, (low - latest.close) / width, 0);
  return clamp(52 + Math.round(extension * 120), 48, 98);
}

function getCurrencyDiff(snapshot: Awaited<ReturnType<ReturnType<typeof getMarketDataService>['getSnapshot']>>, pair: string) {
  const base = pair.slice(0, 3);
  const quote = pair.slice(3);
  const baseScore = snapshot.currencies.find((entry) => entry.name === base)?.score ?? 50;
  const quoteScore = snapshot.currencies.find((entry) => entry.name === quote)?.score ?? 50;
  return clamp(Math.abs(baseScore - quoteScore), 10, 98);
}

function getMomentumScore(candles: ForexCandle[]) {
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const movePct = Math.abs((last - first) / first);
  return clamp(Math.round(50 + movePct * 5200), 40, 98);
}

async function scoreHorizon(
  horizon: DecisionHorizon,
  timeframe: string,
  primaryTf: string,
  confirmTf: string,
  points: number,
  minimumConfidence: number,
  secondaryConfirmTf?: string
): Promise<HorizonDecision> {
  const service = getMarketDataService();
  const snapshot = await service.getSnapshot();
  const liquidity = await getLiquidityOverview();
  const trackedPairs = getTrackedPairs();

  const picks = await Promise.all(
    trackedPairs.map(async (pair): Promise<DecisionPick | null> => {
      const [primary, confirm, secondaryConfirm] = await Promise.all([
        service.getChartSeries(pair, primaryTf, points),
        service.getChartSeries(pair, confirmTf, Math.max(40, Math.round(points * 0.7))),
        secondaryConfirmTf
          ? service.getChartSeries(pair, secondaryConfirmTf, Math.max(40, Math.round(points * 0.7)))
          : Promise.resolve([]),
      ]);

      if (primary.length < 12 || confirm.length < 12 || (secondaryConfirmTf && secondaryConfirm.length < 12)) {
        return null;
      }

      const direction = getDirection(primary);
      const confirmDirection = getDirection(confirm);
      const secondaryDirection = secondaryConfirm.length ? getDirection(secondaryConfirm) : direction;
      const confirmations: Array<{ timeframe: string; direction: 'LONG' | 'SHORT' }> = [
        { timeframe: primaryTf, direction },
        { timeframe: confirmTf, direction: confirmDirection },
      ];
      if (secondaryConfirmTf && secondaryConfirm.length) {
        confirmations.push({ timeframe: secondaryConfirmTf, direction: secondaryDirection });
      }
      const trendAligned = direction === confirmDirection && direction === secondaryDirection;

      const breakoutProbValues = [
        getBreakoutProbability(primary),
        getBreakoutProbability(confirm),
      ];
      if (secondaryConfirm.length) {
        breakoutProbValues.push(getBreakoutProbability(secondaryConfirm));
      }
      const breakoutProb = Math.round(mean(breakoutProbValues));
      const currencyDiff = getCurrencyDiff(snapshot, pair);
      const momentumScores = [
        getMomentumScore(primary),
        getMomentumScore(confirm),
      ];
      if (secondaryConfirm.length) {
        momentumScores.push(getMomentumScore(secondaryConfirm));
      }
      const momentumScore = Math.round(mean(momentumScores));
      const regime = getRegime(primary);

      const liquiditySignal = liquidity.signals.find((entry) => entry.pair === pair);
      const liquiditySupportive = !liquiditySignal
        || liquiditySignal.liquidityBias === 'BALANCED'
        || (direction === 'LONG' && liquiditySignal.liquidityBias === 'BUY-SIDE')
        || (direction === 'SHORT' && liquiditySignal.liquidityBias === 'SELL-SIDE');

      const breakoutReady = breakoutProb >= 75;
      const currencyStrengthEdge = currencyDiff >= 60;
      const regimeSupportive = regime === 'Trending' || regime === 'Volatility Compression';

      const trendScore = trendAligned ? 95 : 55;
      const regimeScore = regimeSupportive ? 90 : 52;
      const liquidityScore = liquiditySupportive ? 92 : 50;

      const confidence = clamp(
        Math.round(
          (trendScore * 0.24)
          + (breakoutProb * 0.24)
          + (currencyDiff * 0.2)
          + (momentumScore * 0.16)
          + (regimeScore * 0.08)
          + (liquidityScore * 0.08)
        ),
        45,
        99
      );

      const currentPrice = snapshot.prices[pair] ?? primary[primary.length - 1].close;

      const allConditionsMet = trendAligned
        && breakoutReady
        && currencyStrengthEdge
        && regimeSupportive
        && liquiditySupportive;

      if (!allConditionsMet || confidence < minimumConfidence) {
        return null;
      }

      return {
        pair,
        direction,
        confidence,
        currentPrice,
        timeframe,
        confirmations,
        regime,
        conditions: {
          trendAligned,
          breakoutReady,
          currencyStrengthEdge,
          regimeSupportive,
          liquiditySupportive,
        },
      };
    })
  );

  return {
    horizon,
    timeframe,
    picks: picks
      .filter((value): value is DecisionPick => value !== null)
      .sort((left, right) => right.confidence - left.confidence)
      .slice(0, 2),
  };
}

export async function getAIDecisionSignals(minimumConfidence = 95): Promise<AIDecisionResponse> {
  const service = getMarketDataService();

  const [daily, weekly, monthly] = await Promise.all([
    scoreHorizon('Daily', 'H1 + M30 + M15', 'H1', 'M30', 72, minimumConfidence, 'M15'),
    scoreHorizon('Weekly', 'H4', 'H4', 'D1', 72, minimumConfidence),
    scoreHorizon('Monthly', 'D1', 'D1', 'W1', 90, minimumConfidence),
  ]);

  return {
    provider: service.providerName,
    generatedAt: new Date().toISOString(),
    minimumConfidence,
    horizons: [daily, weekly, monthly],
  };
}
