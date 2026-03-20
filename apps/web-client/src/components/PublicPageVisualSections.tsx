import { ArrowRight, BarChart3, Briefcase, CheckCircle2, Clock3, CreditCard, HelpCircle, Layers3, Route, ShieldCheck, Sparkles, Target, UserCheck, Users } from 'lucide-react';

export function PlatformWorkflowMapSection() {
  const workflow = [
    {
      step: '01',
      title: 'Pressure Mapping',
      body: 'Start with currency-level pressure to understand directional imbalance before inspecting individual pair setups.',
      icon: BarChart3,
    },
    {
      step: '02',
      title: 'Structure Qualification',
      body: 'Validate conditions through structure, transition behavior, and breakout context so bias has technical shape.',
      icon: Layers3,
    },
    {
      step: '03',
      title: 'Liquidity Confirmation',
      body: 'Overlay liquidity zones and sweep context to separate continuation quality from likely trap behavior.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Ranked Focus',
      body: 'Commit attention to highest-quality ranked candidates instead of spreading focus across average opportunities.',
      icon: Target,
    },
  ];

  return (
    <section className="border-t border-zinc-200 bg-gradient-to-b from-white to-zinc-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">Workflow Map</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900">From market noise to ranked execution focus</h2>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            This is the intended operating sequence for daily platform use. It keeps interpretation stable while attention narrows.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
          {workflow.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.step} className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.3em] text-emerald-700">{item.step}</span>
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturesCapabilityMatrixSection() {
  const rows = [
    {
      capability: 'Signal Source',
      traditional: 'Mostly single-indicator interpretation',
      intelTrader: 'Multi-engine context across strength, structure, liquidity, and ranking',
    },
    {
      capability: 'Attention Allocation',
      traditional: 'Manual scanning across many charts',
      intelTrader: 'Ranked setup prioritization with workflow-level filtering',
    },
    {
      capability: 'Session Consistency',
      traditional: 'Interpretation shifts with chart order and fatigue',
      intelTrader: 'Structured sequence designed for repeatable daily decision flow',
    },
    {
      capability: 'Review Quality',
      traditional: 'Mostly memory and fragmented notes',
      intelTrader: 'Alert continuity and context-linked review support',
    },
  ];

  return (
    <section className="border-t border-zinc-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">Capability Matrix</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900">Why feature coordination matters in real sessions</h2>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            Feature value is measured by how much better decisions become under pressure, not by how many widgets exist.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 shadow-sm sm:mt-10">
          <div className="grid grid-cols-1 bg-zinc-100/80 text-sm font-semibold text-zinc-700 md:grid-cols-3">
            <div className="px-5 py-4 uppercase tracking-[0.2em] text-xs text-zinc-500">Capability</div>
            <div className="border-t border-zinc-200 px-5 py-4 md:border-l md:border-t-0">Typical Tooling</div>
            <div className="border-t border-zinc-200 px-5 py-4 md:border-l md:border-t-0">Intel Trader</div>
          </div>

          {rows.map((row) => (
            <div key={row.capability} className="grid grid-cols-1 border-t border-zinc-200 bg-white md:grid-cols-3">
              <div className="px-5 py-4 text-sm font-semibold text-zinc-900">{row.capability}</div>
              <div className="border-t border-zinc-200 px-5 py-4 text-sm leading-7 text-zinc-600 md:border-l md:border-t-0">
                {row.traditional}
              </div>
              <div className="border-t border-zinc-200 px-5 py-4 text-sm leading-7 text-zinc-600 md:border-l md:border-t-0">
                {row.intelTrader}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CareersRolePathSection() {
  const tracks = [
    {
      title: 'Product Engineering',
      subtitle: 'Reliability + interpretability',
      bullets: [
        'Build resilient systems for live context delivery',
        'Reduce ambiguity between signal output and user interpretation',
        'Improve observability for trust under production load',
      ],
      icon: Sparkles,
    },
    {
      title: 'Product Design',
      subtitle: 'Clarity under information density',
      bullets: [
        'Design interfaces that preserve context while reducing overload',
        'Translate analytical complexity into readable decisions',
        'Support fast scanning without sacrificing precision',
      ],
      icon: Users,
    },
    {
      title: 'Operations & Support',
      subtitle: 'Adoption + confidence',
      bullets: [
        'Turn support insight into product-level improvements',
        'Improve onboarding quality for faster user maturity',
        'Maintain response discipline for account-critical issues',
      ],
      icon: Briefcase,
    },
  ];

  return (
    <section className="border-t border-zinc-200 bg-zinc-950 py-16 sm:py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-400">Role Tracks</p>
          <h2 className="mt-3 text-3xl font-bold">Where strong contributors typically create leverage</h2>
          <p className="mt-4 text-lg leading-8 text-zinc-300">
            The strongest work usually combines technical quality, workflow empathy, and durable system thinking.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-3">
          {tracks.map((track) => {
            const Icon = track.icon;
            return (
              <article key={track.title} className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{track.title}</h3>
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="mt-2 text-sm font-medium text-emerald-300">{track.subtitle}</p>
                <ul className="mt-4 space-y-3">
                  {track.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm leading-7 text-zinc-300">
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-400" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 sm:mt-10 sm:px-5 sm:py-4">
          <Clock3 className="h-4 w-4 text-emerald-400" />
          <span>
            Hiring conversations are strongest when candidates explain how they improve decision quality, not only how they complete isolated tasks.
          </span>
        </div>
      </div>
    </section>
  );
}

export function HelpCenterTriageSection() {
  const lanes = [
    {
      title: 'General Guidance',
      description: 'Use when you need onboarding help, feature interpretation, or product workflow clarification.',
      checks: ['No account-specific data needed', 'Issue is educational or interpretive', 'Best first stop for orientation'],
      icon: HelpCircle,
    },
    {
      title: 'Account Support',
      description: 'Use when the issue depends on login state, billing, role permissions, or plan entitlements.',
      checks: ['Specific user account is affected', 'Payment or access state may be involved', 'Needs record-level verification'],
      icon: UserCheck,
    },
    {
      title: 'Commercial Contact',
      description: 'Use for team onboarding, strategic questions, partnership requests, or deployment planning.',
      checks: ['Organization or team context', 'Planning or rollout discussion', 'Not a bug or account mismatch'],
      icon: Route,
    },
  ];

  return (
    <section className="border-t border-zinc-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">Triage Guide</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900">Pick the right support path in less than 60 seconds</h2>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            Correct routing is the fastest way to better answers. Use this quick filter before opening a request.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-3">
          {lanes.map((lane) => {
            const Icon = lane.icon;
            return (
              <article key={lane.title} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-zinc-900">{lane.title}</h3>
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{lane.description}</p>
                <ul className="mt-4 space-y-2">
                  {lane.checks.map((check) => (
                    <li key={check} className="flex items-start gap-2 text-sm text-zinc-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AccountSupportChecklistSection() {
  const checklist = [
    {
      title: 'Account Identity',
      detail: 'Include the exact affected account email and whether this is a single-user or team-admin issue.',
      icon: UserCheck,
    },
    {
      title: 'Expected Behavior',
      detail: 'State what should happen, for example plan access, login route, role permissions, or post-payment activation.',
      icon: CheckCircle2,
    },
    {
      title: 'Evidence',
      detail: 'Attach screenshot, page path, and approximate timestamp to help support map the issue to account events.',
      icon: HelpCircle,
    },
    {
      title: 'Billing Context',
      detail: 'If payment is involved, include the plan, cycle, and whether checkout, verification, or webhook behavior seems inconsistent.',
      icon: CreditCard,
    },
  ];

  return (
    <section className="border-t border-zinc-200 bg-gradient-to-b from-zinc-50 to-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">Case Checklist</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900">What to include before opening an account support case</h2>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            A complete case can cut resolution time significantly by reducing clarification loops.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">
          {checklist.map((item, idx) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="relative rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
                <span className="absolute right-5 top-5 text-xs font-bold text-zinc-400">{(idx + 1).toString().padStart(2, '0')}</span>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{item.detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FaqQuickNavigationSection() {
  const groups = [
    {
      title: 'Product Fit',
      items: ['What Intel Trader actually does', 'Who the platform is for', 'How it differs from standard charting tools'],
    },
    {
      title: 'Plan & Access',
      items: ['How to choose the right plan', 'What changes after payment', 'What to do when access does not match plan'],
    },
    {
      title: 'Support Routing',
      items: ['When to use Help Center', 'When to use Account Support', 'When to use Contact for commercial needs'],
    },
  ];

  return (
    <section className="border-t border-zinc-200 bg-zinc-950 py-16 sm:py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-400">FAQ Navigator</p>
          <h2 className="mt-3 text-3xl font-bold">Find your question category quickly</h2>
          <p className="mt-4 text-lg leading-8 text-zinc-300">
            Use this map to move directly to the type of answer you need instead of scanning every question in sequence.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-3">
          {groups.map((group) => (
            <article key={group.title} className="rounded-3xl border border-zinc-800 bg-zinc-900/75 p-5 sm:p-6">
              <h3 className="text-xl font-semibold text-white">{group.title}</h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-7 text-zinc-300">
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
