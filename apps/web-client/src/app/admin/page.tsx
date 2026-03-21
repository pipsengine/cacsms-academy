'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthProvider';
import { Activity, CreditCard, Settings2, Shield, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PlanType, PricingDetail, PricingMatrix } from '@/lib/pricing/catalog';

type Tab = 'users' | 'limits' | 'pricing' | 'analytics';

type ManagedSubscription = {
  id?: string;
  planType: string;
  billingCycle: 'monthly' | 'annual';
  price: number;
  currency: string;
  paymentProvider: string;
  status: string;
  startDate: string;
  expiryDate: string;
};

const FEATURES = [
  'Channel Scanner',
  'Breakout Engine',
  'Alert System',
  'AI Probability Engine',
  'Liquidity Intelligence',
] as const;

const PLANS: PlanType[] = ['Scout', 'Analyst', 'Trader', 'ProTrader'];

type UsdBasePricingMatrix = Record<PlanType, PricingDetail>;

type ExchangeRateSnapshot = {
  usdToNgn: number;
  fetchedAt: string | null;
  source: string;
  stale: boolean;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const canEditPricing = user?.role === 'Super Admin';
  const [tab, setTab] = useState<Tab>('users');
  const [overview, setOverview] = useState<any>(null);
  const [limits, setLimits] = useState<any[]>([]);
  const [editedLimits, setEditedLimits] = useState<any[]>([]);
  const [limitsEnabled, setLimitsEnabled] = useState(true);
  const [editingLimits, setEditingLimits] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pricingMatrix, setPricingMatrix] = useState<PricingMatrix | null>(null);
  const [usdBasePricing, setUsdBasePricing] = useState<UsdBasePricingMatrix | null>(null);
  const [editedUsdBasePricing, setEditedUsdBasePricing] = useState<UsdBasePricingMatrix | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateSnapshot | null>(null);
  const [manualExchangeRate, setManualExchangeRate] = useState('');
  const [editingPricing, setEditingPricing] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    const res = await fetch('/api/admin/overview', { cache: 'no-store' });
    setOverview(await res.json());
  };

  const loadLimits = async () => {
    const res = await fetch('/api/admin/usage-limits', { cache: 'no-store' });
    const data = await res.json();
    setLimits(data.limits || []);
    setEditedLimits(data.limits || []);
    setLimitsEnabled(data.enabled !== false);
  };

  const loadAnalytics = async () => {
    const res = await fetch('/api/admin/analytics', { cache: 'no-store' });
    setAnalytics(await res.json());
  };

  const loadPricing = async () => {
    const res = await fetch('/api/admin/pricing', { cache: 'no-store' });
    const data = await res.json();
    setPricingMatrix(data.pricingMatrix);
    setUsdBasePricing(data.usdBasePricing);
    setEditedUsdBasePricing(data.usdBasePricing);
    setExchangeRate(data.exchangeRate);
    setManualExchangeRate(data.exchangeRate?.usdToNgn ? String(data.exchangeRate.usdToNgn) : '');
  };

  useEffect(() => {
    if (tab === 'users') void loadOverview();
    if (tab === 'limits') void loadLimits();
    if (tab === 'pricing') void loadPricing();
    if (tab === 'analytics') void loadAnalytics();
  }, [tab]);

  const toggleLimits = async () => {
    const next = !limitsEnabled;
    setLimitsEnabled(next);
    await fetch('/api/admin/usage-limits/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: next }),
    });
  };

  const saveLimits = async () => {
    const res = await fetch('/api/admin/usage-limits/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limits: editedLimits }),
    });
    if (res.ok) {
      const data = await res.json();
      setLimits(data.limits || []);
      setEditedLimits(data.limits || []);
      setEditingLimits(false);
    }
  };

  const savePricing = async () => {
    const res = await fetch('/api/admin/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usdBasePricing: editedUsdBasePricing,
        manualExchangeRate,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPricingMatrix(data.pricingMatrix);
      setUsdBasePricing(data.usdBasePricing);
      setEditedUsdBasePricing(data.usdBasePricing);
      setExchangeRate(data.exchangeRate);
      setManualExchangeRate(data.exchangeRate?.usdToNgn ? String(data.exchangeRate.usdToNgn) : '');
      setEditingPricing(false);
    }
  };

  const onPricingChange = (
    plan: PlanType,
    field: 'priceValue' | 'unitAmountCents' | 'annualPriceValue' | 'annualUnitAmountCents',
    value: string
  ) => {
    setEditedUsdBasePricing((prev) => prev ? ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [field]: Number(value),
      },
    }) : prev);
  };

  const onLimitChange = (planName: string, featureName: string, field: 'hourlyLimit' | 'dailyLimit', value: string) => {
    let parsed: number | 'Unlimited' = 'Unlimited';
    if (value !== 'Unlimited' && value !== '') {
      parsed = parseInt(value, 10);
      if (isNaN(parsed)) parsed = 0;
    }
    setEditedLimits((prev: any[]) => {
      const next = [...prev];
      const index = next.findIndex((x) => x.planName === planName && x.featureName === featureName);
      if (index >= 0) next[index] = { ...next[index], [field]: parsed };
      else next.push({ planName, featureName, hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited', [field]: parsed });
      return next;
    });
  };

  const openManage = async (id: string) => {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to load user');
      return;
    }
    const managed = data.user.managedSubscription ?? {
      planType: 'Scout',
      billingCycle: 'monthly',
      price: 0,
      currency: '$',
      paymentProvider: 'Admin',
      status: 'Active',
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };
    setModalData(data);
    setForm({
      name: data.user.name ?? '',
      country: data.user.country,
      role: data.user.role,
      managedSubscription: { ...managed },
    });
  };

  const closeManage = () => {
    setModalData(null);
    setForm(null);
    setError(null);
    setSaving(false);
  };

  const saveManage = async () => {
    if (!modalData || !form) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${modalData.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to save user');
      setSaving(false);
      return;
    }
    await Promise.all([loadOverview(), loadAnalytics()]);
    closeManage();
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
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium text-zinc-900">System Administration</h2>
            <p className="text-sm text-zinc-500 mt-1">Manage users, subscriptions, pricing values, access limits, and platform metrics.</p>
          </div>
          <div className="flex bg-white border border-zinc-200 rounded-lg p-1">
            <TabButton active={tab === 'users'} onClick={() => setTab('users')}>Users & Revenue</TabButton>
            <TabButton active={tab === 'limits'} onClick={() => setTab('limits')}>Usage Limits</TabButton>
            <TabButton active={tab === 'pricing'} onClick={() => setTab('pricing')}>Pricing</TabButton>
            <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')}>Analytics</TabButton>
          </div>
        </div>

        {tab === 'users' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <MetricCard icon={<Users />} label="Total Users" value={overview?.metrics?.totalUsers ?? 0} trend="Database live" />
              <MetricCard icon={<Activity />} label="Active Subs" value={overview?.metrics?.activeSubscriptions ?? 0} trend="Current active plans" />
              <MetricCard icon={<CreditCard />} label="Monthly Rev" value={`$${Number(overview?.metrics?.monthlyRevenue ?? 0).toFixed(2)}`} trend="Monthly equivalent" />
              <MetricCard icon={<Shield />} label="Super Admins" value={overview?.metrics?.superAdmins ?? 0} trend="Privileged accounts" />
            </div>

            <Panel title="User Administration">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-white border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Country</th>
                      <th className="px-6 py-3">Plan</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50">
                    {overview?.recentUsers?.length ? overview.recentUsers.map((entry: any) => (
                      <UserRow key={entry.id} entry={entry} onManage={() => void openManage(entry.id)} />
                    )) : (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No users found in the database.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}

        {tab === 'limits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-medium text-zinc-900">Global Usage Limiter</h3>
                <p className="text-sm text-zinc-500 mt-1">Enable or disable all usage limits across the platform.</p>
              </div>
              <button onClick={toggleLimits} className={`px-6 py-2 rounded-lg font-medium transition-colors ${limitsEnabled ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}>
                {limitsEnabled ? 'Disable All Limits' : 'Enable All Limits'}
              </button>
            </div>

            <Panel title="Feature Limits Configuration" action={editingLimits ? (
              <div className="flex gap-2">
                <button onClick={() => { setEditingLimits(false); setEditedLimits(limits); }} className="text-xs px-3 py-1 rounded bg-zinc-200 text-zinc-600 hover:bg-zinc-700">Cancel</button>
                <button onClick={() => void saveLimits()} className="text-xs px-3 py-1 rounded bg-emerald-500 text-zinc-950 font-medium hover:bg-emerald-600">Save Changes</button>
              </div>
            ) : (
              <button onClick={() => setEditingLimits(true)} className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-400"><Settings2 className="w-3 h-3" /> Edit Limits</button>
            )}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-white border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-3">Feature</th>
                      {PLANS.map((plan) => <th key={plan} className="px-6 py-3">{plan}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50">
                    {FEATURES.map((feature) => (
                      <tr key={feature} className="hover:bg-zinc-200/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-700">{feature}</td>
                        {PLANS.map((plan) => {
                          const limit = (editingLimits ? editedLimits : limits).find((x: any) => x.planName === plan && x.featureName === feature) || { hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' };
                          return (
                            <td key={plan} className="px-6 py-4 font-mono text-zinc-400">
                              {editingLimits ? (
                                <EditLimitCell plan={plan} feature={feature} limit={limit} onChange={onLimitChange} />
                              ) : (
                                formatLimit(limit)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard icon={<Activity />} label="Total Feature Uses" value={analytics?.totalUsage || 0} trend="All time" />
              <MetricCard icon={<Users />} label="Active Users Today" value={analytics?.activeUsersToday || 0} trend="Unique users" />
              <MetricCard icon={<CreditCard />} label="Upgrades Today" value={analytics?.upgradesToday || 0} trend="Conversions" />
            </div>

            <Panel title="Feature Usage Breakdown">
              {analytics?.featureUsage ? (
                <div className="space-y-4">
                  {Object.entries(analytics.featureUsage).map(([feature, count]: any) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-zinc-400">{feature}</span>
                      <div className="flex items-center gap-4 w-1/2">
                        <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${analytics.totalUsage ? (count / analytics.totalUsage) * 100 : 0}%` }} />
                        </div>
                        <span className="text-zinc-700 font-mono text-sm w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-8">Loading analytics data...</div>
              )}
            </Panel>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="space-y-6">
            <Panel
              title="Subscription Package Pricing"
              action={editingPricing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPricing(false);
                      setEditedUsdBasePricing(usdBasePricing);
                      setManualExchangeRate(exchangeRate?.usdToNgn ? String(exchangeRate.usdToNgn) : '');
                    }}
                    className="text-xs px-3 py-1 rounded bg-zinc-200 text-zinc-600 hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void savePricing()}
                    className="text-xs px-3 py-1 rounded bg-emerald-500 text-zinc-950 font-medium hover:bg-emerald-600"
                  >
                    Save Pricing
                  </button>
                </div>
              ) : canEditPricing ? (
                <button onClick={() => setEditingPricing(true)} className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-400">
                  <Settings2 className="w-3 h-3" /> Edit Pricing
                </button>
              ) : (
                <span className="text-xs text-zinc-500">Super Admin required to edit pricing</span>
              )}
            >
              <div className="p-6 space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard icon={<CreditCard />} label="USD/NGN Rate" value={exchangeRate ? exchangeRate.usdToNgn.toFixed(2) : '-'} trend={exchangeRate?.source || 'No rate source'} />
                  <MetricCard icon={<Activity />} label="Rate Status" value={exchangeRate?.stale ? 'Cached' : 'Live'} trend={exchangeRate?.fetchedAt ? new Date(exchangeRate.fetchedAt).toLocaleString() : 'No fetch timestamp'} />
                  <MetricCard icon={<Shield />} label="Pricing Model" value="USD Master" trend="NGN derived automatically" />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h4 className="text-sm font-medium uppercase tracking-wider text-zinc-600">Exchange Rate Control</h4>
                      <p className="text-xs text-zinc-500 mt-1">If live detection is unavailable, Super Admin can enter the current USD to NGN rate manually. That manual rate becomes the active pricing factor until it is changed again.</p>
                    </div>
                    <div className="flex items-end gap-3">
                      <Field label="USD to NGN">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={manualExchangeRate}
                          onChange={(e) => setManualExchangeRate(e.target.value)}
                          disabled={!canEditPricing || !editingPricing}
                          className="w-36 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500 disabled:text-zinc-500"
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-wider text-zinc-600">International Base Pricing</h4>
                    <p className="text-xs text-zinc-500 mt-1">Super Admin edits the USD pricing here. Nigerian naira values are calculated automatically from the prevailing USD/NGN rate.</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-zinc-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-xs uppercase text-zinc-500">
                        <tr>
                          <th className="px-4 py-3">Plan</th>
                          <th className="px-4 py-3">Monthly Price</th>
                          <th className="px-4 py-3">Monthly Cents</th>
                          <th className="px-4 py-3">Annual Price</th>
                          <th className="px-4 py-3">Annual Cents</th>
                          <th className="px-4 py-3">Currency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 bg-white">
                        {PLANS.map((plan) => {
                          const row = (editingPricing ? editedUsdBasePricing : usdBasePricing)?.[plan];
                          if (!row) return null;
                          return (
                            <tr key={`usd-${plan}`}>
                              <td className="px-4 py-3 text-zinc-700">{plan}</td>
                              <td className="px-4 py-3">
                                {editingPricing ? (
                                  <input
                                    type="number"
                                    value={row.priceValue}
                                    onChange={(e) => onPricingChange(plan, 'priceValue', e.target.value)}
                                    className="w-28 rounded border border-zinc-200 bg-white px-2 py-1 text-zinc-900"
                                  />
                                ) : (
                                  <span className="text-zinc-600">{row.priceValue}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {editingPricing ? (
                                  <input
                                    type="number"
                                    value={row.unitAmountCents}
                                    onChange={(e) => onPricingChange(plan, 'unitAmountCents', e.target.value)}
                                    className="w-32 rounded border border-zinc-200 bg-white px-2 py-1 text-zinc-900"
                                  />
                                ) : (
                                  <span className="text-zinc-400">{row.unitAmountCents}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {editingPricing ? (
                                  <input
                                    type="number"
                                    value={row.annualPriceValue}
                                    onChange={(e) => onPricingChange(plan, 'annualPriceValue', e.target.value)}
                                    className="w-28 rounded border border-zinc-200 bg-white px-2 py-1 text-zinc-900"
                                  />
                                ) : (
                                  <span className="text-zinc-600">{row.annualPriceValue}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {editingPricing ? (
                                  <input
                                    type="number"
                                    value={row.annualUnitAmountCents}
                                    onChange={(e) => onPricingChange(plan, 'annualUnitAmountCents', e.target.value)}
                                    className="w-32 rounded border border-zinc-200 bg-white px-2 py-1 text-zinc-900"
                                  />
                                ) : (
                                  <span className="text-zinc-400">{row.annualUnitAmountCents}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-zinc-400">{row.currencySymbol} / {row.currencyCode}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-wider text-zinc-600">Nigeria Pricing Preview</h4>
                    <p className="text-xs text-zinc-500 mt-1">These values are read-only and are recalculated from the current USD/NGN rate used by checkout and the pricing page.</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-zinc-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-xs uppercase text-zinc-500">
                        <tr>
                          <th className="px-4 py-3">Plan</th>
                          <th className="px-4 py-3">Monthly Price</th>
                          <th className="px-4 py-3">Monthly Cents</th>
                          <th className="px-4 py-3">Annual Price</th>
                          <th className="px-4 py-3">Annual Cents</th>
                          <th className="px-4 py-3">Currency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 bg-white">
                        {PLANS.map((plan) => {
                          const row = pricingMatrix?.nigeria?.[plan];
                          if (!row) return null;
                          return (
                            <tr key={`ngn-${plan}`}>
                              <td className="px-4 py-3 text-zinc-700">{plan}</td>
                              <td className="px-4 py-3 text-zinc-600">{row.priceValue}</td>
                              <td className="px-4 py-3 text-zinc-400">{row.unitAmountCents}</td>
                              <td className="px-4 py-3 text-zinc-600">{row.annualPriceValue}</td>
                              <td className="px-4 py-3 text-zinc-400">{row.annualUnitAmountCents}</td>
                              <td className="px-4 py-3 text-zinc-400">{row.currencySymbol} / {row.currencyCode}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>

      {modalData && form && (
        <ManageModal
          modalData={modalData}
          form={form}
          error={error}
          saving={saving}
          onClose={closeManage}
          onSave={() => void saveManage()}
          onFieldChange={(field: string, value: string) => setForm((prev: any) => ({ ...prev, [field]: value }))}
          onSubscriptionChange={(field: keyof ManagedSubscription, value: string) => setForm((prev: any) => ({
            ...prev,
            managedSubscription: {
              ...prev.managedSubscription,
              [field]: field === 'price' ? Number(value) : value,
            },
          }))}
        />
      )}
    </DashboardLayout>
  );
}

function TabButton({ active, onClick, children }: any) {
  return <button onClick={onClick} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'}`}>{children}</button>;
}

function Panel({ title, children, action }: any) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 bg-slate-50 flex items-center justify-between">
        <h3 className="font-medium text-zinc-700">{title}</h3>
        {action}
      </div>
      <div className="p-0">{children}</div>
    </div>
  );
}

function MetricCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4">
      <div className="flex items-center gap-3 text-zinc-400 mb-3">{icon}<span className="text-sm font-medium">{label}</span></div>
      <div className="text-2xl font-bold text-zinc-900 mb-1">{value}</div>
      <div className="text-xs text-emerald-500">{trend}</div>
    </div>
  );
}

function UserRow({ entry, onManage }: any) {
  return (
    <tr className="hover:bg-zinc-200/20 transition-colors">
      <td className="px-6 py-4"><div className="font-medium text-zinc-700">{entry.name}</div><div className="text-xs text-zinc-500">{entry.email}</div></td>
      <td className="px-6 py-4 text-zinc-400">{entry.country}</td>
      <td className="px-6 py-4"><span className="px-2 py-1 bg-zinc-200 rounded text-xs text-zinc-600">{entry.plan}</span></td>
      <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${entry.subscriptionStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{entry.subscriptionStatus}</span></td>
      <td className="px-6 py-4 text-zinc-400">{entry.role}</td>
      <td className="px-6 py-4"><button onClick={onManage} className="text-xs text-emerald-500 hover:underline">Manage</button></td>
    </tr>
  );
}

function formatLimit(limit: any) {
  if (!limit) return '-';
  if (limit.hourlyLimit === 0 && limit.dailyLimit === 0) return <span className="text-zinc-600">Locked</span>;
  if (limit.hourlyLimit === 'Unlimited' && limit.dailyLimit === 'Unlimited') return <span className="text-emerald-500">Unlimited</span>;
  return `${limit.hourlyLimit !== 'Unlimited' ? `${limit.hourlyLimit}/hr` : ''} ${limit.dailyLimit !== 'Unlimited' ? `(${limit.dailyLimit}/day)` : ''}`;
}

function EditLimitCell({ plan, feature, limit, onChange }: any) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2"><span className="text-xs text-zinc-500 w-8">Hr:</span><input type="text" value={limit.hourlyLimit} onChange={(e) => onChange(plan, feature, 'hourlyLimit', e.target.value)} className="w-20 bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-700 focus:outline-none focus:border-emerald-500" /></div>
      <div className="flex items-center gap-2"><span className="text-xs text-zinc-500 w-8">Day:</span><input type="text" value={limit.dailyLimit} onChange={(e) => onChange(plan, feature, 'dailyLimit', e.target.value)} className="w-20 bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-700 focus:outline-none focus:border-emerald-500" /></div>
    </div>
  );
}

function ManageModal({ modalData, form, error, saving, onClose, onSave, onFieldChange, onSubscriptionChange }: any) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/60" aria-label="Close modal" />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div><h3 className="text-lg font-medium text-zinc-900">Manage User & Subscription</h3><p className="text-sm text-zinc-500 mt-1">{modalData.user.email}</p></div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:bg-white hover:text-zinc-700"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-8">
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

          <section className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-700 uppercase tracking-wider">User Profile</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name"><input value={form.name} onChange={(e) => onFieldChange('name', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500" /></Field>
              <Field label="Email"><input value={modalData.user.email} disabled className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500" /></Field>
              <Field label="Country"><select value={form.country} onChange={(e) => onFieldChange('country', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500">{modalData.options.countries.map((x: string) => <option key={x} value={x}>{x}</option>)}</select></Field>
              <Field label="Role"><select value={form.role} onChange={(e) => onFieldChange('role', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500">{modalData.options.roles.map((x: string) => <option key={x} value={x}>{x}</option>)}</select></Field>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-700 uppercase tracking-wider">Managed Subscription</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Plan"><select value={form.managedSubscription.planType} onChange={(e) => onSubscriptionChange('planType', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500">{modalData.options.plans.map((x: string) => <option key={x} value={x}>{x}</option>)}</select></Field>
              <Field label="Billing Cycle"><select value={form.managedSubscription.billingCycle} onChange={(e) => onSubscriptionChange('billingCycle', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500"><option value="monthly">monthly</option><option value="annual">annual</option></select></Field>
              <Field label="Status"><select value={form.managedSubscription.status} onChange={(e) => onSubscriptionChange('status', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500">{modalData.options.statuses.map((x: string) => <option key={x} value={x}>{x}</option>)}</select></Field>
              <Field label="Price"><input type="number" value={form.managedSubscription.price} onChange={(e) => onSubscriptionChange('price', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500" /></Field>
              <Field label="Currency"><input value={form.managedSubscription.currency} onChange={(e) => onSubscriptionChange('currency', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500" /></Field>
              <Field label="Payment Provider"><input value={form.managedSubscription.paymentProvider} onChange={(e) => onSubscriptionChange('paymentProvider', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500" /></Field>
              <Field label="Start Date"><input type="date" value={form.managedSubscription.startDate} onChange={(e) => onSubscriptionChange('startDate', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500" /></Field>
              <Field label="Expiry Date"><input type="date" value={form.managedSubscription.expiryDate} onChange={(e) => onSubscriptionChange('expiryDate', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500" /></Field>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-700 uppercase tracking-wider">Subscription History</h4>
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-xs uppercase text-zinc-500"><tr><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Cycle</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Expiry</th></tr></thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {modalData.user.subscriptions.length ? modalData.user.subscriptions.map((entry: any) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 text-zinc-700">{entry.planType}</td>
                      <td className="px-4 py-3 text-zinc-400">{entry.billingCycle}</td>
                      <td className="px-4 py-3 text-zinc-400">{entry.currency}{entry.price}</td>
                      <td className="px-4 py-3 text-zinc-400">{entry.status}</td>
                      <td className="px-4 py-3 text-zinc-400">{entry.paymentProvider}</td>
                      <td className="px-4 py-3 text-zinc-400">{new Date(entry.expiryDate).toLocaleDateString()}</td>
                    </tr>
                  )) : <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">No subscription history found.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-white">Cancel</button>
          <button type="button" onClick={onSave} disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return <label className="block"><div className="mb-1 text-xs font-mono uppercase tracking-wider text-zinc-500">{label}</div>{children}</label>;
}
