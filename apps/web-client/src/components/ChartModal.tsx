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

function generateInitialData(pair: string, type: string) {
  let currentPrice = pair.includes('JPY') ? 150.0 : 1.1;
  const volatility = pair.includes('JPY') ? 0.5 : 0.002;
  const initialData: Array<{ time: string; price: number }> = [];

  for (let i = 60; i >= 0; i--) {
    if (type.includes('Ascending') || type.includes('LONG')) {
      currentPrice += Math.random() * volatility - volatility * 0.3;
    } else if (type.includes('Descending') || type.includes('SHORT')) {
      currentPrice -= Math.random() * volatility - volatility * 0.3;
    } else {
      currentPrice += Math.random() * volatility - volatility * 0.5;
    }

    initialData.push({
      time: new Date(Date.now() - i * 1000).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      price: Number(currentPrice.toFixed(4)),
    });
  }

  return initialData;
}

export default function ChartModal({ isOpen, onClose, pair, timeframe, type }: ChartModalProps) {
  const [data, setData] = useState(() => generateInitialData(pair, type));

  useEffect(() => {
    if (!isOpen) return;

    const volatility = pair.includes('JPY') ? 0.5 : 0.002;

    const interval = setInterval(() => {
      setData(prevData => {
        if (prevData.length === 0) {
          return generateInitialData(pair, type);
        }

        const lastPrice = prevData[prevData.length - 1].price;
        let nextPrice = lastPrice;
        
        if (type.includes('Ascending') || type.includes('LONG')) {
          nextPrice += (Math.random() * volatility) - (volatility * 0.3);
        } else if (type.includes('Descending') || type.includes('SHORT')) {
          nextPrice -= (Math.random() * volatility) - (volatility * 0.3);
        } else {
          nextPrice += (Math.random() * volatility) - (volatility * 0.5);
        }

        const newData = [...prevData.slice(1), {
          time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          price: Number(nextPrice.toFixed(4)),
        }];
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, pair, type]);

  if (!isOpen) return null;

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const currentPrice = data[data.length - 1]?.price;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
              {pair} <span className="text-sm font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{timeframe}</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Structural Analysis: {type}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
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

        <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex justify-between items-center text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-zinc-500">Current Price:</span>
              <span className="ml-2 font-mono text-zinc-200">{currentPrice?.toFixed(pair.includes('JPY') ? 2 : 4)}</span>
            </div>
            <div>
              <span className="text-zinc-500">Volatility:</span>
              <span className="ml-2 font-mono text-amber-500">High</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400 font-mono text-xs">LIVE FEED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
