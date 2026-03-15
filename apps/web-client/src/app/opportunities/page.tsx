import DashboardLayout from '@/components/DashboardLayout';
import OpportunityRanking from '@/components/OpportunityRanking';
import UsageLimiter from '@/components/UsageLimiter';

export default function OpportunitiesPage() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-medium text-zinc-100">Advanced Intelligence Modules</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Extended analytics layer: Fractal Alignment, Market Regime, Volatility Cycles, and AI Confidence.
          </p>
        </div>
        
        <div className="flex-1 min-h-0">
          <UsageLimiter featureName="AI Probability Engine">
            <OpportunityRanking />
          </UsageLimiter>
        </div>
      </div>
    </DashboardLayout>
  );
}
