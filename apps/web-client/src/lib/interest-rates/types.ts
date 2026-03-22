export const G8_CURRENCIES = ['AUD', 'CAD', 'CHF', 'EUR', 'GBP', 'JPY', 'NZD', 'USD'] as const;

export type G8Currency = (typeof G8_CURRENCIES)[number];
export type PolicyDirection = 'Hiking' | 'Cutting' | 'Holding';
export type PolicyCycle = 'Hiking Phase' | 'Peak / Pause' | 'Easing Phase';
export type HistoryRange = '6m' | '1y' | 'all';

export interface InterestRateRecord {
  currency: G8Currency;
  rate: number;
  date: string;
  decisionTimestamp: string;
  changeBps: number;
  previousRate?: number | null;
  forecastRate?: number | null;
  policyDirection: PolicyDirection;
  source: string;
}

export interface CurrencyRateAnalytics {
  currency: G8Currency;
  latestRate: number;
  latestChangeBps: number;
  trend: 'Uptrend' | 'Downtrend' | 'Flat';
  momentum: number;
  policyCycle: PolicyCycle;
  strengthScore: number;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface DifferentialEntry {
  base: G8Currency;
  quote: G8Currency;
  differential: number;
}

export interface InterestRateSnapshot {
  series: Record<G8Currency, InterestRateRecord[]>;
  fetchedAt: string;
  source: string;
  stale: boolean;
}
