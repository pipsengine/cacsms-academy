# Breakout Engine

Detects breakout events on price data by analyzing dynamic volumes, trend channels, and volatility thresholds.

## Included modules
- `config.ts`: Configures breakout sensitivity and confirmation windows.
- `types.ts`: Defines candle data, breakouts, and confidence enums.
- `utils.ts`: Mortality of checking ranges and recent averages.
- `engine.ts`: Evaluates price data to emit breakout candidates.
- `index.ts`: Entry point exposing `detectBreakouts`.
