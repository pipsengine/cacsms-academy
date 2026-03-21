import type { CotRecord, CotPhase, CotSignal, CotRisk, CotBias } from './types.ts';

type PartialRecord = Omit<CotRecord, 'phase' | 'signal' | 'confidence' | 'risk' | 'weeklyBias'>;

function derivePhase(record: PartialRecord): CotPhase {
  const { velocity, acceleration, net } = record;
  // Expansion: momentum is accelerating in the direction of net
  if (Math.sign(velocity) === Math.sign(net) && Math.abs(acceleration) > 0) {
    return 'Expansion';
  }
  // Distribution: previously bullish but velocity turning negative
  if (net > 0 && velocity < 0) return 'Distribution';
  // Accumulation: building up from bearish or neutral
  return 'Accumulation';
}

function deriveSignal(record: PartialRecord, phase: CotPhase): CotSignal {
  const { trend, extreme, velocity } = record;

  if (extreme) return 'Reversal Risk';

  if (phase === 'Expansion') {
    return trend === 'Bullish' ? 'Bullish Expansion' : 'Bearish Expansion';
  }

  if (phase === 'Distribution' || (phase === 'Accumulation' && Math.abs(velocity) < 1000)) {
    return 'Neutral';
  }

  return trend === 'Bullish' ? 'Bullish Expansion' : 'Bearish Expansion';
}

function deriveConfidence(record: PartialRecord, signal: CotSignal): number {
  const { percentile, zScore, extreme } = record;

  // Base confidence from percentile distance from 50
  let base = Math.abs(percentile - 50) * 2; // 0–100

  // Boost for strong z-scores
  const zBoost = Math.min(Math.abs(zScore) * 10, 20);

  // Penalty for reversal risk (uncertainty)
  const reversalPenalty = signal === 'Reversal Risk' ? 15 : 0;

  // Extreme positions reduce confidence in continuation
  const extremePenalty = extreme ? 10 : 0;

  const confidence = Math.min(100, Math.max(0, base + zBoost - reversalPenalty - extremePenalty));
  return Math.round(confidence);
}

function deriveRisk(record: PartialRecord, signal: CotSignal): CotRisk {
  const { extreme, zScore } = record;

  if (extreme || Math.abs(zScore) > 2.5 || signal === 'Reversal Risk') return 'High';
  if (Math.abs(zScore) > 1.5) return 'Medium';
  return 'Low';
}

/**
 * Apply signal engine to a partial record, returning a fully typed CotRecord.
 */
export function applySignalEngine(record: PartialRecord): CotRecord {
  const phase = derivePhase(record);
  const signal = deriveSignal(record, phase);
  const confidence = deriveConfidence(record, signal);
  const risk = deriveRisk(record, signal);
  const weeklyBias: CotBias = record.trend === 'Bullish' ? 'Long' : 'Short';

  return { ...record, phase, signal, confidence, risk, weeklyBias };
}
