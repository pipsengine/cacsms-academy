'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

type WeeklyAnalysisPayload = {
  pair: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  score: number;
  probability: 'Low' | 'Moderate' | 'High';
  market_type: 'Trending' | 'Range Bound';
  summary: string;
  analysis: string;
  key_levels: {
    support: string[];
    resistance: string[];
  };
  trade_focus: string;
  image_requirement: 'REAL_CHART_REQUIRED';
};

type ChartPayload = {
  provider: string;
  candles: Array<{ datetime: string; close: number }>;
};

type ChartPoint = {
  time: string;
  price: number;
};

type WeeklyAnalysisOverviewProps = {
  showMarketHealth?: boolean;
  showTopOpportunities?: boolean;
  maxVisiblePairs?: number;
  compact?: boolean;
};

export default function WeeklyAnalysisOverview({
  showMarketHealth = true,
  showTopOpportunities = true,
  maxVisiblePairs,
  compact = false,
}: WeeklyAnalysisOverviewProps) {
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [opps, setOpps] = useState<OpportunitiesPayload | null>(null);
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [analysis, setAnalysis] = useState<WeeklyAnalysisPayload | null>(null);
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [chartProvider, setChartProvider] = useState<string>('market');
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
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

        if (oppsPayload?.opportunities?.length && !selectedPair) {
          setSelectedPair(oppsPayload.opportunities[0].pair);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, [selectedPair]);

  useEffect(() => {
    if (!selectedPair) return;

    async function loadPairAnalysis() {
      setAnalysisLoading(true);
      try {
        const [analysisRes, chartRes] = await Promise.all([
          fetch(`/api/market/weekly-analysis?pair=${encodeURIComponent(selectedPair)}`, { cache: 'no-store' }),
          fetch(`/api/market/chart?pair=${encodeURIComponent(selectedPair)}&timeframe=H4`, { cache: 'no-store' }),
        ]);

        const analysisPayload = analysisRes.ok ? (await analysisRes.json()) as WeeklyAnalysisPayload : null;
        const chartPayload = chartRes.ok ? (await chartRes.json()) as ChartPayload : null;

        setAnalysis(analysisPayload);
        setChartProvider(chartPayload?.provider ?? 'market');
        setChartPoints(
          (chartPayload?.candles ?? []).map((candle) => ({
            time: new Date(candle.datetime).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            price: Number(candle.close),
          }))
        );
      } finally {
        setAnalysisLoading(false);
      }
    }

    void loadPairAnalysis();
  }, [selectedPair]);

  const selectedOpportunity = useMemo(
    () => opps?.opportunities.find((item) => item.pair === selectedPair) ?? null,
    [opps, selectedPair]
  );

  const visibleOpportunities = useMemo(() => {
    const opportunities = opps?.opportunities ?? [];
    if (typeof maxVisiblePairs === 'number') {
      return opportunities.slice(0, maxVisiblePairs);
    }
    return opportunities;
  }, [maxVisiblePairs, opps]);

  useEffect(() => {
    if (!visibleOpportunities.length) {
      return;
    }

    const selectedStillVisible = visibleOpportunities.some((item) => item.pair === selectedPair);
    if (!selectedPair || !selectedStillVisible) {
      setSelectedPair(visibleOpportunities[0].pair);
    }
  }, [selectedPair, visibleOpportunities]);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
        Loading weekly analysis snapshot...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {showMarketHealth && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
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
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Institutional Weekly Analysis</h3>
          <div className="flex flex-wrap gap-2">
            {visibleOpportunities.map((opp) => (
              <button
                key={opp.pair}
                type="button"
                onClick={() => setSelectedPair(opp.pair)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${selectedPair === opp.pair ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-zinc-300 bg-slate-50 text-zinc-600 hover:border-zinc-600'}`}
              >
                {opp.pair}
              </button>
            ))}
          </div>
        </div>

        {analysisLoading ? (
          <p className="mt-4 text-sm text-zinc-400">Loading pair-level weekly analysis...</p>
        ) : analysis ? (
          <div className={`mt-4 grid gap-5 ${compact ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : 'xl:grid-cols-[minmax(0,1fr)_360px]'}`}>
            <div className="space-y-5">
              <div className="rounded-lg border border-zinc-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-zinc-900">{analysis.pair}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${analysis.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-300' : analysis.direction === 'SHORT' ? 'bg-red-500/10 text-red-300' : 'bg-amber-500/10 text-amber-300'}`}>
                    {analysis.direction}
                  </span>
                  <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-600">{analysis.market_type}</span>
                  <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-600">{analysis.probability} Probability</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{analysis.summary}</p>
                <div className={`mt-4 grid grid-cols-1 gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                  <Metric label="Score" value={String(analysis.score)} />
                  <Metric label="Probability" value={analysis.probability} />
                  {!compact && <Metric label="Chart Requirement" value={analysis.image_requirement} />}
                </div>
              </div>

              {compact ? (
                <div className="rounded-lg border border-zinc-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Preview Summary</h4>
                  <p className="mt-3 text-sm leading-7 text-zinc-600">
                    {buildPreviewNarrative(analysis)}
                  </p>
                  <div className="mt-3 rounded-md border border-zinc-200 bg-white px-3 py-2">
                    <p className="text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-700">Support:</span> {formatLevels(analysis.key_levels.support)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-700">Resistance:</span> {formatLevels(analysis.key_levels.resistance)}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-zinc-200 bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Detailed Analysis</h4>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">{analysis.analysis}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <LevelCard label="Support" levels={analysis.key_levels.support} accent="emerald" />
                    <LevelCard label="Resistance" levels={analysis.key_levels.resistance} accent="red" />
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Trade Focus</h4>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">{analysis.trade_focus}</p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Live Market Chart</h4>
                    <p className="mt-1 text-xs text-zinc-400">Validated market stream for analysis and execution context.</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    VERIFIED DATA
                  </span>
                </div>

                <div className={`mt-4 w-full ${compact ? 'h-44' : 'h-72'}`}>
                  {chartPoints.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartPoints} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="weeklyChartFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="time" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} minTickGap={24} />
                        <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} width={54} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                          formatter={(value) => {
                            const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                            return [numericValue.toFixed(selectedPair.includes('JPY') ? 2 : 4), 'Price'];
                          }}
                        />
                        <Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#weeklyChartFill)" strokeWidth={2} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-500">Real chart data unavailable for this pair.</div>
                  )}
                </div>
              </div>

              {selectedOpportunity && (
                <div className="rounded-lg border border-zinc-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Signal Context</h4>
                  <div className="mt-4 space-y-2 text-sm text-zinc-600">
                    <p>Rank #{selectedOpportunity.rank}</p>
                    <p>Opportunity score: {selectedOpportunity.compositeScore}</p>
                    <p>Confidence: {selectedOpportunity.confidenceClass}</p>
                    <p>Regime: {selectedOpportunity.regime}</p>
                    {compact && <p>Trade focus remains available in the subscriber dashboard.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-400">Weekly analysis unavailable for the selected pair.</p>
        )}
      </div>

      {showTopOpportunities && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Top Opportunities This Week</h3>
          {opps && opps.opportunities.length > 0 ? (
            <div className="mt-4 space-y-3">
              {opps.opportunities.map((opp) => (
                <div key={`${opp.rank}-${opp.pair}`} className="rounded-lg border border-zinc-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-900">#{opp.rank} {opp.pair}</p>
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
      )}
    </div>
  );
}

function formatLevels(levels: string[]): string {
  if (!levels.length) return 'Not available';
  if (levels.length === 1) return levels[0];
  if (levels.length === 2) return `${levels[0]} and ${levels[1]}`;
  return `${levels.slice(0, -1).join(', ')}, and ${levels[levels.length - 1]}`;
}

function buildPreviewNarrative(analysis: WeeklyAnalysisPayload): string {
  const biasText = analysis.direction === 'NEUTRAL'
    ? 'a neutral directional profile'
    : `${analysis.direction.toLowerCase()} directional pressure`;
  const continuationSide = analysis.direction === 'SHORT'
    ? 'below nearby support'
    : analysis.direction === 'LONG'
      ? 'above nearby resistance'
      : 'inside the current range boundaries';

  return `${analysis.pair} is trading in a ${analysis.market_type.toLowerCase()} regime with ${biasText}. Current confidence is ${analysis.probability.toLowerCase()} and the composite score is ${analysis.score}/100, which suggests a selective execution environment rather than aggressive positioning. Structure remains valid while price holds ${continuationSide}; invalidation risk rises quickly if the opposite side of the range is reclaimed. Traders should prioritize confirmation at key levels before committing size and maintain disciplined risk around failed retests.`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-700">{value}</p>
    </div>
  );
}

function LevelCard({
  label,
  levels,
  accent,
}: {
  label: string;
  levels: string[];
  accent: 'emerald' | 'red';
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-slate-50 p-4">
      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {levels.map((level) => (
          <span
            key={`${label}-${level}`}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}
          >
            {level}
          </span>
        ))}
      </div>
    </div>
  );
}
