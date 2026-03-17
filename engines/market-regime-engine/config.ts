export interface RegimeConfig {
  volatilityThreshold: number;
  trendThreshold: number;
}

export const defaultConfig: RegimeConfig = {
  volatilityThreshold: 1.3,
  trendThreshold: 0.5,
};
