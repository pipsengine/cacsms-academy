import DashboardLayout from '@/components/DashboardLayout';
import DailyTradingTipPreview from '@/components/DailyTradingTipPreview';

export default function DailyTradingTipPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-xl font-medium text-zinc-100">Prompt 1: Daily Trading Tips</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Institutional-grade daily tip generated with current market context and actionable execution guidance.
          </p>
        </div>

        <DailyTradingTipPreview />

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Output Contract</p>
          <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
            The generator returns strict JSON with title, tip, pairs, market_state, actionable_insight, and image_prompt.
            If market data is weak, it falls back to an educational but actionable scenario.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
