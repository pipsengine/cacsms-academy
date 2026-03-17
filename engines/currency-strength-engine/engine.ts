import { CurrencyTick, StrengthScore } from './types';
import { aggregateTicks } from './utils';
import { defaultConfig, StrengthConfig } from './config';

export const calculateStrength = (
  ticks: CurrencyTick[],
  config: StrengthConfig = defaultConfig
): StrengthScore[] => {
  const totals = aggregateTicks(ticks);
  const entries = Object.entries(totals);
  const maxValue = Math.max(...entries.map(([, value]) => value), 1);

  const ranked = entries
    .map(([currency, value]) => ({
      currency,
      strength: Number(((value / maxValue) * (1 - config.smoothingFactor)).toFixed(2)),
      rank: 0,
    }))
    .sort((a, b) => b.strength - a.strength)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return ranked;
};
