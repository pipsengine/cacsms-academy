export interface Bar {
  timestamp: string;
  high: number;
  low: number;
  close: number;
}

export interface VolatilityResult {
  timestamp: string;
  atr: number;
}
