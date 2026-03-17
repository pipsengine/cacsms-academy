import { defaultConfig as defaultProbabilityConfig } from '../../engines/ai-probability-engine/config';
import { runProbabilityEngine } from '../../engines/ai-probability-engine/index';
import { runBreakoutEngine } from '../../engines/breakout-engine/index';
import { runChannelEngine } from '../../engines/channel-detection-engine/index';
import { runCurrencyStrengthEngine } from '../../engines/currency-strength-engine/index';
import { runLiquidityEngine } from '../../engines/liquidity-intelligence-engine/index';
import { runRegimeEngine } from '../../engines/market-regime-engine/index';
import { runOpportunityRadar } from '../../engines/opportunity-radar-engine/index';
import { runVolatilityEngine } from '../../engines/volatility-engine/index';
import {
  MarketSnapshot,
  OpportunityPacket,
} from './types';
import {
  CoordinatorConfig,
  defaultCoordinatorConfig,
  coordinatorConfigSchema,
} from './config';

const buildSignals = (snapshot: MarketSnapshot) => {
  const breakoutSignals = runBreakoutEngine(snapshot.candles);
  const baseSignals = breakoutSignals.map((signal) => ({
    id: signal.timestamp,
    score: signal.strength / 2,
    label: Breakout ,
  }));
  baseSignals.push({
    id: snapshot.snapshotId,
    score: snapshot.probability.probability,
    label: 'Probability Engine',
  });
  if (snapshot.currencyTicks.length) {
    baseSignals.push({
      id: snapshot.currencyTicks[0].pair,
      score: Math.min(1, snapshot.currencyTicks[0].price / 100),
      label: 'Currency Strength Pulse',
    });
  }
  return baseSignals;
};

export const orchestrateSnapshot = (
  snapshot: MarketSnapshot,
  config: Partial<CoordinatorConfig> = {}
): OpportunityPacket => {
  const validatedConfig = coordinatorConfigSchema.parse({
    ...defaultCoordinatorConfig,
    ...config,
  });

  const probability = runProbabilityEngine(snapshot.probability, {
    ...defaultProbabilityConfig,
    smoothing: validatedConfig.probability.smoothing,
  });

  const volatilityResults = runVolatilityEngine(snapshot.volatilityBars);
  const regime = runRegimeEngine(snapshot.regime);
  const liquidityZones = runLiquidityEngine(snapshot.orderBook);
  const channel = runChannelEngine(snapshot.pricePoints);
  const assetSignals = runOpportunityRadar(buildSignals(snapshot), {
    minScore: validatedConfig.opportunity.minScore,
    maxResults: validatedConfig.opportunity.maxResults,
  });

  const reasons = [
    Probability  confidence ,
    channel ? Channel detected with slope  : 'No channel detected',
    Regime ,
  ];

  return {
    timestamp: snapshot.snapshotId,
    probability,
    volatility: volatilityResults.at(-1)?.atr || 0,
    liquidityZones: liquidityZones.map((zone) => ({
      level: zone.level,
      imbalance: zone.imbalance,
    })),
    regime: regime.regime,
    opportunities: assetSignals.map((opportunity) => ({
      ...opportunity,
      reason: opportunity.details,
    })),
    meta: reasons,
  };
};
