export interface LiquidityConfig {
  depthWindow: number;
  imbalanceThreshold: number;
}

export const defaultConfig: LiquidityConfig = {
  depthWindow: 10,
  imbalanceThreshold: 0.2,
};
