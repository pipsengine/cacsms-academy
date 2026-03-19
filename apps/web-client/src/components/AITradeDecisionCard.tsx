'use client';

import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, CalendarDays, CalendarRange, CalendarClock, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

type DecisionPick = {
  pair: string;
  direction: 'LONG' | 'SHORT';
  confidence: number;
  currentPrice: number;
  timeframe: string;
  tradeType: 'Breakout Continuation' | 'Compression Release' | 'Channel Reversal';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  riskPct: number;
  riskAcceptable: boolean;
  confirmations: Array<{ timeframe: string; direction: 'LONG' | 'SHORT' }>;
  regime: string;
};

type HorizonDecision = {
  horizon: 'Daily' | 'Weekly' | 'Monthly';
  timeframe: string;
  picks: DecisionPick[];
};

type DecisionPayload = {
  provider: string;
  generatedAt: string;
  minimumConfidence: number;
  horizons: HorizonDecision[];
};

function formatPrice(pair: string, value: number): string {
  return pair.endsWith('JPY') ? value.toFixed(3) : value.toFixed(5);
}

function horizonIcon(horizon: HorizonDecision['horizon']) {
  if (horizon === 'Daily') return <CalendarDays className="w-3.5 h-3.5" />;
  if (horizon === 'Weekly') return <CalendarRange className="w-3.5 h-3.5" />;
  return <CalendarClock className="w-3.5 h-3.5" />;
}

export default function AITradeDecisionCard() {
  const [payload, setPayload] = useState<DecisionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch('/api/market/decisions?minConfidence=95', { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        if (!active || !res.ok || !data) return;
        setPayload(data);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const interval = setInterval(() => void load(), 60_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const totalPicks = useMemo(
    () => payload?.horizons?.reduce((sum, horizon) => sum + horizon.picks.length, 0) ?? 0,
    [payload]
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-zinc-500">
        Loading AI decision engine...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">AI Trade Decision</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1">
          {payload?.minimumConfidence ?? 95}%+ FILTER
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>{payload?.provider?.toUpperCase() || 'MARKET'} · {payload?.generatedAt ? new Date(payload.generatedAt).toLocaleTimeString() : '--'}</span>
          <span className="text-zinc-300">{totalPicks} Qualified Picks</span>
        </div>

        {(payload?.horizons ?? []).map((horizon) => (
          <div key={horizon.horizon} className="rounded-lg border border-zinc-800/70 bg-zinc-950/40 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-zinc-200">
                {horizonIcon(horizon.horizon)}
                <span className="font-semibold">{horizon.horizon}</span>
                <span className="text-[10px] font-mono text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5">{horizon.timeframe}</span>
              </div>
            </div>

            {horizon.picks.length > 0 ? (
              <div className="space-y-2">
                {horizon.picks.map((pick) => (
                  <div key={`${horizon.horizon}-${pick.pair}`} className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-sm font-bold text-zinc-100">{pick.pair}</div>
                          <div className="text-xs font-mono text-emerald-400 tabular-nums">{formatPrice(pick.pair, pick.currentPrice)}</div>
                          {pick.confirmations.length > 0 && (
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                              {pick.confirmations.map((item) => `${item.timeframe} ${item.direction}`).join(' · ')}
                            </div>
                          )}
                          <div className="text-[10px] font-mono text-zinc-500 mt-1">{pick.tradeType}</div>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                          pick.direction === 'LONG'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {pick.direction === 'LONG' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {pick.direction}
                        </span>
                      </div>

                      <div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-zinc-100">{pick.confidence}%</div>
                          <div className="text-[10px] text-zinc-500">{pick.regime}</div>
                        </div>
                        <div className={`mt-1 text-[10px] font-mono px-2 py-1 rounded border text-right ${
                          pick.riskAcceptable
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                            : 'border-red-500/20 bg-red-500/10 text-red-300'
                        }`}>
                          RR {pick.riskReward.toFixed(2)} · Risk {pick.riskPct.toFixed(3)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
                      <div className="rounded border border-zinc-800 bg-zinc-950/40 px-2 py-2">
                        <div className="text-zinc-500">ENTRY</div>
                        <div className="mt-1 text-zinc-100">{formatPrice(pick.pair, pick.entry)}</div>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-950/40 px-2 py-2">
                        <div className="text-zinc-500">STOP</div>
                        <div className="mt-1 text-zinc-100">{formatPrice(pick.pair, pick.stopLoss)}</div>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-950/40 px-2 py-2">
                        <div className="text-zinc-500">TARGET</div>
                        <div className="mt-1 text-zinc-100">{formatPrice(pick.pair, pick.takeProfit)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-xs text-zinc-500 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                No setup passed the {payload?.minimumConfidence ?? 95}% confidence and condition gate.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
