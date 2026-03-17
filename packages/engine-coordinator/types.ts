import { FeatureSnapshot, ProbabilityEstimate } from '../../engines/ai-probability-engine/types';
import { Candle } from '../../engines/breakout-engine/types';
import { PricePoint } from '../../engines/channel-detection-engine/types';
import { CurrencyTick } from '../../engines/currency-strength-engine/types';
import { OrderBook } from '../../engines/liquidity-intelligence-engine/types';
import { RegimeSnapshot } from '../../engines/market-regime-engine/types';
import { EngineSignal } from '../../engines/opportunity-radar-engine/types';
import { Bar } from '../../engines/volatility-engine/types';

export interface MarketSnapshot {
  snapshotId: string;
  probability: FeatureSnapshot;
  candles: Candle[];
  pricePoints: PricePoint[];
  currencyTicks: CurrencyTick[];
  orderBook: OrderBook[];
  regime: RegimeSnapshot[];
  volatilityBars: Bar[];
  signalPool: EngineSignal[];
}

export interface OpportunityPacket {
  timestamp: string;
  probability: ProbabilityEstimate;
  volatility: number;
  liquidityZones: { level: number; imbalance: number }[];
  regime: string;
  opportunities: { id: string; priority: number; reason: string }[];
  meta: string[];
}

export interface CoordinatorEvent {
  type: 'snapshot' | 'opportunity';
  payload: OpportunityPacket;
}

export type CoordinatorOutput = OpportunityPacket;
