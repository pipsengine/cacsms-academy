import { z } from 'zod';
import { MarketSnapshot } from './types';

export const marketSnapshotSchema = z.object({
  snapshotId: z.string(),
  probability: z.object({
    timestamp: z.string(),
    momentum: z.number(),
    liquidity: z.number(),
    volatility: z.number(),
    newsSentiment: z.number().optional(),
  }),
  candles: z.array(
    z.object({
      timestamp: z.string(),
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      volume: z.number(),
    })
  ),
  pricePoints: z.array(
    z.object({
      timestamp: z.string(),
      price: z.number(),
    })
  ),
  currencyTicks: z.array(
    z.object({
      timestamp: z.string(),
      pair: z.string(),
      price: z.number(),
    })
  ),
  orderBook: z.array(
    z.object({
      level: z.number(),
      bid: z.number(),
      ask: z.number(),
    })
  ),
  regime: z.array(
    z.object({
      timestamp: z.string(),
      volatility: z.number(),
      trend: z.number(),
    })
  ),
  volatilityBars: z.array(
    z.object({
      timestamp: z.string(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
    })
  ),
  signalPool: z.array(
    z.object({
      id: z.string(),
      score: z.number(),
      label: z.string(),
    })
  ),
});

export type MarketSnapshotParsable = z.infer<typeof marketSnapshotSchema>;

export const parseMarketSnapshot = (input: unknown): MarketSnapshot =>
  marketSnapshotSchema.parse(input) as unknown as MarketSnapshot;
