import { OrderBook, LiquidityZone } from './types';
import { detectLiquidityZones } from './engine';
import { defaultConfig, LiquidityConfig } from './config';

export const runLiquidityEngine = (
  book: OrderBook[],
  config: LiquidityConfig = defaultConfig
): LiquidityZone[] => detectLiquidityZones(book, config);
