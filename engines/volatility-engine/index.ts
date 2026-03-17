import { Bar, VolatilityResult } from './types';
import { calculateAtr } from './engine';
import { defaultConfig, VolatilityConfig } from './config';

export const runVolatilityEngine = (
  bars: Bar[],
  config: VolatilityConfig = defaultConfig
): VolatilityResult[] => calculateAtr(bars, config);
