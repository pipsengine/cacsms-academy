'use client';

import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, LineChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChartModal from './ChartModal';
import { useMarketData } from './MarketDataProvider';

export default function BreakoutProbabilityTable() {
  const { breakouts, isConnected } = useMarketData();
  const [selectedChart, setSelectedChart] = useState<{pair: string, tf: string, type: string} | null>(null);

  return (
    <>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col h-fit">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Breakout Engine</h3>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-mono text-zinc-500">{isConnected ? 'AI PROBABILITY' : 'DISCONNECTED'}</span>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-3">
            <AnimatePresence>
              {breakouts.length > 0 ? breakouts.map((bo, i) => (
                <motion.div 
                  key={bo.pair + bo.tf} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      bo.dir === 'LONG' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {bo.dir === 'LONG' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200">{bo.pair}</span>
                        <span className="text-xs font-mono text-zinc-500">{bo.tf}</span>
                      </div>
                      <div className="text-xs font-mono text-zinc-400 mt-0.5">
                        {bo.time}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedChart({ pair: bo.pair, tf: bo.tf, type: `${bo.dir} Breakout` })}
                      className="p-1.5 bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 rounded transition-colors opacity-0 group-hover:opacity-100"
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
                        bo.status === 'TRIGGERED' ? 'border-zinc-700 text-zinc-400 bg-zinc-800' :
                        'border-amber-500/30 text-amber-400 bg-amber-500/10'
                      }`}>
                        {bo.status}
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
