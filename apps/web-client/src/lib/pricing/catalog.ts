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

export const planOrder: PlanType[] = ['Scout', 'Analyst', 'Trader', 'ProTrader', 'Institutional'];

export const planDefinitions: Record<PlanType, PlanDefinition> = {
  Scout: {
    planType: 'Scout',
    title: 'Scout',
    tagline: 'Explore the platform',
    description: 'Free access to core market indicators on 5 major pairs. Perfect for exploring what institutional-grade intelligence looks like.',
    buttonVariant: 'outline',
    color: 'zinc',
    features: [
      '5 major pairs (EURUSD, GBPUSD, USDJPY, AUDUSD, USDNGN)',
      'Currency strength heatmap (4-hour delay)',
      '5 channel scans/day — H4 timeframe only',
      '10 alerts/day',
      'Community Discord access',
      'Basic dashboard',
    ],
    lockedFeatures: [
      'Real-time feeds',
      'Breakout detection',
      'AI probability engine',
      'Liquidity intelligence',
    ],
  },
  Analyst: {
    planType: 'Analyst',
    title: 'Analyst',
    tagline: 'For retail beginners',
    description: 'Real-time feeds on 14 pairs with channel scanning and basic breakout detection — everything a developing trader needs.',
    buttonVariant: 'outline',
    color: 'blue',
    annualSaving: 'Save $38/yr',
    features: [
      '14 pairs across major & minor',
      'Real-time currency strength heatmap',
      '30 channel scans/day — M15, H1, H4',
      'Basic breakout detection (email alerts)',
      '10 alerts/day',
      'Standard email support',
    ],
    lockedFeatures: [
      'AI probability engine',
      'Liquidity intelligence',
      'Opportunity radar',
    ],
  },
  Trader: {
    planType: 'Trader',
    title: 'Trader',
    tagline: 'The complete toolkit',
    description: 'All 28 pairs, every timeframe, AI analysis and live opportunity radar. The choice of serious full-time retail traders.',
    buttonVariant: 'solid',
    popular: true,
    color: 'emerald',
    annualSaving: 'Save $98/yr',
    features: [
      'All 28 pairs — full coverage',
      'All timeframes: M1 to Weekly',
      'Unlimited channel scanner',
      'Full breakout engine + push/Telegram/email alerts',
      'AI probability engine (100 analyses/day)',
      'Basic liquidity intelligence',
      'Opportunity radar — Top 5 setups',
      '100 alerts/day',
      'Priority email support',
    ],
  },
  ProTrader: {
    planType: 'ProTrader',
    title: 'Pro Trader',
    tagline: 'For full-time traders',
    description: 'Unlimited AI analyses, full liquidity engine, SMS alerts, API access and 90-day signal history for the professional edge.',
    buttonVariant: 'outline',
    color: 'violet',
    annualSaving: 'Save $198/yr',
    features: [
      'Everything in Trader',
      'Unlimited AI probability analyses',
      'Full liquidity intelligence engine',
      'Full opportunity radar — unlimited',
      'Unlimited alerts + SMS alerts',
      'API access (1,000 calls/day)',
      '90-day signal history',
      'Priority support (12h response)',
    ],
  },
  Institutional: {
    planType: 'Institutional',
    title: 'Institutional',
    tagline: 'Prop firms & funds',
    description: 'Team access, unlimited API, white-label reports, custom webhooks and a dedicated account manager for serious operations.',
    buttonVariant: 'outline',
    color: 'amber',
    annualSaving: 'Save $598/yr',
    features: [
      'Everything in Pro Trader',
      '5 team seats included',
      'Unlimited API calls',
      'White-label PDF intelligence reports',
      'Custom webhook integrations',
      'Historical data export (CSV/JSON)',
      'Dedicated account manager',
      'SLA-backed uptime guarantee',
    ],
  },
};

type PricingMatrix = Record<Region, Record<PlanType, PricingDetail>>;

const pricingMatrix: PricingMatrix = {
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
  return pricingMatrix[region][plan];
}
