'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Activity, BarChart2, Clock, Cpu, Globe, LayoutDashboard, Settings, ShieldAlert, Zap, Target, Shield, Lightbulb, BookOpen, LineChart, Waves } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import AIAssistant from '@/components/AIAssistant';
import { useMarketData } from '@/components/MarketDataProvider';
import UserAccountMenu from '@/components/UserAccountMenu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState<string>('');
  const pathname = usePathname() || '';
  const [isMounted, setIsMounted] = useState(false);
  const { user, logout } = useAuth();
  const { health } = useMarketData();
  const [tick, setTick] = useState(() => Date.now());

  const userInitials = useMemo(() => {
    if (!user?.name) return user?.email?.[0]?.toUpperCase() ?? 'U';
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }, [user]);

  const planColor = useMemo(() => {
    switch (user?.plan) {
      case 'ProTrader': return 'text-violet-700 bg-violet-50 border-violet-200';
      case 'Trader': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Analyst': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-zinc-600 bg-zinc-100 border-zinc-300';
    }
  }, [user?.plan]);

  useEffect(() => {
    const id = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const effectivePathname = isMounted ? pathname : '';

  const getPageTitle = () => {
    switch (effectivePathname) {
      case '/command-center': return 'Command Center';
      case '/currency-strength': return 'Currency Strength';
      case '/channel-scanner': return 'Channel Scanner';
      case '/breakout-engine': return 'Breakout Engine';
      case '/liquidity-intel': return 'Liquidity Intel';
      case '/opportunities': return 'Opportunity Ranking';
      case '/daily-tips': return 'Daily Tips';
      case '/our-courses': return 'Our Courses';
      case '/weekly-analysis': return 'Weekly Analysis';
      case '/cot-intelligence': return 'COT Intelligence';
      case '/interest-rate-intelligence': return 'Interest Rate Intelligence';
      case '/profile': return 'Profile';
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
    <div className="flex h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#ecfeff_0%,_#f8fafc_45%,_#ffffff_100%)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-teal-100/80 bg-white/85 backdrop-blur-xl flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-teal-100/80">
          <Link href="/" className="flex items-center gap-2 text-emerald-700">
            <Cpu className="w-6 h-6" />
            <span className="font-mono font-bold tracking-wider text-lg">INTEL TRADER</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-mono text-zinc-500 mb-4 px-2 uppercase tracking-widest">Core Engines</div>

          
          <NavItem href="/command-center" icon={<LayoutDashboard />} label="Command Center" active={effectivePathname === '/command-center'} />
          <NavItem href="/currency-strength" icon={<Globe />} label="Currency Strength" active={effectivePathname === '/currency-strength'} />
          <NavItem href="/channel-scanner" icon={<Activity />} label="Channel Scanner" active={effectivePathname === '/channel-scanner'} />
          <NavItem href="/breakout-engine" icon={<Zap />} label="Breakout Engine" active={effectivePathname === '/breakout-engine'} />
          <NavItem href="/liquidity-intel" icon={<ShieldAlert />} label="Liquidity Intel" active={effectivePathname === '/liquidity-intel'} />
          <NavItem href="/opportunities" icon={<Target />} label="Opportunity Ranking" active={effectivePathname === '/opportunities'} />

          <div className="mt-8 mb-4 px-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">Intel Insights</div>
          <NavItem href="/daily-tips" icon={<Lightbulb />} label="Daily Tips" active={effectivePathname === '/daily-tips'} />
          <NavItem href="/our-courses" icon={<BookOpen />} label="Our Courses" active={effectivePathname === '/our-courses'} />
          <NavItem href="/weekly-analysis" icon={<LineChart />} label="Weekly Analysis" active={effectivePathname === '/weekly-analysis'} />
          <NavItem href="/cot-intelligence" icon={<BarChart2 />} label="COT Intelligence" active={effectivePathname === '/cot-intelligence'} />
          <NavItem href="/interest-rate-intelligence" icon={<Waves />} label="Interest Rate Intelligence" active={effectivePathname === '/interest-rate-intelligence'} />
          
          <div className="mt-8 mb-4 px-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">System</div>
          <NavItem href="/alert-history" icon={<Clock />} label="Alert History" active={effectivePathname === '/alert-history'} />
          <NavItem href="/configuration" icon={<Settings />} label="Configuration" active={effectivePathname === '/configuration'} />
          
          {user && (user.role === 'Super Admin' || user.role === 'Administrator') && (
            <NavItem href="/admin" icon={<Shield />} label="Administration" active={effectivePathname === '/admin'} />
          )}
        </div>
        
        <div className="p-4 border-t border-teal-100/80 space-y-3">
          {user && (
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-emerald-700 font-mono">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-900 truncate">{user.name || user.email}</div>
                <span className={`inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border mt-0.5 ${planColor}`}>
                  {user.plan}
                </span>
              </div>
            </div>
          )}
          
          <div className="rounded-lg bg-white border border-zinc-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-600">SYSTEM ONLINE</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>Latency:</span>
              <span className="text-emerald-600">12ms</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 flex justify-between mt-1">
              <span>Charts:</span>
              <span className="text-zinc-700">112 / 112</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b border-teal-100/80 bg-white/85 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-medium text-zinc-900 transition-colors hover:text-emerald-700">
              {getPageTitle()}
            </Link>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-zinc-600">Monitoring 28 Pairs</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  health.status === 'healthy' ? 'bg-emerald-500 animate-pulse' :
                  health.status === 'stale' ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
              />
              <span className="text-xs font-mono text-zinc-600">
                {health.status === 'healthy' && 'Live Feed'}
                {health.status === 'stale' && 'Feed Lagging'}
                {health.status === 'offline' && 'Feed Offline'}
                {secondsAgo !== null ? ` · ${secondsAgo}s ago` : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono text-zinc-500">NIGERIA TIME</div>
              <div className="text-sm font-mono text-zinc-700">
                {time || '00:00:00'}
              </div>
            </div>

            {user && <UserAccountMenu variant="light" />}
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
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' })}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
