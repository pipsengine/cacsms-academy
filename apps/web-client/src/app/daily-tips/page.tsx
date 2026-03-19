import DashboardLayout from '@/components/DashboardLayout';
import AppSectionLayout from '@/components/AppSectionLayout';
import DailyTradingTipPreview from '@/components/DailyTradingTipPreview';

export default function DailyTipsPage() {
  return (
    <DashboardLayout>
      <AppSectionLayout
        title="Daily Tips"
        description="Daily actionable forex guidance with market context, pair focus, and execution discipline."
        navItems={[
          { id: 'today-tip', label: "Today's Tip", helper: 'Live generated tip with market state' },
          { id: 'how-to-use', label: 'How to Use', helper: 'Execution flow for daily application' },
          { id: 'risk-checklist', label: 'Risk Checklist', helper: 'Protect downside before entry' },
        ]}
      >
        <section id="today-tip" className="scroll-mt-28 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Today&apos;s Tip</h3>
          <div className="mt-4">
            <DailyTradingTipPreview />
          </div>
        </section>

        <section id="how-to-use" className="scroll-mt-28 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">How to Use</h3>
          <ol className="mt-4 list-decimal pl-5 space-y-2 text-sm text-zinc-300">
            <li>Read the market state first, then check if your chart matches that context.</li>
            <li>Only execute when your trigger confirms (close, retest, or rejection rule).</li>
            <li>Keep risk fixed (e.g., 1%) so one bad trade does not break weekly performance.</li>
          </ol>
        </section>

        <section id="risk-checklist" className="scroll-mt-28 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Risk Checklist</h3>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            <li>Invalidation level is defined before entry.</li>
            <li>Stop-loss is placed beyond structure, not emotion.</li>
            <li>Position size is calculated from fixed account risk.</li>
            <li>No revenge entries after a failed setup.</li>
          </ul>
        </section>
      </AppSectionLayout>
    </DashboardLayout>
  );
}
