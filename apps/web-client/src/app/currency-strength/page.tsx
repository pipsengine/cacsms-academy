import DashboardLayout from '@/components/DashboardLayout';
import CurrencyStrengthHeatmap from '@/components/CurrencyStrengthHeatmap';
import AccessControl from '@/components/AccessControl';

export default function CurrencyStrengthPage() {
  return (
    <DashboardLayout>
      <div className="h-full min-h-[600px]">
        <AccessControl requiredPlan="Scout" moduleName="Currency Strength Analytics">
          <CurrencyStrengthHeatmap />
        </AccessControl>
      </div>
    </DashboardLayout>
  );
}
