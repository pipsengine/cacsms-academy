export interface ChannelConfig {
  minTouches: number;
  maxNoise: number;
  slopeTolerance: number;
}

export const defaultConfig: ChannelConfig = {
  minTouches: 3,
  maxNoise: 0.5,
  slopeTolerance: 0.01,
};
