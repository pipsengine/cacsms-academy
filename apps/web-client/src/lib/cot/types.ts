export type CotAsset = 'AUD' | 'CAD' | 'CHF' | 'EUR' | 'GBP' | 'JPY' | 'NZD' | 'USD' | 'XAU';

export type CotTrend = 'Bullish' | 'Bearish';
export type CotPhase = 'Accumulation' | 'Distribution' | 'Expansion';
export type CotSignal = 'Bullish Expansion' | 'Bearish Expansion' | 'Reversal Risk' | 'Neutral';
export type CotRisk = 'Low' | 'Medium' | 'High';
export type CotBias = 'Long' | 'Short';

export interface RawCotRow {
  asset: CotAsset;
  date: Date;
  long: number;
  short: number;
}

export interface CotRecord {
  id?: string;
  date: Date;
  asset: CotAsset;
  long: number;
  short: number;
  net: number;
  change: number;
  zScore: number;
  percentile: number;
  velocity: number;
  acceleration: number;
  trend: CotTrend;
  extreme: boolean;
  phase: CotPhase;
  signal: CotSignal;
  confidence: number;
  risk: CotRisk;
  weeklyBias: CotBias;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Asset → CFTC market name fragment used in CSV matching */
export const CFTC_MARKET_NAMES: Record<CotAsset, string> = {
  EUR: 'EURO FX - CHICAGO MERCANTILE EXCHANGE',
  GBP: 'BRITISH POUND - CHICAGO MERCANTILE EXCHANGE',
  JPY: 'JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE',
  CHF: 'SWISS FRANC - CHICAGO MERCANTILE EXCHANGE',
  CAD: 'CANADIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE',
  AUD: 'AUSTRALIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE',
  NZD: 'NZ DOLLAR - CHICAGO MERCANTILE EXCHANGE',
  USD: 'USD INDEX - ICE FUTURES U.S.',
  XAU: 'GOLD - COMMODITY EXCHANGE INC.',
};

export const CURRENCY_ASSETS: CotAsset[] = ['AUD', 'CAD', 'CHF', 'EUR', 'GBP', 'JPY', 'NZD', 'USD'];
export const ALL_ASSETS: CotAsset[] = [...CURRENCY_ASSETS, 'XAU'];

export const CFTC_CURRENCY_URL = 'https://www.cftc.gov/dea/newcot/deafut.txt';
export const CFTC_DISAGG_URL = 'https://www.cftc.gov/dea/newcot/f_disagg.txt';
