import { OrderBook, LiquidityZone } from './types';
import { defaultConfig, LiquidityConfig } from './config';
import { calculateImbalance } from './utils';

export const detectLiquidityZones = (
  books: OrderBook[],
  config: LiquidityConfig = defaultConfig
): LiquidityZone[] => {
  const imbalance = calculateImbalance(books);
  return books
    .filter((level) => Math.abs(level.bid - level.ask) / Math.max(level.bid, level.ask, 1) > config.imbalanceThreshold)
    .slice(0, config.depthWindow)
    .map((level) => ({
      level: level.level,
      concentration: Math.max(level.bid, level.ask),
      imbalance,
    }));
};
