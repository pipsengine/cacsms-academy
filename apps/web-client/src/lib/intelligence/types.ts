// Module 1: Fractal Channel Alignment
export interface FractalAlignment {
  score: number; // 0-100
  classification: 'Strong Alignment' | 'Moderate Alignment' | 'Weak Alignment';
  timeframes: {
    D1: string;
    H4: string;
    H1: string;
    M30: string;
  };
}

// Module 2: Market Regime Detection
export type MarketRegime = 'Trending' | 'Range Bound' | 'Volatility Compression' | 'Volatility Expansion';

// Module 3: Volatility Cycle
export interface VolatilityState {
  state: 'Compression' | 'Expansion' | 'Normal';
  breakoutProbability: 'Elevated' | 'Normal' | 'Low';
  metrics: {
    atrCompression: number;
    stdDevContraction: number;
  };
}

// Module 5: Signal Outcome Tracking
export type OutcomeState = 'Success' | 'Failure' | 'Pending';
export interface TrackedSignal {
  id: string;
  signalTime: string;
  signalType: string;
  pair: string;
  timeframe: string;
  outcome: OutcomeState;
}

// Module 6: Cross-Asset Correlation
export interface AssetCorrelation {
  asset: string;
  correlationScore: number; // -1.0 to 1.0
}

// Module 7: AI Confidence Classification
export type ConfidenceClass = 'Institutional Signal' | 'High Probability' | 'Moderate Probability' | 'Weak Signal';

// Module 4: Opportunity Ranking (Composite)
export interface RankedOpportunity {
  rank: number;
  pair: string;
  direction: 'LONG' | 'SHORT';
  compositeScore: number;
  channelStrength: number;
  breakoutProb: number;
  currencyDiff: number;
  fractalScore: number;
  volatilityExpansion: number;
  confidenceClass: ConfidenceClass;
  regime: MarketRegime;
  correlations: AssetCorrelation[];
}
