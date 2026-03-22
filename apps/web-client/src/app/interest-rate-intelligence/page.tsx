'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Activity,
  BarChart2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Waves,
} from 'lucide-react';
import {
  G8_CURRENCIES,
  type CurrencyRateAnalytics,
  type DifferentialEntry,
  type G8Currency,
  type HistoryRange,
  type InterestRateRecord,
} from '@/lib/interest-rates/types';

function fmtRate(value: number): string {
  return `${value.toFixed(2)}%`;
}

function fmtOptionalRate(value?: number | null): string {
  return Number.isFinite(value) ? fmtRate(Number(value)) : '-';
}

function getSurpriseBps(record: InterestRateRecord): number | null {
  if (!Number.isFinite(record.forecastRate)) return null;
  return Math.round((record.rate - Number(record.forecastRate)) * 100);
}

function fmtSurprise(value: number | null): string {
  if (value === null) return '-';
  return `${value > 0 ? '+' : ''}${value} bps`;
}

function fmtDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function directionBadge(direction: string): string {
  if (direction === 'Hiking') return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
  if (direction === 'Cutting') return 'bg-red-500/10 text-red-600 border border-red-500/20';
  return 'bg-zinc-100 text-zinc-700 border border-zinc-300';
}

function signalBadge(signal: string): string {
  if (signal === 'Bullish') return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
  if (signal === 'Bearish') return 'bg-red-500/10 text-red-600 border border-red-500/20';
  return 'bg-zinc-100 text-zinc-700 border border-zinc-300';
}

function cycleBadge(cycle: string): string {
  if (cycle === 'Hiking Phase') return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
  if (cycle === 'Easing Phase') return 'bg-red-500/10 text-red-600 border border-red-500/20';
  return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
}

function sourceBadge(source: string): string {
  if (source === 'curated-baseline') return 'bg-blue-500/10 text-blue-700 border border-blue-500/20';
  if (source === 'curated-manual') return 'bg-cyan-500/10 text-cyan-700 border border-cyan-500/20';
  if (source === 'tradingeconomics' || source === 'fred') return 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20';
  if (source === 'baseline') return 'bg-amber-500/10 text-amber-700 border border-amber-500/20';
  return 'bg-zinc-100 text-zinc-700 border border-zinc-300';
}

function sourceLabel(source: string): string {
  if (source === 'curated-baseline') return 'Curated';
  if (source === 'curated-manual') return 'Manual Curated';
  if (source === 'tradingeconomics') return 'Live Provider';
  if (source === 'fred') return 'Historical Provider';
  if (source === 'baseline') return 'Estimated';
  return source;
}

function isAdminRole(role?: string | null): boolean {
  return role === 'Super Admin' || role === 'Administrator';
}

interface PendingRelease {
  currency: G8Currency;
  date: string;
  scheduledTimeUtc: string;
  hoursOverdue: number;
  kind: 'missing' | 'unverified';
  currentRate?: number;
}

function SummaryCard({
  record,
  analytics,
  selected,
  onSelect,
}: {
  record: InterestRateRecord;
  analytics?: CurrencyRateAnalytics;
  selected: boolean;
  onSelect: () => void;
}) {
  const changePositive = record.changeBps >= 0;
  const surpriseBps = getSurpriseBps(record);
  const hasDecisionContext = record.previousRate !== null || record.forecastRate !== null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-xl border bg-white p-4 space-y-3 transition-all hover:border-zinc-300 ${
        selected ? 'ring-1 ring-emerald-500/40 border-emerald-300' : 'border-zinc-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {changePositive ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
          <span className="text-sm font-semibold text-zinc-900">{record.currency}</span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${directionBadge(record.policyDirection)}`}>
          {record.policyDirection}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div>
          <div className="text-zinc-500 mb-0.5">Rate</div>
          <div className="text-zinc-800 font-semibold">{fmtRate(record.rate)}</div>
        </div>
        <div>
          <div className="text-zinc-500 mb-0.5">Change</div>
          <div className={changePositive ? 'text-emerald-600' : 'text-red-600'}>
            {record.changeBps > 0 ? '+' : ''}
            {record.changeBps} bps
          </div>
        </div>
        <div>
          <div className="text-zinc-500 mb-0.5">Previous</div>
          <div className="text-zinc-700 font-semibold">{fmtOptionalRate(record.previousRate)}</div>
        </div>
        <div>
          <div className="text-zinc-500 mb-0.5">Forecast</div>
          <div className="text-zinc-700 font-semibold">{fmtOptionalRate(record.forecastRate)}</div>
        </div>
        <div>
          <div className="text-zinc-500 mb-0.5">Surprise</div>
          <div className={surpriseBps === null ? 'text-zinc-500 font-semibold' : surpriseBps >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
            {fmtSurprise(surpriseBps)}
          </div>
        </div>
      </div>

      {analytics && (
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${signalBadge(analytics.signal)}`}>
            {analytics.signal}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${cycleBadge(analytics.policyCycle)}`}>
            {analytics.policyCycle}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${sourceBadge(record.source)}`}>
            {sourceLabel(record.source)}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${hasDecisionContext ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'}`}>
            {hasDecisionContext ? 'Forecast Coverage' : 'Rate Only'}
          </span>
        </div>
      )}

      <div className="text-[10px] font-mono text-zinc-500">Decision: {fmtDate(record.decisionTimestamp)}</div>
    </button>
  );
}

