import DashboardLayout from '@/components/DashboardLayout';
import BreakoutProbabilityTable from '@/components/BreakoutProbabilityTable';
import UsageLimiter from '@/components/UsageLimiter';
import AccessControl from '@/components/AccessControl';

export default function BreakoutEnginePage() {
  return (
    <DashboardLayout>
      <div className="h-full min-h-[600px]">
        <AccessControl requiredPlan="Analyst" moduleName="Breakout Engine">
          <UsageLimiter featureName="Breakout Engine">
            <BreakoutProbabilityTable />
          </UsageLimiter>
        </AccessControl>
      </div>
    </DashboardLayout>
  );
}
