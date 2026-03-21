'use client';

import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, LineChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChartModal from './ChartModal';
import { useMarketData } from './MarketDataProvider';

function formatPrice(pair: string, value?: number | null) {
  if (!Number.isFinite(value)) return '--';
  const numericValue = value as number;
  return pair.endsWith('JPY') ? numericValue.toFixed(3) : numericValue.toFixed(5);
}

function formatPercent(value?: number | null, digits = 2) {
  if (!Number.isFinite(value)) return '--';
  const numericValue = value as number;
  return numericValue.toFixed(digits);
}

export default function BreakoutProbabilityTable() {
  const { breakouts, isConnected } = useMarketData();
  const [selectedChart, setSelectedChart] = useState<{pair: string, tf: string, type: string} | null>(null);

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col h-full min-h-0">
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-700 uppercase tracking-wider">Breakout Engine</h3>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-mono text-zinc-500">{isConnected ? 'AI PROBABILITY' : 'DISCONNECTED'}</span>
          </div>
        </div>
        <div className="p-4 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-3 min-h-0">
            <AnimatePresence>
              {breakouts.length > 0 ? breakouts.map((bo, i) => (
                <motion.div 
                  key={bo.pair + bo.tf} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-slate-50 hover:bg-zinc-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      bo.dir === 'LONG' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {bo.dir === 'LONG' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-700">{bo.pair}</span>
                        <span className="text-xs font-mono text-zinc-500">{bo.tf}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          bo.channelStage === 'Confirmed'
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                            : 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                        }`}>
                          {bo.channelStage}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-zinc-400 mt-0.5">
                        {bo.breakoutType ?? 'Structure Watch'} · {bo.boundary ?? 'LEVEL'} · {bo.time}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-1">
                        Trigger {formatPrice(bo.pair, bo.triggerPrice)} · Live {formatPrice(bo.pair, bo.currentPrice)} · Gap {formatPercent(bo.distanceToTriggerPct, 3)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedChart({ pair: bo.pair, tf: bo.tf, type: `${bo.dir} Breakout` })}
                      className="p-1.5 bg-zinc-200 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="View Chart"
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500">CONFIDENCE</span>
                        <span className={`font-mono font-bold transition-all duration-500 ${bo.conf > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {bo.conf}%
                        </span>
                      </div>
                      <div className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        bo.status === 'ACTIVE' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 animate-pulse' :
                        bo.status === 'TRIGGERED' ? 'border-zinc-300 text-zinc-400 bg-zinc-200' :
                        'border-amber-500/30 text-amber-400 bg-amber-500/10'
                      }`}>
                        {bo.status}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        Width {formatPercent(bo.channelWidthPct, 2)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center text-zinc-500 font-mono text-sm py-8">
                  Waiting for data stream...
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {selectedChart && (
        <ChartModal
          key={`${selectedChart.pair}-${selectedChart.tf}-${selectedChart.type}`}
          isOpen={true}
          onClose={() => setSelectedChart(null)}
          pair={selectedChart.pair}
          timeframe={selectedChart.tf}
          type={selectedChart.type}
        />
      )}
    </>
  );
}
