export type PlanType = 'Scout' | 'Analyst' | 'Trader' | 'ProTrader' | 'Institutional';
export type BillingCycle = 'monthly' | 'annual';
export type Region = 'international' | 'nigeria';

export interface PlanDefinition {
  planType: PlanType;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  lockedFeatures?: string[];
  buttonVariant: 'solid' | 'outline';
  popular?: boolean;
  color: string;
  annualSaving?: string;
}

export interface PricingDetail {
  currencyCode: 'usd' | 'ngn';
  currencySymbol: string;
  unitAmountCents: number;
  priceValue: number;
  priceLabel: string;
  period: string;
  annualUnitAmountCents: number;
  annualPriceValue: number;
  annualPriceLabel: string;
  annualMonthlyEquivalent: string;
}

export type PricingMatrix = Record<Region, Record<PlanType, PricingDetail>>;

export const planOrder: PlanType[] = ['Scout', 'Analyst', 'Trader', 'ProTrader', 'Institutional'];

export function getPlanDisplayName(plan?: string) {
  if (plan === 'Scout') return 'Free Plan';
  return plan ?? 'Unknown Plan';
}

export const planDefinitions: Record<PlanType, PlanDefinition> = {
  Scout: {
    planType: 'Scout',
    title: 'Free Plan',
    tagline: 'Explore the platform',
    description: 'A simple starting point for exploring the platform and understanding the Intel Trader workflow.',
    buttonVariant: 'outline',
    color: 'zinc',
    features: [
      '5 major pairs including EURUSD, GBPUSD, USDJPY, AUDUSD, and USDNGN',
      'Currency strength heatmap with 4-hour delay',
      '5 channel scans per day on H4 timeframe',
      '10 alerts per day',
      'Community access',
      'Basic dashboard view',
    ],
    lockedFeatures: [
      'Real-time market feed',
      'Advanced breakout detection',
      'AI probability engine',
      'Liquidity intelligence',
    ],
  },
  Analyst: {
    planType: 'Analyst',
    title: 'Analyst',
    tagline: 'For retail beginners',
    description: 'For developing traders who need broader market coverage and stronger real-time guidance.',
    buttonVariant: 'outline',
    color: 'blue',
    annualSaving: 'Save $38/yr',
    features: [
      '14 pairs across major and minor markets',
      'Real-time currency strength heatmap',
      '30 channel scans per day across M15, H1, and H4',
      'Basic breakout detection with email alerts',
      '10 alerts per day',
      'Standard email support',
    ],
    lockedFeatures: [
      'Full AI probability scoring',
      'Liquidity intelligence',
      'Opportunity radar',
    ],
  },
  Trader: {
    planType: 'Trader',
    title: 'Trader',
    tagline: 'The complete toolkit',
    description: 'The complete trading workspace for serious traders who want full market visibility and AI-backed analysis.',
    buttonVariant: 'solid',
    popular: true,
    color: 'emerald',
    annualSaving: 'Save $98/yr',
    features: [
      'All 28 pairs with full market coverage',
      'All timeframes from M1 to Weekly',
      'Unlimited channel scanning',
      'Full breakout engine with push, Telegram, and email alerts',
      'AI probability engine with 100 analyses per day',
      'Core liquidity intelligence',
      'Opportunity radar with top 5 setups',
      '100 alerts per day',
      'Priority email support',
    ],
  },
  ProTrader: {
    planType: 'ProTrader',
    title: 'Pro Trader',
    tagline: 'For full-time traders',
    description: 'For highly active traders who need deeper analytics, stronger alerts, and more operational flexibility.',
    buttonVariant: 'outline',
    color: 'violet',
    annualSaving: 'Save $198/yr',
    features: [
      'Everything in Trader',
      'Unlimited AI probability analyses',
      'Full liquidity intelligence engine',
      'Full opportunity radar access',
      'Unlimited alerts plus SMS delivery',
      'API access with 1,000 calls per day',
      '90-day signal history',
      'Priority support',
    ],
  },
  Institutional: {
    planType: 'Institutional',
    title: 'Institutional',
    tagline: 'Prop firms & funds',
    description: 'For firms and teams that need scalable market intelligence, integrations, and multi-user access.',
    buttonVariant: 'outline',
    color: 'amber',
    annualSaving: 'Save $598/yr',
    features: [
      'Everything in Pro Trader',
      '5 team seats included',
      'Unlimited API calls',
      'White-label PDF intelligence reports',
      'Custom webhook integrations',
      'Historical data export in CSV and JSON',
      'Dedicated account manager',
      'SLA-backed uptime commitment',
    ],
  },
};

