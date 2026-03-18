import type { PublicPageContent } from '@/components/PublicPageTemplate';

export const aboutPageContent: PublicPageContent = {
  title: 'About',
  description: 'Learn what Intel Trader is building and why the platform focuses on structured forex intelligence.',
  eyebrow: 'Company',
  heroTitle: 'Intel Trader was built to make market interpretation more structured, faster, and more professional.',
  heroBody: 'Intel Trader exists because many traders still work with fragmented context, manual chart watching, and disconnected tools that slow down judgment. The platform is designed to turn that scattered process into one coordinated intelligence workflow.',
  heroDetail: 'Our aim is not to replace trader judgment, but to give it better structure. We want strength, structure, breakout pressure, liquidity context, and ranked opportunities to live inside one environment that supports better decisions.',
  stats: [
    { label: 'Mission', value: 'Clarity', detail: 'Help traders reduce noise and work from clearer market context.' },
    { label: 'Model', value: 'Multi-Engine', detail: 'Use several analytical lenses together instead of one isolated indicator view.' },
    { label: 'Audience', value: 'Serious Users', detail: 'Built for traders and teams who want a more operational workflow.' },
  ],
  sections: [
    {
      eyebrow: 'Purpose',
      title: 'Why the product exists',
      intro: 'The platform was created because more data has not automatically led to better decisions. Traders often have too much information, too little prioritization, and no clean way to read the market as one evolving story.',
      cards: [
        { title: 'Less manual scanning', body: 'Intel Trader continuously monitors the market so users can spend less time hunting and more time evaluating already-qualified setups.' },
        { title: 'Better context', body: 'The product brings together market pressure, structural behavior, breakout awareness, and ranking so users can read a stronger market narrative.' },
        { title: 'More disciplined attention', body: 'By prioritizing what deserves focus, the platform helps traders avoid spreading attention across too many average ideas.' },
      ],
    },
    {
      eyebrow: 'Belief',
      title: 'What we think good trading software should do',
      intro: 'Good software should improve the decision process itself. That means faster interpretation, more transparent system behavior, and a design that respects how users operate under market pressure.',
      cards: [
        { title: 'Support judgment', body: 'The platform should help users think more clearly, not bury them under decorative complexity.' },
        { title: 'Scale with seriousness', body: 'A product should remain usable for newer traders while still providing depth for advanced operators and teams.' },
        { title: 'Earn trust', body: 'Reliable product behavior, visible system state, and repeatable workflows matter as much as visual polish.' },
      ],
    },
  ],
  cta: {
    title: 'See how the product is organized.',
    body: 'The best follow-up is to explore the platform and feature pages, where the command workflow and analytical modules are described in more detail.',
    primaryHref: '/platform',
    primaryLabel: 'Explore Platform',
    secondaryHref: '/features',
    secondaryLabel: 'View Features',
  },
};

