import {
  G8_CURRENCIES,
  type G8Currency,
  type InterestRateRecord,
  type PolicyDirection,
} from './types';

const DEFAULT_DATES = [
  '2024-03-01',
  '2024-06-01',
  '2024-09-01',
  '2024-12-01',
  '2025-03-01',
  '2025-06-01',
  '2025-09-01',
  '2025-12-01',
  '2026-03-01',
] as const;

const DEFAULT_SERIES_PATHS: Record<G8Currency, number[]> = {
  AUD: [4.10, 4.20, 4.35, 4.35, 4.35, 4.25, 4.20, 4.10, 4.10],
  CAD: [4.75, 5.00, 5.00, 5.00, 4.75, 4.50, 4.25, 4.00, 3.75],
  CHF: [1.75, 1.75, 1.50, 1.50, 1.25, 1.00, 1.00, 0.75, 0.50],
  EUR: [4.00, 4.25, 4.50, 4.50, 4.25, 4.00, 3.75, 3.50, 3.25],
  GBP: [5.00, 5.25, 5.25, 5.25, 5.00, 4.75, 4.50, 4.25, 4.00],
  JPY: [-0.10, -0.10, 0.00, 0.10, 0.25, 0.25, 0.25, 0.50, 0.50],
  NZD: [5.25, 5.50, 5.50, 5.50, 5.25, 5.00, 4.75, 4.50, 4.25],
  USD: [5.25, 5.50, 5.50, 5.50, 5.25, 5.25, 5.00, 4.75, 4.50],
};

function toDirection(changeBps: number): PolicyDirection {
  if (changeBps > 0) return 'Hiking';
  if (changeBps < 0) return 'Cutting';
  return 'Holding';
}

export function buildDefaultInterestRateSeries(): Record<G8Currency, InterestRateRecord[]> {
  return Object.fromEntries(
    G8_CURRENCIES.map((currency) => {
      const values = DEFAULT_SERIES_PATHS[currency];
      const rows: InterestRateRecord[] = values.map((rate, idx) => {
        const previous = idx > 0 ? values[idx - 1] : rate;
        const changeBps = Math.round((rate - previous) * 100);
        const date = DEFAULT_DATES[idx];

        return {
          currency,
          rate,
          date,
          decisionTimestamp: `${date}T10:00:00.000Z`,
          changeBps,
          policyDirection: toDirection(changeBps),
          source: 'baseline',
        };
      });

      return [currency, rows];
    })
  ) as Record<G8Currency, InterestRateRecord[]>;
}
