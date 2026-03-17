import { MarketSnapshot, OpportunityPacket } from './types';
import { orchestrateSnapshot } from './engine';
import { CoordinatorConfig } from './config';

export const runCoordinator = (
  snapshot: MarketSnapshot,
  config?: Partial<CoordinatorConfig>
): OpportunityPacket => orchestrateSnapshot(snapshot, config);

export * from './config';
export * from './types';