export const contactPageContent: PublicPageContent = {
  title: 'Contact',
  description: 'Contact Intel Trader for product, commercial, or operational enquiries.',
  eyebrow: 'Company',
  heroTitle: 'Contact Intel Trader for product questions, partnerships, support direction, or platform discussions.',
  heroBody: 'This page is for users, teams, and prospective customers who need the right path into the Intel Trader team. Different requests need different handling, and a structured contact path leads to faster, more useful responses.',
  heroDetail: 'The best enquiries explain the use case, the objective, and any constraints such as team size, country, billing context, or workflow need. That helps us route the conversation correctly from the start.',
  stats: [
    { label: 'General', value: 'Product Enquiries', detail: 'Questions about capability, fit, workflow, or plan selection.' },
    { label: 'Commercial', value: 'Partnerships', detail: 'Requests related to institutional usage, deployment, or strategic collaboration.' },
    { label: 'Operational', value: 'Support Routing', detail: 'Questions that need the correct support or technical ownership path.' },
  ],
  sections: [
    {
      eyebrow: 'Channels',
      title: 'Choose the contact route that matches your need',
      intro: 'Not every request should go into the same queue. Product evaluation, support, and commercial discussions each benefit from different context and different responders.',
      cards: [
        { title: 'Product and onboarding', body: 'Use this path for questions about what Intel Trader does, which plan fits your workflow, and how the dashboard can support your current trading process.' },
        { title: 'Commercial and institutional', body: 'Use this path for team deployments, strategic relationships, advanced onboarding, or conversations that involve scaling the platform beyond one user.' },
        { title: 'Operational and technical', body: 'Use this route when the issue involves platform behavior, access, configuration, or a workflow that appears to be behaving incorrectly.' },
      ],
    },
    {
      eyebrow: 'Best Practice',
      title: 'What to include in a useful enquiry',
      intro: 'The fastest conversations usually begin with enough context to make the reply specific rather than generic.',
      cards: [
        { title: 'State your trading context', body: 'Mention whether you are a retail trader, educator, analyst, desk, or team. Also mention what kind of market coverage or workflow matters most to you.' },
        { title: 'Explain the goal', body: 'Say whether you need stronger monitoring, better ranking, team coordination, plan guidance, or account support. The objective matters more than a vague feature request.' },
        { title: 'Include constraints', body: 'If country, billing, support urgency, compliance needs, or deployment expectations are relevant, mention them early so the conversation starts on practical ground.' },
      ],
    },
  ],
  cta: {
    title: 'Need support rather than a general enquiry?',
    body: 'If the issue is tied to account access, billing, or plan state, the Account Support and Help Center pages will get you to the right path faster.',
    primaryHref: '/account-support',
    primaryLabel: 'Open Account Support',
    secondaryHref: '/help-center',
    secondaryLabel: 'Visit Help Center',
  },
};

export const careersPageContent: PublicPageContent = {
  title: 'Careers',
  description: 'Understand how Intel Trader thinks about hiring, product quality, and working on serious trading software.',
  eyebrow: 'Company',
  heroTitle: 'Careers at Intel Trader are about building a serious market-intelligence product with long-term value.',
  heroBody: 'We are interested in people who care about clarity, user trust, and the quality of systems under real usage. Intel Trader is not just a front-end project or a chart wrapper. It is a decision-support platform that must be reliable, understandable, and professionally useful.',
  heroDetail: 'That means we value ownership, product judgment, and people who can improve the system itself rather than only complete isolated tasks.',
  stats: [
    { label: 'Culture', value: 'Ownership', detail: 'We value contributors who think about outcomes, not only tasks.' },
    { label: 'Standard', value: 'Quality', detail: 'We care about runtime behavior, readability, trust, and user impact.' },
    { label: 'Focus', value: 'Usefulness', detail: 'The product must remain valuable under real trading pressure and real workflows.' },
  ],
  sections: [
    {
      eyebrow: 'Working Style',
      title: 'How we think about building',
      intro: 'The best work here combines technical ability, workflow thinking, and respect for how users actually experience market pressure.',
      cards: [
        { title: 'Operational engineering', body: 'We want engineers who care about data quality, reliability, observability, and how changes behave once users depend on them daily.' },
        { title: 'Purposeful design', body: 'Dense information needs disciplined design. We value designers who can make complex workflows readable without flattening them into generic patterns.' },
        { title: 'User-centered operations', body: 'Support and onboarding matter because a good product still fails if people cannot adopt it clearly and confidently.' },
      ],
    },
    {
      eyebrow: 'Hiring Lens',
      title: 'What we value in contributors',
      intro: 'We prefer thoughtful contributors who improve systems, communicate tradeoffs clearly, and leave behind work others can build on.',
      cards: [
        { title: 'Comfort with complexity', body: 'The product spans interfaces, live data, workflow logic, and user trust. We value people who can think across those boundaries carefully.' },
        { title: 'Clear documentation', body: 'Strong written communication helps preserve reasoning, explain constraints, and keep a growing product understandable over time.' },
        { title: 'Respect for user pressure', body: 'Our users make time-sensitive decisions. Every confusing flow or unreliable behavior has a higher cost in that environment.' },
      ],
    },
  ],
  cta: {
    title: 'Understand the product direction first.',
    body: 'If you want better context before a career conversation, the About and Technology pages explain what Intel Trader is trying to build and why.',
    primaryHref: '/about',
    primaryLabel: 'Read About Us',
    secondaryHref: '/technology',
    secondaryLabel: 'See Technology',
  },
};

