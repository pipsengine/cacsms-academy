import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Cpu, Globe, Activity, Zap, ShieldAlert, Target, 
  Clock, Layers, Eye, Network, BrainCircuit, Database, 
  CheckCircle2, ChevronRight, Menu
} from 'lucide-react';
import PricingPlans from '@/components/PricingPlans';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-emerald-500/30">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-emerald-600">
              <Cpu className="w-8 h-8" />
              <span className="font-mono font-bold tracking-wider text-xl text-zinc-900">INTEL TRADER</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#platform" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Platform</Link>
              <Link href="#technology" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Technology</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">How It Works</Link>
              <Link href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Pricing</Link>
              <Link href="#faq" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">FAQ</Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Login</Link>
              <Link href="/register" className="text-sm font-bold bg-zinc-900 text-white px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors">Sign Up</Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-zinc-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-8">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  The Future of Forex Market Intelligence
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-tight">
                  The Institutional Forex Intelligence Platform
                </h1>
                <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                  Intel Trader is not simply another trading tool. It represents a complete institutional-grade Forex intelligence platform designed to transform how traders analyze, interpret, and respond to global currency markets. Remove guesswork and replace it with data-driven clarity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register" className="inline-flex justify-center items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors text-lg">
                    Create Free Account
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link href="/login" className="inline-flex justify-center items-center gap-2 bg-white text-zinc-900 border-2 border-zinc-200 px-8 py-4 rounded-xl font-bold hover:border-zinc-300 hover:bg-zinc-50 transition-colors text-lg">
                    Login to Dashboard
                  </Link>
                </div>
              </div>
              
              {/* Hero Visual */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-blue-50 rounded-3xl transform rotate-3 scale-105" />
                <div className="relative bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden transform -rotate-1">
                  {/* Dashboard Mockup */}
                  <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4 opacity-90">
                    <div className="h-32 bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                      <div className="w-1/2 h-4 bg-zinc-800 rounded mb-4" />
                      <div className="w-full h-16 bg-gradient-to-t from-emerald-500/20 to-transparent rounded border-b-2 border-emerald-500" />
                    </div>
                    <div className="h-32 bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                      <div className="w-1/2 h-4 bg-zinc-800 rounded mb-4" />
                      <div className="space-y-2">
                        <div className="w-full h-2 bg-zinc-800 rounded" />
                        <div className="w-4/5 h-2 bg-zinc-800 rounded" />
                        <div className="w-full h-2 bg-zinc-800 rounded" />
                      </div>
                    </div>
                    <div className="col-span-2 h-48 bg-zinc-900 rounded-lg border border-zinc-800 p-4 flex items-end gap-2">
                      {[40, 70, 45, 90, 65, 85, 55, 75, 50, 80, 60, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-emerald-500/80 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section id="platform" className="py-24 bg-zinc-50 border-y border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 mb-6">The Problem with Traditional Trading Platforms</h2>
              <p className="text-lg text-zinc-600">
                For decades, retail trading platforms have been built around a relatively simple philosophy: provide price charts and allow traders to interpret the market manually. While charts remain an essential analytical tool, they represent only a small portion of the full intelligence framework required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Eye />, title: "Manual Monitoring", desc: "Traders must manually monitor dozens of currency pairs across multiple timeframes, leading to missed opportunities." },
                { icon: <Clock />, title: "Lagging Indicators", desc: "Heavy reliance on lagging indicators that react only after price movements have already occurred." },
                { icon: <Layers />, title: "Fragmented Signals", desc: "Analytical signals are scattered across multiple tools, requiring interpretation of conflicting information." },
                { icon: <ShieldAlert />, title: "Hidden Institutional Behavior", desc: "Little visibility into institutional market behavior such as liquidity sweeps and stop-hunt zones." },
                { icon: <Target />, title: "No Opportunity Ranking", desc: "Traders spend significant time analyzing low-quality setups while stronger opportunities emerge elsewhere." },
                { icon: <Network />, title: "Isolated Analysis", desc: "Cross-currency relationships are rarely analyzed holistically, missing broader strength or weakness dynamics." }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">{item.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Architecture Section */}
        <section id="technology" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">The Intel Trader Intelligence Architecture</h2>
                <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                  At the core of Intel Trader lies a sophisticated analytical infrastructure composed of multiple specialized intelligence engines designed to interpret market behavior from different perspectives simultaneously.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: <Globe />, title: "Currency Strength Engine", desc: "Evaluates relative strength and weakness of major currencies." },
                    { icon: <Activity />, title: "Multi-Timeframe Channel Engine", desc: "Detects emerging price channels and trend structures." },
                    { icon: <Zap />, title: "Breakout Detection Engine", desc: "Monitors price behavior near structural boundaries." },
                    { icon: <Database />, title: "Liquidity Intelligence Engine", desc: "Detects areas where institutional liquidity may be concentrated." },
                    { icon: <BrainCircuit />, title: "AI Probability Engine", desc: "Evaluates market structure using machine learning models." }
                  ].map((engine, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {engine.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-zinc-900 mb-1">{engine.title}</h4>
                        <p className="text-zinc-600">{engine.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-2 bg-zinc-700 rounded w-1/3 mb-2" />
                        <div className="h-2 bg-zinc-700 rounded w-full" />
                      </div>
                      <div className="w-16 h-8 bg-zinc-700/50 rounded flex items-center justify-center text-xs font-mono text-emerald-400">
                        {90 - i * 5}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-Time Scanner Section */}
        <section id="how-it-works" className="py-24 bg-zinc-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-6">Real-Time Market Scanner</h2>
              <p className="text-lg text-zinc-400">
                Intel Trader continuously scans the entire Forex market in real time, removing the need for traders to manually review dozens of charts throughout the day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                "Continuous monitoring of 28 pairs",
                "Detection of emerging channels",
                "Automated breakout probability",
                "Dynamic currency strength updates",
                "Volatility compression detection",
                "Institutional liquidity zones",
                "Continuous AI probability scoring",
                "Real-time opportunity ranking"
              ].map((feature, i) => (
                <div key={i} className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-2xl flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <span className="text-zinc-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Command Center Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-zinc-900 mb-6">Designed Like a Professional Trading Command Center</h2>
            <p className="text-lg text-zinc-600 max-w-3xl mx-auto mb-16">
              Intel Trader was designed to resemble the analytical environments used by professional trading desks, where information must be processed quickly and decisions must be made with confidence.
            </p>
            
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 to-transparent rounded-3xl transform -translate-y-4 scale-105" />
              <Image 
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=2000" 
                alt="Trading Dashboard" 
                width={2000}
                height={500}
                className="relative rounded-2xl shadow-2xl border border-zinc-200 object-cover h-[500px] w-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        <PricingPlans />

        {/* Why Choose Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-zinc-900 mb-12 text-center">Why Traders Choose Intel Trader</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Automated market scanning eliminates manual chart monitoring.",
                "AI probability models provide statistical insight into trade setups.",
                "Structural analysis reveals market opportunities earlier.",
                "Opportunity ranking focuses trader attention on high-quality setups.",
                "Real-time alerts ensure traders never miss critical developments.",
                "Multi-engine analysis evaluates markets from multiple perspectives.",
                "Professional dashboard interface simplifies complex data."
              ].map((reason, i) => (
                <div key={i} className="flex items-start gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {i + 1}
                  </div>
                  <p className="text-zinc-700 font-medium pt-1">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-zinc-900 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-8">Start Using Institutional-Grade Market Intelligence Today</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="inline-flex justify-center items-center gap-2 bg-emerald-500 text-zinc-900 px-8 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-colors text-lg">
                Create Free Account
              </Link>
              <Link href="/login" className="inline-flex justify-center items-center gap-2 bg-zinc-800 text-white border border-zinc-700 px-8 py-4 rounded-xl font-bold hover:bg-zinc-700 transition-colors text-lg">
                Login to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 text-emerald-500 mb-6">
                <Cpu className="w-6 h-6" />
                <span className="font-mono font-bold tracking-wider text-lg text-white">INTEL TRADER</span>
              </div>
              <p className="text-sm text-zinc-500 max-w-sm">
                The Institutional Forex Intelligence Platform Built for the Next Generation of Traders.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Technology</Link></li>
                <li><Link href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Account Support</Link></li>
                <li><Link href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-8 space-y-8 text-xs text-zinc-500">
            <div className="flex flex-wrap gap-4">
              <Link href="/legal/terms" className="hover:text-zinc-300">Terms and Conditions</Link>
              <Link href="/legal/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
              <Link href="/legal/risk-disclosure" className="hover:text-zinc-300">Risk Disclosure</Link>
              <Link href="/legal/disclaimer" className="hover:text-zinc-300">Disclaimer</Link>
              <Link href="/legal/cookie-policy" className="hover:text-zinc-300">Cookie Policy</Link>
            </div>

            <div className="space-y-4">
              <div>
                <strong className="text-zinc-400 block mb-1">Legal Disclaimer</strong>
                <p>Intel Trader provides analytical tools and market intelligence designed to assist traders in evaluating financial markets. The platform does not provide financial advice, investment recommendations, or guarantees of trading performance. All trading decisions remain the sole responsibility of the user. Trading foreign exchange markets involves substantial risk and may not be suitable for all investors.</p>
              </div>
              <div>
                <strong className="text-zinc-400 block mb-1">Nigeria Regulatory Notice</strong>
                <p>Intel Trader operates as a financial technology platform providing analytical tools and market intelligence. The platform does not operate as a brokerage, financial advisory service, or investment management company. Users remain responsible for ensuring compliance with applicable Nigerian laws and regulations governing financial trading activities.</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
              <p>© {new Date().getFullYear()} Intel Trader. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
