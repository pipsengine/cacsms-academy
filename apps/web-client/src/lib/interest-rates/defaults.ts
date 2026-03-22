import {
  G8_CURRENCIES,
  type G8Currency,
  type InterestRateRecord,
  type PolicyDirection,
} from './types.ts';

export const INTEREST_RATE_BASELINE_VERSION = 12;

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
  AUD: [4.35, 4.35, 4.35, 4.35, 4.10, 3.85, 3.60, 3.60, 4.10],
  CAD: [4.75, 5.00, 5.00, 5.00, 4.75, 4.50, 4.25, 4.00, 3.75],
  CHF: [1.75, 1.75, 1.50, 1.50, 1.25, 1.00, 1.00, 0.75, 0.50],
  EUR: [4.00, 4.25, 4.50, 4.50, 4.25, 4.00, 3.75, 3.50, 3.25],
  GBP: [5.00, 5.25, 5.25, 5.25, 5.00, 4.75, 4.50, 4.25, 4.00],
  JPY: [-0.10, -0.10, 0.00, 0.10, 0.25, 0.25, 0.25, 0.50, 0.50],
  NZD: [5.25, 5.50, 5.50, 5.50, 5.25, 5.00, 4.75, 4.50, 4.25],
  USD: [5.25, 5.50, 5.50, 5.50, 5.25, 5.25, 5.00, 4.75, 4.50],
};

