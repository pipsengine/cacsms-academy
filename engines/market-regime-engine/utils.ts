import { RegimeSnapshot } from './types';

export const average = (snapshots: RegimeSnapshot[], key: 'volatility' | 'trend'): number => {
  if (!snapshots.length) return 0;
  return snapshots.reduce((sum, snap) => sum + snap[key], 0) / snapshots.length;
};
