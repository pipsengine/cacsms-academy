export interface FeatureSnapshot {
  timestamp: string;
  momentum: number;
  liquidity: number;
  volatility: number;
  newsSentiment?: number;
}

export interface ProbabilityEstimate {
  timestamp: string;
  probability: number;
  confidence: number;
  reason: string;
}
