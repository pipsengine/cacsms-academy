import { RegimeSnapshot, RegimeOutput } from './types';
import { classifyRegime } from './engine';
import { defaultConfig, RegimeConfig } from './config';

export const runRegimeEngine = (
  snapshots: RegimeSnapshot[],
  config: RegimeConfig = defaultConfig
): RegimeOutput => classifyRegime(snapshots, config);
