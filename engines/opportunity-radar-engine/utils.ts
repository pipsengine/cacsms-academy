import { EngineSignal } from './types';

export const normalizeSignals = (signals: EngineSignal[]): EngineSignal[] => {
  const maxScore = Math.max(...signals.map((signal) => signal.score), 1);
  return signals.map((signal) => ({ ...signal, score: signal.score / maxScore }));
};
