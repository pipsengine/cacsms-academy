import DashboardLayout from '@/components/DashboardLayout';
import { ShieldAlert } from 'lucide-react';
import UsageLimiter from '@/components/UsageLimiter';

export default function LiquidityIntelPage() {
  return (
    <DashboardLayout>
      <div className="h-full min-h-[600px] flex items-center justify-center border border-zinc-800/50 bg-zinc-900/20 rounded-xl">
        <UsageLimiter featureName="Liquidity Intelligence">
          <div className="text-center">
            <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-zinc-400">Liquidity Intel</h2>
            <p className="text-sm text-zinc-500 mt-2">Module initializing...</p>
          </div>
        </UsageLimiter>
      </div>
    </DashboardLayout>
  );
}
