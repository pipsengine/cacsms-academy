'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ALL_ASSETS, CotAsset, CotRecord } from '@/lib/cot/types';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  BarChart2,
  RefreshCw,
} from 'lucide-react';

type HistoryRange = '6m' | '1y' | 'all';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function signalColor(signal: string): string {
  switch (signal) {
    case 'Bullish Expansion': return 'text-emerald-400';
    case 'Bearish Expansion': return 'text-red-400';
    case 'Reversal Risk': return 'text-amber-400';
    default: return 'text-zinc-400';
  }
}

function trendBadge(trend: string) {
  return trend === 'Bullish'
    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    : 'bg-red-500/10 text-red-400 border border-red-500/20';
}

function riskBadge(risk: string) {
  switch (risk) {
    case 'Low': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'High': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    default: return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  }
}

function phaseBadge(phase: string) {
  switch (phase) {
    case 'Expansion': return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
    case 'Distribution': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    default: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  }
}

// ─── Summary Cards ───────────────────────────────────────────────────────────

function SummaryCard({ record }: { record: CotRecord }) {
  const isBullish = record.trend === 'Bullish';
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isBullish
            ? <TrendingUp className="w-4 h-4 text-emerald-400" />
            : <TrendingDown className="w-4 h-4 text-red-400" />}
          <span className="text-sm font-semibold text-zinc-100">{record.asset}</span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${trendBadge(record.trend)}`}>
          {record.trend}
        </span>
      </div>

      {/* Net & Change */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div>
          <div className="text-zinc-500 mb-0.5">Net</div>
          <div className={record.net >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {record.net >= 0 ? '+' : ''}{fmt(record.net)}
          </div>
        </div>
        <div>
          <div className="text-zinc-500 mb-0.5">Change</div>
          <div className={record.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {record.change >= 0 ? '+' : ''}{fmt(record.change)}
          </div>
        </div>
        <div>
          <div className="text-zinc-500 mb-0.5">Z-Score</div>
          <div className={Math.abs(record.zScore) > 2 ? 'text-amber-400' : 'text-zinc-300'}>
            {record.zScore.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-zinc-500 mb-0.5">Pctile</div>
          <div className="text-zinc-300">{fmt(record.percentile)}%</div>
        </div>
      </div>

      {/* Signal */}
      <div className={`text-xs font-semibold ${signalColor(record.signal)}`}>{record.signal}</div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${phaseBadge(record.phase)}`}>
          {record.phase}
        </span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${riskBadge(record.risk)}`}>
          {record.risk} Risk
        </span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
          record.weeklyBias === 'Long'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {record.weeklyBias}
        </span>
        {record.extreme && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> Extreme
          </span>
        )}
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
          <span>Confidence</span>
          <span className="text-zinc-300">{fmt(record.confidence)}%</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${record.confidence}%` }}
          />
        </div>
      </div>

      <div className="text-[10px] font-mono text-zinc-600 pt-1">{fmtDate(record.date)}</div>
    </div>
  );
}

// ─── History Table ───────────────────────────────────────────────────────────

