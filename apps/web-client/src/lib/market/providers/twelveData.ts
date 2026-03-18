import { providerSymbol } from '../config';
import type { ForexCandle, ForexMarketProvider } from '../types';

type TwelveDataResponse = {
  status?: string;
  message?: string;
  values?: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
  }>;
};

export class TwelveDataForexMarketProvider implements ForexMarketProvider {
  readonly name = 'twelvedata';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCandles(pair: string, interval: string, outputsize: number): Promise<ForexCandle[]> {
    const url = new URL('https://api.twelvedata.com/time_series');
    url.searchParams.set('symbol', providerSymbol(pair));
    url.searchParams.set('interval', interval);
    url.searchParams.set('outputsize', String(outputsize));
    url.searchParams.set('timezone', 'UTC');
    url.searchParams.set('apikey', this.apiKey);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Twelve Data request failed with status ${response.status}`);
    }

    const payload = await response.json() as TwelveDataResponse;
    if (payload.status === 'error' || !payload.values?.length) {
      throw new Error(payload.message || `No candles returned for ${pair}`);
    }

    return payload.values
      .slice()
      .reverse()
      .map((candle) => ({
        datetime: new Date(candle.datetime.replace(' ', 'T') + 'Z').toISOString(),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
      }));
  }
}
