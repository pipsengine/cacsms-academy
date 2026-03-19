'use client';

import { useCallback, useEffect, useState } from 'react';

type DailyTipPayload = {
  title: string;
  tip: string;
  pairs: string[];
  market_state: string;
  actionable_insight: string;
  image_prompt: string;
};

type DailyTradingTipPreviewProps = {
  compact?: boolean;
};

export default function DailyTradingTipPreview({ compact = false }: DailyTradingTipPreviewProps) {
  const [data, setData] = useState<DailyTipPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTip = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/market/daily-tip', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const payload = (await res.json()) as DailyTipPayload;
      setData(payload);
    } catch {
      setError('Unable to load daily tip right now.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTip();
  }, [loadTip]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Market Context Tip</p>
        <button
          type="button"
          onClick={() => void loadTip()}
          className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-sm text-zinc-500">Generating tip...</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && data && (
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-zinc-900">{data.title}</h4>
          <p className="text-sm text-zinc-700 leading-relaxed">{data.tip}</p>
          <p className="text-xs text-zinc-500">
            <span className="font-semibold text-zinc-700">Market state:</span> {data.market_state}
          </p>
          <p className="text-xs text-zinc-500">
            <span className="font-semibold text-zinc-700">Action:</span> {data.actionable_insight}
          </p>
          {data.pairs.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {data.pairs.map((pair) => (
                <span key={pair} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {pair}
                </span>
              ))}
            </div>
          )}
          {!compact && (
            <p className="text-[11px] text-zinc-400 pt-1">
              Visual prompt included for generation: {data.image_prompt}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