function HistoryTable({ records }: { records: InterestRateRecord[] }) {
  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-3">
        <Activity className="w-10 h-10 opacity-50" />
        <p className="text-sm font-mono">No historical data available for this currency.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[560px]">
      <table className="w-full text-xs font-mono text-zinc-700 border-collapse">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-zinc-200">
            {['Date', 'Actual', 'Forecast', 'Previous', 'Surprise', 'Change (bps)', 'Direction', 'Source'].map((h) => (
              <th key={h} className="text-left py-3 px-3 text-[10px] uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...records].reverse().map((r, i) => {
            const surpriseBps = getSurpriseBps(r);
            return (
              <tr key={`${r.currency}-${r.date}-${i}`} className={`border-b border-zinc-200 ${i === 0 ? 'bg-slate-50' : 'hover:bg-zinc-100'}`}>
                <td className="py-2.5 px-3 text-zinc-600">{fmtDate(r.date)}</td>
                <td className="py-2.5 px-3 text-zinc-800 font-semibold">{fmtRate(r.rate)}</td>
                <td className="py-2.5 px-3 text-zinc-600">{fmtOptionalRate(r.forecastRate)}</td>
                <td className="py-2.5 px-3 text-zinc-600">{fmtOptionalRate(r.previousRate)}</td>
                <td className={`py-2.5 px-3 ${surpriseBps === null ? 'text-zinc-500' : surpriseBps >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {fmtSurprise(surpriseBps)}
                </td>
                <td className={`py-2.5 px-3 ${r.changeBps >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {r.changeBps > 0 ? '+' : ''}
                  {r.changeBps}
                </td>
                <td className="py-2.5 px-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${directionBadge(r.policyDirection)}`}>
                    {r.policyDirection}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-zinc-500">{sourceLabel(r.source)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RateTrendChart({ records }: { records: InterestRateRecord[] }) {
  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-3">
        <Activity className="w-10 h-10 opacity-50" />
        <p className="text-sm font-mono">No series to visualize.</p>
      </div>
    );
  }

  const min = Math.min(...records.map((r) => r.rate));
  const max = Math.max(...records.map((r) => r.rate));
  const spread = Math.max(max - min, 0.1);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-end gap-1 h-[280px]">
          {records.map((r, i) => {
            const height = ((r.rate - min) / spread) * 240 + 20;
            return (
              <div key={`${r.currency}-${r.date}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-emerald-500/80 hover:bg-emerald-500 transition-colors"
                  style={{ height: `${height}px` }}
                  title={`${fmtDate(r.date)}: ${fmtRate(r.rate)}`}
                />
                {i % Math.max(1, Math.floor(records.length / 6)) === 0 && (
                  <span className="text-[10px] font-mono text-zinc-500">{fmtDate(r.date).split(' ')[0]}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-center">
          <div className="text-[10px] font-mono text-zinc-500 mb-1">Highest</div>
          <div className="text-sm font-semibold text-emerald-600">{fmtRate(max)}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-center">
          <div className="text-[10px] font-mono text-zinc-500 mb-1">Lowest</div>
          <div className="text-sm font-semibold text-red-600">{fmtRate(min)}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-center">
          <div className="text-[10px] font-mono text-zinc-500 mb-1">Latest</div>
          <div className="text-sm font-semibold text-zinc-700">{fmtRate(records[records.length - 1].rate)}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-center">
          <div className="text-[10px] font-mono text-zinc-500 mb-1">Range</div>
          <div className="text-sm font-semibold text-zinc-700">{(max - min).toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
}

function HistoryWindowSummary({
  records,
  range,
}: {
  records: InterestRateRecord[];
  range: HistoryRange;
}) {
  if (!records.length) {
    return null;
  }

  const first = records[0];
  const last = records[records.length - 1];
  const netChangeBps = Math.round((last.rate - first.rate) * 100);
  const largestMove = records.reduce((largest, row) => {
    if (!largest || Math.abs(row.changeBps) > Math.abs(largest.changeBps)) {
      return row;
    }
    return largest;
  }, null as InterestRateRecord | null);
  const largestSurprise = records.reduce((largest, row) => {
    const surprise = getSurpriseBps(row);
    if (surprise === null) return largest;
    if (!largest || Math.abs(surprise) > Math.abs(largest.surpriseBps)) {
      return { row, surpriseBps: surprise };
    }
    return largest;
  }, null as { row: InterestRateRecord; surpriseBps: number } | null);
  const curatedCount = records.filter((row) => row.source === 'curated-baseline' || row.source === 'curated-manual').length;
  const forecastCoverageCount = records.filter((row) => Number.isFinite(row.forecastRate)).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
        <span className={`px-2 py-1 rounded-full border ${curatedCount === records.length ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-amber-300 text-amber-700 bg-amber-50'}`}>
          {curatedCount === records.length ? 'Dataset: Fully Curated' : `Dataset: ${curatedCount}/${records.length} Curated`}
        </span>
        <span className={`px-2 py-1 rounded-full border ${forecastCoverageCount === records.length ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-amber-300 text-amber-700 bg-amber-50'}`}>
          {forecastCoverageCount === records.length ? 'Forecast Coverage: Full' : `Forecast Coverage: ${forecastCoverageCount}/${records.length}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-center">
          <div className="text-[10px] font-mono text-zinc-500 mb-1">Start Rate</div>
          <div className="text-sm font-semibold text-zinc-800">{fmtRate(first.rate)}</div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">{fmtDate(first.date)}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-center">
          <div className="text-[10px] font-mono text-zinc-500 mb-1">End Rate</div>
          <div className="text-sm font-semibold text-zinc-800">{fmtRate(last.rate)}</div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">{fmtDate(last.date)}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-center">
          <div className="text-[10px] font-mono text-zinc-500 mb-1">Net Change</div>
          <div className={`text-sm font-semibold ${netChangeBps >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {netChangeBps > 0 ? '+' : ''}
            {netChangeBps} bps
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">{range === '6m' ? 'Last 6 months' : 'Last 1 year'}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-center">
          <div className="text-[10px] font-mono text-zinc-500 mb-1">Largest Move</div>
          <div className={`text-sm font-semibold ${largestMove && largestMove.changeBps >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {largestMove ? `${largestMove.changeBps > 0 ? '+' : ''}${largestMove.changeBps} bps` : '-'}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">{largestMove ? fmtDate(largestMove.date) : 'No move'}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-slate-50 p-3 text-center">
          <div className="text-[10px] font-mono text-zinc-500 mb-1">Largest Surprise</div>
          <div className={`text-sm font-semibold ${!largestSurprise ? 'text-zinc-500' : largestSurprise.surpriseBps >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {largestSurprise ? fmtSurprise(largestSurprise.surpriseBps) : '-'}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">{largestSurprise ? fmtDate(largestSurprise.row.date) : 'No forecast data'}</div>
        </div>
      </div>
    </div>
  );
}

function DifferentialHeatmap({ matrix, anchor }: { matrix: DifferentialEntry[]; anchor: G8Currency }) {
  const rows = matrix
    .filter((x) => x.base === anchor)
    .sort((a, b) => b.differential - a.differential);

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center py-12 text-sm font-mono text-zinc-500">
        No differential data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {rows.map((row) => {
        const positive = row.differential >= 0;
        return (
          <div key={`${row.base}-${row.quote}`} className="rounded-lg border border-zinc-200 bg-white p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-zinc-500">{row.base}/{row.quote}</div>
              <div className="text-sm text-zinc-800">Rate Differential</div>
            </div>
            <div className={`text-sm font-mono font-semibold ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {positive ? '+' : ''}
              {row.differential.toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function InterestRateIntelligencePage() {
  const { user } = useAuth();
  const [latestRecords, setLatestRecords] = useState<InterestRateRecord[]>([]);
  const [analytics, setAnalytics] = useState<CurrencyRateAnalytics[]>([]);
  const [history, setHistory] = useState<InterestRateRecord[]>([]);
  const [matrix, setMatrix] = useState<DifferentialEntry[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<G8Currency>('USD');
  const [historyRange, setHistoryRange] = useState<HistoryRange>('1y');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'graphical'>('overview');
  const [status, setStatus] = useState<{ source: string; stale: boolean; fetchedAt: string } | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingestForm, setIngestForm] = useState({
    currency: 'USD' as G8Currency,
    date: '',
    time: '',
    rate: '',
    previousRate: '',
    forecastRate: '',
  });
  const [ingesting, setIngesting] = useState(false);
  const [ingestMessage, setIngestMessage] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [pendingReleases, setPendingReleases] = useState<PendingRelease[]>([]);

  const analyticsMap = useMemo(() => new Map(analytics.map((a) => [a.currency, a])), [analytics]);
  const canIngest = isAdminRole(user?.role);

  const fetchLatest = useCallback(async () => {
    setLoadingLatest(true);
    setError(null);

    try {
      const response = await fetch('/api/interest-rates/latest', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to load latest rates');

      setLatestRecords(data.records ?? []);
      setAnalytics(data.analytics ?? []);
      setStatus({
        source: data.source ?? 'unknown',
        stale: !!data.stale,
        fetchedAt: data.fetchedAt ?? new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load latest rates');
    } finally {
      setLoadingLatest(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/interest-rates/history?currency=${selectedCurrency}&range=${historyRange}`, {
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to load history');
      setHistory(data.records ?? []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  }, [selectedCurrency, historyRange]);

  const fetchMatrix = useCallback(async () => {
    setLoadingMatrix(true);
    try {
      const response = await fetch('/api/interest-rates/differentials', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to load differential matrix');
      setMatrix(data.matrix ?? []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load differential matrix');
    } finally {
      setLoadingMatrix(false);
    }
  }, []);

  const fetchPendingReleases = useCallback(async () => {
    try {
      const response = await fetch('/api/interest-rates/status', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setPendingReleases(data.pendingReleases ?? []);
    } catch {
      // Non-fatal — pending releases are informational
    }
  }, []);

  useEffect(() => {
    void fetchLatest();
  }, [fetchLatest]);

  useEffect(() => {
    if (canIngest) {
      void fetchPendingReleases();
    }
  }, [canIngest, fetchPendingReleases]);

  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'graphical') {
      void fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  useEffect(() => {
    if (activeTab === 'graphical') {
      void fetchMatrix();
    }
  }, [activeTab, fetchMatrix]);

  useEffect(() => {
    setIngestForm((current) => ({ ...current, currency: selectedCurrency }));
  }, [selectedCurrency]);

  const selectedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  const submitDecision = useCallback(async () => {
    setIngesting(true);
    setIngestError(null);
    setIngestMessage(null);

    try {
      const response = await fetch('/api/interest-rates/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: ingestForm.currency,
          date: ingestForm.date,
          time: ingestForm.time || undefined,
          rate: Number(ingestForm.rate),
          previousRate: ingestForm.previousRate === '' ? undefined : Number(ingestForm.previousRate),
          forecastRate: ingestForm.forecastRate === '' ? null : Number(ingestForm.forecastRate),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to ingest interest-rate decision');

      setLatestRecords(data.records ?? []);
      setAnalytics(data.analytics ?? []);
      setStatus({
        source: data.source ?? 'curated-manual',
        stale: !!data.stale,
        fetchedAt: data.fetchedAt ?? new Date().toISOString(),
      });
      setIngestMessage(`Saved ${ingestForm.currency} decision for ${ingestForm.date}.`);

      if (activeTab === 'history' || activeTab === 'graphical') {
        void fetchHistory();
      }
      if (activeTab === 'graphical') {
        void fetchMatrix();
      }
      void fetchPendingReleases();
    } catch (err: any) {
      setIngestError(err?.message || 'Failed to ingest interest-rate decision');
    } finally {
      setIngesting(false);
    }
  }, [activeTab, fetchHistory, fetchMatrix, fetchPendingReleases, ingestForm]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Waves className="w-5 h-5 text-emerald-500" />
            <h1 className="text-lg font-semibold text-zinc-900">Interest Rate Intelligence</h1>
          </div>
          <p className="text-sm text-zinc-500">
            G8 macro policy intelligence for AUD, CAD, CHF, EUR, GBP, JPY, NZD, and USD.
          </p>
          <p className="mt-1 text-xs font-mono text-zinc-500">
            All displayed G8 decision histories are curated and stored in the database. Provider refresh is blocked from overwriting curated release paths.
          </p>
          {status && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-1 rounded-full border border-zinc-300 text-zinc-600 bg-slate-50">
                Source: {sourceLabel(status.source)}
              </span>
              <span className={`px-2 py-1 rounded-full border ${status.stale ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-emerald-300 text-emerald-700 bg-emerald-50'}`}>
                {status.stale ? 'Status: Stale Cache' : 'Status: Live'}
              </span>
              <span className="px-2 py-1 rounded-full border border-zinc-300 text-zinc-600 bg-slate-50">
                Updated: {fmtDate(status.fetchedAt)}
              </span>
            </div>
          )}
        </div>

        {canIngest && (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-sm font-semibold text-cyan-900">Admin Decision Ingest</div>
                <div className="text-xs font-mono text-cyan-800/80">
                  Add the next official central-bank decision directly into the normalized interest-rate store.
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded-full border border-cyan-300 text-cyan-700 bg-white">
                Manual Curated Overlay
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <label className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Currency</span>
                <select
                  value={ingestForm.currency}
                  onChange={(e) => setIngestForm((current) => ({ ...current, currency: e.target.value as G8Currency }))}
                  className="w-full bg-white border border-zinc-300 text-zinc-700 text-sm font-mono rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  {G8_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Date</span>
                <input
                  type="date"
                  value={ingestForm.date}
                  onChange={(e) => setIngestForm((current) => ({ ...current, date: e.target.value }))}
                  className="w-full bg-white border border-zinc-300 text-zinc-700 text-sm font-mono rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Time (UTC)</span>
                <input
                  type="time"
                  step="1"
                  value={ingestForm.time}
                  onChange={(e) => setIngestForm((current) => ({ ...current, time: e.target.value }))}
                  className="w-full bg-white border border-zinc-300 text-zinc-700 text-sm font-mono rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Actual</span>
                <input
                  type="number"
                  step="0.01"
                  value={ingestForm.rate}
                  onChange={(e) => setIngestForm((current) => ({ ...current, rate: e.target.value }))}
                  placeholder="3.75"
                  className="w-full bg-white border border-zinc-300 text-zinc-700 text-sm font-mono rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Previous</span>
                <input
                  type="number"
                  step="0.01"
                  value={ingestForm.previousRate}
                  onChange={(e) => setIngestForm((current) => ({ ...current, previousRate: e.target.value }))}
                  placeholder="3.75"
                  className="w-full bg-white border border-zinc-300 text-zinc-700 text-sm font-mono rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Forecast</span>
                <input
                  type="number"
                  step="0.01"
                  value={ingestForm.forecastRate}
                  onChange={(e) => setIngestForm((current) => ({ ...current, forecastRate: e.target.value }))}
                  placeholder="3.75"
                  className="w-full bg-white border border-zinc-300 text-zinc-700 text-sm font-mono rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </label>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => void submitDecision()}
                disabled={ingesting || !ingestForm.date || ingestForm.rate === ''}
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-mono disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors"
              >
                {ingesting ? 'Saving...' : 'Save Decision'}
              </button>
              {ingestMessage && <span className="text-xs font-mono text-emerald-700">{ingestMessage}</span>}
              {ingestError && <span className="text-xs font-mono text-red-700">{ingestError}</span>}
            </div>

            {pendingReleases.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold text-cyan-900 flex items-center gap-2">
                  Pending Releases
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-300">
                    {pendingReleases.length}
                  </span>
                </div>
                <div className="divide-y divide-cyan-100 rounded-lg border border-cyan-200 overflow-hidden">
                  {pendingReleases.map((pr) => (
                    <div
                      key={`${pr.currency}-${pr.date}`}
                      className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-white text-xs font-mono"
                    >
                      <span className="font-semibold text-zinc-800 w-10">{pr.currency}</span>
                      <span className="text-zinc-600">{pr.date}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          pr.kind === 'missing'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        {pr.kind === 'missing' ? 'No record' : 'Unverified baseline'}
                        {pr.currentRate !== undefined && ` @ ${pr.currentRate.toFixed(2)}%`}
                      </span>
                      <span className="text-zinc-400">+{pr.hoursOverdue}h overdue</span>
                      <button
                        type="button"
                        onClick={() =>
                          setIngestForm((f) => ({
                            ...f,
                            currency: pr.currency,
                            date: pr.date,
                            time: pr.scheduledTimeUtc,
                            rate: pr.currentRate !== undefined ? String(pr.currentRate) : '',
                            previousRate: '',
                            forecastRate: '',
                          }))
                        }
                        className="ml-auto px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-700 border border-cyan-300 hover:bg-cyan-100 transition-colors text-[10px]"
                      >
                        Pre-fill form
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 p-1 bg-white border border-zinc-200 rounded-lg w-fit">
            {(['overview', 'history', 'graphical'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'history' ? `${selectedCurrency} History` : 'Graphical Representation'}
              </button>
            ))}
          </div>

          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value as G8Currency)}
            className="bg-white border border-zinc-300 text-zinc-700 text-sm font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
          >
            {G8_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>

          {activeTab !== 'overview' && (
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1">
              <span className="px-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">Range</span>
              {([
                { value: '6m', label: '6M' },
                { value: '1y', label: '1Y' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHistoryRange(opt.value)}
                  className={`px-3 py-1.5 text-[10px] font-mono rounded-md transition-colors ${
                    historyRange === opt.value
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              void fetchLatest();
              if (activeTab === 'history' || activeTab === 'graphical') void fetchHistory();
              if (activeTab === 'graphical') void fetchMatrix();
            }}
            className="text-xs font-mono text-zinc-600 hover:text-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLatest || loadingHistory || loadingMatrix ? 'animate-spin' : ''}`} />
            Reload
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {loadingLatest ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 flex items-center gap-3 text-zinc-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-mono">Loading interest-rate data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {latestRecords.map((record) => (
                  <SummaryCard
                    key={record.currency}
                    record={record}
                    analytics={analyticsMap.get(record.currency)}
                    selected={selectedCurrency === record.currency}
                    onSelect={() => setSelectedCurrency(record.currency)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {!loadingHistory && <HistoryWindowSummary records={selectedHistory} range={historyRange} />}

            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-mono text-zinc-700">{selectedCurrency} - Interest-Rate History</span>
                  {history.length > 0 && <span className="text-xs font-mono text-zinc-500">({history.length} records)</span>}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Viewing {historyRange === '6m' ? 'Last 6 Months' : 'Last 1 Year'}
                </div>
              </div>

              {loadingHistory ? (
                <div className="flex items-center gap-3 p-6 text-zinc-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-mono">Loading {selectedCurrency} history...</span>
                </div>
              ) : (
                <HistoryTable records={selectedHistory} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'graphical' && (
          <div className="space-y-6">
            {!loadingHistory && <HistoryWindowSummary records={selectedHistory} range={historyRange} />}

            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-sm font-mono text-zinc-700 mb-1">
                <span className="font-semibold">{selectedCurrency}</span> - Policy Rate Trend
              </div>
              <div className="text-xs text-zinc-500 font-mono mb-6">
                Interest-rate path for the {historyRange === '6m' ? 'last 6 months' : 'last 1 year'} and differential impact for the selected anchor currency.
              </div>

              {loadingHistory ? (
                <div className="flex items-center gap-3 p-6 text-zinc-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-mono">Loading chart data...</span>
                </div>
              ) : (
                <RateTrendChart records={selectedHistory} />
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-sm font-mono text-zinc-700 mb-1">{selectedCurrency} Differential Matrix</div>
              <div className="text-xs text-zinc-500 font-mono mb-4">A/B differential = Rate A - Rate B</div>

              {loadingMatrix ? (
                <div className="flex items-center gap-3 p-4 text-zinc-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-mono">Computing differential matrix...</span>
                </div>
              ) : (
                <DifferentialHeatmap matrix={matrix} anchor={selectedCurrency} />
              )}
            </div>
          </div>
        )}

        <p className="text-[11px] font-mono text-zinc-600 text-center pb-2">
          Current sync model: normalized database reads with an hourly release-aware scheduler. The scheduler detects overdue calendar entries and surfaces them as pending releases in the admin panel. USD decisions with a FRED API key are ingested automatically; other G8 currencies require manual admin confirmation.
        </p>
      </div>
    </DashboardLayout>
  );
}
