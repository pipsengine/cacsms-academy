import { Bar, VolatilityResult } from './types';
import { defaultConfig, VolatilityConfig } from './config';
import { trueRange } from './utils';

export const calculateAtr = (bars: Bar[], config: VolatilityConfig = defaultConfig): VolatilityResult[] => {
  const results: VolatilityResult[] = [];
  for (let i = 0; i < bars.length; i++) {
    const window = bars.slice(Math.max(0, i - config.atrWindow + 1), i + 1);
    const ranges = window.map((bar, index) => trueRange(bar, index > 0 ? window[index - 1] : undefined));
    const atr = ranges.reduce((sum, value) => sum + value, 0) / Math.max(ranges.length, 1);
    results.push({ timestamp: bars[i].timestamp, atr: Number(atr.toFixed(4)) });
  }
  return results;
};
