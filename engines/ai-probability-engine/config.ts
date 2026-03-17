export interface AiProbabilityConfig {
  momentumWeight: number;
  liquidityWeight: number;
  volatilityWeight: number;
  bias: number;
  smoothing: number;
}

export const defaultConfig: AiProbabilityConfig = {
  momentumWeight: 1.2,
  liquidityWeight: 0.8,
  volatilityWeight: -0.5,
  bias: 0,
  smoothing: 0.1,
};
