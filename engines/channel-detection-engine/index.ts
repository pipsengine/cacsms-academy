import { PricePoint, Channel } from './types';
import { identifyChannel } from './engine';
import { defaultConfig, ChannelConfig } from './config';

export const runChannelEngine = (points: PricePoint[], config: ChannelConfig = defaultConfig): Channel | null =>
  identifyChannel(points, config);
