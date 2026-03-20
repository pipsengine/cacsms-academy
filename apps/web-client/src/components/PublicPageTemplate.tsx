import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PublicPageSectionNav from '@/components/PublicPageSectionNav';

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

type FaqItem = {
  question: string;
  answer: string;
};

type ProcessStep = {
  label: string;
  title: string;
  body: string;
};

type ProcessBlock = {
  eyebrow?: string;
  title: string;
  intro: string;
  steps: ProcessStep[];
};

type TimelineItem = {
  phase: string;
  title: string;
  body: string;
};

type TimelineBlock = {
  eyebrow?: string;
  title: string;
  intro: string;
  items: TimelineItem[];
};

type ComparisonRow = {
  topic: string;
  left: string;
  right: string;
};

type ComparisonBlock = {
  eyebrow?: string;
  title: string;
  intro: string;
  leftLabel: string;
  rightLabel: string;
  rows: ComparisonRow[];
};

export type PublicPageContent = {
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroDetail: string;
  stats: Stat[];
  highlights?: Card[];
  process?: ProcessBlock;
  timeline?: TimelineBlock;
  comparison?: ComparisonBlock;
  sections: Section[];
  faqs?: FaqItem[];
  cta: Cta;
};

export function buildPublicMetadata(content: PublicPageContent): Metadata {
  return {
    title: `${content.title} | Intel Trader`,
    description: content.description,
  };
}

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function PublicPageTemplate({
  content,
  children,
}: {
  content: PublicPageContent;
  children?: React.ReactNode;
}) {
  const contentNavItems = content.sections.map((section, index) => ({
    id: `section-${index + 1}-${slugifyHeading(section.title)}`,
    label: section.title,
  }));

  const pageNavItems = [
    { id: 'overview', label: 'Overview', shortLabel: 'Overview' },
    ...(content.highlights && content.highlights.length > 0
      ? [{ id: 'key-takeaways', label: 'Key Takeaways', shortLabel: 'Takeaways' }]
      : []),
    ...(content.process && content.process.steps.length > 0
      ? [{ id: 'process', label: 'Process Flow', shortLabel: 'Process' }]
      : []),
    ...(content.timeline && content.timeline.items.length > 0
      ? [{ id: 'timeline', label: 'Timeline', shortLabel: 'Timeline' }]
      : []),
    ...(content.comparison && content.comparison.rows.length > 0
      ? [{ id: 'comparison', label: 'Comparison', shortLabel: 'Compare' }]
      : []),
    ...contentNavItems.map((item, index) => ({
      id: item.id,
      label: item.label,
      shortLabel: `S${index + 1}`,
    })),
    ...(content.faqs && content.faqs.length > 0 ? [{ id: 'faqs', label: 'FAQs', shortLabel: 'FAQs' }] : []),
    { id: 'next-steps', label: 'Next Steps', shortLabel: 'Next' },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main>
        <section id="overview" className="scroll-mt-36 border-b border-zinc-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.10),_transparent_30%),white] public-reveal">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-4xl space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.5em] text-emerald-600">{content.eyebrow}</p>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">{content.heroTitle}</h1>
              <p className="max-w-3xl text-lg leading-8 text-zinc-600">{content.heroBody}</p>
              <p className="max-w-3xl text-base leading-7 text-zinc-500">{content.heroDetail}</p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {content.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm public-reveal">
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-zinc-900">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PublicPageSectionNav items={pageNavItems} />

        {content.highlights && content.highlights.length > 0 && (
          <section id="key-takeaways" className="scroll-mt-36 border-b border-zinc-200 bg-white py-16 public-reveal">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">Key Takeaways</p>
                <h2 className="mt-3 text-3xl font-bold text-zinc-900">What matters most on this page</h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600">
                  These are the ideas that should remain clear even if you only scan the page once.
                </p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {content.highlights.map((highlight) => (
                  <article key={highlight.title} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm public-reveal">
                    <h3 className="text-xl font-semibold text-zinc-900">{highlight.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">{highlight.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {content.process && content.process.steps.length > 0 && (
          <section id="process" className="scroll-mt-36 border-b border-zinc-200 bg-zinc-950 py-20 text-white public-reveal">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-400">
                  {content.process.eyebrow ?? 'Process'}
                </p>
                <h2 className="mt-3 text-3xl font-bold">{content.process.title}</h2>
                <p className="mt-4 text-lg leading-8 text-zinc-300">{content.process.intro}</p>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {content.process.steps.map((step, index) => (
                  <article
                    key={`${step.label}-${step.title}`}
                    className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-sm public-reveal"
                  >
                    <div className="absolute right-4 top-4 text-6xl font-black leading-none text-white/5">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400">{step.label}</p>
                    <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{step.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {content.timeline && content.timeline.items.length > 0 && (
          <section id="timeline" className="scroll-mt-36 border-b border-zinc-200 bg-white py-20 public-reveal">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">
                  {content.timeline.eyebrow ?? 'Timeline'}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-zinc-900">{content.timeline.title}</h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600">{content.timeline.intro}</p>
              </div>

              <ol className="mt-10 space-y-6">
                {content.timeline.items.map((item, index) => (
                  <li key={`${item.phase}-${item.title}`} className="relative rounded-3xl border border-zinc-200 bg-zinc-50 p-6 pl-16 shadow-sm public-reveal">
                    <div className="absolute left-5 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-zinc-950">
                      {index + 1}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">{item.phase}</p>
                    <h3 className="mt-2 text-xl font-semibold text-zinc-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">{item.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {content.comparison && content.comparison.rows.length > 0 && (
          <section id="comparison" className="scroll-mt-36 border-b border-zinc-200 bg-zinc-50 py-20 public-reveal">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">
                  {content.comparison.eyebrow ?? 'Comparison'}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-zinc-900">{content.comparison.title}</h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600">{content.comparison.intro}</p>
              </div>

              <div className="mt-10 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="grid grid-cols-1 border-b border-zinc-200 bg-zinc-100/70 text-sm font-semibold text-zinc-700 md:grid-cols-3">
                  <div className="px-5 py-4 uppercase tracking-[0.2em] text-xs text-zinc-500">Topic</div>
                  <div className="px-5 py-4 border-t border-zinc-200 md:border-t-0 md:border-l">{content.comparison.leftLabel}</div>
                  <div className="px-5 py-4 border-t border-zinc-200 md:border-t-0 md:border-l">{content.comparison.rightLabel}</div>
                </div>
                {content.comparison.rows.map((row) => (
                  <div key={row.topic} className="grid grid-cols-1 border-t border-zinc-200 md:grid-cols-3">
                    <div className="px-5 py-4 text-sm font-semibold text-zinc-900">{row.topic}</div>
                    <div className="px-5 py-4 text-sm leading-7 text-zinc-600 md:border-l">{row.left}</div>
                    <div className="px-5 py-4 text-sm leading-7 text-zinc-600 md:border-l">{row.right}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {content.sections.map((section, index) => (
          <section
            id={`section-${index + 1}-${slugifyHeading(section.title)}`}
            key={section.title}
            className={
              index % 2 === 0
                ? 'scroll-mt-36 py-20 bg-white'
                : 'scroll-mt-36 py-20 border-y border-zinc-200 bg-zinc-50/70'
            }
          >
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
                  <article
                    key={card.title}
                    className={`rounded-3xl border p-6 shadow-sm transition-shadow hover:shadow-md public-reveal ${
                      index % 2 === 0 ? 'border-zinc-200 bg-white' : 'border-zinc-200 bg-white/90'
                    }`}
                  >
                    <h3 className="text-xl font-semibold text-zinc-900">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">{card.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        {content.faqs && content.faqs.length > 0 && (
          <section id="faqs" className="scroll-mt-36 border-t border-zinc-200 bg-zinc-50 py-20 public-reveal">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">Questions</p>
                <h2 className="mt-3 text-3xl font-bold text-zinc-900">Frequently asked follow-up questions</h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600">
                  These answers expand on the most common points people want clarified after reading the main page content.
                </p>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {content.faqs.map((item) => (
                  <article key={item.question} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm public-reveal">
                    <h3 className="text-lg font-semibold text-zinc-900">{item.question}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {children}

        <section id="next-steps" className="scroll-mt-36 border-t border-zinc-200 bg-zinc-950 py-20 text-white public-reveal">
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
