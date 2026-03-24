'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || 'Failed to submit request.');
        return;
      }

      setMessage(data?.message || 'If that email is registered, a reset link has been sent.');
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Enter your registered email address and we will send a password reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none transition-colors focus:border-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          {message && <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div>}
          {error && <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-5 text-sm text-zinc-600">
          Remembered your password?{' '}
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
