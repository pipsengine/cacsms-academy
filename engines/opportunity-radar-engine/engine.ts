import { EngineSignal, Opportunity } from './types';
import { defaultConfig, RadarConfig } from './config';
import { normalizeSignals } from './utils';

export const prioritizeOpportunities = (
  signals: EngineSignal[],
  config: RadarConfig = defaultConfig
): Opportunity[] => {
  const normalized = normalizeSignals(signals);
  return normalized
    .filter((signal) => signal.score >= config.minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, config.maxResults)
    .map((signal, index) => ({
      id: signal.id,
      priority: index + 1,
      details: `${signal.label} @ ${(signal.score * 100).toFixed(1)}% normalized strength`,
    }));
};