export const platformPageContent: PublicPageContent = {
  title: 'Platform',
  description: 'Review how Intel Trader organizes its command-center workflow and analytical layers.',
  eyebrow: 'Platform',
  heroTitle: 'The platform is designed as one coordinated intelligence environment, not a scattered collection of tools.',
  heroBody: 'Intel Trader is organized around a command workflow that helps users move from broad market awareness to ranked action. The goal is to make multiple analytical engines work together inside one readable operating surface.',
  heroDetail: 'This structure is valuable because traders often need to compare currencies, read structure, assess breakout pressure, evaluate liquidity, and prioritize opportunities without losing time to unnecessary switching costs.',
  stats: [
    { label: 'Structure', value: 'Unified', detail: 'The main modules are intended to reinforce one another rather than compete for attention.' },
    { label: 'Flow', value: 'Prioritized', detail: 'The workflow is built to surface what matters first.' },
    { label: 'Fit', value: 'Daily Use', detail: 'The product is meant for repeated operational use, not occasional inspection.' },
  ],
  sections: [
    {
      eyebrow: 'Workflow',
      title: 'How the command-center model works',
      intro: 'The platform is most useful when used as a sequence: understand pressure, read structure, observe event risk, and then focus on the strongest setups.',
      cards: [
        { title: 'Read broad market pressure', body: 'Start by understanding which currencies are strengthening or weakening so the market can be viewed as a system rather than as isolated pairs.' },
        { title: 'Assess structure and transition', body: 'Review channel behavior, compression, and breakout context to determine whether a market is stable, expanding, or nearing a meaningful shift.' },
        { title: 'Rank what deserves attention', body: 'Use opportunity ranking to focus on the best candidates instead of giving equal attention to every setup on the screen.' },
      ],
    },
    {
      eyebrow: 'Audience',
      title: 'Who the platform is built to support',
      intro: 'Intel Trader is intended to remain understandable for newer users while still supporting deeper workflows for advanced traders and teams.',
      cards: [
        { title: 'Retail traders', body: 'Retail users benefit from stronger context, better prioritization, and a cleaner analytical workflow than they would get from disconnected chart tools alone.' },
        { title: 'Advanced independents', body: 'Serious independent traders can use the platform as an operating layer for faster monitoring, earlier context, and better setup qualification.' },
        { title: 'Institutional teams', body: 'Teams benefit from shared market views, more consistent interpretation, and a stronger foundation for supervision and coordinated decision workflows.' },
      ],
    },
  ],
  cta: {
    title: 'Go deeper into the platform itself.',
    body: 'The Features and Technology pages explain the modules and analytical design in more detail.',
    primaryHref: '/features',
    primaryLabel: 'View Features',
    secondaryHref: '/technology',
    secondaryLabel: 'View Technology',
  },
};

export const featuresPageContent: PublicPageContent = {
  title: 'Features',
  description: 'Review the major features inside Intel Trader and how they support market interpretation.',
  eyebrow: 'Platform',
  heroTitle: 'Intel Trader features are built to improve decision quality, not simply to add more indicators.',
  heroBody: 'Each core feature solves a real workflow problem, whether that problem is weak context, slow prioritization, poor alert discipline, or unclear structural interpretation.',
  heroDetail: 'The features are designed to remain useful individually while also creating more value when combined inside one command-center workflow.',
  stats: [
    { label: 'Coverage', value: 'Broad', detail: 'The feature set spans strength, structure, breakout context, liquidity, and ranking.' },
    { label: 'Goal', value: 'Decision Support', detail: 'Every feature should make action more informed or more disciplined.' },
    { label: 'Style', value: 'Operational', detail: 'The product is intended for session-by-session practical use.' },
  ],
  sections: [
    {
      eyebrow: 'Core Modules',
      title: 'The main features answer different but connected questions',
      intro: 'A strong workflow needs to know where pressure exists, how structure looks, where expansion risk is building, and which setup deserves focus first.',
      cards: [
        { title: 'Currency strength', body: 'Shows relative pressure across currencies so users can identify broader directional imbalance and better-aligned pair combinations.' },
        { title: 'Channel and structure analysis', body: 'Helps users understand whether price is trending, compressing, or transitioning across timeframes.' },
        { title: 'Breakout detection', body: 'Surfaces areas where price may be preparing for meaningful expansion beyond structural boundaries.' },
        { title: 'Liquidity intelligence', body: 'Adds attention to likely pools, sweeps, and reaction zones so market intent becomes easier to interpret.' },
        { title: 'Opportunity ranking', body: 'Prioritizes stronger setup candidates so users can allocate attention more intelligently.' },
        { title: 'Alert history and review', body: 'Provides continuity by showing what the system surfaced and how signals can be reviewed after the fact.' },
      ],
    },
    {
      eyebrow: 'Practical Value',
      title: 'Why these features matter together',
      intro: 'The product becomes more useful when the modules reduce friction across the whole session rather than acting like isolated widgets.',
      cards: [
        { title: 'Lower chart fatigue', body: 'Continuous monitoring reduces the time users spend searching manually for what matters.' },
        { title: 'Better prioritization', body: 'Ranking and context make it easier to focus on stronger opportunities during active sessions.' },
        { title: 'Stronger review discipline', body: 'A good product helps users not only act in the moment but also understand how the analytical workflow behaved afterward.' },
      ],
    },
  ],
  cta: {
    title: 'See the architecture behind the features.',
    body: 'If the feature model makes sense, the Technology page is the next place to understand how the platform is evolving under the hood.',
    primaryHref: '/technology',
    primaryLabel: 'Open Technology',
    secondaryHref: '/pricing',
    secondaryLabel: 'Compare Pricing',
  },
};

