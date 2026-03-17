# AI Probability Engine

This engine synthesizes structured market data and historical success rates to generate **probability scores** for upcoming price movements. The output powers dashboard probability badges, trade alerts, and ranking flows.

## Implementation Highlights
- **Config:** Defines smoothing and bias factors used by the logistic probability model.
- **Types:** Captures the input `FeatureSnapshot` (momentum, liquidity, volatility metrics) and the `ProbabilityEstimate` output.
- **Engine:** Aggregates normalized feature data via a logistic regressor plus adaptive confidence scaling.
- **Utils:** Provides normalization helpers and weight blending methods.

The entry point (`index.ts`) exposes `runEngine(snapshot)` and `batchEstimate(snapshots[])` for consumers to integrate into downstream services.
