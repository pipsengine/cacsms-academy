# Dashboard Intelligence Roadmap

This roadmap turns the current dashboard review into an execution plan that can be delivered in phases without losing product quality, data quality, or operational trust.

## Phase 1: Immediate Stabilization

Goal: remove trust-breaking gaps and make the existing dashboard feel consistent and production-aware.

### 1. Replace placeholders and hardcoded states

- Implement the `Liquidity Intel` module instead of the current placeholder.
- Replace hardcoded `Alert History` entries with database-backed alerts.
- Replace static system health values such as latency and chart counts with real telemetry.

### 2. Remove simulated behavior from premium surfaces

- Replace `IntelligenceEngine` mock outputs with computed values from actual market data.
- Ensure opportunity ranking uses real signal inputs, not static example rows.
- Add an explicit production flag to disable mock fallback when live data is unavailable.

### 3. Make configuration real

- Persist user dashboard preferences to the database.
- Apply saved preferences to:
  - tracked pairs
  - default timeframe
  - alert routing
  - minimum probability thresholds
- Reload preferences automatically when users log in.

### 4. Improve user trust signals

- Show feed source, freshness, stale state, and last successful update time.
- Show a visible degraded mode if live provider data fails.
- Add provider health to admin monitoring.

## Phase 2: Product Completion

Goal: make each paid module genuinely useful and coherent for its target plan.

### 1. Complete module functionality by subscription tier

- `Free Plan`
  - delayed currency strength
  - basic overview
  - restricted alerts
- `Analyst`
  - live currency strength
  - channel scanner
  - breakout engine
- `Trader`
  - opportunity radar
  - AI probability engine
  - baseline liquidity intelligence
- `ProTrader`
  - expanded AI analysis
  - full liquidity engine
  - higher alert throughput
  - API access
- `Institutional`
  - team features
  - white-label reporting
  - advanced exports
  - webhooks
  - governance tooling

### 2. Build real liquidity intelligence

- Equal highs / equal lows detection
- Stop cluster estimation
- Sweep detection
- Fair value gap mapping
- Session high / low reaction tracking
- Displacement candle identification
- Re-entry / continuation tagging after sweep

### 3. Build persistent alerting

- Signal-to-alert pipeline
- User-specific delivery rules
- Alert acknowledgment state
- Alert archive and filtering
- Notification deduplication

### 4. Improve dashboard adaptability

- Saved layouts by plan and user
- Pinned modules
- Pair watchlists
- Preset dashboards for scalper / intraday / swing / desk modes

## Phase 3: Professional Data Architecture

Goal: move from app-level feature logic to a proper intelligence platform architecture.

### 1. Establish a market data pipeline

- Raw ingestion layer
- Normalized symbol mapping
- Bar aggregation across intervals
- Session-aware timestamps
- Stale-data detection
- Feed-quality scoring

### 2. Add a feature store

Persist reusable derived features such as:

- rolling volatility
- breakout pressure
- structure slope
- range compression
- liquidity proximity
- currency basket strength
- session expansion statistics
- news/event proximity

### 3. Build a signal store

Every signal should persist:

- pair
- timeframe
- signal type
- feature snapshot
- model version
- confidence score
- explanation fields
- triggered timestamp
- resolved timestamp
- outcome label

### 4. Build research and replay tools

- historical replay by pair and timeframe
- signal inspection timeline
- regime-aware backtesting
- win-rate / expectancy / drawdown analytics
- false-positive breakdowns

## Phase 4: Institutional-Grade Intelligence

Goal: make the platform professionally competitive and durable over time.

### 1. Multi-provider market data resilience

- primary and secondary forex feed providers
- provider failover logic
- quote reconciliation
- discrepancy alerts
- provider scoring dashboard

### 2. Model governance and monitoring

- model version registry
- calibration tracking
- drift detection
- hit-rate decay alerts
- retraining triggers
- per-regime performance reporting

### 3. Team and governance features

- team workspaces
- shared watchlists
- analyst notes
- supervisor review states
- signal approvals
- audit trail for admin actions

### 4. Enterprise reporting

- desk-level performance summaries
- client-ready PDF exports
- webhook event packs
- API usage analytics
- operational SLA reporting

## Recommended Technical Workstreams

### Workstream A: Core Data

- Market data ingestion
- Normalization
- Storage
- Health monitoring

### Workstream B: Intelligence

- Signal feature extraction
- Ranking engine
- Liquidity engine
- AI scoring

### Workstream C: User Experience

- Adaptive dashboard
- Real configuration persistence
- Alert UX
- Historical review tools

### Workstream D: Platform Ops

- Provider failover
- Monitoring
- Auditability
- Admin controls

## Suggested Delivery Sequence

### First 2 weeks

- Replace hardcoded alert history
- Replace fake health indicators
- Persist configuration
- Build minimum viable liquidity module shell with real data inputs
- Disable silent mock behavior in production

### First 30 days

- Full liquidity intelligence MVP
- Real opportunity-ranking inputs
- Signal persistence
- Alert pipeline
- User preference persistence

### 60 to 90 days

- Feature store
- signal history and replay
- model performance analytics
- team collaboration primitives
- multi-provider data readiness

### 90+ days

- full institutional governance
- research lab
- model monitoring
- failover automation
- enterprise reporting and audit packs

## Highest-Impact Immediate Builds

If delivery must be prioritized aggressively, build these first:

1. Real `Liquidity Intel`
2. Persistent `Alert History`
3. Real `Opportunity Ranking` inputs
4. Saved `Configuration`
5. Production-grade market feed health and failover handling

## Success Metrics

Track progress using:

- signal freshness latency
- feed uptime
- stale-data incident count
- alert delivery success rate
- signal win rate by regime
- false-positive rate
- average time-to-decision
- user retention by plan
- upgrade conversion by unlocked module usage