export const technologyPageContent: PublicPageContent = {
  title: 'Technology',
  description: 'Understand the analytical and architectural thinking behind Intel Trader.',
  eyebrow: 'Platform',
  heroTitle: 'The technology behind Intel Trader is focused on live interpretation, modular intelligence, and operational trust.',
  heroBody: 'Intel Trader is meant to be more than a front-end around market data. The platform is organized around services and analytical layers that translate live information into more readable and actionable market context.',
  heroDetail: 'That means the technology story includes how data is handled, how intelligence is derived, and how the interface exposes that work without overwhelming the trader.',
  stats: [
    { label: 'Architecture', value: 'Modular', detail: 'Different responsibilities are separated into focused analytical services and views.' },
    { label: 'Data Goal', value: 'Live Context', detail: 'Incoming market behavior is converted into interpretable workflow outputs.' },
    { label: 'Trust', value: 'Observable', detail: 'System state, feed freshness, and reliability need to remain visible.' },
  ],
  sections: [
    {
      eyebrow: 'Analytical Design',
      title: 'Technology should make market complexity more readable',
      intro: 'A market-intelligence platform should do more than display candles. It should organize market behavior into outputs that improve comprehension, prioritization, and review.',
      cards: [
        { title: 'Multi-engine interpretation', body: 'Strength, structure, breakout, liquidity, and ranking each contribute their own focused perspective instead of forcing one overloaded signal layer.' },
        { title: 'Derived signals and alerts', body: 'Technology becomes more useful when it translates raw movement into rankings, classifications, and alerts that the user can actually work with.' },
        { title: 'Workflow-aware presentation', body: 'The interface is part of the system design because how information is grouped and refreshed directly affects trader trust and speed.' },
      ],
    },
    {
      eyebrow: 'Direction',
      title: 'Where the technical maturity needs to go',
      intro: 'Over time, a serious intelligence platform needs stronger feed handling, better persistence, deeper explainability, and more research-grade analytical depth.',
      cards: [
        { title: 'Feed health and fallback awareness', body: 'Users should understand when data is live, cached, degraded, or unavailable so signal trust is grounded in system reality.' },
        { title: 'Persisted intelligence history', body: 'Stored alerts, preferences, and historical context help users review the system’s behavior over time rather than operating only in the current moment.' },
        { title: 'Future research layers', body: 'Long-term competitiveness depends on richer backtesting, model governance, drift monitoring, and more explainable intelligence outputs.' },
      ],
    },
  ],
  cta: {
    title: 'See how the technology becomes a user-facing workflow.',
    body: 'The Platform and Features pages describe how the system design translates into the practical command-center experience.',
    primaryHref: '/platform',
    primaryLabel: 'Explore Platform',
    secondaryHref: '/features',
    secondaryLabel: 'Explore Features',
  },
};

