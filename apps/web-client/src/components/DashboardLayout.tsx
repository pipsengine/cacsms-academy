'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Activity, Clock, Cpu, Globe, LayoutDashboard, Settings, ShieldAlert, Zap, Target, LogOut, User as UserIcon, Shield, ChevronDown, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import AIAssistant from '@/components/AIAssistant';
import { useMarketData } from '@/components/MarketDataProvider';
import { getAccessibleFeatures } from '@/lib/auth/permissions';
import { getPlanDisplayName } from '@/lib/pricing/catalog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState<string>('');
  const pathname = usePathname() || '';
  const [isMounted, setIsMounted] = useState(false);
  const { user, logout } = useAuth();
  const { health } = useMarketData();
  const [tick, setTick] = useState(() => Date.now());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = useMemo(() => {
    if (!user?.name) return user?.email?.[0]?.toUpperCase() ?? 'U';
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }, [user]);

  const accessibleFeatures = useMemo(() => getAccessibleFeatures(user), [user]);

  const planColor = useMemo(() => {
    switch (user?.plan) {
      case 'Institutional': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'ProTrader': return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
      case 'Trader': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Analyst': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-zinc-400 bg-zinc-700/30 border-zinc-700/50';
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
          
          <NavItem href="/command-center" icon={<LayoutDashboard />} label="Command Center" active={effectivePathname === '/command-center'} />
          {accessibleFeatures.currencyStrength && (
            <NavItem href="/currency-strength" icon={<Globe />} label="Currency Strength" active={effectivePathname === '/currency-strength'} />
          )}
          {accessibleFeatures.channelScanner && (
            <NavItem href="/channel-scanner" icon={<Activity />} label="Channel Scanner" active={effectivePathname === '/channel-scanner'} />
          )}
          {accessibleFeatures.breakoutEngine && (
            <NavItem href="/breakout-engine" icon={<Zap />} label="Breakout Engine" active={effectivePathname === '/breakout-engine'} />
          )}
          {accessibleFeatures.liquidityIntel && (
            <NavItem href="/liquidity-intel" icon={<ShieldAlert />} label="Liquidity Intel" active={effectivePathname === '/liquidity-intel'} />
          )}
          {accessibleFeatures.opportunityRadar && (
            <NavItem href="/opportunities" icon={<Target />} label="Opportunity Ranking" active={effectivePathname === '/opportunities'} />
          )}
          
          <div className="mt-8 mb-4 px-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">System</div>
          <NavItem href="/alert-history" icon={<Clock />} label="Alert History" active={effectivePathname === '/alert-history'} />
          <NavItem href="/configuration" icon={<Settings />} label="Configuration" active={effectivePathname === '/configuration'} />
          
          {user && (user.role === 'Super Admin' || user.role === 'Administrator') && (
            <NavItem href="/admin" icon={<Shield />} label="Administration" active={effectivePathname === '/admin'} />
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800/50 space-y-3">
          {user && (
            <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-emerald-400 font-mono">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-200 truncate">{user.name || user.email}</div>
                <span className={`inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border mt-0.5 ${planColor}`}>
                  {getPlanDisplayName(user.plan)}
                </span>
              </div>
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
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono text-zinc-400">NIGERIA TIME</div>
              <div className="text-sm font-mono text-zinc-200">
                {time || '00:00:00'}
              </div>
            </div>

            {/* User Profile Dropdown */}
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/70 border border-transparent hover:border-zinc-700/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-400 font-mono">{userInitials}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-semibold text-zinc-200 leading-tight truncate max-w-[120px]">
                      {user.name || user.email}
                    </div>
                    <div className={`text-[10px] font-mono ${planColor.split(' ')[0]}`}>{getPlanDisplayName(user.plan)}</div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform hidden md:block ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/40 z-50 overflow-hidden">
                    {/* Profile Header */}
                    <div className="px-4 py-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-emerald-400 font-mono">{userInitials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-zinc-100 truncate">{user.name || 'User'}</div>
                          <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${planColor}`}>
                          {getPlanDisplayName(user.plan)}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">{user.role}</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      <Link
                        href="/configuration"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-zinc-500" />
                        Settings
                      </Link>
                      <Link
                        href="/pricing"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-zinc-500" />
                        Manage Subscription
                      </Link>
                      {(user.role === 'Super Admin' || user.role === 'Administrator') && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-zinc-500" />
                          Administration
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-zinc-800 py-1.5">
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
