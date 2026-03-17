export interface StrengthConfig {
  smoothingFactor: number;
  baseWindow: number;
}

export const defaultConfig: StrengthConfig = {
  smoothingFactor: 0.3,
  baseWindow: 5,
};
