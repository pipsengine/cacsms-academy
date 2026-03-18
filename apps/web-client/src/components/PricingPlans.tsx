'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Lock, Zap } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import {
  getPricingDetail,
  getPricingDetailFromMatrix,
  planDefinitions,
  planOrder,
  PlanType,
  Region,
  resolveRegion,
  BillingCycle,
  PricingMatrix,
} from '@/lib/pricing/catalog';
import { getPlanRank } from '@/lib/pricing/upgrade';

type PricingPlansProps = {
  mode?: 'section' | 'page';
};

const colorMap: Record<string, { badge: string; check: string; button: string; buttonOutline: string; ring: string; heading: string }> = {
  zinc: {
    badge: 'bg-zinc-100 text-zinc-600',
    check: 'text-zinc-400',
    button: 'bg-zinc-900 hover:bg-zinc-800 text-white',
    buttonOutline: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50',
    ring: 'border-zinc-200',
    heading: 'text-zinc-900',
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700',
    check: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonOutline: 'border border-blue-300 text-blue-700 hover:bg-blue-50',
    ring: 'border-blue-200',
    heading: 'text-blue-900',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700',
    check: 'text-emerald-500',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    buttonOutline: 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50',
    ring: 'border-emerald-500 shadow-emerald-100 shadow-xl',
    heading: 'text-emerald-900',
  },
  violet: {
    badge: 'bg-violet-50 text-violet-700',
    check: 'text-violet-500',
    button: 'bg-violet-600 hover:bg-violet-700 text-white',
    buttonOutline: 'border border-violet-300 text-violet-700 hover:bg-violet-50',
    ring: 'border-violet-200',
    heading: 'text-violet-900',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700',
    check: 'text-amber-500',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    buttonOutline: 'border border-amber-300 text-amber-700 hover:bg-amber-50',
    ring: 'border-amber-200',
    heading: 'text-amber-900',
  },
};

