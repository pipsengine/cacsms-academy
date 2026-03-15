import DashboardLayout from '@/components/DashboardLayout';
import CurrencyStrengthHeatmap from '@/components/CurrencyStrengthHeatmap';
import ActiveChannelScanner from '@/components/ActiveChannelScanner';
import BreakoutProbabilityTable from '@/components/BreakoutProbabilityTable';
import AlertHistoryLog from '@/components/AlertHistoryLog';
import AccessControl from '@/components/AccessControl';
import UsageLimiter from '@/components/UsageLimiter';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div>
            <AccessControl requiredPlan="Professional" moduleName="Currency Strength Analytics">
              <CurrencyStrengthHeatmap />
            </AccessControl>
          </div>
          <div>
            <UsageLimiter featureName="Channel Scanner">
              <ActiveChannelScanner />
            </UsageLimiter>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div>
            <UsageLimiter featureName="Breakout Engine">
              <BreakoutProbabilityTable />
            </UsageLimiter>
          </div>
          <div>
            <UsageLimiter featureName="Alert System">
              <AlertHistoryLog />
            </UsageLimiter>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
