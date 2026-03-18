import { prisma } from '@/lib/prisma';
import {
  defaultPricingMatrix,
  type BillingCycle,
  type PlanType,
  type PricingDetail,
  type PricingMatrix,
  type Region,
} from '@/lib/pricing/catalog';

const USD_BASE_PRICING_KEY = 'pricingUsdBaseMatrix';
const USD_NGN_RATE_KEY = 'usdNgnExchangeRate';
const EXCHANGE_RATE_PROVIDER = 'openexchangerates';
const MANUAL_EXCHANGE_RATE_PROVIDER = 'manual';
const EXCHANGE_RATE_TTL_MS = 6 * 60 * 60 * 1000;

export interface ExchangeRateSnapshot {
  usdToNgn: number;
  fetchedAt: string | null;
  source: string;
  stale: boolean;
}

type UsdBasePricingMatrix = Record<PlanType, PricingDetail>;

function formatLabel(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function deriveAnnualMonthlyEquivalent(currencyCode: PricingDetail['currencyCode'], annualPriceValue: number) {
  const monthlyEquivalent = annualPriceValue / 12;

  if (currencyCode === 'ngn') {
    return formatLabel(Math.round(monthlyEquivalent));
  }

  return monthlyEquivalent.toFixed(2).replace(/\.00$/, '');
}

function withDerivedFields(detail: Partial<PricingDetail>, fallback: PricingDetail): PricingDetail {
  const currencyCode = detail.currencyCode ?? fallback.currencyCode;
  const currencySymbol = detail.currencySymbol ?? fallback.currencySymbol;
  const unitAmountCents = Number(detail.unitAmountCents ?? fallback.unitAmountCents);
  const priceValue = Number(detail.priceValue ?? fallback.priceValue);
  const annualUnitAmountCents = Number(detail.annualUnitAmountCents ?? fallback.annualUnitAmountCents);
  const annualPriceValue = Number(detail.annualPriceValue ?? fallback.annualPriceValue);

  return {
    currencyCode,
    currencySymbol,
    unitAmountCents,
    priceValue,
    priceLabel: formatLabel(priceValue),
    period: '/month',
    annualUnitAmountCents,
    annualPriceValue,
    annualPriceLabel: formatLabel(annualPriceValue),
    annualMonthlyEquivalent: deriveAnnualMonthlyEquivalent(currencyCode, annualPriceValue),
  };
}

function getDefaultUsdBasePricing(): UsdBasePricingMatrix {
  return structuredClone(defaultPricingMatrix.international);
}

function getDefaultFallbackRate() {
  const traderUsd = defaultPricingMatrix.international.Trader.priceValue || 1;
  const traderNgn = defaultPricingMatrix.nigeria.Trader.priceValue || traderUsd;
  return traderNgn / traderUsd;
}

function normalizeUsdBasePricing(input: unknown): UsdBasePricingMatrix {
  const fallback = getDefaultUsdBasePricing();
  if (!input || typeof input !== 'object') return fallback;

  for (const plan of Object.keys(fallback) as PlanType[]) {
    const value = (input as any)[plan];
    if (!value || typeof value !== 'object') continue;
    fallback[plan] = withDerivedFields(value, fallback[plan]);
  }

  return fallback;
}

function convertUsdDetailToNgn(detail: PricingDetail, usdToNgn: number): PricingDetail {
  const monthlyPriceValue = Math.round(detail.priceValue * usdToNgn);
  const annualPriceValue = Math.round(detail.annualPriceValue * usdToNgn);

  return {
    currencyCode: 'ngn',
    currencySymbol: 'N',
    unitAmountCents: monthlyPriceValue * 100,
    priceValue: monthlyPriceValue,
    priceLabel: formatLabel(monthlyPriceValue),
    period: '/month',
    annualUnitAmountCents: annualPriceValue * 100,
    annualPriceValue,
    annualPriceLabel: formatLabel(annualPriceValue),
    annualMonthlyEquivalent: deriveAnnualMonthlyEquivalent('ngn', annualPriceValue),
  };
}

async function readCachedExchangeRate(): Promise<ExchangeRateSnapshot> {
  const fallbackRate = getDefaultFallbackRate();

  try {
    const record = await prisma.platformSetting.findUnique({ where: { key: USD_NGN_RATE_KEY } });
    if (!record?.value) {
      return {
        usdToNgn: fallbackRate,
        fetchedAt: null,
        source: 'fallback',
        stale: true,
      };
    }

    const parsed = JSON.parse(record.value);
    const fetchedAt = typeof parsed?.fetchedAt === 'string' ? parsed.fetchedAt : null;
    const usdToNgn = Number(parsed?.usdToNgn ?? fallbackRate);
    const source = typeof parsed?.source === 'string' ? parsed.source : 'cache';
    const stale = source === MANUAL_EXCHANGE_RATE_PROVIDER
      ? false
      : !fetchedAt || Date.now() - new Date(fetchedAt).getTime() > EXCHANGE_RATE_TTL_MS;

    return {
      usdToNgn: Number.isFinite(usdToNgn) && usdToNgn > 0 ? usdToNgn : fallbackRate,
      fetchedAt,
      source,
      stale,
    };
  } catch {
    return {
      usdToNgn: fallbackRate,
      fetchedAt: null,
      source: 'fallback',
      stale: true,
    };
  }
}

async function fetchLiveUsdToNgnRate(): Promise<ExchangeRateSnapshot | null> {
  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
  if (!appId) return null;

  const url = new URL('https://openexchangerates.org/api/latest.json');
  url.searchParams.set('app_id', appId);
  url.searchParams.set('symbols', 'NGN');
  url.searchParams.set('prettyprint', '0');

  const response = await fetch(url.toString(), {
    method: 'GET',
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Exchange rate request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const usdToNgn = Number(payload?.rates?.NGN);
  const timestamp = typeof payload?.timestamp === 'number' ? new Date(payload.timestamp * 1000).toISOString() : new Date().toISOString();

  if (!Number.isFinite(usdToNgn) || usdToNgn <= 0) {
    throw new Error('Invalid USD/NGN rate payload');
  }

  return {
    usdToNgn,
    fetchedAt: timestamp,
    source: EXCHANGE_RATE_PROVIDER,
    stale: false,
  };
}

async function persistExchangeRate(snapshot: ExchangeRateSnapshot) {
  await prisma.platformSetting.upsert({
    where: { key: USD_NGN_RATE_KEY },
    update: { value: JSON.stringify(snapshot) },
    create: { key: USD_NGN_RATE_KEY, value: JSON.stringify(snapshot) },
  });
}

export async function getUsdNgnExchangeRate(options?: { forceRefresh?: boolean }): Promise<ExchangeRateSnapshot> {
  const cached = await readCachedExchangeRate();

  if (cached.source === MANUAL_EXCHANGE_RATE_PROVIDER) {
    return cached;
  }

  if (!options?.forceRefresh && !cached.stale) {
    return cached;
  }

  try {
    const live = await fetchLiveUsdToNgnRate();
    if (!live) return cached;
    await persistExchangeRate(live);
    return live;
  } catch {
    return cached;
  }
}

export async function getUsdBasePricingMatrix(): Promise<UsdBasePricingMatrix> {
  try {
    const record = await prisma.platformSetting.findUnique({ where: { key: USD_BASE_PRICING_KEY } });
    if (!record?.value) return getDefaultUsdBasePricing();
    return normalizeUsdBasePricing(JSON.parse(record.value));
  } catch {
    return getDefaultUsdBasePricing();
  }
}

export async function saveUsdBasePricingMatrix(matrix: UsdBasePricingMatrix): Promise<UsdBasePricingMatrix> {
  const normalized = normalizeUsdBasePricing(matrix);
  await prisma.platformSetting.upsert({
    where: { key: USD_BASE_PRICING_KEY },
    update: { value: JSON.stringify(normalized) },
    create: { key: USD_BASE_PRICING_KEY, value: JSON.stringify(normalized) },
  });
  return normalized;
}

export async function saveManualUsdNgnExchangeRate(usdToNgn: number): Promise<ExchangeRateSnapshot> {
  const normalizedRate = Number(usdToNgn);
  if (!Number.isFinite(normalizedRate) || normalizedRate <= 0) {
    throw new Error('Invalid USD/NGN exchange rate');
  }

  const snapshot: ExchangeRateSnapshot = {
    usdToNgn: normalizedRate,
    fetchedAt: new Date().toISOString(),
    source: MANUAL_EXCHANGE_RATE_PROVIDER,
    stale: false,
  };

  await persistExchangeRate(snapshot);
  return snapshot;
}

export async function getPricingMatrix(options?: { forceRefreshRate?: boolean }): Promise<{ pricingMatrix: PricingMatrix; exchangeRate: ExchangeRateSnapshot; usdBasePricing: UsdBasePricingMatrix; }> {
  const [usdBasePricing, exchangeRate] = await Promise.all([
    getUsdBasePricingMatrix(),
    getUsdNgnExchangeRate({ forceRefresh: options?.forceRefreshRate }),
  ]);

  const pricingMatrix: PricingMatrix = {
    international: structuredClone(usdBasePricing),
    nigeria: Object.fromEntries(
      (Object.keys(usdBasePricing) as PlanType[]).map((plan) => [
        plan,
        convertUsdDetailToNgn(usdBasePricing[plan], exchangeRate.usdToNgn),
      ])
    ) as Record<PlanType, PricingDetail>,
  };

  return {
    pricingMatrix,
    exchangeRate,
    usdBasePricing,
  };
}

export function getBillingPrice(detail: PricingDetail, billingCycle: BillingCycle) {
  if (billingCycle === 'annual') {
    return {
      unitAmountCents: detail.annualUnitAmountCents,
      priceValue: detail.annualPriceValue,
    };
  }

  return {
    unitAmountCents: detail.unitAmountCents,
    priceValue: detail.priceValue,
  };
}
