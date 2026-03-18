import React from 'react';
import Link from 'next/link';
import {
  Cpu,
  Globe,
  Activity,
  Zap,
  ShieldAlert,
  Target,
  Clock,
  Layers,
  Eye,
  Network,
  BrainCircuit,
  Database,
  CheckCircle2,
  ChevronRight,
  Menu,
} from 'lucide-react';
import PricingPlans from '@/components/PricingPlans';

const problemCards = [
  {
    icon: <Eye />,
    title: 'Manual Monitoring',
    desc: 'Most traders still depend on manually watching pairs, timeframes, and watchlists, which creates fatigue and causes strong setups to appear only after the best timing has passed.',
    detail:
      'Intel Trader reduces that burden by continuously watching multiple market conditions at once and surfacing the setups that already meet meaningful structural filters.',
  },
  {
    icon: <Clock />,
    title: 'Lagging Indicators',
    desc: 'Traditional indicators usually confirm what has already happened, leaving traders to react late rather than prepare early for structural movement.',
    detail:
      'Intel Trader combines live market movement, breakout pressure, and ranked probability so users can see higher-quality context before the majority of traders recognize it.',
  },
  {
    icon: <Layers />,
    title: 'Fragmented Signals',
    desc: 'Important decision inputs are often split across separate tools, tabs, and alert systems, forcing traders to combine conflicting information under time pressure.',
    detail:
      'Intel Trader unifies those inputs into one intelligence workflow so currency strength, structure, alerts, and opportunity ranking can be read together without guesswork.',
  },
  {
    icon: <ShieldAlert />,
    title: 'Hidden Institutional Behavior',
    desc: 'Retail tools rarely explain where liquidity is concentrated, where sweeps are likely, or how institutional participants may be positioning around obvious zones.',
    detail:
      'Intel Trader adds liquidity awareness and structural interpretation so users can understand where the market is likely to hunt, reject, or accelerate.',
  },
  {
    icon: <Target />,
    title: 'No Opportunity Ranking',
    desc: 'Without prioritization, traders spend too much time on average setups while stronger opportunities elsewhere receive less attention than they deserve.',
    detail:
      'Intel Trader ranks opportunities so capital, focus, and execution energy can be directed toward the setups with stronger structural backing.',
  },
  {
    icon: <Network />,
    title: 'Isolated Analysis',
    desc: 'A single pair rarely tells the full story because broader currency relationships and cross-market pressure often drive the most important shifts.',
    detail:
      'Intel Trader connects those relationships so users can trade the broader narrative rather than isolated candles with limited context.',
  },
];

const engineCards = [
  {
    icon: <Globe />,
    title: 'Currency Strength Engine',
    desc: 'Tracks relative currency pressure so traders can see where broad strength is building, where weakness is spreading, and which pairs are most structurally aligned with that imbalance.',
  },
  {
    icon: <Activity />,
    title: 'Multi-Timeframe Channel Engine',
    desc: 'Measures price structure across multiple timeframes to reveal directional channels, developing compression, and the zones where structure may transition.',
  },
  {
    icon: <Zap />,
    title: 'Breakout Detection Engine',
    desc: 'Monitors breakout pressure around meaningful structural boundaries so traders can distinguish between random movement and expansion that deserves real attention.',
  },
  {
    icon: <Database />,
    title: 'Liquidity Intelligence Engine',
    desc: 'Highlights probable liquidity pools, sweep locations, and reaction zones so users can interpret market intent with greater precision.',
  },
  {
    icon: <BrainCircuit />,
    title: 'AI Probability Engine',
    desc: 'Adds machine-supported signal qualification to help traders compare setup quality, confidence level, and expected structural behavior more effectively.',
  },
];

const whyChooseCards = [
  'Automated market scanning reduces the need to monitor charts manually and helps traders spend more time acting on qualified information instead of hunting for it.',
  'AI-backed probability analysis adds another decision layer so each setup is not judged only by intuition, but also by ranked structural quality.',
  'Structural analysis helps traders see breakout zones, compression, reversal potential, and directional imbalance earlier than ordinary visual review.',
  'Opportunity ranking turns a wide forex universe into a practical decision list, making it easier to allocate attention where it matters most.',
  'Real-time alerting helps traders respond to meaningful market changes without staying glued to charts during every session.',
  'Multi-engine alignment keeps strength, liquidity, and breakout analysis working together so the market story is clearer and easier to trust.',
  'The professional dashboard format presents dense market information in a way that feels deliberate, readable, and operationally useful.',
];

