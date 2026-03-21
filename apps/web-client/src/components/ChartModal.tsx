'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair: string;
  timeframe: string;
  type: string;
}

type ChartPoint = { time: string; price: number };

export default function ChartModal({ isOpen, onClose, pair, timeframe, type }: ChartModalProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [provider, setProvider] = useState('market');

  useEffect(() => {
    if (!isOpen) return;

    const loadChart = async () => {
      const res = await fetch(`/api/market/chart?pair=${encodeURIComponent(pair)}&timeframe=${encodeURIComponent(timeframe)}`, {
        cache: 'no-store',
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.candles?.length) return;

      setProvider(payload.provider || 'market');
      setData(
        payload.candles.map((candle: { datetime: string; close: number }) => ({
          time: new Date(candle.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: Number(candle.close),
        }))
      );
    };

    void loadChart();
    const interval = setInterval(() => {
      void loadChart();
    }, 60_000);

    return () => clearInterval(interval);
  }, [isOpen, pair, timeframe]);

  if (!isOpen) return null;
  if (data.length === 0) return null;

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const currentPrice = data[data.length - 1]?.price;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
              {pair} <span className="text-sm font-mono text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded">{timeframe}</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Structural Analysis: {type}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#52525b" 
                tick={{ fill: '#52525b', fontSize: 12 }}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis 
                domain={[minPrice - (maxPrice - minPrice) * 0.1, maxPrice + (maxPrice - minPrice) * 0.1]} 
                stroke="#52525b"
                tick={{ fill: '#52525b', fontSize: 12 }}
                tickFormatter={(val) => val.toFixed(pair.includes('JPY') ? 2 : 4)}
                orientation="right"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                itemStyle={{ color: '#10b981' }}
                formatter={(value: any) => [Number(value).toFixed(pair.includes('JPY') ? 2 : 4), 'Price']}
              />
              <ReferenceLine y={currentPrice} stroke="#10b981" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 border-t border-zinc-200 flex justify-between items-center text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-zinc-500">Current Price:</span>
              <span className="ml-2 font-mono text-zinc-700">{currentPrice?.toFixed(pair.includes('JPY') ? 2 : 4)}</span>
            </div>
            <div>
              <span className="text-zinc-500">Volatility:</span>
              <span className="ml-2 font-mono text-amber-500">High</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400 font-mono text-xs">{provider.toUpperCase()} FEED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
