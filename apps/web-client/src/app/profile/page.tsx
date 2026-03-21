'use client';

import Link from 'next/link';
import { CreditCard, LayoutDashboard, Settings, Shield } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthProvider';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium text-zinc-900">Profile</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Review your account identity, access level, and the shortcuts most relevant to your workspace.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">Account Identity</p>
                <h3 className="mt-3 text-2xl font-semibold text-zinc-900">{user?.name || 'User Account'}</h3>
                <p className="mt-1 text-sm text-zinc-400">{user?.email || 'No email available'}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Subscription</p>
                  <p className="mt-2 text-lg font-semibold text-zinc-900">{user?.plan || 'Unknown'} Plan</p>
                  <p className="mt-1 text-sm text-zinc-500">Access and usage limits are enforced according to this package.</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Role</p>
                  <p className="mt-2 text-lg font-semibold text-zinc-900">{user?.role || 'Unknown'}</p>
                  <p className="mt-1 text-sm text-zinc-500">Administrative actions and protected routes depend on this role.</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Region</p>
                  <p className="mt-2 text-lg font-semibold text-zinc-900">{user?.country || 'Unknown'}</p>
                  <p className="mt-1 text-sm text-zinc-500">This is the country currently attached to your account profile.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Quick Actions</p>
              <div className="mt-4 space-y-3">
                <Link href="/command-center" className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-900">
                  <LayoutDashboard className="h-4 w-4 text-zinc-500" />
                  Dashboard
                </Link>
                <Link href="/configuration" className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-900">
                  <Settings className="h-4 w-4 text-zinc-500" />
                  Settings
                </Link>
                <Link href="/pricing" className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-900">
                  <CreditCard className="h-4 w-4 text-zinc-500" />
                  Manage Subscription
                </Link>
                {(user?.role === 'Super Admin' || user?.role === 'Administrator') && (
                  <Link href="/admin" className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-900">
                    <Shield className="h-4 w-4 text-zinc-500" />
                    Administration
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}