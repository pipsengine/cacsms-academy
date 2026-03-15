import DashboardLayout from '@/components/DashboardLayout';
import BreakoutProbabilityTable from '@/components/BreakoutProbabilityTable';
import UsageLimiter from '@/components/UsageLimiter';

export default function BreakoutEnginePage() {
  return (
    <DashboardLayout>
      <div className="h-full min-h-[600px]">
        <UsageLimiter featureName="Breakout Engine">
          <BreakoutProbabilityTable />
        </UsageLimiter>
      </div>
    </DashboardLayout>
  );
}
