import { describe, expect, it } from 'vitest';
import { getPricingDetail, resolveRegion } from '@/lib/pricing/catalog';

describe('pricing catalog', () => {
  it('resolves Nigeria region for Nigerian users when no override is provided', () => {
    expect(resolveRegion(undefined, 'Nigeria')).toBe('nigeria');
    expect(resolveRegion('international', 'Nigeria')).toBe('international');
  });

  it('returns USD Trader pricing', () => {
    const pricing = getPricingDetail('Trader', 'international');
    expect(pricing.currencyCode).toBe('usd');
    expect(pricing.unitAmountCents).toBe(4900);
    expect(pricing.priceValue).toBe(49);
    expect(pricing.priceLabel).toBe('49');
  });

  it('returns USD Analyst pricing', () => {
    const pricing = getPricingDetail('Analyst', 'international');
    expect(pricing.currencyCode).toBe('usd');
    expect(pricing.unitAmountCents).toBe(1900);
    expect(pricing.priceValue).toBe(19);
  });

  it('returns NGN ProTrader pricing', () => {
    const pricing = getPricingDetail('ProTrader', 'nigeria');
    expect(pricing.currencyCode).toBe('ngn');
    expect(pricing.priceValue).toBe(49999);
    expect(pricing.priceLabel).toBe('49,999');
  });

  it('returns annual pricing lower than 12x monthly', () => {
    const pricing = getPricingDetail('Trader', 'international');
    const twelveMonths = pricing.unitAmountCents * 12;
    expect(pricing.annualUnitAmountCents).toBeLessThan(twelveMonths);
  });

  it('Scout plan is free in all regions', () => {
    expect(getPricingDetail('Scout', 'international').priceValue).toBe(0);
    expect(getPricingDetail('Scout', 'nigeria').priceValue).toBe(0);
  });
});
