import { Bar } from './types';

export const trueRange = (current: Bar, previous?: Bar): number => {
  if (!previous) return current.high - current.low;
  return Math.max(
    current.high - current.low,
    Math.abs(current.high - previous.close),
    Math.abs(current.low - previous.close)
  );
};
