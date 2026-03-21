'use client';

import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AccessControl from '@/components/AccessControl';
import CurrencyStrengthHeatmap from '@/components/CurrencyStrengthHeatmap';
import AITradeDecisionCard from '@/components/AITradeDecisionCard';
import ActiveChannelScanner from '@/components/ActiveChannelScanner';
import BreakoutProbabilityTable from '@/components/BreakoutProbabilityTable';
import OpportunityRanking from '@/components/OpportunityRanking';
import { useAuth } from '@/components/AuthProvider';
import { getAccessibleFeatures } from '@/lib/auth/permissions';

export default function CommandCenterPage() {
  const { user } = useAuth();
  const features = getAccessibleFeatures(user);
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const [topRowHeight, setTopRowHeight] = useState<number | null>(null);

  useEffect(() => {
    const target = leftColumnRef.current;
    if (!target) return;

    const updateHeight = () => {
      setTopRowHeight(Math.ceil(target.getBoundingClientRect().height));
    };

    updateHeight();
    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(target);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium text-zinc-900">Multi-Engine Market Overview</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Your dashboard automatically reflects the modules unlocked by your current subscription package.
          </p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {features.currencyStrength && (
            <div ref={leftColumnRef} className="space-y-6 self-start">
              <AccessControl requiredPlan="Scout" moduleName="Currency Strength Analytics">
                <CurrencyStrengthHeatmap />
              </AccessControl>

              <AccessControl requiredPlan="Trader" moduleName="AI Decision Engine">
                <AITradeDecisionCard />
              </AccessControl>
            </div>
          )}

          {features.breakoutEngine && (
            <div
              className="min-h-0 self-start overflow-hidden"
              style={topRowHeight ? { height: `${topRowHeight}px` } : undefined}
            >
              <AccessControl requiredPlan="Analyst" moduleName="Breakout Engine">
                <div className="h-full min-h-0">
                  <BreakoutProbabilityTable />
                </div>
              </AccessControl>
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {features.channelScanner && (
            <div className="h-[620px]">
              <AccessControl requiredPlan="Analyst" moduleName="Channel Scanner">
                <ActiveChannelScanner />
              </AccessControl>
            </div>
          )}

          {features.opportunityRadar && (
            <div className="h-[620px]">
              <AccessControl requiredPlan="Trader" moduleName="AI Probability Engine">
                <OpportunityRanking />
              </AccessControl>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
