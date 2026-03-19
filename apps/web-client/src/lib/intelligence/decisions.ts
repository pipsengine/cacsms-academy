import { getLiquidityOverview } from '@/lib/market/liquidity';
import { getMarketDataService } from '@/lib/market/service';
import type { BreakoutSignal, ChannelSignal, ForexCandle } from '@/lib/market/types';
import type { MarketRegime } from './types';

type DecisionHorizon = 'Daily' | 'Weekly' | 'Monthly';

type DecisionPick = {
  pair: string;
  direction: 'LONG' | 'SHORT';
  confidence: number;
  currentPrice: number;
  timeframe: string;
  tradeType: 'Breakout Continuation' | 'Compression Release' | 'Channel Reversal';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  riskPct: number;
  riskAcceptable: boolean;
  confirmations: Array<{ timeframe: string; direction: 'LONG' | 'SHORT' }>;
  regime: MarketRegime;
  conditions: {
    structureConfirmed: boolean;
    trendAligned: boolean;
    breakoutReady: boolean;
    currencyStrengthEdge: boolean;
    regimeSupportive: boolean;
    liquiditySupportive: boolean;
    riskAcceptable: boolean;
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

function getTradeType(breakout: BreakoutSignal): DecisionPick['tradeType'] {
  if (breakout.breakoutType === 'Compression Release') return 'Compression Release';
  if (breakout.breakoutType === 'Channel Reversal') return 'Channel Reversal';
  return 'Breakout Continuation';
}

function getStructureMaps(snapshot: Awaited<ReturnType<ReturnType<typeof getMarketDataService>['getSnapshot']>>) {
  const channelMap = new Map<string, ChannelSignal>();
  const breakoutMap = new Map<string, BreakoutSignal>();

  for (const channel of snapshot.channels) {
    channelMap.set(`${channel.pair}:${channel.tf}`, channel);
  }

  for (const breakout of snapshot.breakouts) {
    breakoutMap.set(`${breakout.pair}:${breakout.tf}`, breakout);
  }

  return { channelMap, breakoutMap };
}

function createTradePlan(channel: ChannelSignal, breakout: BreakoutSignal, direction: 'LONG' | 'SHORT') {
  const width = Math.max(Math.abs(channel.resistance - channel.support), channel.currentPrice * 0.0005);
  const buffer = width * 0.1;
  const entry = breakout.status === 'TRIGGERED'
    ? breakout.currentPrice
    : breakout.triggerPrice;
  const stopLoss = direction === 'LONG'
    ? channel.support - buffer
    : channel.resistance + buffer;
  const riskDistance = Math.abs(entry - stopLoss);
  const rewardMultiple = breakout.breakoutType === 'Compression Release' ? 2.2 : 1.8;
  const takeProfit = direction === 'LONG'
    ? entry + (riskDistance * rewardMultiple)
    : entry - (riskDistance * rewardMultiple);
  const riskPct = (riskDistance / entry) * 100;
  const rewardPct = (Math.abs(takeProfit - entry) / entry) * 100;
  const riskReward = rewardPct === 0 ? 0 : rewardPct / riskPct;
  const riskAcceptable = riskPct >= 0.08 && riskPct <= 1.35 && riskReward >= 1.6;

  return {
    entry,
    stopLoss,
    takeProfit,
    riskPct: clamp(Number(riskPct.toFixed(3)), 0, 100),
    riskReward: Number(riskReward.toFixed(2)),
    riskAcceptable,
  };
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
  const { channelMap, breakoutMap } = getStructureMaps(snapshot);
  const trackedPairs = [...new Set([
    ...snapshot.channels.map((entry) => entry.pair),
    ...snapshot.breakouts.map((entry) => entry.pair),
  ])].slice(0, 10);

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

      const primaryChannel = channelMap.get(`${pair}:${primaryTf}`);
      const primaryBreakout = breakoutMap.get(`${pair}:${primaryTf}`);
      if (!primaryChannel || !primaryBreakout) {
        return null;
      }

      const rawDirection = primaryChannel.breakoutBias !== 'NEUTRAL'
        ? primaryChannel.breakoutBias
        : primaryBreakout.dir;
      const direction: 'LONG' | 'SHORT' = rawDirection;

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
      const structureConfirmed = primaryChannel.stage === 'Confirmed' && primaryBreakout.channelStage === 'Confirmed';

      const breakoutProbValues = [primaryBreakout.conf];
      const confirmBreakout = breakoutMap.get(`${pair}:${confirmTf}`);
      if (confirmBreakout) breakoutProbValues.push(confirmBreakout.conf);
      const secondaryBreakout = secondaryConfirmTf ? breakoutMap.get(`${pair}:${secondaryConfirmTf}`) : undefined;
      if (secondaryBreakout) breakoutProbValues.push(secondaryBreakout.conf);
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

      const breakoutReady = (primaryBreakout.status === 'ACTIVE' || primaryBreakout.status === 'TRIGGERED')
        && breakoutProb >= 72
        && primaryBreakout.distanceToTriggerPct <= 0.45;
      const currencyStrengthEdge = currencyDiff >= 60;
      const regimeSupportive = regime === 'Trending' || regime === 'Volatility Compression';
      const tradePlan = createTradePlan(primaryChannel, primaryBreakout, direction);

      const trendScore = trendAligned ? 95 : 55;
      const structureScore = structureConfirmed ? 94 : 56;
      const regimeScore = regimeSupportive ? 90 : 52;
      const liquidityScore = liquiditySupportive ? 92 : 50;
      const riskScore = tradePlan.riskAcceptable ? 94 : 48;

      const confidence = clamp(
        Math.round(
          (structureScore * 0.22)
          + (trendScore * 0.2)
          + (breakoutProb * 0.2)
          + (currencyDiff * 0.16)
          + (momentumScore * 0.12)
          + (regimeScore * 0.08)
          + (liquidityScore * 0.08)
          + (riskScore * 0.14)
        ),
        45,
        99
      );

      const currentPrice = snapshot.prices[pair] ?? primary[primary.length - 1].close;

      const allConditionsMet = trendAligned
        && structureConfirmed
        && breakoutReady
        && currencyStrengthEdge
        && regimeSupportive
        && liquiditySupportive
        && tradePlan.riskAcceptable;

      if (!allConditionsMet || confidence < minimumConfidence) {
        return null;
      }

      return {
        pair,
        direction,
        confidence,
        currentPrice,
        timeframe,
        tradeType: getTradeType(primaryBreakout),
        entry: tradePlan.entry,
        stopLoss: tradePlan.stopLoss,
        takeProfit: tradePlan.takeProfit,
        riskReward: tradePlan.riskReward,
        riskPct: tradePlan.riskPct,
        riskAcceptable: tradePlan.riskAcceptable,
        confirmations,
        regime,
        conditions: {
          structureConfirmed,
          trendAligned,
          breakoutReady,
          currencyStrengthEdge,
          regimeSupportive,
          liquiditySupportive,
          riskAcceptable: tradePlan.riskAcceptable,
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
