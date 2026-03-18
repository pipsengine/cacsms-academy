import { normalizePair } from '../config';
import type { ForexCandle, ForexMarketProvider } from '../types';

function basePriceForPair(pair: string) {
  if (pair.endsWith('JPY')) return 150;
  if (pair === 'USDNGN') return 1550;
  if (pair.startsWith('XAU')) return 2300;
  return 1.1;
}

export class MockForexMarketProvider implements ForexMarketProvider {
  readonly name = 'mock';

  async getCandles(pair: string, _interval: string, outputsize: number): Promise<ForexCandle[]> {
    const normalizedPair = normalizePair(pair);
    const candles: ForexCandle[] = [];
    let current = basePriceForPair(normalizedPair);
    const volatility = normalizedPair.endsWith('JPY') ? 0.35 : normalizedPair === 'USDNGN' ? 8 : 0.0025;

    for (let index = outputsize - 1; index >= 0; index -= 1) {
      const drift = (Math.random() - 0.48) * volatility;
      const open = current;
      const close = Number((current + drift).toFixed(normalizedPair.endsWith('JPY') ? 3 : 5));
      const high = Number((Math.max(open, close) + Math.random() * volatility * 0.5).toFixed(normalizedPair.endsWith('JPY') ? 3 : 5));
      const low = Number((Math.min(open, close) - Math.random() * volatility * 0.5).toFixed(normalizedPair.endsWith('JPY') ? 3 : 5));
      candles.push({
        datetime: new Date(Date.now() - index * 60_000).toISOString(),
        open: Number(open.toFixed(normalizedPair.endsWith('JPY') ? 3 : 5)),
        high,
        low,
        close,
      });
      current = close;
    }

    return candles;
  }
}
