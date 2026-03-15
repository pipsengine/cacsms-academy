'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

type Region = 'international' | 'nigeria';
type PlanType = 'Free' | 'Professional' | 'Premium';

type PricingPlansProps = {
  mode?: 'section' | 'page';
};

function getInitialRegion(userCountry: string | undefined): Region {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('pricing-region');
    if (stored === 'international' || stored === 'nigeria') return stored;
  }
  return userCountry === 'Nigeria' ? 'nigeria' : 'international';
}

export default function PricingPlans({ mode = 'section' }: PricingPlansProps) {
  const { user } = useAuth();
  const [region, setRegion] = useState<Region>(() => getInitialRegion(user?.country));
  const [loading, setLoading] = useState<PlanType | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem('pricing-region', region);
  }, [region]);

  const pricing = useMemo(() => {
    const isNigeria = region === 'nigeria';
    return {
      currencySymbol: isNigeria ? '₦' : '$',
      free: '0',
      professional: isNigeria ? '4,999' : '3.99',
      premium: isNigeria ? '9,999' : '8.99',
      period: '/month',
    };
  }, [region]);

  const plans = useMemo(() => {
    return [
      {
        planType: 'Free' as const,
        title: 'Free Plan',
        description:
          'Allows users to explore the platform’s core capabilities and experience automated Forex market intelligence with limited scanning access.',
        price: pricing.free,
        buttonVariant: 'outline' as const,
        features: [
          'Restricted scans and alerts',
          'Basic dashboard access',
          'Limited timeframe analysis',
          'Community support',
        ],
      },
      {
        planType: 'Professional' as const,
        title: 'Professional Plan',
        description:
          'Unlocks expanded analytical capabilities including full channel scanning and breakout detection systems.',
        price: pricing.professional,
        buttonVariant: 'solid' as const,
        popular: true,
        features: [
          'Full scanner access',
          'Breakout detection system',
          'Currency strength engine',
          'Expanded timeframe analysis',
          'Priority email support',
        ],
      },
      {
        planType: 'Premium' as const,
        title: 'Premium Plan',
        description:
          'Provides unrestricted access to all intelligence engines including AI probability analysis, liquidity detection, and opportunity radar ranking.',
        price: pricing.premium,
        buttonVariant: 'outline' as const,
        features: [
          'Everything in Professional',
          'AI probability analysis',
          'Liquidity detection engine',
          'Opportunity radar ranking',
          'Unlimited alerts',
          '24/7 priority support',
        ],
      },
    ];
  }, [pricing.free, pricing.premium, pricing.professional]);

  const onSelectPlan = async (plan: PlanType) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, region }),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) {
        setLoading(null);
        return;
      }

      window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  };

  const content = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        mode="register"
        defaultCountry={region === 'nigeria' ? 'Nigeria' : 'International'}
      />
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">Subscription Plans</h2>
        <p className="text-lg text-zinc-600">
          Intel Trader offers three subscription tiers designed to serve traders with different analytical needs.
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setRegion('international')}
            className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
              region === 'international' ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            International
          </button>
          <button
            type="button"
            onClick={() => setRegion('nigeria')}
            className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
              region === 'nigeria' ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Nigeria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isPopular = plan.popular === true;
          const buttonLabel = loading === plan.planType ? 'Processing...' : 'Get started today';
          const cardBase =
            'relative rounded-3xl border bg-white p-8 shadow-sm flex flex-col min-h-[520px]';
          const cardClass = isPopular
            ? `${cardBase} border-indigo-600 shadow-xl`
            : `${cardBase} border-zinc-200`;

          const primaryButtonClass =
            plan.buttonVariant === 'solid'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-white hover:bg-zinc-50 text-indigo-700 border border-indigo-300';

          const buttonDisabled = loading !== null || (user?.plan === plan.planType && !!user);

          return (
            <div key={plan.planType} className={cardClass}>
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold">
                  Most popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-zinc-900">{plan.title}</h3>
                <p className="text-zinc-600 mt-3 min-h-[72px]">{plan.description}</p>
                <div className="mt-6 flex items-end gap-2">
                  <div className="text-4xl font-extrabold text-zinc-900">
                    {pricing.currencySymbol}
                    {plan.price}
                  </div>
                  <div className="text-sm text-zinc-500 pb-1">{pricing.period}</div>
                </div>
              </div>

              <button
                type="button"
                disabled={buttonDisabled}
                onClick={() => onSelectPlan(plan.planType)}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-colors ${
                  buttonDisabled ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200' : primaryButtonClass
                }`}
              >
                {user?.plan === plan.planType ? 'Current Plan' : buttonLabel}
              </button>

              {!user && (
                <div className="mt-3 text-center text-sm text-zinc-500">
                  Already have an account?{' '}
                  <Link href="/login" className="text-indigo-700 hover:underline">
                    Login
                  </Link>
                </div>
              )}

              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-zinc-700">
                    <Check className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (mode === 'page') {
    return <div className="min-h-screen bg-zinc-50 py-16">{content}</div>;
  }

  return (
    <section id="pricing" className="py-24 bg-zinc-50 border-y border-zinc-200">
      {content}
    </section>
  );
}
