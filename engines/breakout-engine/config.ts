export interface BreakoutConfig {
  windowSize: number;
  strengthThreshold: number;
  volumeMultiplier: number;
}

export const defaultConfig: BreakoutConfig = {
  windowSize: 20,
  strengthThreshold: 1.5,
  volumeMultiplier: 1.2,
};
