'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getDashboardForPlan } from '@/lib/auth/redirects';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') ?? null;
  const plan = searchParams?.get('plan') ?? null;
  const region = searchParams?.get('region') ?? null;
  const billingCycle = searchParams?.get('billingCycle') ?? null;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { user, updatePlan } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            plan,
            region,
            billingCycle,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data?.plan) {
          setStatus('error');
          return;
        }

        updatePlan(data.plan);
        setStatus('success');
      } catch (error) {
        console.error('Payment verification failed:', error);
        setStatus('error');
      }
    };

    void verifyPayment();
  }, [sessionId, plan, region, billingCycle, updatePlan]);

  return (
    <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Processing Payment</h1>
          <p className="text-zinc-400">Please wait while we confirm your subscription...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Payment Successful!</h1>
          <p className="text-zinc-400 mb-8">
            Your subscription has been updated and your dashboard will now reflect the modules included in your package.
          </p>
          <Link
            href={getDashboardForPlan((plan as any) || user?.plan)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors block"
          >
            Open My Dashboard
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Verification Failed</h1>
          <p className="text-zinc-400 mb-8">
            We couldn&apos;t verify your payment. Please contact support if you were charged.
          </p>
          <Link
            href="/pricing"
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors block"
          >
            Return to Pricing
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
