import { EngineSignal, Opportunity } from './types';
import { prioritizeOpportunities } from './engine';
import { defaultConfig, RadarConfig } from './config';

export const runOpportunityRadar = (
  signals: EngineSignal[],
  config: RadarConfig = defaultConfig
): Opportunity[] => prioritizeOpportunities(signals, config);
