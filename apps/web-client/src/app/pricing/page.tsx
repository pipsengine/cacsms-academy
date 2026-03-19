'use client';

import Link from 'next/link';
import PricingPlans from '@/components/PricingPlans';
import Testimonials from '@/components/Testimonials';
import PricingFAQ from '@/components/PricingFAQ';
import { CheckCircle2, TrendingUp, Shield, Zap } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_40%)]"></div>
        
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" /> Transparent, Professional Pricing
            </div>
            
            <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight mb-6">
              Start Your Trading Edge<br />at Any Level
            </h1>
            
            <p className="mt-6 text-xl leading-8 text-zinc-600 max-w-3xl mx-auto">
              From free exploration to institutional-grade access — every tier is designed around real trader needs. No hidden fees. Cancel anytime. Join 10,000+ traders worldwide.
            </p>
          </div>

          {/* Value Props */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-zinc-900">No Credit Card</h3>
                <p className="text-sm text-zinc-600">Try Free plan risk-free</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-zinc-900">Flexible Upgrade</h3>
                <p className="text-sm text-zinc-600">Pay only the difference</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-zinc-900">Regional Pricing</h3>
                <p className="text-sm text-zinc-600">USD & NGN support</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-zinc-900">Cancel Anytime</h3>
                <p className="text-sm text-zinc-600">No lock-in contracts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <PricingPlans mode="page" showTrustIndicators={true} />

      {/* Feature Comparison Highlight */}
      <section className="py-16 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-zinc-900 mb-8 text-center">Why Choose Intel Trader?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-zinc-200">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">AI-Powered Insights</h3>
              <p className="text-zinc-600">
                Advanced machine learning analyzes market patterns and delivers high-probability setups automatically, saving you hours of manual work.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-zinc-200">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Institutional Quality</h3>
              <p className="text-zinc-600">
                Bank-level security, 99.9% uptime SLA, and compliance with global financial regulations. Enterprise-ready infrastructure.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-zinc-200">
              <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Real-Time Trading</h3>
              <p className="text-zinc-600">
                Instant market analysis, automated alerts across all channels (Email, Telegram, SMS), and unlimited API access on Elite+ plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <PricingFAQ />

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-zinc-900 to-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to trade smarter?</h2>
          <p className="text-xl text-zinc-300 mb-8">
            Start free and upgrade when you're ready. No credit card required.
          </p>
          <Link
            href="#pricing"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold transition-colors shadow-lg hover:shadow-xl"
          >
            View Pricing Plans
          </Link>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-white border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-zinc-900 mb-4">Need help choosing?</h3>
          <p className="text-lg text-zinc-600 mb-8">
            Our team is here to answer your questions and help you find the right plan for your trading style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
            >
              Talk to Sales
            </a>
            <a
              href="mailto:support@inteltrader.com"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-zinc-300 text-zinc-900 font-semibold hover:bg-zinc-50 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
