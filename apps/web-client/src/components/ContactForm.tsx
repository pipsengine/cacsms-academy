'use client';

import { useState } from 'react';

const inquiryTypes = [
  'General Product Enquiry',
  'Support Request',
  'Billing and Subscription',
  'Partnership and Institutional',
  'Technical and Integration',
] as const;

const initialState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  country: '',
  inquiryType: inquiryTypes[0],
  subject: '',
  message: '',
};

export default function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ inquiryId: string; message: string } | null>(null);

  const update = (key: keyof typeof initialState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || 'We could not submit your enquiry.');
        return;
      }

      setSuccess({
        inquiryId: data?.inquiryId ?? 'pending',
        message: data?.message ?? 'Your enquiry has been received successfully.',
      });
      setForm(initialState);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
      <form onSubmit={submit} className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">Contact Form</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900">Send a detailed enquiry to the Intel Trader team</h2>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            Use this form when you want a real follow-up from the team. The more precise your message is about your use case, objective, and challenge, the easier it is for us to respond with something useful rather than generic.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Field label="Full name" required>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClassName} required />
          </Field>
          <Field label="Email address" required>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClassName} required />
          </Field>
          <Field label="Phone number">
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClassName} />
          </Field>
          <Field label="Company or desk">
            <input value={form.company} onChange={(e) => update('company', e.target.value)} className={inputClassName} />
          </Field>
          <Field label="Country">
            <input value={form.country} onChange={(e) => update('country', e.target.value)} className={inputClassName} />
          </Field>
          <Field label="Enquiry type" required>
            <select value={form.inquiryType} onChange={(e) => update('inquiryType', e.target.value)} className={inputClassName}>
              {inquiryTypes.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 grid gap-5">
          <Field label="Subject" required>
            <input value={form.subject} onChange={(e) => update('subject', e.target.value)} className={inputClassName} required />
          </Field>
          <Field label="Message" required hint="Please provide enough detail for the team to understand the context, expected outcome, and current challenge.">
            <textarea
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className={`${inputClassName} min-h-40 resize-y`}
              required
              minLength={30}
            />
          </Field>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <p className="font-semibold">Thank you. Your enquiry has been received.</p>
            <p className="mt-1">{success.message}</p>
            <p className="mt-2 text-emerald-700">Reference: {success.inquiryId}</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="max-w-xl text-sm leading-6 text-zinc-500">
            After submission, the system stores your enquiry, sends you a thank-you acknowledgement, and notifies the admin team so the request can be reviewed quickly.
          </p>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {busy ? 'Submitting...' : 'Send Enquiry'}
          </button>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-zinc-900">What happens after you submit?</h3>
          <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-600">
            <p>The enquiry is stored in the system with a reference ID so it can be tracked and reviewed properly.</p>
            <p>The platform sends a thank-you acknowledgement to the email address you provided so you know the message was received.</p>
            <p>The admin team is notified with the full enquiry detail, including your type of request and the exact message you submitted.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-zinc-900">Tips for faster response quality</h3>
          <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-600">
            <p>Explain whether you are a trader, team, evaluator, or institution so the conversation starts with the right context.</p>
            <p>Be specific about what outcome you want, such as plan guidance, account help, technical clarification, or partnership discussion.</p>
            <p>If the request relates to an issue, describe the page, expected behavior, actual behavior, and the approximate time it happened.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700">
        {label}
        {required ? ' *' : ''}
      </span>
      {hint && <span className="mt-1 block text-xs leading-5 text-zinc-500">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClassName =
  'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-500';
