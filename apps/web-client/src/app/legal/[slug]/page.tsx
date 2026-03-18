import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';

import type { ComponentPropsWithoutRef } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Cpu } from 'lucide-react';

const findDocsRoot = () => {
  let dir = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    const candidate = path.join(dir, 'docs', 'legal');
    if (existsSync(candidate)) {
      return path.join(dir, 'docs');
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('Unable to locate docs/legal directory');
};

const DOCS_ROOT = findDocsRoot();

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
    <h1 className={`text-4xl font-bold text-zinc-900 ${className ?? ''}`} {...props} />
  ),
  h2: ({ className, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className={`mt-8 text-3xl font-semibold text-zinc-900 ${className ?? ''}`} {...props} />
  ),
  h3: ({ className, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className={`mt-6 text-2xl font-semibold text-zinc-900 ${className ?? ''}`} {...props} />
  ),
  h4: ({ className, ...props }: ComponentPropsWithoutRef<'h4'>) => (
    <h4 className={`mt-5 text-xl font-semibold text-zinc-900 ${className ?? ''}`} {...props} />
  ),
  h5: ({ className, ...props }: ComponentPropsWithoutRef<'h5'>) => (
    <h5 className={`mt-4 text-lg font-semibold text-zinc-900 ${className ?? ''}`} {...props} />
  ),
  h6: ({ className, ...props }: ComponentPropsWithoutRef<'h6'>) => (
    <h6 className={`mt-3 text-base font-semibold text-zinc-900 ${className ?? ''}`} {...props} />
  ),
  p: ({ className, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p className={`text-base leading-relaxed text-zinc-700 text-justify ${className ?? ''}`} {...props} />
  ),
  li: ({ className, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <li className={`text-base text-zinc-700 ml-6 list-disc text-justify ${className ?? ''}`} {...props} />
  ),
  ul: ({ className, ...props }: ComponentPropsWithoutRef<'ul'>) => (
    <ul className={`space-y-2 ${className ?? ''}`} {...props} />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol className={`space-y-2 list-decimal ml-6 ${className ?? ''}`} {...props} />
  ),
  strong: ({ className, ...props }: ComponentPropsWithoutRef<'strong'>) => (
    <strong className={`font-semibold text-zinc-900 ${className ?? ''}`} {...props} />
  ),
  em: ({ className, ...props }: ComponentPropsWithoutRef<'em'>) => (
    <em className={`italic text-zinc-800 ${className ?? ''}`} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className={`border-l-4 border-emerald-500/80 bg-emerald-50 p-4 text-zinc-700 italic shadow-sm text-justify ${className ?? ''}`}
      {...props}
    />
  ),
  a: ({ className, href, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a
      className={`text-emerald-600 underline decoration-dashed underline-offset-4 transition hover:text-emerald-500 ${className ?? ''}`}
      href={href}
      target={href && href.startsWith('http') ? '_blank' : undefined}
      rel={href && href.startsWith('http') ? 'noreferrer' : undefined}
      {...props}
    />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<'code'>) => (
    <code
      className={`rounded bg-zinc-100 px-1 py-0.5 text-sm font-mono text-zinc-800 ${className ?? ''}`}
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentPropsWithoutRef<'pre'>) => (
    <pre className={`rounded-2xl bg-black/90 p-4 text-sm text-zinc-50 ${className ?? ''}`} {...props} />
  ),
};

export async function generateStaticParams() {
  return Object.keys(LEGAL_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug as LegalSlug];
  if (!page) {
    notFound();
  }

  const filePath = path.join(DOCS_ROOT, 'legal', page.file);
  const markdown = await fs.readFile(filePath, 'utf-8');

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/95 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-emerald-50 px-3 py-2 text-sm font-semibold tracking-widest text-emerald-600 transition hover:border-emerald-300"
          >
            <Cpu className="h-5 w-5 text-emerald-500" />
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
            <p className="text-sm uppercase tracking-[0.6em] text-emerald-600">{page.title}</p>
            <h1 className="text-4xl font-bold text-zinc-900 sm:text-5xl">{page.heading}</h1>
            <p className="text-lg text-zinc-600">{page.summary}</p>
          </div>

          <div className="rounded-3xl border border-zinc-100 bg-white/80 p-8 shadow-xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents as any}
              className="text-justify space-y-6"
            >
              {markdown}
            </ReactMarkdown>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            {Object.entries(LEGAL_PAGES)
              .filter(([key]) => key !== slug)
              .map(([key, entry]) => (
                <Link
                  key={key}
                  href={`/legal/${key}`}
                  className="rounded-full border border-zinc-200 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-600 transition hover:border-emerald-400 hover:text-emerald-600"
                >
                  {entry.shortLabel}
                </Link>
              ))}
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-700">Need to act?</p>
            <p className="mt-2 text-sm text-zinc-600">
              If you still have questions after reading this document, reach out via{' '}
              <a className="text-emerald-600 underline decoration-dashed" href="mailto:legal@cacsms.com">
                legal@cacsms.com
              </a>{' '}
              or use the support chat in the dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
