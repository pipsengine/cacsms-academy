import { CurrencyTick, StrengthScore } from './types';
import { calculateStrength } from './engine';
import { defaultConfig, StrengthConfig } from './config';

export const runCurrencyStrengthEngine = (
  ticks: CurrencyTick[],
  config: StrengthConfig = defaultConfig
): StrengthScore[] => calculateStrength(ticks, config);
