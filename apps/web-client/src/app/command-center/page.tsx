import DashboardLayout from '@/components/DashboardLayout';
import AccessControl from '@/components/AccessControl';
import CurrencyStrengthHeatmap from '@/components/CurrencyStrengthHeatmap';
import ActiveChannelScanner from '@/components/ActiveChannelScanner';
import BreakoutProbabilityTable from '@/components/BreakoutProbabilityTable';
import OpportunityRanking from '@/components/OpportunityRanking';

export default function CommandCenterPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium text-zinc-100">Multi-Engine Market Overview</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Cross-market command view for strength, structure, breakout risk, and ranked opportunities.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AccessControl requiredPlan="Scout" moduleName="Currency Strength Analytics">
            <CurrencyStrengthHeatmap />
          </AccessControl>

          <AccessControl requiredPlan="Analyst" moduleName="Channel Scanner">
            <BreakoutProbabilityTable />
          </AccessControl>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AccessControl requiredPlan="Analyst" moduleName="Channel Scanner">
            <ActiveChannelScanner />
          </AccessControl>

          <div className="min-h-[620px]">
            <AccessControl requiredPlan="Trader" moduleName="AI Probability Engine">
              <OpportunityRanking />
            </AccessControl>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
