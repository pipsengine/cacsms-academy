import { PricePoint, Channel } from './types';
import { defaultConfig, ChannelConfig } from './config';
import { calculateSlope, touchesCount } from './utils';

export const identifyChannel = (
  points: PricePoint[],
  config: ChannelConfig = defaultConfig
): Channel | null => {
  if (points.length < config.minTouches) return null;

  const slope = calculateSlope(points);
  const support = Math.min(...points.map((p) => p.price));
  const resistance = Math.max(...points.map((p) => p.price));
  const validity =
    (touchesCount(points, support) + touchesCount(points, resistance)) / config.minTouches;

  if (Math.abs(slope) > config.slopeTolerance || validity < 1) return null;

  return {
    support,
    resistance,
    slope,
    validity: Math.min(1, validity),
  };
};
