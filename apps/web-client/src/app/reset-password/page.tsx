'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => (searchParams?.get('token') || '').trim(), [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function validateToken() {
      if (!token) {
        setTokenValid(false);
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await response.json().catch(() => null);
        if (cancelled) return;
        setTokenValid(Boolean(data?.valid));
      } catch {
        if (cancelled) return;
        setTokenValid(false);
      } finally {
        if (!cancelled) {
          setValidating(false);
        }
      }
    }

    void validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || 'Failed to reset password.');
        return;
      }

      setMessage('Password reset successful. You can now sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Reset Password</h1>

        {validating ? (
          <p className="mt-4 text-sm text-zinc-600">Validating reset link...</p>
        ) : !tokenValid ? (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            This reset link is invalid or has expired.
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-zinc-600">Enter your new password below.</p>
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none transition-colors focus:border-emerald-500"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-zinc-700">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none transition-colors focus:border-emerald-500"
                />
              </div>

              {message && <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div>}
              {error && <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          </>
        )}

        <div className="mt-5 text-sm text-zinc-600">
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
