import { Candle } from './types';

export const average = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const rangeSpread = (candles: Candle[]): number => {
  if (!candles.length) return 0;
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  return Math.max(...highs) - Math.min(...lows);
};
