'use client';

import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, LineChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChartModal from './ChartModal';
import { useMarketData } from './MarketDataProvider';

export default function ActiveChannelScanner() {
  const { channels, isConnected } = useMarketData();
  const [selectedChart, setSelectedChart] = useState<{pair: string, tf: string, type: string} | null>(null);

  return (
    <>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col h-fit">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Active Channel Scanner</h3>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-mono text-zinc-500">{isConnected ? 'SCANNING 112 CHARTS' : 'DISCONNECTED'}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-mono text-zinc-500 bg-zinc-900/80">
                <th className="px-4 py-3 font-medium">PAIR</th>
                <th className="px-4 py-3 font-medium">TF</th>
                <th className="px-4 py-3 font-medium">TYPE</th>
                <th className="px-4 py-3 font-medium">TOUCHES</th>
                <th className="px-4 py-3 font-medium">SCORE</th>
                <th className="px-4 py-3 font-medium">BIAS</th>
                <th className="px-4 py-3 font-medium">PROB</th>
                <th className="px-4 py-3 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence>
                {channels.length > 0 ? channels.map((channel, i) => (
                  <motion.tr 
                    key={channel.pair + channel.tf} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-4 py-3 font-bold text-zinc-200">{channel.pair}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{channel.tf}</td>
                    <td className="px-4 py-3 text-zinc-300">{channel.type}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{channel.touches}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${channel.score > 80 ? 'bg-emerald-500' : channel.score > 60 ? 'bg-amber-500' : 'bg-zinc-500'}`}
                            style={{ width: `${channel.score}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs transition-all duration-500">{channel.score}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 text-xs font-bold ${
                        channel.bias === 'LONG' ? 'text-emerald-500' : 
                        channel.bias === 'SHORT' ? 'text-red-500' : 'text-zinc-500'
                      }`}>
                        {channel.bias === 'LONG' && <ArrowUpRight className="w-3 h-3" />}
                        {channel.bias === 'SHORT' && <ArrowDownRight className="w-3 h-3" />}
                        {channel.bias === 'NEUTRAL' && <Minus className="w-3 h-3" />}
                        {channel.bias}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-300 transition-all duration-500">{channel.prob}%</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedChart({ pair: channel.pair, tf: channel.tf, type: channel.type })}
                        className="p-1.5 bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="View Chart"
                      >
                        <LineChart className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-zinc-500 font-mono text-sm">
                      Waiting for data stream...
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
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
