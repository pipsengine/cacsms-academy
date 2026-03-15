import DashboardLayout from '@/components/DashboardLayout';
import ActiveChannelScanner from '@/components/ActiveChannelScanner';
import UsageLimiter from '@/components/UsageLimiter';

export default function ChannelScannerPage() {
  return (
    <DashboardLayout>
      <div className="h-full min-h-[600px]">
        <UsageLimiter featureName="Channel Scanner">
          <ActiveChannelScanner />
        </UsageLimiter>
      </div>
    </DashboardLayout>
  );
}
