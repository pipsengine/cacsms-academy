export interface RegimeSnapshot {
  timestamp: string;
  volatility: number;
  trend: number;
}

export type MarketRegime = 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
export interface RegimeOutput {
  regime: MarketRegime;
  confidence: number;
}
