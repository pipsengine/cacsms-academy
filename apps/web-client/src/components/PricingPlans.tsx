'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Lock, Zap, ArrowRight } from 'lucide-react';
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
  showTrustIndicators?: boolean;
};

const colorMap: Record<string, { badge: string; check: string; button: string; buttonOutline: string; ring: string; heading: string; border?: string }> = {
  zinc: {
    badge: 'bg-zinc-100 text-zinc-600',
    check: 'text-zinc-400',
    button: 'bg-zinc-900 hover:bg-zinc-800 text-white',
    buttonOutline: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50',
    ring: 'border-zinc-200',
    heading: 'text-zinc-900',
    border: 'border-zinc-200',
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700',
    check: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonOutline: 'border border-blue-300 text-blue-700 hover:bg-blue-50',
    ring: 'border-blue-200',
    heading: 'text-blue-900',
    border: 'border-blue-200',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700',
    check: 'text-emerald-500',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    buttonOutline: 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50',
    ring: 'border-emerald-500 shadow-lg shadow-emerald-200/50',
    heading: 'text-emerald-900',
    border: 'border-emerald-500',
  },
  violet: {
    badge: 'bg-violet-50 text-violet-700',
    check: 'text-violet-500',
    button: 'bg-violet-600 hover:bg-violet-700 text-white',
    buttonOutline: 'border border-violet-300 text-violet-700 hover:bg-violet-50',
    ring: 'border-violet-200',
    heading: 'text-violet-900',
    border: 'border-violet-200',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700',
    check: 'text-amber-500',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    buttonOutline: 'border border-amber-300 text-amber-700 hover:bg-amber-50',
    ring: 'border-amber-200',
    heading: 'text-amber-900',
    border: 'border-amber-200',
  },
};

