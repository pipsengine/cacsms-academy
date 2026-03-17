import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { ComponentPropsWithoutRef } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Cpu } from 'lucide-react';

const LEGAL_PAGES = {
  terms: {
    title: 'Terms and Conditions',
    heading: 'Agreement & Compliance',
    summary:
      'Defines the contractual relationship, Nigerian eligibility requirements, and acceptable behaviors for every Intel Trader visitor.',
    file: 'terms-and-conditions.md',
    shortLabel: 'Terms',
  },
  privacy: {
    title: 'Privacy Policy',
    heading: 'Privacy & Data Governance',
    summary:
      'Details how Intel Trader processes and safeguards personal data in alignment with the NDPR and related Nigerian frameworks.',
    file: 'privacy-policy.md',
    shortLabel: 'Privacy',
  },
  'risk-disclosure': {
    title: 'Risk Disclosure',
    heading: 'Risk Awareness',
    summary:
      'Sets out the inherent volatility of the forex markets and clarifies that the platform only offers intelligence, not execution or advice.',
    file: 'risk-disclosure.md',
    shortLabel: 'Risk Disclosure',
  },
  disclaimer: {
    title: 'Disclaimer',
    heading: 'Scope of Responsibility',
    summary:
      'States the limitations of Intel Trader’s commitments, the absence of advice, and how third-party infrastructure is managed.',
    file: 'disclaimer.md',
    shortLabel: 'Disclaimer',
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    heading: 'Cookies & Tracking',
    summary:
      'Explains the cookies we set, the types of tracking we perform, and how users can manage their preferences.',
    file: 'cookie-policy.md',
    shortLabel: 'Cookie Policy',
  },
} as const;

type LegalSlug = keyof typeof LEGAL_PAGES;

const markdownComponents = {
  h1: ({ className, ...props }: ComponentPropsWithoutRef<'h1'>) => (
    <h1 className={`text-3xl font-semibold text-white ${className ?? ''}`} {...props} />
  ),
  h2: ({ className, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className={`text-2xl font-semibold text-white ${className ?? ''}`} {...props} />
  ),
  h3: ({ className, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className={`text-xl font-semibold text-zinc-100 ${className ?? ''}`} {...props} />
  ),
  p: ({ className, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p className={`text-base leading-relaxed text-zinc-200 ${className ?? ''}`} {...props} />
  ),
  li: ({ className, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <li className={`text-base text-zinc-200 ml-4 list-disc ${className ?? ''}`} {...props} />
  ),
  ul: ({ className, ...props }: ComponentPropsWithoutRef<'ul'>) => (
    <ul className={`space-y-2 ${className ?? ''}`} {...props} />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol className={`space-y-2 list-decimal ml-4 ${className ?? ''}`} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className={`border-l-4 border-emerald-500/80 bg-zinc-900/50 p-4 text-zinc-200 italic ${className ?? ''}`}
      {...props}
    />
  ),
  a: ({ className, href, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a
      className={`text-emerald-400 underline decoration-dashed underline-offset-4 transition-colors hover:text-emerald-300 ${className ?? ''}`}
      href={href}
      target={href && href.startsWith('http') ? '_blank' : undefined}
      rel={href && href.startsWith('http') ? 'noreferrer' : undefined}
      {...props}
    />
  ),
};

export async function generateStaticParams() {
  return Object.keys(LEGAL_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug as LegalSlug];
  if (!page) {
    return {
      title: 'Intel Trader Legal',
      description: 'Legal notices, privacy commitments, and risk disclosures for Intel Trader.',
    };
  }

  return {
    title: `${page.title} | Intel Trader`,
    description: page.summary,
  };
}

export default async function LegalPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug as LegalSlug];
  if (!page) {
    notFound();
  }

  const filePath = path.join(process.cwd(), '..', 'docs', 'legal', page.file);
  const markdown = await fs.readFile(filePath, 'utf-8');

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold tracking-widest text-emerald-200 transition hover:border-emerald-400/80"
          >
            <Cpu className="h-5 w-5 text-emerald-300" />
            <span>Back to Intel Trader</span>
          </Link>
          <div className="text-right text-xs uppercase tracking-[0.4em] text-zinc-400">
            {page.title}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.6em] text-emerald-300">{page.title}</p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">{page.heading}</h1>
            <p className="text-lg text-zinc-300">{page.summary}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-emerald-500/5 backdrop-blur-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents as any}>
              {markdown}
            </ReactMarkdown>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
            {Object.entries(LEGAL_PAGES)
              .filter(([key]) => key !== params.slug)
              .map(([key, entry]) => (
                <Link
                  key={key}
                  href={`/legal/${key}`}
                  className="rounded-full border border-zinc-800/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-300 transition hover:border-emerald-400/80 hover:text-emerald-300"
                >
                  {entry.shortLabel}
                </Link>
              ))}
          </div>

          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-emerald-500/5 p-6 text-sm text-zinc-200">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-200">Need to act?</p>
            <p className="mt-2 text-sm">
              If you still have questions after reading this document, reach out via{' '}
              <a className="text-emerald-300 underline decoration-dashed" href="mailto:legal@inteltrader.ai">
                legal@inteltrader.ai
              </a>{' '}
              or use the support chat in the dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
