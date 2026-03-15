import { Bell, Zap, ShieldAlert, Activity } from 'lucide-react';

export default function AlertHistoryLog() {
  const alerts = [
    { type: 'BREAKOUT', pair: 'EURAUD', tf: 'M30', msg: 'Breakout Detected: SHORT (Conf: 81%)', time: '11:42:15 WAT', icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { type: 'CHANNEL', pair: 'GBPJPY', tf: 'H1', msg: 'Channel Detected: Ascending (Score: 88%)', time: '11:38:02 WAT', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { type: 'LIQUIDITY', pair: 'USDJPY', tf: 'H4', msg: 'Liquidity Sweep: Equal Highs Rejected', time: '11:15:44 WAT', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { type: 'MATURITY', pair: 'EURUSD', tf: 'H1', msg: 'Channel Upgrade: Institutional (5+ touches)', time: '10:55:10 WAT', icon: Bell, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { type: 'BREAKOUT', pair: 'GBPUSD', tf: 'H1', msg: 'Breakout Detected: LONG (Conf: 94%)', time: '10:30:00 WAT', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col h-fit">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Alert History Log</h3>
        <span className="text-xs font-mono text-zinc-500">REAL-TIME</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <div key={i} className={`flex gap-4 p-3 rounded-lg border ${alert.border} bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${alert.bg} ${alert.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${alert.border} ${alert.color} bg-zinc-950`}>
                        {alert.type}
                      </span>
                      <span className="font-bold text-zinc-200 text-sm">{alert.pair}</span>
                      <span className="text-xs font-mono text-zinc-500">{alert.tf}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">{alert.time}</span>
                  </div>
                  <p className="text-sm text-zinc-400 truncate">{alert.msg}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
