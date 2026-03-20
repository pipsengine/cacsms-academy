'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer:
      'Absolutely! You can upgrade or downgrade your plan at any time. When you upgrade, you will only be charged the difference between your current plan and the new one. Downgrades take effect on your next billing cycle.',
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes. The Free plan is always available with no credit card required. It includes access to 5 major currency pairs, basic AI analysis (5/day), and all core features. Try it risk-free to see if Intel Trader works for your style.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express) via Stripe. For Nigerian traders, we support NGN payments with pricing optimized for your region. All payments are secure and encrypted.',
  },
  {
    question: 'Can I get a refund? What is your cancellation policy?',
    answer:
      'You can cancel your subscription anytime with no penalties. If you request a refund within 14 days of your first payment and the platform did not meet your expectations, we will refund you in full. Just contact support@inteltrader.com.',
  },
  {
    question: 'What is included in the Elite (ProTrader) plan?',
    answer:
      'The Elite (ProTrader) plan includes everything in Trader, plus advanced liquidity intelligence, custom opportunity radar alerts, SMS and Telegram notifications, API access, and priority support. It is designed for serious traders running daily operations.',
  },
  {
    question: 'How does the API work and what are the rate limits?',
    answer:
      'The API provides programmatic access to Intel Trader data and analyses. Growth supports basic API access, while Elite (ProTrader) unlocks expanded API usage for integrations. Full API documentation is available in your dashboard.',
  },
  {
    question: 'Do you offer custom pricing for teams or enterprises?',
    answer:
      'Yes! If you need custom features, higher API limits, white-label solutions, or multi-office deployments, contact our sales team at sales@inteltrader.com. We can work out tailored plans for organizations.',
  },
  {
    question: 'Is my data secure? What security measures are in place?',
    answer:
      'Your data is protected with bank-level encryption (TLS 1.3), regular security audits, and compliance with GDPR and regional financial regulations. All servers are hosted on secure, redundant infrastructure with automatic backups.',
  },
];

export default function PricingFAQ() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-zinc-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-zinc-600">
            Everything you need to know about Intel Trader pricing and plans. Have a question we didn't answer? Contact our support team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className="border border-zinc-200 rounded-xl bg-white overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-zinc-50 transition-colors duration-200 group"
              >
                <span className="text-base font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-zinc-400 group-hover:text-zinc-600 transition-all duration-300 flex-shrink-0 ${
                    expanded === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expanded === idx ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100">
                  <p className="text-base text-zinc-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-base text-zinc-600 mb-4">
            Still have questions?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@inteltrader.com"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors duration-200"
            >
              Email Support
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-zinc-300 text-zinc-900 font-semibold hover:bg-zinc-50 transition-colors duration-200"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
