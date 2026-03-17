export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BreakoutSignal {
  timestamp: string;
  direction: 'LONG' | 'SHORT';
  strength: number;
  reason: string;
}