function HistoryTable({ records }: { records: CotRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-600 gap-3">
        <Activity className="w-10 h-10 opacity-50" />
        <p className="text-sm font-mono">No historical data available for this asset.</p>
        <p className="text-xs">Run the ingestion pipeline from the admin panel to load CFTC data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[560px]">
      <table className="w-full text-xs font-mono text-zinc-300 border-collapse">
        <thead className="sticky top-0 z-10 bg-zinc-950">
          <tr className="border-b border-zinc-800">
            {['Date', 'Long', 'Short', 'Net', 'Change', 'Z-Score', 'Pctile', 'Signal', 'Phase', 'Conf%'].map((h) => (
              <th key={h} className="text-left py-3 px-3 text-[10px] uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr
              key={`${r.asset}-${r.date}`}
              className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                i === 0 ? 'bg-zinc-900/40' : ''
              }`}
            >
              <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">{fmtDate(r.date)}</td>
              <td className="py-2.5 px-3 text-zinc-300">{fmt(r.long)}</td>
              <td className="py-2.5 px-3 text-zinc-300">{fmt(r.short)}</td>
              <td className={`py-2.5 px-3 font-semibold ${r.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.net >= 0 ? '+' : ''}{fmt(r.net)}
              </td>
              <td className={`py-2.5 px-3 ${r.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.change >= 0 ? '+' : ''}{fmt(r.change)}
              </td>
              <td className={`py-2.5 px-3 ${Math.abs(r.zScore) > 2 ? 'text-amber-400' : 'text-zinc-300'}`}>
                {r.zScore.toFixed(2)}
              </td>
              <td className="py-2.5 px-3 text-zinc-300">{fmt(r.percentile)}%</td>
              <td className={`py-2.5 px-3 whitespace-nowrap ${signalColor(r.signal)}`}>{r.signal}</td>
              <td className="py-2.5 px-3">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${phaseBadge(r.phase)}`}>{r.phase}</span>
              </td>
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.confidence}%` }} />
                  </div>
                  <span className="text-zinc-400">{fmt(r.confidence)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function CotIntelligencePage() {
  const [syncStatus, setSyncStatus] = useState<{
    lastScheduledSyncDate: string | null;
    nextScheduledSyncIso: string;
    cotRecords: number;
    autoSyncEnabled: boolean;
  } | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CotAsset>('EUR');
  const [latestAll, setLatestAll] = useState<CotRecord[]>([]);
  const [history, setHistory] = useState<CotRecord[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyRange, setHistoryRange] = useState<HistoryRange>('1y');
  const [errorLatest, setErrorLatest] = useState<string | null>(null);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  // Fetch latest all assets on mount
  useEffect(() => {
    setLoadingLatest(true);
    setErrorLatest(null);
    fetch('/api/cot/latest')
      .then((r) => r.json())
      .then((data) => setLatestAll(data.records ?? []))
      .catch(() => setErrorLatest('Failed to load latest COT data.'))
      .finally(() => setLoadingLatest(false));
  }, []);

  useEffect(() => {
    fetch('/api/cot/status')
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) return;
        setSyncStatus({
          lastScheduledSyncDate: data.lastScheduledSyncDate ?? null,
          nextScheduledSyncIso: data.nextScheduledSyncIso,
          cotRecords: data.cotRecords ?? 0,
          autoSyncEnabled: !!data.autoSyncEnabled,
        });
      })
      .catch(() => {
        setSyncStatus(null);
      });
  }, []);

  // Fetch history when asset changes or tab becomes history
  const fetchHistory = useCallback(() => {
    setLoadingHistory(true);
    setErrorHistory(null);
    fetch(`/api/cot/history?asset=${selectedAsset}&range=${historyRange}`)
      .then((r) => r.json())
      .then((data) => setHistory(data.records ?? []))
      .catch(() => setErrorHistory('Failed to load historical COT data.'))
      .finally(() => setLoadingHistory(false));
  }, [selectedAsset, historyRange]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [selectedAsset, activeTab, historyRange, fetchHistory]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-5 h-5 text-emerald-500" />
              <h1 className="text-lg font-semibold text-zinc-100">COT Intelligence</h1>
            </div>
            <p className="text-sm text-zinc-500">
              Commitments of Traders — CFTC positioning data for institutional trend analysis.
            </p>
            {syncStatus && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className={`px-2 py-1 rounded-full border ${syncStatus.autoSyncEnabled ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                  Auto Sync: {syncStatus.autoSyncEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <span className="px-2 py-1 rounded-full border border-zinc-700 text-zinc-400 bg-zinc-900/40">
                  Last Sync Date (Lagos): {syncStatus.lastScheduledSyncDate ?? 'Not yet run'}
                </span>
                <span className="px-2 py-1 rounded-full border border-zinc-700 text-zinc-400 bg-zinc-900/40">
                  Next Sync: {fmtDate(syncStatus.nextScheduledSyncIso)} 00:00 (Lagos)
                </span>
                <span className="px-2 py-1 rounded-full border border-zinc-700 text-zinc-400 bg-zinc-900/40">
                  Records: {fmt(syncStatus.cotRecords)}
                </span>
              </div>
            )}
          </div>

          {/* Asset Selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value as CotAsset)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm font-mono rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
            >
              {ALL_ASSETS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800 rounded-lg w-fit">
          {(['overview', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'overview' ? 'Overview' : `${selectedAsset} History`}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Selected asset detail */}
            {loadingLatest ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex items-center gap-3 text-zinc-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-mono">Loading latest COT data…</span>
              </div>
            ) : errorLatest ? (
              <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">{errorLatest}</div>
            ) : latestAll.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center space-y-3">
                <Activity className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-500 font-mono">No COT data available yet.</p>
                <p className="text-xs text-zinc-600">
                  Trigger the ingestion pipeline via <code className="text-amber-400">POST /api/cot/ingest</code> (admin) to load live CFTC data.
                </p>
              </div>
            ) : (
              <>
                {/* All assets grid */}
                <div>
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">All Assets — Latest</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {ALL_ASSETS.map((asset) => {
                      const rec = latestAll.find((r) => r.asset === asset);
                      if (!rec) return (
                        <div
                          key={asset}
                          onClick={() => setSelectedAsset(asset)}
                          className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 cursor-pointer hover:border-zinc-700 transition-colors"
                        >
                          <div className="text-sm font-mono font-semibold text-zinc-400">{asset}</div>
                          <div className="text-xs text-zinc-600 mt-1 font-mono">No data</div>
                        </div>
                      );
                      return (
                        <div
                          key={asset}
                          onClick={() => setSelectedAsset(asset)}
                          className={`cursor-pointer transition-all hover:border-zinc-600 ${
                            selectedAsset === asset ? 'ring-1 ring-emerald-500/40' : ''
                          }`}
                        >
                          <SummaryCard record={rec} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-mono text-zinc-300">{selectedAsset} — Full History</span>
                {history.length > 0 && (
                  <span className="text-xs font-mono text-zinc-600">({history.length} records)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-700 rounded-md">
                  {([
                    { value: '6m', label: '6M' },
                    { value: '1y', label: '1Y' },
                    { value: 'all', label: 'All' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setHistoryRange(opt.value)}
                      className={`px-2.5 py-1 text-[10px] font-mono rounded ${
                        historyRange === opt.value
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={fetchHistory}
                  className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {loadingHistory ? (
              <div className="flex items-center gap-3 p-6 text-zinc-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-mono">Loading {selectedAsset} history…</span>
              </div>
            ) : errorHistory ? (
              <div className="p-4 text-sm text-red-400">{errorHistory}</div>
            ) : (
              <HistoryTable records={history} />
            )}
          </div>
        )}

        {/* Footer note */}
        <p className="text-[11px] font-mono text-zinc-700 text-center pb-2">
          Data source: CFTC Commitments of Traders — updated weekly (Friday release). Non-commercial positions for currencies; Managed Money for gold.
        </p>
      </div>
    </DashboardLayout>
  );
}
