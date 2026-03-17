import { Candle } from './types';
import { detectBreakouts } from './engine';
import { defaultConfig, BreakoutConfig } from './config';

export const runBreakoutEngine = (
  candles: Candle[],
  config: BreakoutConfig = defaultConfig
) => detectBreakouts(candles, config);
