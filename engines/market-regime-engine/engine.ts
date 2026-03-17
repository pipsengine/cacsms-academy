import { RegimeSnapshot, RegimeOutput, MarketRegime } from './types';
import { defaultConfig, RegimeConfig } from './config';
import { average } from './utils';

const determineRegime = (snapshot: RegimeSnapshot, config: RegimeConfig): MarketRegime => {
  if (snapshot.volatility > config.volatilityThreshold && snapshot.trend > config.trendThreshold) {
    return 'BULLISH';
  }
  if (snapshot.volatility > config.volatilityThreshold && snapshot.trend < -config.trendThreshold) {
    return 'BEARISH';
  }
  return 'SIDEWAYS';
};

export const classifyRegime = (
  snapshot: RegimeSnapshot[],
  config: RegimeConfig = defaultConfig
): RegimeOutput => {
  const avgVolatility = average(snapshot, 'volatility');
  const avgTrend = average(snapshot, 'trend');
  const regime = determineRegime(
    { timestamp: snapshot[snapshot.length - 1]?.timestamp || new Date().toISOString(), volatility: avgVolatility, trend: avgTrend },
    config
  );
  return { regime, confidence: Math.min(1, Math.max(0, 1 - Math.abs(avgTrend) * 0.1)) };
};
