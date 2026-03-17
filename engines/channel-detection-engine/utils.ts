import { PricePoint } from './types';

export const calculateSlope = (points: PricePoint[]): number => {
  const n = points.length;
  if (n < 2) return 0;
  const xAvg = (n - 1) / 2;
  const yAvg = points.reduce((sum, p) => sum + p.price, 0) / n;
  const numerator = points.reduce((sum, { price }, index) => sum + (index - xAvg) * (price - yAvg), 0);
  const denominator = points.reduce((sum, _, index) => sum + Math.pow(index - xAvg, 2), 0);
  return denominator === 0 ? 0 : numerator / denominator;
};

export const touchesCount = (points: PricePoint[], level: number): number =>
  points.filter((point) => Math.abs(point.price - level) < 0.01 * level).length;
