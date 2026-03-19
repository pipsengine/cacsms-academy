'use client';

import { useEffect, useState } from 'react';

type MarketStatus = {
  provider: string;
  snapshotProvider: string | null;
  generatedAt: string | null;
  refreshMs: number;
  trackedPairs: number;
  stale: boolean;
  mode: 'live' | 'fallback-cache' | 'offline';
  lastErrorMessage: string | null;
};

type RankedOpportunity = {
  rank: number;
  pair: string;
  direction: 'LONG' | 'SHORT';
  compositeScore: number;
  confidenceClass: string;
  regime: string;
};

type OpportunitiesPayload = {
  provider: string;
  generatedAt: string;
  opportunities: RankedOpportunity[];
};

export default function WeeklyAnalysisOverview() {
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [opps, setOpps] = useState<OpportunitiesPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [statusRes, oppsRes] = await Promise.all([
          fetch('/api/market/status', { cache: 'no-store' }),
          fetch('/api/market/opportunities', { cache: 'no-store' }),
        ]);

        const statusPayload = statusRes.ok ? (await statusRes.json()) as MarketStatus : null;
        const oppsPayload = oppsRes.ok ? (await oppsRes.json()) as OpportunitiesPayload : null;

        setStatus(statusPayload);
        setOpps(oppsPayload);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-300">
        Loading weekly analysis snapshot...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Market Health</h3>
        {status ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Metric label="Mode" value={status.mode} />
            <Metric label="Provider" value={status.snapshotProvider ?? status.provider} />
            <Metric label="Tracked Pairs" value={String(status.trackedPairs)} />
            <Metric label="Stale" value={status.stale ? 'Yes' : 'No'} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">Market status unavailable.</p>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Top Opportunities This Week</h3>
        {opps && opps.opportunities.length > 0 ? (
          <div className="mt-4 space-y-3">
            {opps.opportunities.map((opp) => (
              <div key={`${opp.rank}-${opp.pair}`} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-100">#{opp.rank} {opp.pair}</p>
                  <span className={`text-xs font-semibold ${opp.direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {opp.direction}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Score {opp.compositeScore} · {opp.confidenceClass} · {opp.regime}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">No weekly opportunities available yet.</p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}
