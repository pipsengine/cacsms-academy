'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, TrendingDown, TrendingUp, Waves } from 'lucide-react';

type LiquiditySignal = {
  pair: string;
  timeframe: string;
  currentPrice: number;
  sessionHigh: number;
  sessionLow: number;
  rangePercent: number;
  liquidityBias: 'BUY-SIDE' | 'SELL-SIDE' | 'BALANCED';
  nearestPool: string;
  nearestPoolDistancePct: number;
  sweepState: 'SWEEPED-HIGH' | 'SWEEPED-LOW' | 'INSIDE-RANGE';
  displacementScore: number;
  compressionScore: number;
  actionLabel: string;
};

type LiquidityResponse = {
  provider: string;
  generatedAt: string;
  signals: LiquiditySignal[];
};

export default function LiquidityIntelPanel() {
  const [data, setData] = useState<LiquidityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch('/api/market/liquidity', { cache: 'no-store' });
        const payload = await res.json().catch(() => null);
        if (!active || !res.ok) return;
        setData(payload);
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

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-zinc-500">
        Loading liquidity intelligence...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Liquidity Intelligence</h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          {data?.provider?.toUpperCase() || 'MARKET'} · {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : '--'}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {data?.signals?.length ? data.signals.map((signal) => (
          <div key={signal.pair} className="rounded-lg border border-zinc-800/70 bg-zinc-950/40 p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-zinc-100">{signal.pair}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-400">{signal.timeframe}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    signal.sweepState === 'SWEEPED-HIGH'
                      ? 'border-red-500/30 text-red-400 bg-red-500/10'
                      : signal.sweepState === 'SWEEPED-LOW'
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                      : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                  }`}>
                    {signal.sweepState}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mt-1">{signal.actionLabel}</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-zinc-500">Liquidity Bias</div>
                <div className={`text-sm font-semibold ${
                  signal.liquidityBias === 'BUY-SIDE'
                    ? 'text-emerald-400'
                    : signal.liquidityBias === 'SELL-SIDE'
                    ? 'text-red-400'
                    : 'text-amber-400'
                }`}>
                  {signal.liquidityBias}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricTile label="Current Price" value={formatPrice(signal.pair, signal.currentPrice)} icon={<Waves className="w-3 h-3" />} />
              <MetricTile label="Nearest Pool" value={`${signal.nearestPool} (${signal.nearestPoolDistancePct}%)`} icon={<ShieldAlert className="w-3 h-3" />} />
              <MetricTile label="Compression" value={`${signal.compressionScore}%`} icon={<TrendingDown className="w-3 h-3" />} />
              <MetricTile label="Displacement" value={`${signal.displacementScore}%`} icon={<TrendingUp className="w-3 h-3" />} />
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-400">
              <span>Session High: <span className="text-zinc-200">{formatPrice(signal.pair, signal.sessionHigh)}</span></span>
              <span>Session Low: <span className="text-zinc-200">{formatPrice(signal.pair, signal.sessionLow)}</span></span>
              <span>Range Width: <span className="text-zinc-200">{signal.rangePercent}%</span></span>
            </div>
          </div>
        )) : (
          <div className="text-center text-zinc-500 py-8">No liquidity signals available.</div>
        )}
      </div>
    </div>
  );
}

function MetricTile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded border border-zinc-800/60 bg-zinc-900/50 p-3">
      <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-medium text-zinc-200">{value}</div>
    </div>
  );
}

function formatPrice(pair: string, value: number) {
  if (pair.endsWith('JPY')) return value.toFixed(3);
  if (pair === 'USDNGN') return value.toFixed(2);
  return value.toFixed(5);
}
