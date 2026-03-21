'use client';

import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { isSuperAdmin } from '@/lib/auth/permissions';

interface AccessControlProps {
  children: React.ReactNode;
  requiredPlan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader';
  moduleName: string;
}

export default function AccessControl({ children, requiredPlan, moduleName }: AccessControlProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const planLevels: Record<string, number> = {
    'Scout': 0,
    'Analyst': 1,
    'Trader': 2,
    'ProTrader': 3,
  };

  // Super Admin / Administrator always get access
  if (isSuperAdmin(user)) {
    return <>{children}</>;
  }

  // Regular users checked against plan level
  const userLevel = user ? (planLevels[user.plan] ?? -1) : -1;
  const requiredLevel = planLevels[requiredPlan] ?? 0;
  if (userLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-zinc-200 bg-slate-50 rounded-xl p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-6">
        <Lock className="w-6 h-6 text-zinc-500" />
      </div>
      <h2 className="text-xl font-medium text-zinc-900 mb-2">Access Restricted</h2>
      <p className="text-zinc-400 max-w-md mb-8">
        The <span className="text-emerald-500 font-mono">{moduleName}</span> module requires a {requiredPlan} subscription or higher. Upgrade your account to unlock this intelligence layer.
      </p>
      <Link 
        href="/pricing"
        className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-2 px-6 rounded transition-colors"
      >
        VIEW UPGRADE OPTIONS
      </Link>
    </div>
  );
}
