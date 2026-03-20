import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Stat = {
  label: string;
  value: string;
  detail: string;
};

type Card = {
  title: string;
  body: string;
};

type Section = {
  eyebrow?: string;
  title: string;
  intro: string;
  cards: Card[];
};

type Cta = {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export type PublicPageContent = {
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroDetail: string;
  stats: Stat[];
  sections: Section[];
  cta: Cta;
};

export function buildPublicMetadata(content: PublicPageContent): Metadata {
  return {
    title: `${content.title} | Intel Trader`,
    description: content.description,
  };
}

export default function PublicPageTemplate({
  content,
  children,
}: {
  content: PublicPageContent;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main>
        <section className="border-b border-zinc-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.10),_transparent_30%),white]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-4xl space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.5em] text-emerald-600">{content.eyebrow}</p>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">{content.heroTitle}</h1>
              <p className="max-w-3xl text-lg leading-8 text-zinc-600">{content.heroBody}</p>
              <p className="max-w-3xl text-base leading-7 text-zinc-500">{content.heroDetail}</p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {content.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-zinc-900">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {content.sections.map((section) => (
          <section key={section.title} className="py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                {section.eyebrow && (
                  <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">{section.eyebrow}</p>
                )}
                <h2 className="mt-3 text-3xl font-bold text-zinc-900">{section.title}</h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600">{section.intro}</p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {section.cards.map((card) => (
                  <article key={card.title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <h3 className="text-xl font-semibold text-zinc-900">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">{card.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        {children}

        <section className="border-t border-zinc-200 bg-zinc-950 py-20 text-white">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-400">{content.eyebrow}</p>
            <h2 className="mt-4 text-4xl font-bold">{content.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-zinc-300">{content.cta.body}</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href={content.cta.primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-bold text-zinc-950 transition-colors hover:bg-emerald-400"
              >
                {content.cta.primaryLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
              {content.cta.secondaryHref && content.cta.secondaryLabel && (
                <Link
                  href={content.cta.secondaryHref}
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-zinc-900"
                >
                  {content.cta.secondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
