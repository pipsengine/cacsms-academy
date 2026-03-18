'use client';

import DashboardLayout from '@/components/DashboardLayout';
import AccessControl from '@/components/AccessControl';
import CurrencyStrengthHeatmap from '@/components/CurrencyStrengthHeatmap';
import ActiveChannelScanner from '@/components/ActiveChannelScanner';
import BreakoutProbabilityTable from '@/components/BreakoutProbabilityTable';
import OpportunityRanking from '@/components/OpportunityRanking';
import { useAuth } from '@/components/AuthProvider';
import { getAccessibleFeatures } from '@/lib/auth/permissions';

export default function CommandCenterPage() {
  const { user } = useAuth();
  const features = getAccessibleFeatures(user);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium text-zinc-100">Multi-Engine Market Overview</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Your dashboard automatically reflects the modules unlocked by your current subscription package.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {features.currencyStrength && (
            <AccessControl requiredPlan="Scout" moduleName="Currency Strength Analytics">
              <CurrencyStrengthHeatmap />
            </AccessControl>
          )}

          {features.breakoutEngine && (
            <AccessControl requiredPlan="Analyst" moduleName="Breakout Engine">
              <BreakoutProbabilityTable />
            </AccessControl>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {features.channelScanner && (
            <AccessControl requiredPlan="Analyst" moduleName="Channel Scanner">
              <ActiveChannelScanner />
            </AccessControl>
          )}

          {features.opportunityRadar && (
            <div className="min-h-[620px]">
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
