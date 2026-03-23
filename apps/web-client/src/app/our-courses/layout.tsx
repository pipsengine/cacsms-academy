import type { ReactNode } from 'react';
import Link from 'next/link';
import AcademyAuthGuard from '@/components/AcademyAuthGuard';
import LearningNavigator from '@/components/LearningNavigator';
import LearningProgressProvider from '@/components/LearningProgressProvider';

type OurCoursesLayoutProps = {
  children: ReactNode;
};

export default function OurCoursesLayout({ children }: OurCoursesLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfeff_0%,_#f8fafc_45%,_#ffffff_100%)] text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-teal-100/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-700">Cacsms Academy Learning Space</p>
            <h1 className="truncate text-lg font-semibold text-zinc-900">Forex Academy Environment</h1>
          </div>

          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/our-courses"
              className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 font-semibold text-teal-700 hover:bg-teal-100"
            >
              Course Home
            </Link>
            <Link
              href="/command-center"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Trading Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademyAuthGuard>
          <section className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Future Learning Environment</p>
                <p className="mt-1 text-sm text-zinc-700">
                  Learn daily with a structured path: Chapters, Topics, Subtopics, and Lessons designed for long-term consistency.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700">Chapter-led Flow</span>
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700">Topic Context</span>
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700">Lesson Mastery</span>
              </div>
            </div>
          </section>

          <LearningProgressProvider>
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <LearningNavigator />
              <div className="min-w-0">
                {children}
              </div>
            </div>
          </LearningProgressProvider>
        </AcademyAuthGuard>
      </main>
    </div>
  );
}
