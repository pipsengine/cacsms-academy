import { CurrencyTick } from './types';

const extractBaseCurrency = (pair: string): string => pair.slice(0, 3);

export const aggregateTicks = (ticks: CurrencyTick[]): Record<string, number> => {
  const bucket: Record<string, number> = {};
  ticks.forEach((tick) => {
    const currency = extractBaseCurrency(tick.pair);
    bucket[currency] = (bucket[currency] || 0) + tick.price;
  });
  return bucket;
};
