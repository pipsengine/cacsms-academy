import { FeatureSnapshot, ProbabilityEstimate } from './types';
import { runProbability } from './engine';
import { defaultConfig, AiProbabilityConfig } from './config';

export const executeProbabilityEngine = (
  snapshot: FeatureSnapshot,
  config: AiProbabilityConfig = defaultConfig
): ProbabilityEstimate => {
  return runProbability(snapshot, config);
};

export const batchProbability = (
  snapshots: FeatureSnapshot[],
  config: AiProbabilityConfig = defaultConfig
): ProbabilityEstimate[] => {
  return snapshots.map((snapshot) => runProbability(snapshot, config));
};
