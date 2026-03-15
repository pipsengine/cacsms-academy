'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

interface CurrencyData {
  name: string;
  score: number;
}

interface ChannelData {
  pair: string;
  tf: string;
  type: string;
  touches: string;
  score: number;
  bias: string;
  prob: number;
}

interface BreakoutData {
  pair: string;
  tf: string;
  dir: string;
  conf: number;
  time: string;
  status: string;
}

interface MarketDataContextType {
  currencies: CurrencyData[];
  channels: ChannelData[];
  breakouts: BreakoutData[];
  isConnected: boolean;
}

const MarketDataContext = createContext<MarketDataContextType>({
  currencies: [],
  channels: [],
  breakouts: [],
  isConnected: false,
});

export const useMarketData = () => useContext(MarketDataContext);

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [breakouts, setBreakouts] = useState<BreakoutData[]>([]);

  useEffect(() => {
    // Connect to the WebSocket server on the same origin
    const socketInstance = io();

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('currency_update', (data: CurrencyData[]) => {
      setCurrencies(data);
    });

    socketInstance.on('channel_update', (data: ChannelData[]) => {
      setChannels(data);
    });

    socketInstance.on('breakout_update', (data: BreakoutData[]) => {
      setBreakouts(data);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <MarketDataContext.Provider value={{ currencies, channels, breakouts, isConnected }}>
      {children}
    </MarketDataContext.Provider>
  );
}
