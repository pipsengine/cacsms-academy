import { CFTC_CURRENCY_URL, CFTC_DISAGG_URL } from './types';

const FETCH_TIMEOUT_MS = 30_000;

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'IntelTrader/1.0 COT-Ingestion' },
    });
    if (!res.ok) {
      throw new Error(`CFTC fetch failed: ${res.status} ${res.statusText} for ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchCurrencyRaw(): Promise<string> {
  return fetchWithTimeout(CFTC_CURRENCY_URL);
}

export async function fetchDisaggRaw(): Promise<string> {
  return fetchWithTimeout(CFTC_DISAGG_URL);
}
