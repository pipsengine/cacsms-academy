'use client';

import { useMarketData } from './MarketDataProvider';

export default function CurrencyStrengthHeatmap() {
  const { currencies, isConnected } = useMarketData();

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 31) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-500 border-red-500/30';
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col h-fit">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Currency Strength</h3>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-mono text-zinc-500">{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-4 gap-3">
          {currencies.length > 0 ? currencies.map((currency) => (
            <div 
              key={currency.name}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-500 ${getScoreColor(currency.score)}`}
            >
              <span className="text-lg font-bold">{currency.name}</span>
              <span className="text-xs font-mono mt-1">
                {currency.score}%
              </span>
              <span className="text-[10px] font-mono mt-1 opacity-80">
                {currency.score >= 62 ? 'LONG' : currency.score <= 38 ? 'SHORT' : 'NEUTRAL'}
              </span>
            </div>
          )) : (
            <div className="col-span-4 text-center text-zinc-500 font-mono text-sm py-8">
              Waiting for data stream...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