export const defaultPricingMatrix: PricingMatrix = {
  international: {
    Scout: {
      currencyCode: 'usd', currencySymbol: '$',
      unitAmountCents: 0, priceValue: 0, priceLabel: '0', period: '/month',
      annualUnitAmountCents: 0, annualPriceValue: 0, annualPriceLabel: '0', annualMonthlyEquivalent: '0',
    },
    Analyst: {
      currencyCode: 'usd', currencySymbol: '$',
      unitAmountCents: 1900, priceValue: 19, priceLabel: '19', period: '/month',
      annualUnitAmountCents: 19000, annualPriceValue: 190, annualPriceLabel: '190', annualMonthlyEquivalent: '15.83',
    },
    Trader: {
      currencyCode: 'usd', currencySymbol: '$',
      unitAmountCents: 4900, priceValue: 49, priceLabel: '49', period: '/month',
      annualUnitAmountCents: 49000, annualPriceValue: 490, annualPriceLabel: '490', annualMonthlyEquivalent: '40.83',
    },
    ProTrader: {
      currencyCode: 'usd', currencySymbol: '$',
      unitAmountCents: 9900, priceValue: 99, priceLabel: '99', period: '/month',
      annualUnitAmountCents: 99000, annualPriceValue: 990, annualPriceLabel: '990', annualMonthlyEquivalent: '82.50',
    },
    Institutional: {
      currencyCode: 'usd', currencySymbol: '$',
      unitAmountCents: 29900, priceValue: 299, priceLabel: '299', period: '/month',
      annualUnitAmountCents: 299000, annualPriceValue: 2990, annualPriceLabel: '2,990', annualMonthlyEquivalent: '249.17',
    },
  },
  nigeria: {
    Scout: {
      currencyCode: 'ngn', currencySymbol: 'N',
      unitAmountCents: 0, priceValue: 0, priceLabel: '0', period: '/month',
      annualUnitAmountCents: 0, annualPriceValue: 0, annualPriceLabel: '0', annualMonthlyEquivalent: '0',
    },
    Analyst: {
      currencyCode: 'ngn', currencySymbol: 'N',
      unitAmountCents: 1499900, priceValue: 14999, priceLabel: '14,999', period: '/month',
      annualUnitAmountCents: 14999000, annualPriceValue: 149990, annualPriceLabel: '149,990', annualMonthlyEquivalent: '12,499',
    },
    Trader: {
      currencyCode: 'ngn', currencySymbol: 'N',
      unitAmountCents: 2999900, priceValue: 29999, priceLabel: '29,999', period: '/month',
      annualUnitAmountCents: 29999000, annualPriceValue: 299990, annualPriceLabel: '299,990', annualMonthlyEquivalent: '24,999',
    },
    ProTrader: {
      currencyCode: 'ngn', currencySymbol: 'N',
      unitAmountCents: 4999900, priceValue: 49999, priceLabel: '49,999', period: '/month',
      annualUnitAmountCents: 49999000, annualPriceValue: 499990, annualPriceLabel: '499,990', annualMonthlyEquivalent: '41,666',
    },
    Institutional: {
      currencyCode: 'ngn', currencySymbol: 'N',
      unitAmountCents: 14999900, priceValue: 149999, priceLabel: '149,999', period: '/month',
      annualUnitAmountCents: 149999000, annualPriceValue: 1499990, annualPriceLabel: '1,499,990', annualMonthlyEquivalent: '124,999',
    },
  },
};

export function resolveRegion(input: unknown, userCountry: string): Region {
  if (input === 'nigeria') return 'nigeria';
  if (input === 'international') return 'international';
  return userCountry === 'Nigeria' ? 'nigeria' : 'international';
}

export function getPricingDetail(plan: PlanType, region: Region): PricingDetail {
  return defaultPricingMatrix[region][plan];
}

export function getPricingDetailFromMatrix(matrix: PricingMatrix, plan: PlanType, region: Region): PricingDetail {
  return matrix[region][plan];
}
