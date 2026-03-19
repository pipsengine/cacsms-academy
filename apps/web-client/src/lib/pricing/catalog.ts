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
    title: 'Free',
    tagline: 'Perfect to start',
    description: 'Explore institutional-grade market analysis and build a solid trading foundation—no credit card required.',
    buttonVariant: 'outline',
    color: 'zinc',
    features: [
      'Analyze 5 major currency pairs in real-time',
      'Currency strength insights with real-time updates',
      'AI-powered trade probability insights (up to 5/day)',
      'Automated channel detection across key levels',
      'Get real-time alerts on high-probability setups',
      'Access to community forum and trading guides',
      'Basic dashboard with core market intelligence',
    ],
    lockedFeatures: [
      'Unlimited AI probability analyses',
      'Full liquidity intelligence engine',
      'Opportunity radar with ranked setups',
      'API access for integrations',
      'Advanced alert channels (Telegram, SMS)',
    ],
  },
  Analyst: {
    planType: 'Analyst',
    title: 'Growth',
    tagline: 'For expanding traders',
    description: 'Expand your market coverage with real-time analysis, automated setups, and priority support to scale your edge.',
    buttonVariant: 'outline',
    color: 'blue',
    annualSaving: 'Save $38/yr',
    features: [
      'Monitor 14 major and minor currency pairs 24/7',
      'Real-time currency strength heatmap with rankings',
      'Channel detection across multiple timeframes (M15, H1, H4)',
      'Automated breakout alerts with high accuracy',
      'AI-powered analyses—up to 50 per day',
      'Receive unlimited alerts via email',
      'Priority email support—response within 6 hours',
      'Access to advanced trading guides and case studies',
    ],
    lockedFeatures: [
      'Unlimited AI probability analyses',
      'Advanced liquidity intelligence',
      'Opportunity radar for ranked trades',
      'API access for custom workflows',
      'SMS and Telegram notifications',
    ],
  },
  Trader: {
    planType: 'Trader',
    title: 'Trader',
    tagline: 'Most popular choice',
    description: 'The go-to platform for professional traders. Full market access, AI-powered insights, and unlimited automated analysis—all in one place.',
    buttonVariant: 'solid',
    popular: true,
    color: 'emerald',
    annualSaving: 'Save $98/yr',
    features: [
      'Trade all 28 forex pairs across every timeframe',
      'Unlimited channel scans and breakout detection',
      'AI-powered trade probability scores—no daily limits',
      'Automatically ranked top 5 trade setups every hour',
      'Full liquidity intelligence for smarter entries',
      'Unlimited alerts across all channels (email, push, Telegram)',
      'Advanced dashboard with historical signal tracking',
      'Priority support with 1-hour response guarantee',
      'Access to exclusive trading strategies and webinars',
    ],
  },
  ProTrader: {
    planType: 'ProTrader',
    title: 'Elite',
    tagline: 'For full-time traders',
    description: 'Maximum edge with unlimited analyses, API access, SMS alerts, and dedicated support—built for serious traders running daily operations.',
    buttonVariant: 'outline',
    color: 'violet',
    annualSaving: 'Save $198/yr',
    features: [
      'Everything in Trader plan',
      'Unlimited AI-powered probability analyses',
      'Advanced liquidity intelligence with deeper insights',
      'Custom opportunity radar alerts tailored to your strategy',
      'SMS and Telegram notifications for critical setups',
      'API access—1,000+ calls per day for integrations',
      'Complete 90-day historical data and signal archive',
      'Dedicated support specialist with phone access',
      'Monthly strategy consultation calls',
      'Advanced webhook integration for custom workflows',
    ],
  },
  Institutional: {
    planType: 'Institutional',
    title: 'Institutional',
    tagline: 'Professional teams & funds',
    description: 'Enterprise-grade market intelligence platform built for prop firms, funds, and professional teams. Unlimited everything with white-label options.',
    buttonVariant: 'outline',
    color: 'amber',
    annualSaving: 'Save $598/yr',
    features: [
      'Everything in Elite plan',
      '5 team seats included (add more seats if needed)',
      'Unlimited API calls with priority queue',
      'White-label PDF intelligence reports for clients',
      'Custom webhook integrations and API documentation',
      'Complete historical data exports (CSV, JSON, SQL)',
      'Dedicated account manager and technical support',
      'SLA-backed 99.9% uptime guarantee',
      'Custom data retention policies',
      'Multi-office single sign-on (SSO) support',
      'Quarterly business reviews and optimization sessions',
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