export default function PricingPlans({ mode = 'section', showTrustIndicators = true }: PricingPlansProps) {
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

  const getCTALabel = (plan: PlanType, isBusy: boolean, isCurrentPlan: boolean, isLowerThanCurrent: boolean, isFree: boolean) => {
    if (isCurrentPlan) return 'Current Plan';
    if (isLowerThanCurrent) return 'Downgrade Unavailable';
    if (isBusy) return 'Processing...';
    if (isFree) return 'Get Started Free';
    if (currentPlanRank >= 0) return 'Upgrade Plan';
    return billing === 'annual' ? 'Subscribe Annually' : 'Subscribe Now';
  };

  const content = (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto" style={{ maxWidth: '1600px' }}>
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          mode="register"
          defaultCountry={region === 'nigeria' ? 'Nigeria' : 'International'}
        />

        {mode === 'page' && showTrustIndicators && (
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/50 px-6 py-3 shadow-sm">
              <div className="text-sm font-semibold text-zinc-900">✓ Trusted by 10,000+ traders</div>
              <div className="w-px h-4 bg-zinc-200"></div>
              <div className="text-sm font-semibold text-zinc-900">★ 4.9/5 from 500+ reviews</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-6">
            <Zap className="w-4 h-4" /> Institutional-Grade Intelligence
          </div>
          <h2 className="text-5xl sm:text-6xl font-extrabold text-zinc-900 mb-6 tracking-tight leading-tight">
            Trade with Institutional-Grade Intelligence
          </h2>
          <p className="text-xl text-zinc-600 leading-8">
            AI-powered channel analysis, liquidity insights, and real-time opportunities across global forex markets. Find your edge, wherever you are in your trading journey.
          </p>
        </div>

        {/* Controls: billing cycle + region */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          {/* Billing toggle */}
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white p-1.5 shadow-sm gap-1.5">
            <button type="button" onClick={() => setBilling('monthly')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${billing === 'monthly' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900'}`}>
              Monthly
            </button>
            <button type="button" onClick={() => setBilling('annual')}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${billing === 'annual' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900'}`}>
              Annual
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${billing === 'annual' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>-17%</span>
            </button>
          </div>
          {/* Region toggle */}
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white p-1.5 shadow-sm gap-1.5">
            <button type="button" onClick={() => setRegion('international')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${region === 'international' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900'}`}>
              International
            </button>
            <button type="button" onClick={() => setRegion('nigeria')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${region === 'nigeria' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900'}`}>
              Nigeria 🇳🇬
            </button>
          </div>
        </div>

        {/* Cards Grid - 5 columns with improved spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
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
                className={`group relative flex flex-col rounded-2xl border bg-white p-6 sm:p-7 md:p-8 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? `${colors.border} border-2 shadow-lg scale-[1.02]` 
                    : `border-zinc-200 hover:border-zinc-300`
                }`}
                style={{
                  transitionProperty: 'all',
                  transformOrigin: 'center'
                }}
              >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-lg">
                  ⭐ Most Popular
                </div>
              )}
              {billing === 'annual' && plan.annualSaving && !isFree && (
                <div className="absolute top-6 right-6 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  {plan.annualSaving}
                </div>
              )}

              {/* Plan name & tagline */}
              <div className="mb-7">
                <span className={`inline-block text-[11px] font-extrabold px-3 py-1.5 rounded-full mb-4 ${colors.badge}`}>
                  {plan.title}
                </span>
                <div className="text-sm text-zinc-500 font-semibold mb-4 h-5 flex items-center">{plan.tagline}</div>

                {/* Price */}
                <div className="flex items-baseline gap-0.5 flex-wrap mb-2">
                  {isFree ? (
                    <span className="text-4xl sm:text-5xl font-extrabold text-zinc-900">Free</span>
                  ) : (
                    <>
                      <span className="text-lg sm:text-2xl font-bold text-zinc-500">{plan.currencySymbol}</span>
                      <span className="text-4xl sm:text-5xl font-extrabold text-zinc-900 break-words">{plan.displayPrice}</span>
                      <span className="text-sm sm:text-base text-zinc-400 whitespace-nowrap">/mo</span>
                    </>
                  )}
                </div>
                {billing === 'annual' && plan.displayTotal && !isFree && (
                  <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                    {plan.currencySymbol}{plan.displayTotal} billed annually
                  </p>
                )}
                <p className="text-sm text-zinc-600 mt-4 leading-relaxed">{plan.description}</p>
              </div>

              {/* CTA Button - Primary focus */}
              <button
                type="button"
                disabled={buttonDisabled}
                onClick={() => onSelectPlan(plan.planType)}
                className={`w-full py-3.5 px-4 rounded-xl text-base font-bold transition-all duration-200 mb-6 flex items-center justify-center gap-2 group/btn ${
                  buttonDisabled
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    : plan.buttonVariant === 'solid'
                    ? `${colors.button} hover:shadow-lg hover:scale-105 active:scale-95`
                    : `${colors.buttonOutline} hover:shadow-md hover:bg-opacity-50`
                }`}
              >
                {getCTALabel(plan.planType, isBusy, isCurrentPlan, isLowerThanCurrent, isFree)}
                {!buttonDisabled && <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
              </button>

              {user && !isCurrentPlan && !isLowerThanCurrent && currentPlanRank >= 0 && (
                <p className="mb-6 text-center text-xs text-emerald-700 font-medium bg-emerald-50 rounded-lg py-2 px-3">
                  ✓ Pay only the difference from your current plan
                </p>
              )}

              {/* Features - Enhanced spacing and typography */}
              <div className="space-y-3.5 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={`${feature}-${idx}`} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colors.check}`} />
                    <span className="text-sm leading-relaxed text-zinc-700">{feature}</span>
                  </div>
                ))}
                {plan.lockedFeatures?.map((feature, idx) => (
                  <div key={`locked-${feature}-${idx}`} className="flex items-start gap-3 opacity-50">
                    <Lock className="w-5 h-5 mt-0.5 flex-shrink-0 text-zinc-300" />
                    <span className="text-sm leading-relaxed line-through text-zinc-400">{feature}</span>
                  </div>
                ))}
              </div>

              {!user && !isCurrentPlan && (
                <p className="mt-6 text-center text-xs text-zinc-500 border-t border-zinc-200 pt-4">
                  Already have an account?{' '}
                  <Link href="/login" className="text-zinc-900 hover:text-emerald-600 font-semibold transition-colors">Sign in</Link>
                </p>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );

  if (mode === 'page') {
    return <section className="py-20 bg-white">{content}</section>;
  }

  return content;
}
