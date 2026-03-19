'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

interface CurrencyData {
  name: string;
  score: number;
  timestamp?: string;
}

interface ChannelData {
  pair: string;
  tf: string;
  type: string;
  touches: string;
  score: number;
  bias: string;
  prob: number;
  stage: 'Developing' | 'Confirmed';
  support: number;
  resistance: number;
  currentPrice: number;
  widthPct: number;
  containmentPct: number;
  breakoutBias: 'LONG' | 'SHORT' | 'NEUTRAL';
  timestamp?: string;
}

interface BreakoutData {
  pair: string;
  tf: string;
  dir: string;
  conf: number;
  time: string;
  status: string;
  boundary: 'SUPPORT' | 'RESISTANCE';
  triggerPrice: number;
  currentPrice: number;
  distanceToTriggerPct: number;
  channelWidthPct: number;
  breakoutType: 'Continuation' | 'Compression Release' | 'Channel Reversal';
  channelStage: 'Developing' | 'Confirmed';
  timestamp?: string;
}

type MarketDataPayload<T> = {
  data: T;
  timestamp?: string;
};

type MarketHealthStatus = 'healthy' | 'stale' | 'offline';

interface MarketDataHealth {
  status: MarketHealthStatus;
  lastUpdate: string | null;
  latencyMs: number | null;
}

interface MarketDataContextType {
  currencies: CurrencyData[];
  channels: ChannelData[];
  breakouts: BreakoutData[];
  prices: Record<string, number>;
  priceTimestamps: Record<string, string>;
  isConnected: boolean;
  health: MarketDataHealth;
}

const MarketDataContext = createContext<MarketDataContextType>({
  currencies: [],
  channels: [],
  breakouts: [],
  prices: {},
  priceTimestamps: {},
  isConnected: false,
  health: { status: 'offline', lastUpdate: null, latencyMs: null },
});

export const useMarketData = () => useContext(MarketDataContext);

function toFiniteNumber(value: unknown, fallback = Number.NaN) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeChannelData(entries: ChannelData[]) {
  return entries.map((entry) => ({
    ...entry,
    stage: entry.stage ?? 'Developing',
    support: toFiniteNumber(entry.support),
    resistance: toFiniteNumber(entry.resistance),
    currentPrice: toFiniteNumber(entry.currentPrice),
    widthPct: toFiniteNumber(entry.widthPct),
    containmentPct: toFiniteNumber(entry.containmentPct),
    breakoutBias: entry.breakoutBias ?? 'NEUTRAL',
  }));
}

function normalizeBreakoutData(entries: BreakoutData[]) {
  return entries.map((entry) => ({
    ...entry,
    boundary: entry.boundary ?? 'RESISTANCE',
    triggerPrice: toFiniteNumber(entry.triggerPrice),
    currentPrice: toFiniteNumber(entry.currentPrice),
    distanceToTriggerPct: toFiniteNumber(entry.distanceToTriggerPct),
    channelWidthPct: toFiniteNumber(entry.channelWidthPct),
    breakoutType: entry.breakoutType ?? 'Continuation',
    channelStage: entry.channelStage ?? 'Developing',
  }));
}

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [breakouts, setBreakouts] = useState<BreakoutData[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [priceTimestamps, setPriceTimestamps] = useState<Record<string, string>>({});
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [healthStatus, setHealthStatus] = useState<MarketHealthStatus>('offline');

  const normalizePayload = <T,>(payload: T | MarketDataPayload<T>): MarketDataPayload<T> => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as MarketDataPayload<T>;
    }
    return {
      data: payload as T,
    };
  };

  const handleUpdate = useCallback(<T,>(
    payload: T | MarketDataPayload<T>,
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => {
    const normalized = normalizePayload(payload);
    setter(normalized.data);

    const eventTimestamp = normalized.timestamp ? Date.parse(normalized.timestamp) : Date.now();
    const now = Date.now();
    setLastUpdate(eventTimestamp);
    setLatency(Math.max(0, now - eventTimestamp));
  }, [setLastUpdate, setLatency]);

  useEffect(() => {
    const socketInstance = io();

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setHealthStatus('healthy');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setHealthStatus('offline');
    });

    socketInstance.on('currency_update', (payload) => handleUpdate(payload, setCurrencies));
    socketInstance.on('channel_update', (payload) => handleUpdate(payload, (value) => setChannels(normalizeChannelData(value as ChannelData[]))));
    socketInstance.on('breakout_update', (payload) => handleUpdate(payload, (value) => setBreakouts(normalizeBreakoutData(value as BreakoutData[]))));
    socketInstance.on('prices_update', (payload) => handleUpdate(payload, setPrices));
    socketInstance.on('price_timestamps_update', (payload) => handleUpdate(payload, setPriceTimestamps));

    return () => {
      socketInstance.disconnect();
    };
  }, [handleUpdate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        setHealthStatus('offline');
        return;
      }

      if (!lastUpdate) {
        setHealthStatus('offline');
        return;
      }

      const age = Date.now() - lastUpdate;
      if (age < 8000) {
        setHealthStatus('healthy');
      } else if (age < 15000) {
        setHealthStatus('stale');
      } else {
        setHealthStatus('offline');
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isConnected, lastUpdate]);

  const health = useMemo<MarketDataHealth>(() => ({
    status: isConnected ? healthStatus : 'offline',
    lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null,
    latencyMs: latency,
  }), [isConnected, healthStatus, lastUpdate, latency]);

  return (
    <MarketDataContext.Provider value={{ currencies, channels, breakouts, prices, priceTimestamps, isConnected, health }}>
      {children}
    </MarketDataContext.Provider>
  );
}
