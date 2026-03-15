'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { Lock, Play, Clock } from 'lucide-react';

interface UsageLimiterProps {
  children: React.ReactNode;
  featureName: string;
}

export default function UsageLimiter({ children, featureName }: UsageLimiterProps) {
  const { user, isLoading } = useAuth();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [errorData, setErrorData] = useState<{ message: string, resetTime: string, upgradeSuggestion: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-allow Premium, Super Admin, and Administrator
  const isPremiumOrAdmin = user?.plan === 'Premium' || user?.role === 'Super Admin' || user?.role === 'Administrator';

  if (isLoading) return null;

  if (isPremiumOrAdmin) {
    return <>{children}</>;
  }

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/usage/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureName, action: 'consume' })
      });
      const data = await res.json();
      
      if (data.allowed) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
        setErrorData({
          message: data.message || 'You have reached your usage limit for this feature.',
          resetTime: data.resetTime || '',
          upgradeSuggestion: data.upgradeSuggestion || 'Upgrade to Premium'
        });
      }
    } catch (error) {
      console.error('Failed to check usage limits');
    } finally {
      setLoading(false);
    }
  };

  if (isAllowed) {
    return <>{children}</>;
  }

  if (isAllowed === false && errorData) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-zinc-800/50 bg-zinc-900/20 rounded-xl p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-xl font-medium text-zinc-100 mb-2">Usage Limit Reached</h2>
        <p className="text-zinc-400 max-w-md mb-4">
          {errorData.message}
        </p>
        {errorData.resetTime && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-8 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
            <Clock className="w-4 h-4" />
            <span>{errorData.resetTime}</span>
          </div>
        )}
        <Link 
          href="/pricing"
          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-2 px-6 rounded transition-colors"
        >
          {errorData.upgradeSuggestion.toUpperCase()}
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-zinc-800/50 bg-zinc-900/20 rounded-xl p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
        <Play className="w-6 h-6 text-emerald-500 ml-1" />
      </div>
      <h2 className="text-xl font-medium text-zinc-100 mb-2">{featureName}</h2>
      <p className="text-zinc-400 max-w-md mb-8">
        Click below to initialize the {featureName.toLowerCase()} module. This action will consume your usage allowance.
      </p>
      <button 
        onClick={handleRun}
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
      >
        {loading ? 'INITIALIZING...' : 'RUN MODULE'}
      </button>
    </div>
  );
}
