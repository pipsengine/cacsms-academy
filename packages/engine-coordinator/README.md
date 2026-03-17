# Engine Coordinator

Provides a single entry point that orchestrates all intelligence engines to produce comprehensive opportunity packets.

## Responsibilities

1. Normalize incoming market ticks.
2. Run the volatility, channel, breakout, liquidity, regime, and probability engines in sequence.
3. Produce prioritized opportunities using the opportunity radar engine.
4. Attach metadata (regime, liquidity zones, probabilities) and telemetry events.

The coordinator exposes `orchestrateSnapshot` for real-time feeds and `hydrateHistory` for batch replays.
