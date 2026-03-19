export type CurrencyStrength = {
  name: string;
  score: number;
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
};

export type ChannelSignal = {
  pair: string;
  tf: string;
  type: string;
  touches: string;
  score: number;
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  prob: number;
  stage: 'Developing' | 'Confirmed';
  support: number;
  resistance: number;
  currentPrice: number;
  widthPct: number;
  containmentPct: number;
  breakoutBias: 'LONG' | 'SHORT' | 'NEUTRAL';
};

export type BreakoutSignal = {
  pair: string;
  tf: string;
  dir: 'LONG' | 'SHORT';
  conf: number;
  time: string;
  status: 'ACTIVE' | 'TRIGGERED' | 'MONITORING';
  boundary: 'SUPPORT' | 'RESISTANCE';
  triggerPrice: number;
  currentPrice: number;
  distanceToTriggerPct: number;
  channelWidthPct: number;
  breakoutType: 'Continuation' | 'Compression Release' | 'Channel Reversal';
  channelStage: 'Developing' | 'Confirmed';
};

export type ForexCandle = {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type MarketSnapshot = {
  provider: string;
  generatedAt: string;
  currencies: CurrencyStrength[];
  channels: ChannelSignal[];
  breakouts: BreakoutSignal[];
  prices: Record<string, number>;
  priceTimestamps: Record<string, string>;
};

export interface ForexMarketProvider {
  readonly name: string;
  getCandles(pair: string, interval: string, outputsize: number): Promise<ForexCandle[]>;
}