export const helpCenterPageContent: PublicPageContent = {
  title: 'Help Center',
  description: 'Find guidance for onboarding, workflow understanding, and common support questions in Intel Trader.',
  eyebrow: 'Support',
  heroTitle: 'The Help Center is meant to make common product questions easier to resolve without friction.',
  heroBody: 'A good help experience should reduce confusion quickly. This page is for users who need structured guidance around onboarding, product understanding, and routine workflow interpretation before opening a more specific support case.',
  heroDetail: 'By organizing the most common help areas clearly, the platform can make support more useful and reduce avoidable back-and-forth for both users and the support team.',
  stats: [
    { label: 'Goal', value: 'Fast Clarity', detail: 'The Help Center is designed to answer common questions before escalation is needed.' },
    { label: 'Best For', value: 'Guided Use', detail: 'Ideal for orientation, setup understanding, and feature interpretation.' },
    { label: 'Outcome', value: 'Better Escalation', detail: 'Clear self-service makes later support requests sharper and faster.' },
  ],
  sections: [
    {
      eyebrow: 'Common Topics',
      title: 'Where most users usually need help',
      intro: 'Most requests start with onboarding, plan understanding, or interpreting what the product is showing. Organizing those topics well makes the whole support experience more effective.',
      cards: [
        { title: 'Getting started', body: 'Use this area to understand what the command center shows first, which modules matter initially, and how to navigate the product with confidence.' },
        { title: 'Plan and subscription understanding', body: 'Use this area to compare package access, understand upgrades, and clarify which features should be available on your current subscription.' },
        { title: 'Feature interpretation', body: 'Use this area when the module is visible but you need help understanding what a ranking, alert, or liquidity state is trying to communicate.' },
      ],
    },
    {
      eyebrow: 'Escalation',
      title: 'When a help article is not enough',
      intro: 'General guidance works for orientation. Once the issue involves a specific account, payment, or technical inconsistency, it is better to move directly to a more targeted support path.',
      cards: [
        { title: 'Account-specific issues', body: 'If the problem depends on one user profile, payment record, role, or entitlement state, move to Account Support rather than staying in general help content.' },
        { title: 'Unexpected product behavior', body: 'If the product appears inconsistent, stale, or incomplete, gather a screenshot, page name, and approximate time so support can investigate with useful context.' },
        { title: 'Commercial or team requests', body: 'If the question is about multi-user rollout, institutional setup, or special arrangements, Contact is usually a better path than general self-service.' },
      ],
    },
  ],
  cta: {
    title: 'Need account-level support instead?',
    body: 'If the issue is tied to billing, access, role, or subscription state, the Account Support page is the right next step.',
    primaryHref: '/account-support',
    primaryLabel: 'Go to Account Support',
    secondaryHref: '/contact',
    secondaryLabel: 'Contact Us',
  },
};

export const accountSupportPageContent: PublicPageContent = {
  title: 'Account Support',
  description: 'Get help for login state, billing, subscriptions, permissions, and other account-specific support needs.',
  eyebrow: 'Support',
  heroTitle: 'Account Support is for issues that depend on your specific user account, plan, role, or billing state.',
  heroBody: 'Some issues cannot be solved by a general article because they depend on account identity, payment status, entitlements, session state, or administrative configuration. This page is for those cases.',
  heroDetail: 'The best requests include the affected email address, the expected behavior, the actual behavior, and a screenshot or timestamp where possible. That context shortens resolution time significantly.',
  stats: [
    { label: 'Scope', value: 'User Specific', detail: 'This path is designed for issues tied to one account and its current state.' },
    { label: 'Common Need', value: 'Billing and Access', detail: 'Most requests here involve plans, payments, roles, or session behavior.' },
    { label: 'Best Input', value: 'Precise Detail', detail: 'Clear context leads to faster diagnosis and fewer follow-up questions.' },
  ],
  sections: [
    {
      eyebrow: 'Support Scope',
      title: 'What Account Support should handle',
      intro: 'If the question depends on data unique to your account, this is usually the correct support route.',
      cards: [
        { title: 'Login and session issues', body: 'Use this route if access state, logout state, or session behavior seems inconsistent with what should happen for your account.' },
        { title: 'Plan and entitlement issues', body: 'Use this route if a subscription changed but the dashboard, unlocked modules, or privileges do not match what you expected.' },
        { title: 'Billing and verification questions', body: 'Use this route for payment confirmation, verification, invoice logic, and account behavior after a successful or pending payment event.' },
      ],
    },
    {
      eyebrow: 'Faster Resolution',
      title: 'What to include in your request',
      intro: 'Support is faster when the request explains the issue in a way that can be checked against account data and product behavior.',
      cards: [
        { title: 'Affected account email', body: 'Always provide the exact email address involved so the correct user record can be reviewed without guesswork.' },
        { title: 'Expected outcome', body: 'Explain what should have happened, such as a role change taking effect, a plan unlocking a module, or a payment activating a subscription.' },
        { title: 'Screenshot and time reference', body: 'Whenever possible, include the page, screenshot, and approximate time so the issue can be matched against logs and recent account events.' },
      ],
    },
  ],
  cta: {
    title: 'Looking for general product help instead?',
    body: 'If your question is not tied to one specific account, the Help Center and FAQ pages are usually a better place to begin.',
    primaryHref: '/help-center',
    primaryLabel: 'Open Help Center',
    secondaryHref: '/faq',
    secondaryLabel: 'Read FAQ',
  },
};

