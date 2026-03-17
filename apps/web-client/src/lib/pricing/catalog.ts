export type PlanType = 'Free' | 'Professional' | 'Premium';
export type Region = 'international' | 'nigeria';

export interface PlanDefinition {
  planType: PlanType;
  title: string;
  description: string;
  features: string[];
  buttonVariant: 'solid' | 'outline';
  popular?: boolean;
}

export interface PricingDetail {
  currencyCode: 'usd' | 'ngn';
  currencySymbol: string;
  unitAmountCents: number;
  priceValue: number;
  priceLabel: string;
  period: string;
}

export const planOrder: PlanType[] = ['Free', 'Professional', 'Premium'];

export const planDefinitions: Record<PlanType, PlanDefinition> = {
  Free: {
    planType: 'Free',
    title: 'Free Plan',
    description:
      'Allows users to explore the platform’s core capabilities and experience automated Forex market intelligence with limited scanning access.',
    buttonVariant: 'outline',
    features: [
      'Restricted scans and alerts',
      'Basic dashboard access',
      'Limited timeframe analysis',
      'Community support',
    ],
  },
  Professional: {
    planType: 'Professional',
    title: 'Professional Plan',
    description:
      'Unlocks expanded analytical capabilities including full channel scanning and breakout detection systems.',
    buttonVariant: 'solid',
    popular: true,
    features: [
      'Full scanner access',
      'Breakout detection system',
      'Currency strength engine',
      'Expanded timeframe analysis',
      'Priority email support',
    ],
  },
  Premium: {
    planType: 'Premium',
    title: 'Premium Plan',
    description:
      'Provides unrestricted access to all intelligence engines including AI probability analysis, liquidity detection, and opportunity radar ranking.',
    buttonVariant: 'outline',
    features: [
      'Everything in Professional',
      'AI probability analysis',
      'Liquidity detection engine',
      'Opportunity radar ranking',
      'Unlimited alerts',
      '24/7 priority support',
    ],
  },
};

const pricingMatrix: Record<Region, Record<PlanType, PricingDetail>> = {
  international: {
    Free: {
      currencyCode: 'usd',
      currencySymbol: '$',
      unitAmountCents: 0,
      priceValue: 0,
      priceLabel: '0',
      period: '/month',
    },
    Professional: {
      currencyCode: 'usd',
      currencySymbol: '$',
      unitAmountCents: 399,
      priceValue: 3.99,
      priceLabel: '3.99',
      period: '/month',
    },
    Premium: {
      currencyCode: 'usd',
      currencySymbol: '$',
      unitAmountCents: 899,
      priceValue: 8.99,
      priceLabel: '8.99',
      period: '/month',
    },
  },
  nigeria: {
    Free: {
      currencyCode: 'ngn',
      currencySymbol: '₦',
      unitAmountCents: 0,
      priceValue: 0,
      priceLabel: '0',
      period: '/month',
    },
    Professional: {
      currencyCode: 'ngn',
      currencySymbol: '₦',
      unitAmountCents: 499900,
      priceValue: 4999,
      priceLabel: '4,999',
      period: '/month',
    },
    Premium: {
      currencyCode: 'ngn',
      currencySymbol: '₦',
      unitAmountCents: 999900,
      priceValue: 9999,
      priceLabel: '9,999',
      period: '/month',
    },
  },
};

export function resolveRegion(input: unknown, userCountry: string): Region {
  if (input === 'nigeria') return 'nigeria';
  if (input === 'international') return 'international';
  return userCountry === 'Nigeria' ? 'nigeria' : 'international';
}

export function getPricingDetail(plan: PlanType, region: Region): PricingDetail {
  return pricingMatrix[region][plan];
}
