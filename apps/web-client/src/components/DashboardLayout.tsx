'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Activity, Clock, Cpu, Globe, LayoutDashboard, Settings, ShieldAlert, Zap, Target, LogOut, User as UserIcon, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import AIAssistant from '@/components/AIAssistant';
import { useMarketData } from '@/components/MarketDataProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState<string>('');
  const pathname = usePathname() || '';
  const [isMounted, setIsMounted] = useState(false);
  const { user, logout } = useAuth();
  const { health } = useMarketData();
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const id = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const effectivePathname = isMounted ? pathname : '';

  const getPageTitle = () => {
    switch (effectivePathname) {
      case '/': return 'Command Center';
      case '/currency-strength': return 'Currency Strength';
      case '/channel-scanner': return 'Channel Scanner';
      case '/breakout-engine': return 'Breakout Engine';
      case '/liquidity-intel': return 'Liquidity Intel';
      case '/opportunities': return 'Opportunity Ranking';
      case '/alert-history': return 'Alert History';
      case '/configuration': return 'Configuration';
      default: return 'Command Center';
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setTime(formatter.format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const secondsAgo = useMemo(() => {
    if (!health.lastUpdate) return null;
    const last = new Date(health.lastUpdate).getTime();
    return Math.max(0, Math.round((tick - last) / 1000));
  }, [health.lastUpdate, tick]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <Link href="/" className="flex items-center gap-2 text-emerald-500">
            <Cpu className="w-6 h-6" />
            <span className="font-mono font-bold tracking-wider text-lg">INTEL TRADER</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-mono text-zinc-500 mb-4 px-2 uppercase tracking-widest">Core Engines</div>
          
          <NavItem href="/" icon={<LayoutDashboard />} label="Command Center" active={effectivePathname === '/'} />
          <NavItem href="/currency-strength" icon={<Globe />} label="Currency Strength" active={effectivePathname === '/currency-strength'} />
          <NavItem href="/channel-scanner" icon={<Activity />} label="Channel Scanner" active={effectivePathname === '/channel-scanner'} />
          <NavItem href="/breakout-engine" icon={<Zap />} label="Breakout Engine" active={effectivePathname === '/breakout-engine'} />
          <NavItem href="/liquidity-intel" icon={<ShieldAlert />} label="Liquidity Intel" active={effectivePathname === '/liquidity-intel'} />
          <NavItem href="/opportunities" icon={<Target />} label="Opportunity Ranking" active={effectivePathname === '/opportunities'} />
          
          <div className="mt-8 mb-4 px-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">System</div>
          <NavItem href="/alert-history" icon={<Clock />} label="Alert History" active={effectivePathname === '/alert-history'} />
          <NavItem href="/configuration" icon={<Settings />} label="Configuration" active={effectivePathname === '/configuration'} />
          
          {user && (user.role === 'Super Admin' || user.role === 'Administrator') && (
            <NavItem href="/admin" icon={<Shield />} label="Administration" active={effectivePathname === '/admin'} />
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800/50 space-y-3">
          {user && (
            <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-200 truncate max-w-[100px]">{user.name}</div>
                  <div className="text-[10px] font-mono text-emerald-500">{user.plan} Plan</div>
                </div>
              </div>
              <button onClick={logout} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400">SYSTEM ONLINE</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>Latency:</span>
              <span className="text-emerald-500">12ms</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 flex justify-between mt-1">
              <span>Charts:</span>
              <span className="text-zinc-300">112 / 112</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium text-zinc-100">{getPageTitle()}</h1>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono text-zinc-400">Monitoring 28 Pairs</span>
          </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  health.status === 'healthy' ? 'bg-emerald-500 animate-pulse' :
                  health.status === 'stale' ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
              />
              <span className="text-xs font-mono text-zinc-400">
                {health.status === 'healthy' && 'Live Feed'}
                {health.status === 'stale' && 'Feed Lagging'}
                {health.status === 'offline' && 'Feed Offline'}
                {secondsAgo !== null ? ` · ${secondsAgo}s ago` : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono text-zinc-400">NIGERIA TIME</div>
              <div className="text-sm font-mono text-zinc-200">
                {time || '00:00:00'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        <AIAssistant />
      </main>
    </div>
  );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        active 
          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' })}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
