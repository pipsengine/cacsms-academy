'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Settings, Bell, Shield, Smartphone, Mail, Globe, Cpu, Save } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

export default function ConfigurationPage() {
  const { addNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [marketStatus, setMarketStatus] = useState({
    provider: 'market',
    snapshotProvider: null as string | null,
    generatedAt: null as string | null,
    refreshMs: 60000,
    trackedPairs: 0,
    stale: true,
    mode: 'live' as 'live' | 'fallback-cache' | 'fallback-mock',
    lastErrorMessage: null as string | null,
  });
  
  const [config, setConfig] = useState({
    alerts: {
      email: true,
      push: false,
      telegram: true,
      sound: true,
    },
    trading: {
      riskPerTrade: '1.0',
      defaultTimeframe: 'H1',
      minProbability: '75',
      autoScan: true,
    },
    pairs: {
      majors: true,
      crosses: true,
      exotics: false,
      crypto: false,
    }
  });

  React.useEffect(() => {
    let active = true;

    const loadPreferences = async () => {
      const res = await fetch('/api/user/preferences', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!active || !res.ok || !data?.preferences) {
        setIsLoading(false);
        return;
      }

      setConfig(data.preferences);
      setIsLoading(false);
    };

    void loadPreferences();

    const loadMarketStatus = async () => {
      const res = await fetch('/api/market/status', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!active || !res.ok || !data) return;
      setMarketStatus(data);
    };

    void loadMarketStatus();
    const interval = setInterval(() => void loadMarketStatus(), 30_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        addNotification({ type: 'error', title: 'Save Failed', message: 'We could not save your configuration.' });
        return;
      }

      addNotification({ type: 'success', title: 'Configuration Saved', message: 'Your system preferences have been updated successfully.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto text-zinc-500">Loading configuration...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">System Configuration</h2>
            <p className="text-sm text-zinc-400 mt-1">Manage your platform preferences and alert settings.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? <Cpu className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Preferences */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-zinc-200">Alert Delivery Methods</h3>
                  <p className="text-sm text-zinc-500">Choose how you want to receive market intelligence.</p>
                </div>
              </div>

              <div className="space-y-4">
                <ToggleRow 
                  icon={<Mail className="w-4 h-4" />}
                  title="Email Notifications" 
                  description="Receive detailed analysis reports via email."
                  checked={config.alerts.email}
                  onChange={(v) => setConfig(c => ({...c, alerts: {...c.alerts, email: v}}))}
                />
                <ToggleRow 
                  icon={<Smartphone className="w-4 h-4" />}
                  title="Push Notifications" 
                  description="Instant alerts on your mobile device."
                  checked={config.alerts.push}
                  onChange={(v) => setConfig(c => ({...c, alerts: {...c.alerts, push: v}}))}
                />
                <ToggleRow 
                  icon={<Globe className="w-4 h-4" />}
                  title="Telegram Integration" 
                  description="Get real-time signals in your Telegram app."
                  checked={config.alerts.telegram}
                  onChange={(v) => setConfig(c => ({...c, alerts: {...c.alerts, telegram: v}}))}
                />
                <ToggleRow 
                  icon={<Bell className="w-4 h-4" />}
                  title="Audio Alerts" 
                  description="Play an audible notification when a priority alert is triggered."
                  checked={config.alerts.sound}
                  onChange={(v) => setConfig(c => ({...c, alerts: {...c.alerts, sound: v}}))}
                />
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-zinc-200">Trading Parameters</h3>
                  <p className="text-sm text-zinc-500">Configure the AI engine&apos;s analysis thresholds.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Default Risk Per Trade (%)</label>
                  <input 
                    type="number" 
                    value={config.trading.riskPerTrade}
                    onChange={(e) => setConfig(c => ({...c, trading: {...c.trading, riskPerTrade: e.target.value}}))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Minimum Probability Score</label>
                  <input 
                    type="number" 
                    value={config.trading.minProbability}
                    onChange={(e) => setConfig(c => ({...c, trading: {...c.trading, minProbability: e.target.value}}))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Default Timeframe</label>
                  <select 
                    value={config.trading.defaultTimeframe}
                    onChange={(e) => setConfig(c => ({...c, trading: {...c.trading, defaultTimeframe: e.target.value}}))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="M15">M15</option>
                    <option value="M30">M30</option>
                    <option value="H1">H1</option>
                    <option value="H4">H4</option>
                    <option value="D1">D1</option>
                  </select>
                </div>
                <ToggleRow 
                  icon={<Cpu className="w-4 h-4" />}
                  title="Automatic Market Scan" 
                  description="Keep ranking, breakout, and liquidity scans running continuously in the background."
                  checked={config.trading.autoScan}
                  onChange={(v) => setConfig(c => ({...c, trading: {...c.trading, autoScan: v}}))}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-zinc-200">Asset Classes</h3>
                </div>
              </div>

              <div className="space-y-4">
                <CheckboxRow 
                  label="Major Pairs" 
                  checked={config.pairs.majors}
                  onChange={(v) => setConfig(c => ({...c, pairs: {...c.pairs, majors: v}}))}
                />
                <CheckboxRow 
                  label="Cross Pairs" 
                  checked={config.pairs.crosses}
                  onChange={(v) => setConfig(c => ({...c, pairs: {...c.pairs, crosses: v}}))}
                />
                <CheckboxRow 
                  label="Exotic Pairs" 
                  checked={config.pairs.exotics}
                  onChange={(v) => setConfig(c => ({...c, pairs: {...c.pairs, exotics: v}}))}
                />
                <CheckboxRow 
                  label="Cryptocurrencies" 
                  checked={config.pairs.crypto}
                  onChange={(v) => setConfig(c => ({...c, pairs: {...c.pairs, crypto: v}}))}
                />
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-medium text-emerald-500">System Status</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Provider</span>
                  <span className="font-mono text-zinc-200">{marketStatus.provider}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Data Feed</span>
                  <span className={`font-mono ${marketStatus.mode === 'live' && !marketStatus.stale ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {marketStatus.mode === 'live' && !marketStatus.stale ? 'Live' : marketStatus.mode === 'fallback-mock' ? 'Fallback Mock' : 'Cached'}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Last Sync</span>
                  <span className="font-mono text-zinc-200">
                    {marketStatus.generatedAt ? new Date(marketStatus.generatedAt).toLocaleTimeString() : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Tracked Pairs</span>
                  <span className="font-mono text-zinc-200">{marketStatus.trackedPairs}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Snapshot Source</span>
                  <span className="font-mono text-zinc-200">{marketStatus.snapshotProvider ?? 'Unavailable'}</span>
                </div>
                {marketStatus.lastErrorMessage && (
                  <div className="text-xs text-amber-300 border border-amber-500/20 bg-amber-500/10 rounded-lg px-3 py-2">
                    Provider notice: {marketStatus.lastErrorMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ToggleRow({ icon, title, description, checked, onChange }: { icon: React.ReactNode, title: string, description: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
      <div className="flex items-center gap-4">
        <div className="text-zinc-500">{icon}</div>
        <div>
          <div className="font-medium text-zinc-200">{title}</div>
          <div className="text-xs text-zinc-500">{description}</div>
        </div>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-zinc-700'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700 bg-zinc-950 group-hover:border-zinc-500'}`}>
        {checked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{label}</span>
    </label>
  );
}
