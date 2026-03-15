import DashboardLayout from '@/components/DashboardLayout';
import AlertHistoryLog from '@/components/AlertHistoryLog';
import UsageLimiter from '@/components/UsageLimiter';

export default function AlertHistoryPage() {
  return (
    <DashboardLayout>
      <div className="h-full min-h-[600px]">
        <UsageLimiter featureName="Alert System">
          <AlertHistoryLog />
        </UsageLimiter>
      </div>
    </DashboardLayout>
  );
}
