import DashboardLayout from '@/components/DashboardLayout';
import AppSectionLayout from '@/components/AppSectionLayout';
import WeeklyAnalysisOverview from '@/components/WeeklyAnalysisOverview';

export default function WeeklyAnalysisPage() {
  return (
    <DashboardLayout>
      <AppSectionLayout
        title="Weekly Analysis"
        description="Weekly context for market regime, top opportunities, and execution priorities."
        navItems={[
          { id: 'snapshot', label: 'Weekly Snapshot', helper: 'Market health and current opportunity board' },
          { id: 'playbook', label: 'Weekly Playbook', helper: 'Plan and execution framework for the week' },
          { id: 'review', label: 'Review Framework', helper: 'How to close the week with useful feedback' },
        ]}
      >
        <section id="snapshot" className="scroll-mt-28">
          <WeeklyAnalysisOverview />
        </section>

        <section id="playbook" className="scroll-mt-28 rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Weekly Playbook</h3>
          <ol className="mt-4 list-decimal pl-5 space-y-2 text-sm text-zinc-600">
            <li>Define directional bias from higher timeframe structure.</li>
            <li>Prioritize top-ranked opportunities by quality, not quantity.</li>
            <li>Predefine invalidation and risk for each setup before execution.</li>
            <li>Reduce trade frequency during unclear regime transitions.</li>
          </ol>
        </section>

        <section id="review" className="scroll-mt-28 rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Review Framework</h3>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li>Track setup quality score versus final outcome.</li>
            <li>Document rule violations separately from market losses.</li>
            <li>Identify one process improvement to apply next week.</li>
          </ul>
        </section>
      </AppSectionLayout>
    </DashboardLayout>
  );
}
