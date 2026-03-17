export interface RadarConfig {
  minScore: number;
  maxResults: number;
}

export const defaultConfig: RadarConfig = {
  minScore: 0.4,
  maxResults: 5,
};
