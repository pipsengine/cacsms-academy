import { describe, expect, it } from 'vitest';
import { getPricingDetail, resolveRegion } from '@/lib/pricing/catalog';

describe('pricing catalog', () => {
  it('resolves Nigeria region for Nigerian users when no override is provided', () => {
    expect(resolveRegion(undefined, 'Nigeria')).toBe('nigeria');
    expect(resolveRegion('international', 'Nigeria')).toBe('international');
  });

  it('returns USD professional pricing with cents', () => {
    const pricing = getPricingDetail('Professional', 'international');
    expect(pricing.currencyCode).toBe('usd');
    expect(pricing.unitAmountCents).toBe(399);
    expect(pricing.priceValue).toBeCloseTo(3.99);
    expect(pricing.priceLabel).toBe('3.99');
  });

  it('returns NGN premium pricing in kobo', () => {
    const pricing = getPricingDetail('Premium', 'nigeria');
    expect(pricing.currencyCode).toBe('ngn');
    expect(pricing.unitAmountCents).toBe(999900);
    expect(pricing.priceValue).toBe(9999);
    expect(pricing.priceLabel).toBe('9,999');
  });
});
