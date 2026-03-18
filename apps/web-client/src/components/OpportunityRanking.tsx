'use client';

import React, { useEffect, useState } from 'react';
import { Target, Activity, Zap, Layers, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import type { RankedOpportunity } from '@/lib/intelligence/types';

export default function OpportunityRanking() {
  const [opportunities, setOpportunities] = useState<RankedOpportunity[]>([]);
  const [provider, setProvider] = useState('market');

  useEffect(() => {
    let active = true;

    const load = async () => {
      const res = await fetch('/api/market/opportunities', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!active || !res.ok) return;
      setProvider(data?.provider ?? 'market');
      setOpportunities(data?.opportunities ?? []);
    };

    void load();
    const interval = setInterval(() => void load(), 60_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Opportunity Ranking Engine</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
          {provider.toUpperCase()} ACTIVE
        </span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {opportunities.length ? opportunities.map((opp) => (
            <div key={opp.pair} className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-800 text-xs font-mono text-zinc-400 border border-zinc-700">
                    #{opp.rank}
                  </div>
                  <h4 className="text-lg font-bold text-zinc-100">{opp.pair}</h4>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                    opp.direction === 'LONG'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {opp.direction === 'LONG' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {opp.direction}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono text-zinc-100">{opp.compositeScore}<span className="text-sm text-zinc-500">%</span></div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">{opp.confidenceClass}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <MetricCard icon={<Layers />} label="Fractal Align" value={`${opp.fractalScore}%`} />
                <MetricCard icon={<Activity />} label="Regime" value={opp.regime} />
                <MetricCard icon={<Zap />} label="Breakout Prob" value={`${opp.breakoutProb}%`} />
                <MetricCard icon={<BarChart3 />} label="Vol Expansion" value={`${opp.volatilityExpansion}%`} />
              </div>

              {opp.correlations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Macro Correlation:</span>
                  {opp.correlations.map(corr => (
                    <span key={corr.asset} className="text-xs text-zinc-300 bg-zinc-800/50 px-2 py-1 rounded">
                      {corr.asset} <span className={corr.correlationScore > 0 ? 'text-emerald-400' : 'text-red-400'}>{corr.correlationScore > 0 ? '+' : ''}{corr.correlationScore}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )) : (
            <div className="text-center text-zinc-500 py-8">No ranked opportunities available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-zinc-950/50 rounded border border-zinc-800/50 p-2 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-zinc-500">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-3 h-3' })}
        <span className="text-[10px] font-mono uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="text-sm font-medium text-zinc-200 truncate">{value}</div>
    </div>
  );
}