export default function PricingPlans({ mode = 'section' }: PricingPlansProps) {
  const { user } = useAuth();
  const [region, setRegion] = useState<Region>('international');
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState<PlanType | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pricingMatrix, setPricingMatrix] = useState<PricingMatrix | null>(null);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    const loadPricing = async () => {
      const res = await fetch('/api/pricing', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      setPricingMatrix(data?.pricingMatrix ?? null);
    };
    void loadPricing();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const stored = window.localStorage.getItem('pricing-region');
    if (stored === 'international' || stored === 'nigeria') { setRegion(stored); return; }
    if (user?.country === 'Nigeria') setRegion('nigeria');
  }, [hydrated, user?.country]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem('pricing-region', region);
  }, [region, hydrated]);

  const plans = useMemo(() => planOrder.map((planType) => {
    const definition = planDefinitions[planType];
    const pricing = pricingMatrix
      ? getPricingDetailFromMatrix(pricingMatrix, planType, region)
      : getPricingDetail(planType, region);
    const isAnnual = billing === 'annual';
    return {
      ...definition,
      displayPrice: isAnnual ? pricing.annualMonthlyEquivalent : pricing.priceLabel,
      displayTotal: isAnnual ? pricing.annualPriceLabel : null,
      currencySymbol: pricing.currencySymbol,
      unitAmountCents: isAnnual ? pricing.annualUnitAmountCents : pricing.unitAmountCents,
      priceValue: isAnnual ? pricing.annualPriceValue : pricing.priceValue,
    };
  }), [region, billing, pricingMatrix]);

  const currentPlanRank = user?.plan ? getPlanRank(user.plan as PlanType) : -1;

  const onSelectPlan = async (plan: PlanType) => {
    if (!user) { setAuthOpen(true); return; }
    setLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, region, billingCycle: billing }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) { setLoading(null); return; }
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

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-4">
          <Zap className="w-3.5 h-3.5" /> Institutional-Grade Intelligence
        </div>
        <h2 className="text-4xl font-extrabold text-zinc-900 mb-4 tracking-tight">
          Choose your trading edge
        </h2>
        <p className="text-lg text-zinc-500">
          From free exploration to institutional-grade access — every tier built around real trader needs.
        </p>
      </div>

      {/* Controls: billing cycle + region */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        {/* Billing toggle */}
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white p-1 shadow-sm gap-1">
          <button type="button" onClick={() => setBilling('monthly')}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${billing === 'monthly' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
            Monthly
          </button>
          <button type="button" onClick={() => setBilling('annual')}
            className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-full transition-colors ${billing === 'annual' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
            Annual
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${billing === 'annual' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>-17%</span>
          </button>
        </div>
        {/* Region toggle */}
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white p-1 shadow-sm gap-1">
          <button type="button" onClick={() => setRegion('international')}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${region === 'international' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
            International
          </button>
          <button type="button" onClick={() => setRegion('nigeria')}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${region === 'nigeria' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
            Nigeria 🇳🇬
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {plans.map((plan) => {
          const colors = colorMap[plan.color] ?? colorMap.zinc;
          const isCurrentPlan = user?.plan === plan.planType;
          const isLowerThanCurrent = currentPlanRank >= 0 && getPlanRank(plan.planType) < currentPlanRank;
          const isBusy = loading === plan.planType;
          const isFree = plan.priceValue === 0;
          const buttonDisabled = isBusy || isCurrentPlan || isLowerThanCurrent;

          return (
            <div
              key={plan.planType}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 transition-shadow ${
                plan.popular ? `${colors.ring} shadow-xl scale-[1.02]` : `border-zinc-200 hover:shadow-md`
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow">
                  Most Popular
                </div>
              )}
              {billing === 'annual' && plan.annualSaving && !isFree && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {plan.annualSaving}
                </div>
              )}

              {/* Plan name & tagline */}
              <div className="mb-5">
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${colors.badge}`}>
                  {plan.title}
                </span>
                <div className="text-xs text-zinc-400 font-medium mb-3">{plan.tagline}</div>

                {/* Price */}
                <div className="flex items-end gap-1 mb-1">
                  {isFree ? (
                    <span className="text-4xl font-extrabold text-zinc-900">Free</span>
                  ) : (
                    <>
                      <span className="text-lg font-bold text-zinc-500 mb-1">{plan.currencySymbol}</span>
                      <span className="text-4xl font-extrabold text-zinc-900">{plan.displayPrice}</span>
                      <span className="text-sm text-zinc-400 mb-1">/mo</span>
                    </>
                  )}
                </div>
                {billing === 'annual' && plan.displayTotal && !isFree && (
                  <p className="text-xs text-zinc-400">
                    {plan.currencySymbol}{plan.displayTotal} billed annually
                  </p>
                )}
                <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{plan.description}</p>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                disabled={buttonDisabled}
                onClick={() => onSelectPlan(plan.planType)}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-colors mb-5 ${
                  buttonDisabled
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    : plan.buttonVariant === 'solid'
                    ? colors.button
                    : colors.buttonOutline
                }`}
              >
                {isCurrentPlan
                  ? 'Current Plan'
                  : isLowerThanCurrent
                  ? 'Downgrade Unavailable'
                  : isBusy
                  ? 'Processing...'
                  : isFree
                  ? 'Get Started Free'
                  : currentPlanRank >= 0
                  ? 'Upgrade Plan'
                  : billing === 'annual'
                  ? 'Subscribe Annually'
                  : 'Subscribe Monthly'}
              </button>

              {user && !isCurrentPlan && !isLowerThanCurrent && currentPlanRank >= 0 && (
                <p className="mb-4 text-center text-xs text-emerald-700">
                  You will only be charged the difference from your current plan.
                </p>
              )}

              {/* Features */}
              <div className="space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-zinc-700">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.check}`} />
                    <span className="text-xs leading-relaxed">{feature}</span>
                  </div>
                ))}
                {plan.lockedFeatures?.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-zinc-300">
                    <Lock className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-300" />
                    <span className="text-xs leading-relaxed line-through">{feature}</span>
                  </div>
                ))}
              </div>

              {!user && !isCurrentPlan && (
                <p className="mt-4 text-center text-xs text-zinc-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-zinc-700 hover:underline font-semibold">Login</Link>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust signals */}
      <div className="mt-12 text-center text-sm text-zinc-400 flex flex-wrap items-center justify-center gap-6">
        <span>✓ Cancel anytime</span>
        <span>✓ No hidden fees</span>
        <span>✓ NGN pricing for Nigerian traders</span>
        <span>✓ 14-day free trial on Trader</span>
        <span>✓ Secure payment via Stripe</span>
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
