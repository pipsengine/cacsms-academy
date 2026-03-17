import { Candle, BreakoutSignal } from './types';
import { defaultConfig, BreakoutConfig } from './config';
import { average, rangeSpread } from './utils';

const directionFromCandle = (candle: Candle): 'LONG' | 'SHORT' =>
  candle.close >= candle.open ? 'LONG' : 'SHORT';

export const detectBreakouts = (
  candles: Candle[],
  config: BreakoutConfig = defaultConfig
): BreakoutSignal[] => {
  if (candles.length < config.windowSize) return [];

  const latest = candles[candles.length - 1];
  const window = candles.slice(-config.windowSize);
  const avgRange = average(window.map((c) => c.high - c.low));
  const spread = rangeSpread(window);

  const breakoutStrength = spread / (avgRange || 1);
  const volumeSpike = latest.volume / (average(window.map((c) => c.volume)) || 1);

  const isBreakout = breakoutStrength >= config.strengthThreshold && volumeSpike > config.volumeMultiplier;
  if (!isBreakout) return [];

  return [
    {
      timestamp: latest.timestamp,
      direction: directionFromCandle(latest),
      strength: Number(breakoutStrength.toFixed(2)),
      reason: `Spread ${spread.toFixed(2)} exceeded average ${avgRange.toFixed(2)} with volume ${volumeSpike.toFixed(
        2
      )}`,
    },
  ];
};