export const faqPageContent: PublicPageContent = {
  title: 'FAQ',
  description: 'Read frequently asked questions about Intel Trader, its workflow, support, pricing, and user fit.',
  eyebrow: 'Support',
  heroTitle: 'The FAQ page answers the questions serious users ask before they adopt Intel Trader fully.',
  heroBody: 'A useful FAQ should reduce uncertainty, not just repeat marketing lines. This page is meant to help users understand what the platform does, who it is for, and how support and subscriptions work in practice.',
  heroDetail: 'It is especially useful for first-time evaluators who want enough context to move forward confidently without needing immediate direct support.',
  stats: [
    { label: 'Purpose', value: 'Evaluation', detail: 'The FAQ is most useful when users are deciding whether the product fits their workflow.' },
    { label: 'Topics', value: 'Product to Support', detail: 'Questions cover capability, audience, plans, and operational support.' },
    { label: 'Outcome', value: 'Clearer Next Step', detail: 'Each answer should make it easier to know where to go next.' },
  ],
  sections: [
    {
      eyebrow: 'Product Questions',
      title: 'What users usually want to know first',
      intro: 'Before adoption, traders usually want to know what the platform really does, who it is for, and how it differs from normal charting software.',
      cards: [
        { title: 'What does Intel Trader actually do?', body: 'It helps traders interpret live forex markets through a combined workflow of strength, structure, breakout context, liquidity awareness, ranking, and alerts.' },
        { title: 'Who is the platform for?', body: 'It supports ambitious retail traders, more advanced independent operators, and team or institutional workflows that need stronger structure and coordination.' },
        { title: 'How is it different from charting software?', body: 'A charting platform mainly displays price. Intel Trader adds organized interpretation and prioritization so the market is easier to evaluate with discipline.' },
      ],
    },
    {
      eyebrow: 'Support Questions',
      title: 'What users ask about plans and support',
      intro: 'Adoption decisions are often influenced by how clearly the platform handles support, account issues, and plan understanding.',
      cards: [
        { title: 'How do I choose the right plan?', body: 'The right plan depends on how much market coverage, dashboard depth, and workflow flexibility you need. Simpler needs suit entry tiers, while teams and advanced users usually need broader access.' },
        { title: 'Where do I go for account problems?', body: 'If the issue involves billing, login state, plan access, role state, or payment behavior, Account Support is the right route.' },
        { title: 'Can the platform support Nigerian and international users?', body: 'Yes. Intel Trader supports both Nigerian and international usage, including NGN pricing context alongside broader global workflow needs.' },
      ],
    },
  ],
  cta: {
    title: 'Need something more specific than a frequently asked question?',
    body: 'If your situation is tied to your account or your commercial use case, Contact and Account Support are the right follow-up pages.',
    primaryHref: '/contact',
    primaryLabel: 'Contact Intel Trader',
    secondaryHref: '/account-support',
    secondaryLabel: 'Account Support',
  },
};
