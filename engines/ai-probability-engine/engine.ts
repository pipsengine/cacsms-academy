import { FeatureSnapshot, ProbabilityEstimate } from './types';
import { defaultConfig, AiProbabilityConfig } from './config';
import { normalize, weightedSum } from './utils';

export const runProbability = (
  snapshot: FeatureSnapshot,
  config: AiProbabilityConfig = defaultConfig
): ProbabilityEstimate => {
  const minmax = {
    momentum: [-2, 2],
    liquidity: [0, 1],
    volatility: [0, 2],
  };

  const normalizedMomentum = normalize(snapshot.momentum, minmax.momentum);
  const normalizedLiquidity = normalize(snapshot.liquidity, minmax.liquidity);
  const normalizedVolatility = normalize(snapshot.volatility, minmax.volatility);

  const score = weightedSum(snapshot, {
    momentum: config.momentumWeight * normalizedMomentum,
    liquidity: config.liquidityWeight * normalizedLiquidity,
    volatility: config.volatilityWeight * normalizedVolatility,
  });

  const logistic = 1 / (1 + Math.exp(-(score + config.bias)));
  const probability = Math.min(1, Math.max(0, logistic));
  const confidence = Math.max(0.1, 1 - config.smoothing * Math.abs(snapshot.volatility));

  return {
    timestamp: snapshot.timestamp,
    probability,
    confidence,
    reason: `Aggregated momentum ${normalizedMomentum.toFixed(2)} and liquidity ${normalizedLiquidity.toFixed(
      2
    )}`,
  };
};