const faqItems = [
  {
    question: 'What does Intel Trader do for forex traders?',
    answer:
      'Intel Trader gives forex traders a market-intelligence workspace that combines currency strength, structural scanning, breakout pressure, liquidity awareness, and AI-backed ranking into one environment. Instead of relying on disconnected chart tools, traders can read a more complete market picture before acting.',
  },
  {
    question: 'Who should use Intel Trader?',
    answer:
      'Intel Trader is suitable for retail beginners, serious independent traders, professional operators, and institutional teams. The platform is designed to scale from simple exploration into deeper operational use as the trader or firm grows.',
  },
  {
    question: 'How is Intel Trader different from an ordinary charting platform?',
    answer:
      'A normal charting platform mainly shows price. Intel Trader adds structured interpretation around that price by ranking opportunities, identifying channel behavior, highlighting liquidity context, and surfacing higher-quality alerts that help users make more disciplined decisions.',
  },
  {
    question: 'Does Intel Trader support traders in Nigeria?',
    answer:
      'Yes. Intel Trader supports NGN pricing, Nigerian trading context, Lagos-friendly workflows, and a product experience designed for traders and teams operating in Nigeria as well as global FX markets.',
  },
];

export default function LandingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-emerald-500/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2 text-emerald-600">
              <Cpu className="w-8 h-8" />
              <span className="font-mono font-bold tracking-wider text-xl text-zinc-900">INTEL TRADER</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="#platform" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Platform</Link>
              <Link href="#technology" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Technology</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">How It Works</Link>
              <Link href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Pricing</Link>
              <Link href="#faq" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">FAQ</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Login</Link>
              <Link href="/register" className="text-sm font-bold bg-zinc-900 text-white px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors">Sign Up</Link>
            </div>

            <button className="md:hidden p-2 text-zinc-600" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-8">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  The Future of Forex Market Intelligence
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-tight">
                  Institutional Forex Intelligence for Modern Traders
                </h1>
                <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                  Intel Trader is a forex market intelligence platform built to help traders interpret live market behavior with more structure, more confidence, and far less operational friction. Instead of forcing users to piece together signals from scattered charts and disconnected tools, Intel Trader brings the important layers of market context into one coordinated workspace.
                </p>
                <p className="text-base text-zinc-500 mb-8 leading-relaxed">
                  The platform combines currency strength analysis, structural channel detection, breakout monitoring, liquidity context, AI-assisted probability scoring, and ranked opportunity discovery so traders can spend less time searching and more time acting with intention. It is designed for ambitious retail traders, serious professionals, and institutional teams that want a cleaner operating picture of the forex market.
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
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-center shadow-sm">
                    <p className="text-xs uppercase tracking-[0.5em] text-zinc-500">Coverage</p>
                    <p className="text-2xl font-bold text-zinc-900">28</p>
                    <p className="text-sm text-zinc-500">forex pairs monitored across the workflow</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-center shadow-sm">
                    <p className="text-xs uppercase tracking-[0.5em] text-zinc-500">Intelligence</p>
                    <p className="text-2xl font-bold text-zinc-900">5+</p>
                    <p className="text-sm text-zinc-500">core engines working in one workspace</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-center shadow-sm">
                    <p className="text-xs uppercase tracking-[0.5em] text-zinc-500">Focus</p>
                    <p className="text-2xl font-bold text-zinc-900">1</p>
                    <p className="text-sm text-zinc-500">command center for ranked decisions</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-blue-50 rounded-3xl transform rotate-3 scale-105" />
                <div className="relative bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden transform -rotate-1">
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

        <section id="platform" className="py-24 bg-zinc-50 border-y border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 mb-6">Why Traditional Trading Workflows Break Down</h2>
              <p className="text-lg text-zinc-600">
                The average trader is still expected to gather information manually, compare conflicting chart signals, and make fast decisions with limited structural clarity. Intel Trader was built to solve that by turning fragmented information into one coherent market-intelligence process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {problemCards.map((item) => (
                <div key={item.title} className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">{item.title}</h3>
                  <p className="text-zinc-600 leading-relaxed mb-3">{item.desc}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="technology" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">A Multi-Engine Intelligence Architecture for Forex Analysis</h2>
                <p className="text-lg text-zinc-600 mb-4 leading-relaxed">
                  Intel Trader is built around a layered intelligence architecture that converts live forex market data into structured insights traders can actually use. Rather than asking users to interpret every signal from scratch, the platform organizes information into engines that measure strength, structure, volatility behavior, liquidity context, and ranked opportunity quality.
                </p>
                <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                  This makes the platform useful not only for solo traders, but also for professional teams that need a shared market picture, clearer decision support, and a more repeatable way to evaluate what deserves attention in the forex market.
                </p>
                <div className="space-y-6">
                  {engineCards.map((engine) => (
                    <div key={engine.title} className="flex gap-4">
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

        <section id="how-it-works" className="py-24 bg-zinc-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-6">Live Forex Scanning and Ranked Market Awareness</h2>
              <p className="text-lg text-zinc-400">
                Intel Trader continuously watches the forex market and converts that raw activity into structured signals traders can evaluate quickly. Instead of simply forwarding price changes, the platform organizes live monitoring into a decision-ready workflow that highlights structure, direction, signal quality, and relative opportunity strength.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                'Continuous monitoring of key forex pairs inside one coordinated workflow',
                'Early identification of developing channels and structural directional bias',
                'Automated breakout-pressure detection around important market boundaries',
                'Dynamic currency strength updates to expose broad relative movement',
                'Volatility compression recognition before potential market expansion',
                'Liquidity context that helps traders interpret likely reaction areas',
                'Continuous AI-assisted setup qualification for signal comparison',
                'Opportunity ranking that makes the strongest setups easier to identify quickly',
              ].map((feature) => (
                <div key={feature} className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-2xl flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <span className="text-zinc-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-zinc-900 mb-6">A Command Center Built for Serious Market Work</h2>
            <p className="text-lg text-zinc-600 max-w-3xl mx-auto mb-5">
              Intel Trader is designed to feel like an operational command center rather than a simple watchlist. Each panel is built to reduce distraction, improve decision sequencing, and keep the most relevant market context visible without forcing the trader to reconstruct the story alone.
            </p>
            <p className="text-base text-zinc-500 max-w-3xl mx-auto mb-12">
              That makes the platform useful for individual traders who want cleaner execution discipline and for teams that need a shared intelligence surface for review, communication, and coordinated market interpretation.
            </p>

            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 to-transparent rounded-3xl transform -translate-y-4 scale-105" />
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 shadow-2xl">
                <div className="flex h-10 items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <div className="ml-4 text-xs font-mono uppercase tracking-[0.35em] text-zinc-500">
                    Intel Trader forex intelligence dashboard
                  </div>
                </div>

                <div className="grid gap-4 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,_#09090b,_#111827)] p-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Opportunity Ranking</p>
                          <h3 className="mt-2 text-xl font-bold text-white">GBPJPY Long Bias</h3>
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-right">
                          <p className="text-2xl font-bold text-emerald-400">94%</p>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">Institutional Signal</p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <MetricPill label="Fractal Align" value="96%" accent="emerald" />
                        <MetricPill label="Regime" value="Trending" accent="blue" />
                        <MetricPill label="Breakout Prob" value="88%" accent="amber" />
                      </div>
                      <div className="mt-4 h-32 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                        <div className="flex h-full items-end gap-2">
                          {[32, 40, 36, 54, 48, 61, 57, 72, 68, 82, 76, 92].map((height, index) => (
                            <div key={index} className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-300" style={{ height: `${height}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <PanelCard
                        title="Currency Strength"
                        lines={[
                          'JPY leading across monitored majors',
                          'USD weakening on shorter intraday cycle',
                          'GBP maintaining directional advantage',
                        ]}
                      />
                      <PanelCard
                        title="Liquidity Intel"
                        lines={[
                          'Buy-side sweep completed above prior high',
                          'Compression released with displacement',
                          'Nearest reaction pool mapped below expansion leg',
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Live Feed Monitor</p>
                      <div className="mt-4 space-y-3">
                        {[
                          ['EURUSD', 'Compression', '72%'],
                          ['GBPUSD', 'Breakout Watch', '84%'],
                          ['USDJPY', 'Trend Extension', '91%'],
                          ['AUDJPY', 'Liquidity Sweep', '79%'],
                        ].map(([pair, state, score]) => (
                          <div key={pair} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-3">
                            <div>
                              <p className="font-mono text-sm font-bold text-white">{pair}</p>
                              <p className="text-xs text-zinc-500">{state}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-emerald-400">{score}</p>
                              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Signal</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Operational Status</p>
                      <div className="mt-4 grid gap-3">
                        <StatusRow label="Feed Status" value="Live" accent="emerald" />
                        <StatusRow label="Tracked Pairs" value="28" accent="blue" />
                        <StatusRow label="Signal Queue" value="Healthy" accent="amber" />
                        <StatusRow label="Latency" value="12ms" accent="emerald" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PricingPlans />

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-zinc-900 mb-12 text-center">Why Traders Choose Intel Trader</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChooseCards.map((text, index) => (
                <div key={text} className="flex items-start gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {index + 1}
                  </div>
                  <p className="text-zinc-700 font-medium pt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 bg-zinc-50 border-y border-zinc-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl font-bold text-zinc-900 mb-5">Frequently Asked Questions</h2>
              <p className="text-lg text-zinc-600">
                These are the questions most traders and evaluation teams ask when comparing Intel Trader with more traditional forex analysis tools.
              </p>
            </div>
            <div className="space-y-5">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-3">{item.question}</h3>
                  <p className="text-zinc-600 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-zinc-900 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-4">Start Using Institutional-Grade Forex Intelligence Today</h2>
            <p className="text-zinc-300 max-w-3xl mx-auto mb-8">
              Whether you are evaluating the market as a solo trader, building a more disciplined daily workflow, or scaling intelligence across a team, Intel Trader gives you a more deliberate way to monitor, interpret, and rank the forex market.
            </p>
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

      <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 text-emerald-500 mb-6">
                <Cpu className="w-6 h-6" />
                <span className="font-mono font-bold tracking-wider text-lg text-white">INTEL TRADER</span>
              </div>
              <p className="text-sm text-zinc-500 max-w-sm">
                A forex market intelligence platform built to help traders move from fragmented chart watching to clearer, more disciplined market interpretation.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-emerald-400 transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-emerald-400 transition-colors">Features</Link></li>
                <li><Link href="/technology" className="hover:text-emerald-400 transition-colors">Technology</Link></li>
                <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help-center" className="hover:text-emerald-400 transition-colors">Help Center</Link></li>
                <li><Link href="/account-support" className="hover:text-emerald-400 transition-colors">Account Support</Link></li>
                <li><Link href="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link></li>
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

function MetricPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'emerald' | 'blue' | 'amber';
}) {
  const accentClass =
    accent === 'emerald'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
      : accent === 'blue'
        ? 'border-blue-500/20 bg-blue-500/10 text-blue-300'
        : 'border-amber-500/20 bg-amber-500/10 text-amber-300';

  return (
    <div className={`rounded-xl border p-3 ${accentClass}`}>
      <p className="text-[10px] uppercase tracking-[0.3em]">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function PanelCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{title}</p>
      <div className="mt-4 space-y-3">
        {lines.map((line) => (
          <div key={line} className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-3 text-sm text-zinc-300">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'emerald' | 'blue' | 'amber';
}) {
  const dotClass =
    accent === 'emerald'
      ? 'bg-emerald-500'
      : accent === 'blue'
        ? 'bg-blue-500'
        : 'bg-amber-500';

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-3">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <span className="font-mono text-sm font-bold text-white">{value}</span>
    </div>
  );
}
