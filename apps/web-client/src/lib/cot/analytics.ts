import { RawCotRow, CotRecord, CotAsset } from './types';

const ROLLING_WINDOW = 52;

interface BaseMetrics {
  net: number;
  change: number;
  velocity: number;
  acceleration: number;
  zScore: number;
  percentile: number;
  extreme: boolean;
}

function stdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function percentileRank(sortedValues: number[], value: number): number {
  if (sortedValues.length === 0) return 50;
  let count = 0;
  for (const v of sortedValues) {
    if (v <= value) count++;
  }
  return Math.round((count / sortedValues.length) * 100);
}

/**
 * Compute all derived metrics for a sorted (oldest→newest) list of raw rows per asset.
 * Returns an array of partial CotRecord objects (no signal/confidence/risk/phase yet).
 */
export function computeMetrics(
  asset: CotAsset,
  sortedRows: RawCotRow[]
): Omit<CotRecord, 'phase' | 'signal' | 'confidence' | 'risk' | 'weeklyBias'>[] {
  const nets: number[] = [];
  const result: Omit<CotRecord, 'phase' | 'signal' | 'confidence' | 'risk' | 'weeklyBias'>[] = [];

  for (let i = 0; i < sortedRows.length; i++) {
    const row = sortedRows[i];
    const net = row.long - row.short;
    nets.push(net);

    const prevNet = i > 0 ? sortedRows[i - 1].long - sortedRows[i - 1].short : net;
    const change = net - prevNet;

    // velocity = Δnet (same as change when viewed sequentially)
    const velocity = change;

    // acceleration = Δvelocity
    let acceleration = 0;
    if (i >= 2) {
      const prevPrevNet = sortedRows[i - 2].long - sortedRows[i - 2].short;
      const prevVelocity = prevNet - prevPrevNet;
      acceleration = velocity - prevVelocity;
    }

    // Rolling 52-week window for z-score and percentile
    const windowStart = Math.max(0, i - ROLLING_WINDOW + 1);
    const windowNets = nets.slice(windowStart, i + 1);
    const mean = windowNets.reduce((s, v) => s + v, 0) / windowNets.length;
    const sd = stdDev(windowNets, mean);

    const zScore = sd > 0 ? (net - mean) / sd : 0;
    const extreme = Math.abs(zScore) > 2;

    const sortedWindow = [...windowNets].sort((a, b) => a - b);
    const percentile = percentileRank(sortedWindow, net);

    const trend = net >= 0 ? 'Bullish' : 'Bearish';

    result.push({
      date: row.date,
      asset,
      long: row.long,
      short: row.short,
      net,
      change,
      zScore,
      percentile,
      velocity,
      acceleration,
      trend,
      extreme,
    });
  }

  return result;
}
