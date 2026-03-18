'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Info } from 'lucide-react';

type AlertRecord = {
  id: string;
  alertType: string;
  severity: string;
  pair: string | null;
  timeframe: string | null;
  title: string;
  message: string;
  createdAt: string;
};

const severityStyle: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export default function AlertHistoryLog() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const res = await fetch('/api/alerts/history?limit=25', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!active || !res.ok) return;
      setAlerts(data?.alerts ?? []);
    };

    void load();
    const interval = setInterval(() => void load(), 30_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col h-fit">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Alert History Log</h3>
        <span className="text-xs font-mono text-zinc-500">LIVE ARCHIVE</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-3">
          {alerts.length ? alerts.map((alert) => {
            const style = severityStyle[alert.severity] ?? severityStyle.info;
            const Icon = style.icon ?? Bell;
            return (
              <div key={alert.id} className={`flex gap-4 p-3 rounded-lg border ${style.border} bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${style.border} ${style.color} bg-zinc-950`}>
                        {alert.alertType}
                      </span>
                      {alert.pair && <span className="font-bold text-zinc-200 text-sm">{alert.pair}</span>}
                      {alert.timeframe && <span className="text-xs font-mono text-zinc-500">{alert.timeframe}</span>}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-200">{alert.title}</p>
                  <p className="text-sm text-zinc-400 mt-1">{alert.message}</p>
                </div>
              </div>
            );
          }) : (
            <div className="text-center text-zinc-500 py-8">No alert history available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
