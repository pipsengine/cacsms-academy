import DashboardLayout from '@/components/DashboardLayout';
import UsageLimiter from '@/components/UsageLimiter';
import AccessControl from '@/components/AccessControl';
import LiquidityIntelPanel from '@/components/LiquidityIntelPanel';

export default function LiquidityIntelPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium text-zinc-900">Liquidity Intelligence</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Monitor sweep behavior, range edges, displacement pressure, and the nearest liquidity pools across tracked forex pairs.
          </p>
        </div>

        <AccessControl requiredPlan="Trader" moduleName="Liquidity Intelligence">
          <UsageLimiter featureName="Liquidity Intelligence">
            <LiquidityIntelPanel />
          </UsageLimiter>
        </AccessControl>
      </div>
    </DashboardLayout>
  );
}
