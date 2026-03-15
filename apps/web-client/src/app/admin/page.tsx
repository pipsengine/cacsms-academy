'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthProvider';
import { Users, CreditCard, Activity, Shield, Settings2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'limits' | 'analytics'>('users');
  const [limits, setLimits] = useState<any[]>([]);
  const [limitsEnabled, setLimitsEnabled] = useState(true);
  const [isEditingLimits, setIsEditingLimits] = useState(false);
  const [editedLimits, setEditedLimits] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'limits') {
      fetch('/api/admin/usage-limits')
        .then(res => res.json())
        .then(data => {
          setLimits(data.limits || []);
          setEditedLimits(data.limits || []);
          setLimitsEnabled(data.enabled !== false);
        });
    } else if (activeTab === 'analytics') {
      fetch('/api/admin/analytics')
        .then(res => res.json())
        .then(data => setAnalytics(data));
    }
  }, [activeTab]);

  const toggleLimits = async () => {
    const newState = !limitsEnabled;
    setLimitsEnabled(newState);
    await fetch('/api/admin/usage-limits/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: newState })
    });
  };

  const saveLimits = async () => {
    try {
      const res = await fetch('/api/admin/usage-limits/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limits: editedLimits })
      });
      if (res.ok) {
        const data = await res.json();
        setLimits(data.limits);
        setIsEditingLimits(false);
      }
    } catch (error) {
      console.error('Failed to save limits', error);
    }
  };

  const handleLimitChange = (planName: string, featureName: string, field: 'hourlyLimit' | 'dailyLimit', value: string) => {
    let parsedValue: number | 'Unlimited' = 'Unlimited';
    if (value !== 'Unlimited' && value !== '') {
      parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setEditedLimits(prev => {
      const newLimits = [...prev];
      const index = newLimits.findIndex(l => l.planName === planName && l.featureName === featureName);
      if (index !== -1) {
        newLimits[index] = { ...newLimits[index], [field]: parsedValue };
      } else {
        newLimits.push({ planName, featureName, hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited', [field]: parsedValue });
      }
      return newLimits;
    });
  };

  if (user?.role !== 'Super Admin' && user?.role !== 'Administrator') {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-red-500">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold">ACCESS DENIED</h2>
            <p className="text-sm mt-2">You do not have administrative privileges.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium text-zinc-100">System Administration</h2>
            <p className="text-sm text-zinc-500 mt-1">Manage users, subscriptions, and platform metrics.</p>
          </div>
          <div className="flex bg-zinc-900/50 border border-zinc-800 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Users & Revenue
            </button>
            <button 
              onClick={() => setActiveTab('limits')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'limits' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Usage Limits
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Analytics
            </button>
          </div>
        </div>

        {activeTab === 'users' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <MetricCard icon={<Users />} label="Total Users" value="1,248" trend="+12%" />
              <MetricCard icon={<Activity />} label="Active Subs" value="892" trend="+5%" />
              <MetricCard icon={<CreditCard />} label="Monthly Rev" value="$12,450" trend="+18%" />
              <MetricCard icon={<Shield />} label="System Status" value="Optimal" trend="99.9% Uptime" />
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
                <h3 className="font-medium text-zinc-200">Recent Registrations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Country</th>
                      <th className="px-6 py-3">Plan</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    <UserRow name="David O." email="david@example.com" country="Nigeria" plan="Premium" status="Active" />
                    <UserRow name="Sarah M." email="sarah@example.com" country="UK" plan="Professional" status="Active" />
                    <UserRow name="John D." email="john@example.com" country="USA" plan="Free" status="Pending" />
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === 'limits' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-medium text-zinc-100">Global Usage Limiter</h3>
                <p className="text-sm text-zinc-500 mt-1">Enable or disable all usage limits across the platform.</p>
              </div>
              <button 
                onClick={toggleLimits}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${limitsEnabled ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
              >
                {limitsEnabled ? 'Disable All Limits' : 'Enable All Limits'}
              </button>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                <h3 className="font-medium text-zinc-200">Feature Limits Configuration</h3>
                {isEditingLimits ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsEditingLimits(false);
                        setEditedLimits(limits);
                      }}
                      className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={saveLimits}
                      className="text-xs px-3 py-1 rounded bg-emerald-500 text-zinc-950 font-medium hover:bg-emerald-600"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingLimits(true)}
                    className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-400"
                  >
                    <Settings2 className="w-3 h-3" /> Edit Limits
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-3">Feature</th>
                      <th className="px-6 py-3">Free Limit</th>
                      <th className="px-6 py-3">Pro Limit</th>
                      <th className="px-6 py-3">Premium Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {['Channel Scanner', 'Breakout Engine', 'Alert System', 'AI Probability Engine', 'Liquidity Intelligence'].map(feature => {
                      const free = (isEditingLimits ? editedLimits : limits).find(l => l.planName === 'Free' && l.featureName === feature) || { hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' };
                      const pro = (isEditingLimits ? editedLimits : limits).find(l => l.planName === 'Professional' && l.featureName === feature) || { hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' };
                      const prem = (isEditingLimits ? editedLimits : limits).find(l => l.planName === 'Premium' && l.featureName === feature) || { hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' };
                      
                      const formatLimit = (l: any) => {
                        if (!l) return '-';
                        if (l.hourlyLimit === 0 && l.dailyLimit === 0) return <span className="text-zinc-600">Locked</span>;
                        if (l.hourlyLimit === 'Unlimited' && l.dailyLimit === 'Unlimited') return <span className="text-emerald-500">Unlimited</span>;
                        return `${l.hourlyLimit !== 'Unlimited' ? `${l.hourlyLimit}/hr` : ''} ${l.dailyLimit !== 'Unlimited' ? `(${l.dailyLimit}/day)` : ''}`;
                      };

                      const renderEditCell = (planName: string, l: any) => (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 w-8">Hr:</span>
                            <input 
                              type="text" 
                              value={l.hourlyLimit} 
                              onChange={(e) => handleLimitChange(planName, feature, 'hourlyLimit', e.target.value)}
                              className="w-20 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 w-8">Day:</span>
                            <input 
                              type="text" 
                              value={l.dailyLimit} 
                              onChange={(e) => handleLimitChange(planName, feature, 'dailyLimit', e.target.value)}
                              className="w-20 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      );

                      return (
                        <tr key={feature} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-200">{feature}</td>
                          <td className="px-6 py-4 font-mono text-zinc-400">
                            {isEditingLimits ? renderEditCell('Free', free) : formatLimit(free)}
                          </td>
                          <td className="px-6 py-4 font-mono text-zinc-400">
                            {isEditingLimits ? renderEditCell('Professional', pro) : formatLimit(pro)}
                          </td>
                          <td className="px-6 py-4 font-mono text-zinc-400">
                            {isEditingLimits ? renderEditCell('Premium', prem) : formatLimit(prem)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard icon={<Activity />} label="Total Feature Uses" value={analytics?.totalUsage || 0} trend="All time" />
              <MetricCard icon={<Users />} label="Active Users Today" value={analytics?.activeUsersToday || 0} trend="Unique users" />
              <MetricCard icon={<CreditCard />} label="Upgrades Today" value={analytics?.upgradesToday || 0} trend="Conversions" />
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
                <h3 className="font-medium text-zinc-200">Feature Usage Breakdown</h3>
              </div>
              <div className="p-6">
                {analytics?.featureUsage ? (
                  <div className="space-y-4">
                    {Object.entries(analytics.featureUsage).map(([feature, count]: any) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-zinc-400">{feature}</span>
                        <div className="flex items-center gap-4 w-1/2">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${(count / analytics.totalUsage) * 100}%` }}
                            />
                          </div>
                          <span className="text-zinc-200 font-mono text-sm w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-zinc-500 py-8">Loading analytics data...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3 text-zinc-400 mb-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-zinc-100 mb-1">{value}</div>
      <div className="text-xs text-emerald-500">{trend}</div>
    </div>
  );
}

function UserRow({ name, email, country, plan, status }: any) {
  return (
    <tr className="hover:bg-zinc-800/20 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-zinc-200">{name}</div>
        <div className="text-xs text-zinc-500">{email}</div>
      </td>
      <td className="px-6 py-4 text-zinc-400">{country}</td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">{plan}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-xs ${status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4">
        <button className="text-xs text-emerald-500 hover:underline">Manage</button>
      </td>
    </tr>
  );
}
