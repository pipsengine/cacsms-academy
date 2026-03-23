'use client';

import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  title: string;
  content: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Alex Chen',
    title: 'FX Trader • Singapore',
    content:
      'Cacsms Academy completely transformed my trading workflow. The AI probability engine gives me the edge I needed. Went from manual channel detection to fully automated setups in minutes.',
  },
  {
    name: 'Maria Rodriguez',
    title: 'Investment Manager • London',
    content:
      'Using the ProTrader plan with my team. The API integrations seamlessly connect to our existing systems. The liquidity intelligence alone has improved our entry accuracy by 23%.',
  },
  {
    name: 'James Wilson',
    title: 'Prop Trader • New York',
    content:
      'The opportunity radar saves me hours every day. Instead of scanning markets manually, I get ranked, actionable setups delivered automatically. This is professional-grade tech at an accessible price.',
  },
  {
    name: 'Priya Kapoor',
    title: 'Retail Trader • India',
    content:
      'Started with the Free plan to learn, upgraded to Trader after 2 weeks. The educational content combined with real-time analysis helped me understand forex like never before. Highly recommend.',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-zinc-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-zinc-900 mb-4">
            Trusted by professional traders worldwide
          </h2>
          <p className="text-xl text-zinc-600">
            Join thousands of forex traders who use Cacsms Academy to identify high-probability setups faster and trade with institutional-grade intelligence.
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-zinc-200 p-8 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-emerald-500 text-emerald-500"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-lg text-zinc-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div>
                <div className="font-semibold text-zinc-900">{testimonial.name}</div>
                <div className="text-sm text-zinc-500">{testimonial.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Footer */}
        <div className="mt-16 text-center">
          <p className="text-base text-zinc-600 mb-4">
            ⭐ Trusted by 10,000+ traders | 4.9/5 from 500+ verified reviews
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="text-sm font-semibold text-emerald-700">✓ All traders | All regions | No spam</span>
          </div>
        </div>
      </div>
    </section>
  );
}
