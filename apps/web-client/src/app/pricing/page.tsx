'use client';

import Link from 'next/link';
import PricingPlans from '@/components/PricingPlans';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <section className="border-b border-zinc-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.10),_transparent_30%),white]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.5em] text-emerald-600">Platform</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Pricing is structured so users can adopt the platform at the depth that matches their workflow.
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600">
              Intel Trader pricing is designed to reflect practical usage tiers rather than artificial packaging. Entry plans are meant to help users explore the platform and build structured habits, while higher plans unlock deeper analytical coverage, broader operational capability, and more advanced administrative flexibility.
            </p>
            <p className="mt-4 text-base leading-7 text-zinc-500">
              The goal is to let individuals start cleanly and then scale into more serious usage without losing continuity. That is why the pricing system is also connected to real plan entitlements, upgrade logic, and currency-aware display across international and Nigerian billing contexts.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900">Built for growth</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Users can begin with lighter access and move upward as they need more coverage, richer analysis, and a more complete command workflow.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900">Upgrade-aware billing</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                The system is designed so users upgrading to a higher package pay the difference rather than repurchasing the full value of the new plan from scratch.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900">Regional pricing support</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Pricing supports both international and Nigerian contexts, including exchange-rate-aware presentation where naira equivalents are derived from the current USD pricing factor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PricingPlans mode="page" />

      <section className="border-t border-zinc-200 bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">Plan Guidance</p>
            <h2 className="mt-3 text-3xl font-bold text-zinc-900">How to think about the packages</h2>
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              The right subscription depends on how much market coverage, workflow depth, and operating control you need. A user who wants simple exploration does not need the same environment as a trader or institution that depends on the platform every day.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-zinc-900">Free Plan</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">Best for users who want to understand the platform shape, core dashboard flow, and foundational market-intelligence experience before committing to broader coverage.</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-zinc-900">Analyst and Trader</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">Best for users who want broader market monitoring, stronger setup visibility, and a more complete daily operating workflow with greater analytical reach.</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-zinc-900">Pro Trader</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">Best for serious independent operators who need deeper intelligence, richer operational continuity, and more powerful decision support from the platform.</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-zinc-900">Institutional</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">Best for desks, teams, and organizations that need broad capability, administrative control, and a platform that can support more formal operating requirements.</p>
            </div>
          </div>

          <div className="mt-12 rounded-3xl bg-zinc-950 px-8 py-10 text-white">
            <h2 className="text-3xl font-bold">Need help choosing the right plan?</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
              If you are comparing plans based on workflow fit, team size, or operational depth rather than just price, the best next step is to review the Features page or contact the team directly.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/features" className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-base font-bold text-zinc-950 transition-colors hover:bg-emerald-400">
                View Features
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-zinc-900">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