const CURATED_SERIES: Partial<Record<G8Currency, Array<{ date: string; time?: string; rate: number; forecastRate?: number | null; previousRate?: number | null }>>> = {
  // RBA – Reserve Bank of Australia (target cash rate)
  AUD: [
    { date: '2023-11-07', time: '04:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.10 },
    { date: '2023-12-05', time: '04:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.35 },
    { date: '2024-02-06', time: '04:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.35 },
    { date: '2024-03-19', time: '04:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.35 },
    { date: '2024-05-07', time: '05:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.35 },
    { date: '2024-06-18', time: '05:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.35 },
    { date: '2024-08-06', time: '05:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.35 },
    { date: '2024-09-24', time: '05:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.35 },
    { date: '2024-11-05', time: '04:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.35 },
    { date: '2024-12-10', time: '04:30:00', rate: 4.35, forecastRate: 4.35, previousRate: 4.35 },
    { date: '2025-02-18', time: '04:30:00', rate: 4.10, forecastRate: 4.10, previousRate: 4.35 },
    { date: '2025-04-01', time: '04:30:00', rate: 4.10, forecastRate: 4.10, previousRate: 4.10 },
    { date: '2025-05-20', time: '05:30:00', rate: 3.85, forecastRate: 3.85, previousRate: 4.10 },
    { date: '2025-07-08', time: '05:30:00', rate: 3.85, forecastRate: 3.60, previousRate: 3.85 },
    { date: '2025-08-12', time: '05:30:00', rate: 3.60, forecastRate: 3.60, previousRate: 3.85 },
    { date: '2025-09-30', time: '05:30:00', rate: 3.60, forecastRate: 3.60, previousRate: 3.60 },
    { date: '2025-11-04', time: '04:30:00', rate: 3.60, forecastRate: 3.60, previousRate: 3.60 },
    { date: '2025-12-09', time: '04:30:00', rate: 3.60, forecastRate: 3.60, previousRate: 3.60 },
    { date: '2026-02-03', time: '04:30:00', rate: 3.85, forecastRate: 3.85, previousRate: 3.60 },
    { date: '2026-03-17', time: '04:30:00', rate: 4.10, forecastRate: 4.10, previousRate: 3.85 },
  ],
  // BoC – Bank of Canada (overnight rate target)
  CAD: [
    { date: '2022-09-07', time: '15:00:00', rate: 3.25, forecastRate: 3.25, previousRate: 2.50 },
    { date: '2022-10-26', time: '15:00:00', rate: 3.75, forecastRate: 4.00, previousRate: 3.25 },
    { date: '2022-12-07', time: '16:00:00', rate: 4.25, forecastRate: 4.25, previousRate: 3.75 },
    { date: '2023-01-25', time: '16:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.25 },
    { date: '2023-03-08', time: '16:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2023-04-12', time: '15:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2023-06-07', time: '15:00:00', rate: 4.75, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2023-07-12', time: '15:00:00', rate: 5.00, forecastRate: 5.00, previousRate: 4.75 },
    { date: '2023-09-06', time: '15:00:00', rate: 5.00, forecastRate: 5.00, previousRate: 5.00 },
    { date: '2023-10-25', time: '15:00:00', rate: 5.00, forecastRate: 5.00, previousRate: 5.00 },
    { date: '2023-12-06', time: '16:00:00', rate: 5.00, forecastRate: 5.00, previousRate: 5.00 },
    { date: '2024-01-24', time: '15:45:00', rate: 5.00, forecastRate: 5.00, previousRate: 5.00 },
    { date: '2024-03-06', time: '15:45:00', rate: 5.00, forecastRate: 5.00, previousRate: 5.00 },
    { date: '2024-04-10', time: '14:45:00', rate: 5.00, forecastRate: 5.00, previousRate: 5.00 },
    { date: '2024-06-05', time: '14:45:00', rate: 4.75, forecastRate: 4.75, previousRate: 5.00 },
    { date: '2024-07-24', time: '14:45:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.75 },
    { date: '2024-09-04', time: '14:45:00', rate: 4.25, forecastRate: 4.25, previousRate: 4.50 },
    { date: '2024-10-23', time: '14:45:00', rate: 3.75, forecastRate: 3.75, previousRate: 4.25 },
    { date: '2024-12-11', time: '15:45:00', rate: 3.25, forecastRate: 3.25, previousRate: 3.75 },
    { date: '2025-01-29', time: '15:45:00', rate: 3.00, forecastRate: 3.00, previousRate: 3.25 },
    { date: '2025-03-12', time: '14:45:00', rate: 2.75, forecastRate: 2.75, previousRate: 3.00 },
    { date: '2025-04-16', time: '14:45:00', rate: 2.75, forecastRate: 2.75, previousRate: 2.75 },
    { date: '2025-06-04', time: '14:45:00', rate: 2.75, forecastRate: 2.75, previousRate: 2.75 },
    { date: '2025-07-30', time: '14:45:00', rate: 2.75, forecastRate: 2.75, previousRate: 2.75 },
    { date: '2025-09-17', time: '14:45:00', rate: 2.50, forecastRate: 2.50, previousRate: 2.75 },
    { date: '2025-10-29', time: '14:45:00', rate: 2.25, forecastRate: 2.25, previousRate: 2.50 },
    { date: '2025-12-10', time: '15:45:00', rate: 2.25, forecastRate: 2.25, previousRate: 2.25 },
    { date: '2026-01-28', time: '15:45:00', rate: 2.25, forecastRate: 2.25, previousRate: 2.25 },
    { date: '2026-03-18', time: '14:45:00', rate: 2.25, forecastRate: 2.25, previousRate: 2.25 },
  ],
  // SNB – Swiss National Bank (policy rate; quarterly meetings)
  CHF: [
    { date: '2021-06-17', time: '08:30:00', rate: -0.75, forecastRate: null, previousRate: -0.75 },
    { date: '2021-09-23', time: '08:30:00', rate: -0.75, forecastRate: -0.75, previousRate: -0.75 },
    { date: '2021-12-16', time: '09:30:00', rate: -0.75, forecastRate: -0.75, previousRate: -0.75 },
    { date: '2022-03-24', time: '09:30:00', rate: -0.75, forecastRate: -0.75, previousRate: -0.75 },
    { date: '2022-06-16', time: '08:30:00', rate: -0.25, forecastRate: -0.75, previousRate: -0.75 },
    { date: '2022-09-22', time: '08:30:00', rate: 0.50, forecastRate: 0.50, previousRate: -0.25 },
    { date: '2022-12-15', time: '09:30:00', rate: 1.00, forecastRate: 1.00, previousRate: 0.50 },
    { date: '2023-03-23', time: '09:30:00', rate: 1.50, forecastRate: 1.50, previousRate: 1.00 },
    { date: '2023-06-22', time: '08:30:00', rate: 1.75, forecastRate: 1.75, previousRate: 1.50 },
    { date: '2023-09-21', time: '08:30:00', rate: 1.75, forecastRate: 2.00, previousRate: 1.75 },
    { date: '2023-12-14', time: '09:30:00', rate: 1.75, forecastRate: 1.75, previousRate: 1.75 },
    { date: '2024-03-21', time: '09:30:00', rate: 1.50, forecastRate: 1.75, previousRate: 1.75 },
    { date: '2024-06-20', time: '08:30:00', rate: 1.25, forecastRate: 1.50, previousRate: 1.50 },
    { date: '2024-09-26', time: '08:30:00', rate: 1.00, forecastRate: 1.00, previousRate: 1.25 },
    { date: '2024-12-12', time: '09:30:00', rate: 0.50, forecastRate: 0.75, previousRate: 1.00 },
    { date: '2025-03-20', time: '09:30:00', rate: 0.25, forecastRate: 0.25, previousRate: 0.50 },
    { date: '2025-06-19', time: '08:30:00', rate: 0.00, forecastRate: 0.00, previousRate: 0.25 },
    { date: '2025-09-25', time: '08:30:00', rate: 0.00, forecastRate: 0.00, previousRate: 0.00 },
    { date: '2025-12-11', time: '09:30:00', rate: 0.00, forecastRate: 0.00, previousRate: 0.00 },
    { date: '2026-03-19', time: '09:30:00', rate: 0.00, forecastRate: 0.00, previousRate: 0.00 },
  ],
  // ECB – European Central Bank (deposit facility rate)
  EUR: [
    { date: '2023-10-26', time: '13:15:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2023-12-14', time: '14:15:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2024-01-25', time: '14:15:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2024-03-07', time: '14:15:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2024-04-11', time: '13:15:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2024-06-06', time: '13:15:00', rate: 4.25, forecastRate: 4.25, previousRate: 4.50 },
    { date: '2024-07-18', time: '13:15:00', rate: 4.25, forecastRate: 4.25, previousRate: 4.25 },
    { date: '2024-09-12', time: '13:15:00', rate: 3.65, forecastRate: 3.65, previousRate: 4.25 },
    { date: '2024-10-17', time: '13:15:00', rate: 3.40, forecastRate: 3.40, previousRate: 3.65 },
    { date: '2024-12-12', time: '14:15:00', rate: 3.15, forecastRate: 3.15, previousRate: 3.40 },
    { date: '2025-01-30', time: '14:15:00', rate: 2.90, forecastRate: 2.90, previousRate: 3.15 },
    { date: '2025-03-06', time: '14:15:00', rate: 2.65, forecastRate: 2.65, previousRate: 2.90 },
    { date: '2025-04-17', time: '13:15:00', rate: 2.40, forecastRate: 2.40, previousRate: 2.65 },
    { date: '2025-06-05', time: '13:15:00', rate: 2.15, forecastRate: 2.15, previousRate: 2.40 },
    { date: '2025-07-24', time: '13:15:00', rate: 2.15, forecastRate: 2.15, previousRate: 2.15 },
    { date: '2025-09-11', time: '13:15:00', rate: 2.15, forecastRate: 2.15, previousRate: 2.15 },
    { date: '2025-10-30', time: '14:15:00', rate: 2.15, forecastRate: 2.15, previousRate: 2.15 },
    { date: '2025-12-18', time: '14:15:00', rate: 2.15, forecastRate: 2.15, previousRate: 2.15 },
    { date: '2026-02-05', time: '14:15:00', rate: 2.15, forecastRate: 2.15, previousRate: 2.15 },
    { date: '2026-03-19', time: '14:15:00', rate: 2.15, forecastRate: 2.15, previousRate: 2.15 },
  ],
  // BoE – Bank of England (bank rate)
  GBP: [
    { date: '2023-11-02', time: '13:00:00', rate: 5.25, forecastRate: 5.25, previousRate: 5.25 },
    { date: '2023-12-14', time: '13:00:00', rate: 5.25, forecastRate: 5.25, previousRate: 5.25 },
    { date: '2024-02-01', time: '13:00:00', rate: 5.25, forecastRate: 5.25, previousRate: 5.25 },
    { date: '2024-03-21', time: '13:00:00', rate: 5.25, forecastRate: 5.25, previousRate: 5.25 },
    { date: '2024-05-09', time: '12:00:00', rate: 5.25, forecastRate: 5.25, previousRate: 5.25 },
    { date: '2024-06-20', time: '12:00:00', rate: 5.25, forecastRate: 5.25, previousRate: 5.25 },
    { date: '2024-08-01', time: '12:00:00', rate: 5.00, forecastRate: 5.00, previousRate: 5.25 },
    { date: '2024-09-19', time: '12:00:00', rate: 5.00, forecastRate: 5.00, previousRate: 5.00 },
    { date: '2024-11-07', time: '13:00:00', rate: 4.75, forecastRate: 4.75, previousRate: 5.00 },
    { date: '2024-12-19', time: '13:00:00', rate: 4.75, forecastRate: 4.75, previousRate: 4.75 },
    { date: '2025-02-06', time: '13:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.75 },
    { date: '2025-03-20', time: '13:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2025-05-08', time: '12:02:00', rate: 4.25, forecastRate: 4.25, previousRate: 4.50 },
    { date: '2025-06-19', time: '12:00:00', rate: 4.25, forecastRate: 4.25, previousRate: 4.25 },
    { date: '2025-08-07', time: '12:00:00', rate: 4.00, forecastRate: 4.00, previousRate: 4.25 },
    { date: '2025-09-18', time: '12:00:00', rate: 4.00, forecastRate: 4.00, previousRate: 4.00 },
    { date: '2025-11-06', time: '13:00:00', rate: 4.00, forecastRate: 4.00, previousRate: 4.00 },
    { date: '2025-12-18', time: '13:00:00', rate: 3.75, forecastRate: 3.75, previousRate: 4.00 },
    { date: '2026-02-05', time: '13:00:00', rate: 3.75, forecastRate: 3.75, previousRate: 3.75 },
    { date: '2026-03-19', time: '13:00:00', rate: 3.75, forecastRate: 3.75, previousRate: 3.75 },
  ],
  // BoJ – Bank of Japan (uncollateralised overnight call rate)
  JPY: [
    { date: '2023-10-31', time: '04:30:00', rate: -0.10, forecastRate: -0.10, previousRate: -0.10 },
    { date: '2023-12-19', time: '03:49:00', rate: -0.10, forecastRate: -0.10, previousRate: -0.10 },
    { date: '2024-01-23', time: '04:00:00', rate: -0.10, forecastRate: -0.10, previousRate: -0.10 },
    { date: '2024-03-19', time: '04:35:00', rate: 0.10, forecastRate: 0.10, previousRate: -0.10 },
    { date: '2024-04-26', time: '04:00:00', rate: 0.10, forecastRate: 0.10, previousRate: 0.10 },
    { date: '2024-06-14', time: '04:25:00', rate: 0.10, forecastRate: 0.10, previousRate: 0.10 },
    { date: '2024-07-31', time: '05:00:00', rate: 0.25, forecastRate: 0.10, previousRate: 0.10 },
    { date: '2024-09-20', time: '04:00:00', rate: 0.25, forecastRate: 0.25, previousRate: 0.25 },
    { date: '2024-10-31', time: '04:00:00', rate: 0.25, forecastRate: 0.25, previousRate: 0.25 },
    { date: '2024-12-19', time: '03:55:00', rate: 0.25, forecastRate: 0.25, previousRate: 0.25 },
    { date: '2025-01-24', time: '04:20:00', rate: 0.50, forecastRate: 0.50, previousRate: 0.25 },
    { date: '2025-03-19', time: '03:30:00', rate: 0.50, forecastRate: 0.50, previousRate: 0.50 },
    { date: '2025-05-01', time: '04:00:00', rate: 0.50, forecastRate: 0.50, previousRate: 0.50 },
    { date: '2025-06-17', time: '04:00:00', rate: 0.50, forecastRate: 0.50, previousRate: 0.50 },
    { date: '2025-07-31', time: '04:00:00', rate: 0.50, forecastRate: 0.50, previousRate: 0.50 },
    { date: '2025-09-19', time: '04:00:00', rate: 0.50, forecastRate: 0.50, previousRate: 0.50 },
    { date: '2025-10-30', time: '04:00:00', rate: 0.50, forecastRate: 0.50, previousRate: 0.50 },
    { date: '2025-12-19', time: '04:00:00', rate: 0.75, forecastRate: 0.75, previousRate: 0.50 },
    { date: '2026-01-23', time: '04:00:00', rate: 0.75, forecastRate: 0.75, previousRate: 0.75 },
    { date: '2026-03-19', time: '03:30:00', rate: 0.75, forecastRate: 0.75, previousRate: 0.75 },
  ],
  // RBNZ – Reserve Bank of New Zealand (official cash rate)
  NZD: [
    { date: '2023-05-24', time: '03:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.25 },
    { date: '2023-07-12', time: '03:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2023-08-16', time: '03:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2023-10-04', time: '02:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2023-11-29', time: '02:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-02-28', time: '02:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-04-10', time: '03:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-05-22', time: '03:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-07-10', time: '03:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-08-14', time: '03:00:00', rate: 5.25, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-10-09', time: '02:00:00', rate: 4.75, forecastRate: 4.75, previousRate: 5.25 },
    { date: '2024-11-27', time: '02:00:00', rate: 4.25, forecastRate: 4.25, previousRate: 4.75 },
    { date: '2025-02-19', time: '02:00:00', rate: 3.75, forecastRate: 3.75, previousRate: 4.25 },
    { date: '2025-04-09', time: '03:00:00', rate: 3.50, forecastRate: 3.50, previousRate: 3.75 },
    { date: '2025-05-28', time: '03:00:00', rate: 3.25, forecastRate: 3.25, previousRate: 3.50 },
    { date: '2025-07-09', time: '03:00:00', rate: 3.25, forecastRate: 3.25, previousRate: 3.25 },
    { date: '2025-08-20', time: '03:00:00', rate: 3.00, forecastRate: 3.00, previousRate: 3.25 },
    { date: '2025-10-08', time: '02:00:00', rate: 2.50, forecastRate: 2.75, previousRate: 3.00 },
    { date: '2025-11-26', time: '02:00:00', rate: 2.25, forecastRate: 2.25, previousRate: 2.50 },
    { date: '2026-02-18', time: '02:00:00', rate: 2.25, forecastRate: 2.25, previousRate: 2.25 },
  ],
  // Fed – US Federal Reserve (upper bound of fed funds target range)
  USD: [
    { date: '2023-02-01', time: '20:00:00', rate: 4.75, forecastRate: 4.75, previousRate: 4.50 },
    { date: '2023-03-22', time: '19:00:00', rate: 5.00, forecastRate: 5.00, previousRate: 4.75 },
    { date: '2023-05-03', time: '19:00:00', rate: 5.25, forecastRate: 5.25, previousRate: 5.00 },
    { date: '2023-06-14', time: '19:00:00', rate: 5.25, forecastRate: 5.25, previousRate: 5.25 },
    { date: '2023-07-26', time: '19:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.25 },
    { date: '2023-09-20', time: '19:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2023-11-01', time: '19:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2023-12-13', time: '20:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-01-31', time: '20:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-03-20', time: '19:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-05-01', time: '19:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-06-12', time: '19:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-07-31', time: '19:00:00', rate: 5.50, forecastRate: 5.50, previousRate: 5.50 },
    { date: '2024-09-18', time: '19:00:00', rate: 5.00, forecastRate: 5.25, previousRate: 5.50 },
    { date: '2024-11-07', time: '20:00:00', rate: 4.75, forecastRate: 4.75, previousRate: 5.00 },
    { date: '2024-12-18', time: '20:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.75 },
    { date: '2025-01-29', time: '20:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2025-03-19', time: '19:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2025-05-07', time: '19:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2025-06-18', time: '19:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2025-07-30', time: '19:00:00', rate: 4.50, forecastRate: 4.50, previousRate: 4.50 },
    { date: '2025-09-17', time: '19:00:00', rate: 4.25, forecastRate: 4.25, previousRate: 4.50 },
    { date: '2025-10-29', time: '19:00:00', rate: 4.00, forecastRate: 4.00, previousRate: 4.25 },
    { date: '2025-12-10', time: '20:00:00', rate: 3.75, forecastRate: 3.75, previousRate: 4.00 },
    { date: '2026-01-28', time: '20:00:00', rate: 3.75, forecastRate: 3.75, previousRate: 3.75 },
    { date: '2026-03-18', time: '19:00:00', rate: 3.75, forecastRate: 3.75, previousRate: 3.75 },
  ],
};

function toDirection(changeBps: number): PolicyDirection {
  if (changeBps > 0) return 'Hiking';
  if (changeBps < 0) return 'Cutting';
  return 'Holding';
}

export function buildDefaultInterestRateSeries(): Record<G8Currency, InterestRateRecord[]> {
  return Object.fromEntries(
    G8_CURRENCIES.map((currency) => {
      const curated = CURATED_SERIES[currency];
      if (curated?.length) {
        const rows: InterestRateRecord[] = curated.map((entry, idx) => {
          const previous = idx > 0 ? curated[idx - 1].rate : entry.rate;
          const previousForChange = entry.previousRate ?? previous;
          const changeBps = Math.round((entry.rate - previousForChange) * 100);

          return {
            currency,
            rate: entry.rate,
            date: entry.date,
            decisionTimestamp: `${entry.date}T${entry.time ?? '10:00:00'}.000Z`,
            changeBps,
            previousRate: previousForChange,
            forecastRate: entry.forecastRate ?? null,
            policyDirection: toDirection(changeBps),
            source: 'curated-baseline',
          };
        });

        return [currency, rows];
      }

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
          previousRate: previous,
          forecastRate: null,
          policyDirection: toDirection(changeBps),
          source: 'baseline',
        };
      });

      return [currency, rows];
    })
  ) as Record<G8Currency, InterestRateRecord[]>;
}
