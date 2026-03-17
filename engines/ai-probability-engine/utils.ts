import { FeatureSnapshot } from './types';

export const normalize = (value: number, range: [number, number]): number => {
  const [min, max] = range;
  if (max === min) return 0;
  return (value - min) / (max - min);
};

export const weightedSum = (
  snapshot: FeatureSnapshot,
  weights: { momentum: number; liquidity: number; volatility: number }
): number => {
  const base =
    snapshot.momentum * weights.momentum +
    snapshot.liquidity * weights.liquidity +
    snapshot.volatility * weights.volatility;
  return base;
};
