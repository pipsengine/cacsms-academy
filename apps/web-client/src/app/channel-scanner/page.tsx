import DashboardLayout from '@/components/DashboardLayout';
import ActiveChannelScanner from '@/components/ActiveChannelScanner';
import UsageLimiter from '@/components/UsageLimiter';
import AccessControl from '@/components/AccessControl';

export default function ChannelScannerPage() {
  return (
    <DashboardLayout>
      <div className="h-full min-h-[600px]">
        <AccessControl requiredPlan="Analyst" moduleName="Channel Scanner">
          <UsageLimiter featureName="Channel Scanner">
            <ActiveChannelScanner />
          </UsageLimiter>
        </AccessControl>
      </div>
    </DashboardLayout>
  );
}
