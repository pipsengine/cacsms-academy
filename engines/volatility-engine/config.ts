export interface VolatilityConfig {
  atrWindow: number;
}

export const defaultConfig: VolatilityConfig = {
  atrWindow: 14,
};
