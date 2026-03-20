import type { PublicPageContent } from '@/components/PublicPageTemplate';

export const aboutPageContent: PublicPageContent = {
  title: 'About',
  description: 'Learn what Intel Trader is building and why the platform focuses on structured forex intelligence.',
  eyebrow: 'Company',
  heroTitle: 'Intel Trader was built to make market interpretation more structured, faster, and more professionally actionable.',
  heroBody: 'Intel Trader exists because too many forex workflows still depend on fragmented chart watching, improvised analysis, and disconnected tools that force traders to rebuild context manually every session. That creates unnecessary delay, inconsistent judgment, and a higher likelihood of acting on partial information instead of a complete market view.',
  heroDetail: 'Our aim is not to replace trader judgment. It is to give judgment better structure. We want strength, structure, breakout pressure, liquidity context, and ranked opportunities to sit inside one operating environment that helps traders move from observation to decision with more discipline, continuity, and confidence.',
  stats: [
    { label: 'Mission', value: 'Clarity', detail: 'Help traders reduce noise, organize attention better, and work from clearer market context.' },
    { label: 'Model', value: 'Multi-Engine', detail: 'Use several analytical lenses together instead of forcing one overloaded indicator view to do everything.' },
    { label: 'Audience', value: 'Serious Users', detail: 'Built for traders and teams who want a more operational workflow rather than another passive charting layer.' },
  ],
  highlights: [
    { title: 'Built around workflow quality', body: 'Intel Trader is designed to improve how traders interpret markets session by session, not simply to display more data or more indicators.' },
    { title: 'Judgment remains with the user', body: 'The product is meant to strengthen decision structure and context, not replace trader discretion or flatten analysis into blind automation.' },
    { title: 'Long-term direction is operational depth', body: 'The platform is moving toward stronger review, explainability, and coordination between market intelligence and disciplined execution workflows.' },
  ],
  process: {
    eyebrow: 'Company Lens',
    title: 'How to understand Intel Trader quickly',
    intro: 'The simplest way to understand the product is to look at the problem first, the workflow second, and the long-term operating model third.',
    steps: [
      { label: 'Problem', title: 'Start with the workflow gap', body: 'Intel Trader begins from the idea that many traders work with fragmented tools and weak prioritization, which leads to scattered interpretation and inconsistent decisions.' },
      { label: 'Approach', title: 'Then look at the coordinated model', body: 'The platform combines multiple analytical layers so traders can form context, compare scenarios, and focus attention without rebuilding the same picture manually every session.' },
      { label: 'Direction', title: 'Finally, consider the operating ambition', body: 'The long-term goal is to support not only live interpretation, but stronger review, explainability, planning, and workflow discipline around the full decision cycle.' },
    ],
  },
  timeline: {
    eyebrow: 'Product Evolution',
    title: 'How Intel Trader thinking has progressed',
    intro: 'The product direction matured from solving fragmented chart usage to building a full operating layer for clearer and more disciplined market interpretation.',
    items: [
      { phase: 'Stage One', title: 'Problem recognition', body: 'The initial focus was understanding why traders with abundant data still experienced weak prioritization and inconsistent decision structure.' },
      { phase: 'Stage Two', title: 'Coordinated intelligence design', body: 'The core architecture moved toward combining strength, structure, liquidity, and ranking so context could be formed more coherently.' },
      { phase: 'Stage Three', title: 'Operational workflow refinement', body: 'The product expanded from feature availability to workflow quality, aiming to reduce friction between observation, qualification, and attention allocation.' },
    ],
  },
  sections: [
    {
      eyebrow: 'Purpose',
      title: 'Why the product exists',
      intro: 'The platform was created because more data has not automatically led to better decisions. Traders often have too much information, too little prioritization, and no clean way to read the market as one evolving story across pressure, structure, timing, and opportunity quality.',
      cards: [
        { title: 'Less manual scanning', body: 'Intel Trader continuously monitors the market so users can spend less time hunting through pair after pair and more time evaluating already-qualified setups with real decision value.' },
        { title: 'Better context', body: 'The product brings together market pressure, structural behavior, breakout awareness, liquidity context, and ranking so users can work from a stronger and more coherent market narrative instead of isolated signals.' },
        { title: 'More disciplined attention', body: 'By prioritizing what deserves focus first, the platform helps traders avoid spreading attention across too many average ideas and encourages a more selective, process-driven session workflow.' },
      ],
    },
    {
      eyebrow: 'Belief',
      title: 'What we think good trading software should do',
      intro: 'Good software should improve the decision process itself. That means faster interpretation, more transparent system behavior, clearer prioritization, and a design that respects how users operate under market pressure rather than adding decorative complexity around the same old workflow problems.',
      cards: [
        { title: 'Support judgment', body: 'The platform should help users think more clearly, compare scenarios more quickly, and operate with less ambiguity. It should not bury them under decorative complexity or forced novelty.' },
        { title: 'Scale with seriousness', body: 'A product should remain understandable for newer traders while still providing the depth, continuity, and operational fit required by advanced independent operators and professional teams.' },
        { title: 'Earn trust', body: 'Reliable product behavior, visible system state, explainable outputs, and repeatable workflows matter as much as visual polish because traders rely on timing, confidence, and consistency under pressure.' },
      ],
    },
    {
      eyebrow: 'Direction',
      title: 'How we want Intel Trader to evolve',
      intro: 'Long term, we want Intel Trader to mature into a platform that supports not just interpretation in the moment, but review, governance, workflow consistency, and stronger coordination between market intelligence and trade execution discipline.',
      cards: [
        { title: 'Deeper historical intelligence', body: 'We want users to understand not only what the system is showing now, but how similar market conditions and alerts behaved over time so review becomes part of the workflow instead of an afterthought.' },
        { title: 'Stronger explainability', body: 'The best intelligence systems do not only produce outputs. They help users understand why attention is being directed somewhere, what conditions matter, and what changed in the underlying market picture.' },
        { title: 'More operational coordination', body: 'As the platform grows, it should support better links between market context, planning, alert review, trade journaling, and performance learning so traders can build a more complete decision process around it.' },
      ],
    },
  ],
  faqs: [
    {
      question: 'Is Intel Trader trying to replace trader discretion?',
      answer: 'No. The platform is meant to improve the structure around trader discretion, not remove it. It helps organize context, prioritize attention, and make the analytical process more repeatable, but final judgment still belongs to the user.',
    },
    {
      question: 'Why focus so heavily on structure instead of just speed?',
      answer: 'Speed without structure often produces fast but inconsistent decisions. Intel Trader is designed around the idea that better process quality leads to better action quality, especially when the market is active and attention is limited.',
    },
    {
      question: 'What makes the product different from a generic trading dashboard?',
      answer: 'The difference is coordination. Instead of presenting isolated tools, Intel Trader is organized around multiple intelligence layers that work together so pressure, structure, liquidity, and ranking can be interpreted as one evolving picture.',
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
  heroBody: 'This page is for users, teams, and prospective customers who need the right path into the Intel Trader team. Different requests need different handling, and a structured contact path leads to faster, more useful responses with less back-and-forth and less ambiguity.',
  heroDetail: 'The best enquiries explain the use case, the objective, and any constraints such as team size, country, billing context, workflow maturity, or operational requirement. That helps us route the conversation correctly from the start and respond with guidance that is specific rather than generic.',
  stats: [
    { label: 'General', value: 'Product Enquiries', detail: 'Questions about capability, fit, workflow, onboarding, or plan selection.' },
    { label: 'Commercial', value: 'Partnerships', detail: 'Requests related to team usage, deployment, strategic collaboration, or advanced onboarding.' },
    { label: 'Operational', value: 'Support Routing', detail: 'Questions that need the correct support, billing, or technical ownership path.' },
  ],
  highlights: [
    { title: 'Use the right route early', body: 'A well-routed message gets a more useful response faster than sending every request into the same general queue.' },
    { title: 'Specific context improves response quality', body: 'Clear details about workflow, goals, country, billing context, or team size make it easier to respond with practical guidance instead of generic copy.' },
    { title: 'Contact is broader than support', body: 'This page is suitable for product evaluation, team rollout discussions, commercial conversations, and operational direction when the issue is not purely account-specific.' },
  ],
  process: {
    eyebrow: 'Best Contact Flow',
    title: 'How to get a strong first response',
    intro: 'A better reply usually starts with choosing the right route, framing the need clearly, and providing just enough detail to avoid a clarification loop.',
    steps: [
      { label: 'Route', title: 'Choose the right contact path', body: 'Decide whether your message is about product fit, commercial rollout, or operational support direction before you send it.' },
      { label: 'Context', title: 'Describe your actual situation', body: 'State your role, trading context, workflow needs, and any important operational or billing constraints that shape the request.' },
      { label: 'Outcome', title: 'Say what you need next', body: 'Make it clear whether you want sales guidance, onboarding direction, a commercial discussion, or a route to the right support owner.' },
    ],
  },
  timeline: {
    eyebrow: 'Contact Workflow',
    title: 'What usually happens after you reach out',
    intro: 'A good enquiry flow routes the request correctly, gathers the right context, and then returns a response format aligned with your actual goal.',
    items: [
      { phase: 'Intake', title: 'Request is categorized', body: 'Your message is categorized as product, commercial, or operational so it can be handled by the most relevant path from the start.' },
      { phase: 'Clarification', title: 'Context is validated', body: 'If needed, key details are clarified around workflow goals, constraints, and expected next step to avoid mismatched guidance.' },
      { phase: 'Response', title: 'Guidance is delivered', body: 'You receive direction tailored to your case, whether that means onboarding guidance, commercial follow-up, or account-specific support routing.' },
    ],
  },
  sections: [
    {
      eyebrow: 'Channels',
      title: 'Choose the contact route that matches your need',
      intro: 'Not every request should go into the same queue. Product evaluation, support, and commercial discussions each benefit from different context and different responders. Using the right route early usually means a faster reply and a much more useful first conversation.',
      cards: [
        { title: 'Product and onboarding', body: 'Use this path for questions about what Intel Trader does, how the platform fits your current trading workflow, which plan is appropriate, and what a sensible onboarding path looks like for your level of experience.' },
        { title: 'Commercial and team deployment', body: 'Use this path for team rollouts, partnership discussions, strategic relationships, higher-touch onboarding, or conversations that involve scaling the platform beyond one user or one account.' },
        { title: 'Operational and technical direction', body: 'Use this route when the issue involves platform behavior, access, configuration, workflow inconsistency, or something that appears to be behaving incorrectly and needs investigation or clarification.' },
      ],
    },
    {
      eyebrow: 'Best Practice',
      title: 'What to include in a useful enquiry',
      intro: 'The fastest conversations usually begin with enough context to make the reply specific rather than generic. A short but well-structured enquiry often produces a better response than a long message with unclear direction.',
      cards: [
        { title: 'State your trading context', body: 'Mention whether you are a retail trader, educator, analyst, proprietary desk, or team. Also mention what kind of market coverage, automation, review process, or workflow discipline matters most to you.' },
        { title: 'Explain the goal', body: 'Say whether you need stronger monitoring, better setup ranking, team coordination, onboarding guidance, account support, or plan selection help. The objective matters more than a vague feature request.' },
        { title: 'Include constraints', body: 'If country, billing expectations, urgency, deployment requirements, support needs, or compliance considerations are relevant, mention them early so the conversation starts on practical ground rather than assumptions.' },
      ],
    },
    {
      eyebrow: 'Response Quality',
      title: 'How to help us respond well the first time',
      intro: 'A strong first response depends on being able to understand the request quickly, route it correctly, and answer with the right level of commercial, technical, or workflow detail.',
      cards: [
        { title: 'Be concrete about the workflow', body: 'If you are evaluating the platform, explain what you are replacing today, what feels slow or unreliable in your current process, and what would count as a meaningful improvement.' },
        { title: 'Separate support from evaluation', body: 'If the issue is account-specific, say so clearly. If the request is exploratory or commercial, make that explicit too. This avoids losing time in the wrong queue.' },
        { title: 'Include follow-up expectations', body: 'If you need a call, a written overview, sales follow-up, or a direct support answer, mention that upfront so the response format matches what you actually need next.' },
      ],
    },
  ],
  faqs: [
    {
      question: 'Should I use Contact for account problems?',
      answer: 'Only if the issue is general in nature. If it depends on your specific account, payment state, plan access, or login behavior, Account Support is the better route because it is designed for account-level investigation.',
    },
    {
      question: 'What kind of message gets the best response?',
      answer: 'The best message explains who you are, what you are trying to achieve, what constraint matters most, and what kind of response you need next. That makes routing faster and the reply more useful.',
    },
    {
      question: 'Can teams or organizations use this page for commercial enquiries?',
      answer: 'Yes. The Contact page is appropriate for team deployment, strategic onboarding, workflow evaluation, or other discussions that go beyond individual self-service adoption.',
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
  heroBody: 'We are interested in people who care about clarity, user trust, and the quality of systems under real usage. Intel Trader is not just a front-end project or a chart wrapper. It is a decision-support platform that must be reliable, understandable, and professionally useful under conditions where users are working with time pressure and real financial consequence.',
  heroDetail: 'That means we value ownership, product judgment, clear communication, and people who can improve the system itself rather than only complete isolated tasks. We care about the quality of decisions behind the work, not only the speed of shipping it.',
  stats: [
    { label: 'Culture', value: 'Ownership', detail: 'We value contributors who think about outcomes, tradeoffs, and long-term system quality, not only tasks.' },
    { label: 'Standard', value: 'Quality', detail: 'We care about runtime behavior, clarity, readability, trust, and user impact in equal measure.' },
    { label: 'Focus', value: 'Usefulness', detail: 'The product must remain valuable under real trading pressure, real support conditions, and real workflows.' },
  ],
  highlights: [
    { title: 'The bar is product seriousness', body: 'Intel Trader is built for contributors who care about clarity, trust, and outcomes, not just visible activity or isolated feature delivery.' },
    { title: 'Cross-functional quality matters', body: 'Engineering, design, documentation, support, and operations all contribute directly to how trustworthy the product feels in real use.' },
    { title: 'Good judgment compounds over time', body: 'The strongest contributors are the ones who improve system quality in durable ways, not only those who move quickly in the short term.' },
  ],
  process: {
    eyebrow: 'Working Here',
    title: 'How contribution quality is evaluated',
    intro: 'Strong work at Intel Trader usually follows a simple pattern: understand the user reality, improve the system thoughtfully, and leave behind something others can build on.',
    steps: [
      { label: 'Understand', title: 'Start with real user pressure', body: 'The product serves traders working under time pressure, so good work begins by understanding how confusion, delay, or weak reliability affects that environment.' },
      { label: 'Improve', title: 'Solve the system, not only the task', body: 'The best contributors strengthen product clarity, runtime trust, and workflow quality rather than treating each piece of work as an isolated ticket.' },
      { label: 'Sustain', title: 'Leave behind durable quality', body: 'Good work includes reasoning, documentation, and implementation choices that remain understandable and maintainable after the original contributor moves on.' },
    ],
  },
  timeline: {
    eyebrow: 'Working Model',
    title: 'How meaningful contribution usually unfolds',
    intro: 'Strong contributors typically move from understanding user pressure to improving product systems and then reinforcing long-term maintainability.',
    items: [
      { phase: 'Context', title: 'Understand the operational problem', body: 'Work starts with understanding where users lose clarity, trust, or speed in real trading workflows.' },
      { phase: 'Execution', title: 'Ship quality with clear reasoning', body: 'The goal is not only implementation, but implementation that is explainable, reliable, and aligned with product-level outcomes.' },
      { phase: 'Compounding', title: 'Leave durable improvements', body: 'High-value contributions improve the system in ways that remain useful and understandable to future contributors.' },
    ],
  },
  sections: [
    {
      eyebrow: 'Working Style',
      title: 'How we think about building',
      intro: 'The best work here combines technical ability, workflow thinking, product discipline, and respect for how users actually experience market pressure. Building serious trading software requires more than execution speed. It requires judgment about clarity, trust, performance, reliability, and operational fit.',
      cards: [
        { title: 'Operational engineering', body: 'We want engineers who care about data quality, runtime reliability, observability, failure modes, and how changes behave once users depend on them daily for session-by-session market interpretation.' },
        { title: 'Purposeful design', body: 'Dense information needs disciplined design. We value designers who can make complex workflows readable and fast to interpret without flattening them into generic patterns that hide important distinctions.' },
        { title: 'User-centered operations', body: 'Support, onboarding, and documentation matter because a good product still fails if people cannot adopt it clearly, trust it under pressure, or understand what the platform is trying to show them.' },
      ],
    },
    {
      eyebrow: 'Hiring Lens',
      title: 'What we value in contributors',
      intro: 'We prefer thoughtful contributors who improve systems, communicate tradeoffs clearly, and leave behind work others can build on. The strongest people in a product like this usually combine competence with care and clarity.',
      cards: [
        { title: 'Comfort with complexity', body: 'The product spans interfaces, live data, workflow logic, account systems, and user trust. We value people who can think carefully across those boundaries without losing precision.' },
        { title: 'Clear documentation', body: 'Strong written communication helps preserve reasoning, explain constraints, support future contributors, and keep a growing product understandable instead of becoming tribal knowledge.' },
        { title: 'Respect for user pressure', body: 'Our users make time-sensitive decisions. Every confusing flow, stale state, or unreliable behavior has a higher cost in that environment, so we value people who take clarity and robustness seriously.' },
      ],
    },
    {
      eyebrow: 'Environment',
      title: 'What kind of work environment this creates',
      intro: 'The culture we want is direct, thoughtful, and outcome-focused. We want people who can discuss tradeoffs honestly, challenge weak assumptions, and still move work forward responsibly.',
      cards: [
        { title: 'High ownership, low ceremony', body: 'We prefer practical execution and sound reasoning over performative process. The goal is to maintain quality without turning the work into administrative theater.' },
        { title: 'Cross-functional respect', body: 'Product, engineering, design, support, and operations all shape user trust. Strong work here requires understanding that no single function carries product quality alone.' },
        { title: 'Long-term product thinking', body: 'We are more interested in contributors who compound product quality over time than in people who can produce isolated bursts of activity without durable system improvement.' },
      ],
    },
  ],
  faqs: [
    {
      question: 'What kinds of roles matter most at Intel Trader?',
      answer: 'Roles that improve product clarity, runtime trust, workflow quality, and operational usefulness matter most. That can include engineering, design, support, operations, and other contributors who strengthen the system in durable ways.',
    },
    {
      question: 'Is the focus mainly on shipping quickly?',
      answer: 'No. Shipping matters, but only when it improves the product responsibly. The emphasis is on useful progress, thoughtful tradeoffs, and work that continues to hold up after release.',
    },
    {
      question: 'Why is product judgment emphasized so much?',
      answer: 'Because Intel Trader operates in a context where clarity, reliability, and timing matter. Good judgment reduces avoidable product debt and leads to systems users can trust more consistently under pressure.',
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
  heroBody: 'Intel Trader is organized around a command workflow that helps users move from broad market awareness to ranked action. The goal is to make multiple analytical engines work together inside one readable operating surface so the trader can form context, compare possibilities, and prioritize attention without rebuilding the same picture manually across separate screens and tools.',
  heroDetail: 'This structure matters because traders often need to compare currencies, read structure, assess breakout pressure, evaluate liquidity, and prioritize opportunities within the same session. A platform that keeps forcing context switching increases friction and lowers consistency right where discipline matters most.',
  stats: [
    { label: 'Structure', value: 'Unified', detail: 'The main modules are intended to reinforce one another rather than compete for attention or duplicate effort.' },
    { label: 'Flow', value: 'Prioritized', detail: 'The workflow is built to surface what matters first instead of treating every signal as equally important.' },
    { label: 'Fit', value: 'Daily Use', detail: 'The product is meant for repeated operational use, not occasional inspection or passive dashboard viewing.' },
  ],
  highlights: [
    { title: 'The platform is sequence-driven', body: 'Its highest value comes from helping traders move from market-wide pressure to filtered opportunities through a coherent analytical path.' },
    { title: 'Coordination reduces friction', body: 'Keeping structure, liquidity, ranking, and monitoring in one environment reduces context switching and helps preserve interpretive consistency.' },
    { title: 'Designed for repeated daily use', body: 'The platform is not intended as a one-off research surface. It is meant to support routine, disciplined interaction across active market sessions.' },
  ],
  process: {
    eyebrow: 'Workflow Sequence',
    title: 'How the platform is meant to be used',
    intro: 'Intel Trader is most valuable when the user moves through it in a deliberate sequence rather than consuming isolated modules out of context.',
    steps: [
      { label: 'Context', title: 'Form the broad market picture first', body: 'Use strength and broad context to understand where directional pressure may be building before focusing on specific pairs or setups.' },
      { label: 'Qualification', title: 'Test that picture against structure and liquidity', body: 'Channel behavior, breakout conditions, and liquidity context help determine whether the broader idea is stable, fragile, or worth monitoring more closely.' },
      { label: 'Focus', title: 'Commit attention to ranked candidates', body: 'Once the market story is clearer, opportunity ranking helps narrow attention to the setups most worthy of deeper review or action.' },
    ],
  },
  comparison: {
    eyebrow: 'Workflow Difference',
    title: 'Fragmented workflow versus Intel Trader workflow',
    intro: 'The platform is designed to reduce repeated context rebuilding and help traders preserve consistency across a full session.',
    leftLabel: 'Fragmented Approach',
    rightLabel: 'Intel Trader Approach',
    rows: [
      {
        topic: 'Context formation',
        left: 'Users rebuild market context manually across separate tools and windows.',
        right: 'Context is formed through coordinated modules in one operating flow.',
      },
      {
        topic: 'Attention prioritization',
        left: 'Every chart competes equally for focus, creating fatigue and indecision.',
        right: 'Opportunity ranking and layered signals help direct attention selectively.',
      },
      {
        topic: 'Workflow continuity',
        left: 'Insight quality varies as users switch repeatedly between disconnected views.',
        right: 'The platform keeps core analytical states aligned to support steadier interpretation.',
      },
    ],
  },
  sections: [
    {
      eyebrow: 'Workflow',
      title: 'How the command-center model works',
      intro: 'The platform is most useful when used as a sequence: understand pressure, read structure, observe event risk, evaluate liquidity conditions, and then focus on the strongest setups. The value is not only in each module, but in how they reduce the cost of moving from one layer of reasoning to the next.',
      cards: [
        { title: 'Read broad market pressure', body: 'Start by understanding which currencies are strengthening or weakening so the market can be viewed as a system rather than a loose collection of isolated pairs. This creates a stronger base context for pair selection and directional alignment.' },
        { title: 'Assess structure and transition', body: 'Review channel behavior, compression, and breakout context to determine whether a market is stable, expanding, or nearing a meaningful transition. Structure adds timing and condition to directional ideas.' },
        { title: 'Evaluate liquidity and reaction zones', body: 'Liquidity context helps traders read where price is likely to react, where stops may be clustered, and where apparent moves may involve sweep behavior rather than straightforward continuation.' },
        { title: 'Rank what deserves attention', body: 'Use opportunity ranking to focus on the best candidates instead of giving equal attention to everything on the screen. This encourages selectivity and makes active sessions easier to manage with discipline.' },
      ],
    },
    {
      eyebrow: 'Audience',
      title: 'Who the platform is built to support',
      intro: 'Intel Trader is intended to remain understandable for newer users while still supporting deeper workflows for advanced traders and teams. That means the platform has to balance readability with depth and avoid becoming either too shallow for serious use or too opaque for onboarding.',
      cards: [
        { title: 'Retail traders', body: 'Retail users benefit from stronger context, better prioritization, and a cleaner analytical workflow than they would get from disconnected chart tools alone. The platform helps reduce avoidable noise and indecision.' },
        { title: 'Advanced independents', body: 'Serious independent traders can use the platform as an operating layer for faster monitoring, earlier context, stronger setup qualification, and a more repeatable session routine.' },
        { title: 'Professional teams', body: 'Teams benefit from shared market views, more consistent interpretation, and a stronger foundation for supervision, review, and coordinated decision workflows across multiple users.' },
      ],
    },
    {
      eyebrow: 'Operational Value',
      title: 'What the platform should improve in daily use',
      intro: 'A serious platform should improve not just what users see, but how they work. The goal is operational leverage: less wasted attention, better context retention, and more consistent decision discipline across repeated sessions.',
      cards: [
        { title: 'Faster session setup', body: 'A trader should be able to open the platform and orient quickly, rather than spending the first part of the session reconstructing the same market context from scratch.' },
        { title: 'Lower interpretation drift', body: 'When strength, structure, liquidity, and opportunity quality are organized together, it becomes easier to maintain a stable reading of the market instead of changing bias with every isolated chart move.' },
        { title: 'Stronger review and accountability', body: 'As the platform matures, users should be able to compare what the system surfaced, what they acted on, and how those decisions aligned with their own process and risk discipline.' },
      ],
    },
  ],
  faqs: [
    {
      question: 'How should a new user approach the platform?',
      answer: 'A good starting point is to treat the platform as a guided workflow. Begin with broad market pressure, move into structure, consider liquidity and transition, and then focus on ranked opportunities rather than trying to inspect everything equally.',
    },
    {
      question: 'Is the platform only useful during active trading hours?',
      answer: 'No. It can also support planning, review, preparation, and post-session evaluation. The benefit is not only in live alerts, but in maintaining stronger context across the whole trading process.',
    },
    {
      question: 'Why does the platform emphasize coordination between modules?',
      answer: 'Because traders rarely make good decisions from one isolated signal. The value of the platform comes from reducing friction between different kinds of context so the user can interpret the market more coherently.',
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
  heroBody: 'Each core feature solves a real workflow problem, whether that problem is weak context, slow prioritization, poor alert discipline, fragmented review, or unclear structural interpretation. The platform is designed to improve the quality of what a trader notices, how quickly they notice it, and how consistently they can act on it.',
  heroDetail: 'The features are designed to remain useful individually while also creating much more value when combined inside one command-center workflow. The combined system matters because the market rarely presents one clean variable at a time.',
  stats: [
    { label: 'Coverage', value: 'Broad', detail: 'The feature set spans strength, structure, breakout context, liquidity, ranking, and review continuity.' },
    { label: 'Goal', value: 'Decision Support', detail: 'Every feature should make action more informed, more selective, or more disciplined.' },
    { label: 'Style', value: 'Operational', detail: 'The product is intended for session-by-session practical use rather than passive observation.' },
  ],
  highlights: [
    { title: 'Each feature solves a workflow problem', body: 'The design priority is not feature quantity. It is whether each module improves clarity, prioritization, timing, or review discipline in practice.' },
    { title: 'The combined workflow matters more than any single module', body: 'Intel Trader is strongest when users treat the feature set as a coordinated system rather than a collection of independent widgets.' },
    { title: 'Better attention allocation is a core outcome', body: 'Many of the features exist to help users decide what deserves focus first, which often matters more than discovering yet another possible setup.' },
  ],
  process: {
    eyebrow: 'Feature Logic',
    title: 'How the feature set creates practical value',
    intro: 'The feature design is built around a progression from awareness to interpretation to prioritization so the user can make cleaner decisions with less wasted attention.',
    steps: [
      { label: 'Awareness', title: 'Identify what is changing in the market', body: 'Features like strength and monitoring help users understand where pressure is developing before they spend time on detailed chart inspection.' },
      { label: 'Interpretation', title: 'Add structure and intent', body: 'Channel behavior, breakout state, and liquidity context help clarify whether price action is stable, transitional, manipulated, or worth escalating in attention.' },
      { label: 'Prioritization', title: 'Act on the strongest candidates', body: 'Ranking, alerts, and review continuity help traders commit attention more selectively and learn from how the system surfaced opportunities over time.' },
    ],
  },
  comparison: {
    eyebrow: 'Feature Value',
    title: 'Standalone signal tools versus coordinated intelligence layers',
    intro: 'Intel Trader feature design is centered on connected decision support rather than isolated indicator output.',
    leftLabel: 'Standalone Signals',
    rightLabel: 'Coordinated Features',
    rows: [
      {
        topic: 'Signal interpretation',
        left: 'Signals are consumed individually with limited cross-context validation.',
        right: 'Signals are interpreted through strength, structure, liquidity, and ranking context together.',
      },
      {
        topic: 'User attention load',
        left: 'Users must decide priority manually across many competing hints.',
        right: 'Ranking and workflow sequencing reduce unnecessary cognitive load.',
      },
      {
        topic: 'Review discipline',
        left: 'Post-session understanding is often memory-based and inconsistent.',
        right: 'Alert continuity and structured outputs make review more traceable and useful.',
      },
    ],
  },
  sections: [
    {
      eyebrow: 'Core Modules',
      title: 'The main features answer different but connected questions',
      intro: 'A strong workflow needs to know where pressure exists, how structure looks, where expansion risk is building, where liquidity may matter, and which setup deserves focus first. The feature set is designed around those connected questions rather than a generic indicator checklist.',
      cards: [
        { title: 'Currency strength', body: 'Shows relative pressure across currencies so users can identify broader directional imbalance, compare momentum conditions, and build more aligned pair combinations from a stronger macro session view.' },
        { title: 'Channel and structure analysis', body: 'Helps users understand whether price is trending, compressing, rotating, or transitioning across timeframes so structural context is clearer before a breakout or reversal interpretation is made.' },
        { title: 'Breakout detection', body: 'Surfaces areas where price may be preparing for meaningful expansion beyond structural boundaries and helps users focus on conditions where volatility and directional change may be building.' },
        { title: 'Liquidity intelligence', body: 'Adds attention to likely liquidity pools, sweep behavior, and reaction zones so market intent becomes easier to interpret and users can better distinguish between continuation and manipulation risk.' },
        { title: 'Opportunity ranking', body: 'Prioritizes stronger setup candidates so users can allocate attention more intelligently instead of scanning dozens of possibilities with no clear sequence or quality filter.' },
        { title: 'Alert history and review', body: 'Provides continuity by showing what the system surfaced, when it surfaced it, and how alerts can be reviewed after the fact as part of a more disciplined learning and review process.' },
      ],
    },
    {
      eyebrow: 'Practical Value',
      title: 'Why these features matter together',
      intro: 'The product becomes more useful when the modules reduce friction across the whole session rather than acting like isolated widgets. Combined value matters because most trading errors come from weak transitions between context, interpretation, and execution focus.',
      cards: [
        { title: 'Lower chart fatigue', body: 'Continuous monitoring reduces the time users spend searching manually for what matters and lowers the mental drain created by repeated chart-by-chart scanning with no clear prioritization.' },
        { title: 'Better prioritization', body: 'Ranking and layered context make it easier to focus on stronger opportunities during active sessions, especially when many pairs or scenarios are competing for attention at once.' },
        { title: 'Stronger review discipline', body: 'A good product helps users not only act in the moment but also understand how the analytical workflow behaved afterward so decisions can be reviewed against market context rather than memory alone.' },
      ],
    },
    {
      eyebrow: 'Outcome',
      title: 'What better feature design should produce',
      intro: 'The purpose of a feature is not just visibility. It is operational effect. Better features should help traders filter noise earlier, hold context longer, and act with more selectivity and consistency.',
      cards: [
        { title: 'Clearer market narrative', body: 'When modules complement one another, the market becomes easier to read as a sequence of pressures and transitions rather than a set of disconnected chart events.' },
        { title: 'More selective execution', body: 'A trader with stronger context and ranking discipline is better positioned to ignore average setups and reserve attention for higher-conviction situations.' },
        { title: 'Improved process maturity', body: 'Over time, the right feature set should help traders build a more structured routine around observation, qualification, review, and accountability.' },
      ],
    },
  ],
  faqs: [
    {
      question: 'Which feature matters most?',
      answer: 'That depends on the user, but the platform is designed so the features reinforce one another. Strength helps with broad context, structure adds condition, liquidity improves interpretation, and ranking improves attention discipline.',
    },
    {
      question: 'Are these features meant to be used independently?',
      answer: 'They can be used independently, but they become more valuable when used together. The product is strongest when it helps the user move through a full decision workflow rather than consume one isolated output.',
    },
    {
      question: 'Do the features help with review as well as live monitoring?',
      answer: 'Yes. The platform is intended to support not only live interpretation but also review, continuity, and learning so users can understand how attention was directed and how their own decisions aligned with that context.',
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
  heroBody: 'Intel Trader is meant to be more than a front-end around market data. The platform is organized around services and analytical layers that translate live information into more readable and actionable market context. The technology story is therefore about interpretation quality, system reliability, workflow continuity, and how raw market movement becomes something operationally useful.',
  heroDetail: 'That means the technology discussion includes how data is handled, how intelligence is derived, how state is surfaced to the user, and how the interface exposes analytical work without overwhelming the trader or hiding reliability conditions that affect trust.',
  stats: [
    { label: 'Architecture', value: 'Modular', detail: 'Different responsibilities are separated into focused analytical services, data paths, and presentation layers.' },
    { label: 'Data Goal', value: 'Live Context', detail: 'Incoming market behavior is converted into interpretable workflow outputs instead of raw feed noise.' },
    { label: 'Trust', value: 'Observable', detail: 'System state, feed freshness, reliability, and degradation need to remain visible to the user.' },
  ],
  highlights: [
    { title: 'Architecture supports interpretation quality', body: 'The technical design matters because weak systems either produce unreliable outputs or make it hard for users to understand what the platform is really saying.' },
    { title: 'Reliability is part of the product', body: 'Feed freshness, fallback behavior, stable state transitions, and visible system health are not operational extras. They are part of user trust.' },
    { title: 'Explainability becomes more important as intelligence deepens', body: 'As the platform grows more sophisticated, users need better visibility into why attention is being directed in a certain direction and how much trust that output deserves.' },
  ],
  process: {
    eyebrow: 'Technical View',
    title: 'How technology becomes user-facing value',
    intro: 'The platform’s technical value emerges when raw market inputs are translated into reliable, interpretable outputs that users can actually trust and act on.',
    steps: [
      { label: 'Input', title: 'Collect and condition market information', body: 'Live data, feed state, and internal system conditions need to be handled carefully before they can support trustworthy interpretation.' },
      { label: 'Derivation', title: 'Transform data into intelligence layers', body: 'Modular services derive strength, structure, liquidity, breakout, and ranking context so the platform can organize the market into useful analytical outputs.' },
      { label: 'Presentation', title: 'Expose state without overwhelming the user', body: 'The interface must reveal enough context, health, and prioritization for confident use while keeping the workflow readable under real market pressure.' },
    ],
  },
  timeline: {
    eyebrow: 'Technical Maturity',
    title: 'How platform technology matures over time',
    intro: 'The roadmap emphasizes moving from basic live interpretation toward deeper reliability, explainability, and governance depth.',
    items: [
      { phase: 'Foundation', title: 'Live context generation', body: 'Initial architecture focuses on turning market input into useful real-time analytical outputs.' },
      { phase: 'Stability', title: 'Operational reliability and observability', body: 'The next layer strengthens feed health visibility, fallback handling, and consistent runtime behavior under broader usage.' },
      { phase: 'Depth', title: 'Explainability and governance', body: 'Long-term maturity includes richer intelligence history, clearer explainability, and better model/process governance for sustained trust.' },
    ],
  },
  sections: [
    {
      eyebrow: 'Analytical Design',
      title: 'Technology should make market complexity more readable',
      intro: 'A market-intelligence platform should do more than display candles. It should organize market behavior into outputs that improve comprehension, prioritization, timing awareness, and review quality. Good architecture matters because weak structure usually produces either noisy outputs or opaque ones.',
      cards: [
        { title: 'Multi-engine interpretation', body: 'Strength, structure, breakout, liquidity, and ranking each contribute their own focused perspective instead of forcing one overloaded signal layer to represent every type of market behavior.' },
        { title: 'Derived signals and alerts', body: 'Technology becomes more useful when it translates raw movement into rankings, classifications, and alerts that the user can actually work with in real time rather than simply forwarding undifferentiated noise.' },
        { title: 'Workflow-aware presentation', body: 'The interface is part of the system design because how information is grouped, refreshed, prioritized, and visually stabilized directly affects trader trust, reading speed, and confidence under pressure.' },
      ],
    },
    {
      eyebrow: 'Direction',
      title: 'Where the technical maturity needs to go',
      intro: 'Over time, a serious intelligence platform needs stronger feed handling, better persistence, deeper explainability, clearer model governance, and more research-grade analytical depth. The goal is not only to add capability, but to make the system more dependable and more intelligible as it expands.',
      cards: [
        { title: 'Feed health and fallback awareness', body: 'Users should understand when data is live, cached, degraded, delayed, or unavailable so signal trust remains grounded in system reality rather than assumption.' },
        { title: 'Persisted intelligence history', body: 'Stored alerts, user preferences, review states, and historical context help users examine how the system behaved over time instead of operating only in the current moment.' },
        { title: 'Future research layers', body: 'Long-term competitiveness depends on richer backtesting, model governance, drift monitoring, explainability, and stronger analytical instrumentation that supports both product improvement and user trust.' },
      ],
    },
    {
      eyebrow: 'Reliability',
      title: 'Why operational trust matters as much as raw capability',
      intro: 'In a trading environment, technical quality is not only about feature breadth. It is about whether the system is timely, understandable, stable, and honest about its own current condition.',
      cards: [
        { title: 'Visible system state', body: 'A strong platform should communicate whether feeds are healthy, stale, or degraded so users can interpret outputs with the right level of confidence.' },
        { title: 'Consistent behavior under load', body: 'As usage grows, the product needs predictable performance and stable state transitions so the trader is not guessing whether a problem comes from the market or the platform.' },
        { title: 'Explainable intelligence outputs', body: 'The more advanced the system becomes, the more important it is that users can understand how attention was directed and what conditions contributed to a ranking or alert.' },
      ],
    },
  ],
  faqs: [
    {
      question: 'Why does technology matter so much for a trading intelligence product?',
      answer: 'Because the value of the product depends on more than interface design. It depends on whether data is timely, outputs are interpretable, state is trustworthy, and the system behaves consistently under real usage.',
    },
    {
      question: 'What does modular intelligence mean here?',
      answer: 'It means different analytical responsibilities are separated into focused layers rather than being forced into one opaque signal engine. That makes the system easier to evolve, reason about, and explain to users.',
    },
    {
      question: 'Why emphasize observability and explainability?',
      answer: 'Because users need to know not just what the platform shows, but how trustworthy the current system state is and why attention is being directed in a particular direction. That is essential for operational trust.',
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
  heroBody: 'A good help experience should reduce confusion quickly and leave the user with a clearer next step. This page is for users who need structured guidance around onboarding, product understanding, plan expectations, and routine workflow interpretation before opening a more specific support case.',
  heroDetail: 'By organizing the most common help areas clearly, the platform can make support more useful, improve self-service success, and reduce avoidable back-and-forth for both users and the support team.',
  stats: [
    { label: 'Goal', value: 'Fast Clarity', detail: 'The Help Center is designed to answer common questions before escalation is needed.' },
    { label: 'Best For', value: 'Guided Use', detail: 'Ideal for orientation, setup understanding, feature interpretation, and general product confidence.' },
    { label: 'Outcome', value: 'Better Escalation', detail: 'Clear self-service makes later support requests sharper, faster, and easier to diagnose.' },
  ],
  highlights: [
    { title: 'Use this page for orientation first', body: 'The Help Center is the right place to start when you need product understanding, workflow explanation, or plan guidance that is not tied to one specific account.' },
    { title: 'Good self-service shortens support cycles', body: 'The more clearly a user can identify the page, module, and nature of the issue, the easier it becomes to resolve or escalate effectively.' },
    { title: 'Escalation quality matters', body: 'The Help Center is not only for answers. It also helps users frame better support requests when the issue turns out to require account-level investigation.' },
  ],
  process: {
    eyebrow: 'Support Flow',
    title: 'How to use the Help Center effectively',
    intro: 'The fastest route to resolution usually starts with identifying the exact kind of help you need before escalating to a more specific support path.',
    steps: [
      { label: 'Identify', title: 'Locate the exact module or workflow step', body: 'Clarify whether the issue is about onboarding, plan understanding, feature interpretation, or a suspected malfunction.' },
      { label: 'Differentiate', title: 'Separate confusion from account-specific behavior', body: 'Determine whether the problem is general guidance, a workflow question, or something that depends on your specific account state.' },
      { label: 'Escalate', title: 'Move to the right support path if needed', body: 'If the issue depends on login, payment, plan, entitlement, or permissions, switch to Account Support instead of staying in general help content.' },
    ],
  },
  comparison: {
    eyebrow: 'Support Routing',
    title: 'General guidance versus account-specific support',
    intro: 'Understanding where the issue belongs is often the biggest factor in resolution speed.',
    leftLabel: 'Help Center Use Case',
    rightLabel: 'Account Support Use Case',
    rows: [
      {
        topic: 'Issue type',
        left: 'Onboarding, workflow understanding, feature interpretation, and non-account-specific guidance.',
        right: 'Login, billing, role, entitlement, payment, or account-state mismatches.',
      },
      {
        topic: 'Required detail',
        left: 'General product context and the affected page or module.',
        right: 'Exact account email, expected behavior, observed behavior, screenshot, and timing.',
      },
      {
        topic: 'Best outcome',
        left: 'Faster self-service and clearer escalation when needed.',
        right: 'Direct investigation of user-specific records and state transitions.',
      },
    ],
  },
  sections: [
    {
      eyebrow: 'Common Topics',
      title: 'Where most users usually need help',
      intro: 'Most requests start with onboarding, plan understanding, or interpreting what the product is showing. Organizing those topics well makes the whole support experience more effective because users can solve common issues without waiting for a queue-based reply.',
      cards: [
        { title: 'Getting started', body: 'Use this area to understand what the command center shows first, which modules matter initially, how to orient yourself quickly, and how to navigate the product with more confidence from the first session.' },
        { title: 'Plan and subscription understanding', body: 'Use this area to compare package access, understand upgrades, clarify entitlement differences, and confirm which features should be available on your current subscription state.' },
        { title: 'Feature interpretation', body: 'Use this area when a module is visible but you need help understanding what a ranking, alert, liquidity state, or structural classification is trying to communicate and how it should influence attention.' },
      ],
    },
    {
      eyebrow: 'Escalation',
      title: 'When a help article is not enough',
      intro: 'General guidance works for orientation. Once the issue involves a specific account, payment, permission state, or technical inconsistency, it is better to move directly to a more targeted support path so resolution does not stall in general guidance content.',
      cards: [
        { title: 'Account-specific issues', body: 'If the problem depends on one user profile, payment record, role, session state, or entitlement state, move to Account Support rather than staying in general help content.' },
        { title: 'Unexpected product behavior', body: 'If the product appears inconsistent, stale, incomplete, or mismatched to what you expected, gather a screenshot, page name, and approximate time so support can investigate with useful context.' },
        { title: 'Commercial or team requests', body: 'If the question is about multi-user rollout, team adoption, strategic onboarding, or special arrangements, Contact is usually a better path than general self-service help.' },
      ],
    },
    {
      eyebrow: 'Self-Service Quality',
      title: 'How to get better value from self-guided help',
      intro: 'The Help Center works best when users approach it as a way to sharpen the problem before escalation, not just as a place to confirm frustration. Better context usually leads to faster outcomes.',
      cards: [
        { title: 'Name the exact page or module', body: 'Support and guidance are far more useful when the question is anchored to a specific page, module, or workflow step rather than a broad statement that something feels wrong.' },
        { title: 'Separate interpretation from malfunction', body: 'Sometimes the issue is that a signal is unclear rather than technically broken. Distinguishing between those cases leads to better guidance and a faster next step.' },
        { title: 'Capture the surrounding context', body: 'If possible, note what you were doing before the issue appeared, whether you refreshed, whether your plan changed recently, and whether the same behavior repeated elsewhere.' },
      ],
    },
  ],
  faqs: [
    {
      question: 'What should I check before opening a support request?',
      answer: 'First identify the exact page, module, or workflow step involved. Then determine whether the issue is general guidance, account-specific behavior, or a suspected malfunction. That usually makes the next step obvious.',
    },
    {
      question: 'When is the Help Center enough on its own?',
      answer: 'The Help Center is usually enough when you need orientation, product understanding, feature interpretation, or plan guidance that does not depend on your specific user account or billing state.',
    },
    {
      question: 'What if I still am not sure where the issue belongs?',
      answer: 'If the problem is tied to your account, plan, login, payment, or permissions, use Account Support. If it is broader, exploratory, or commercial, Contact is the better path.',
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
  heroBody: 'Some issues cannot be solved by a general article because they depend on account identity, payment status, entitlement state, session state, role assignment, or administrative configuration. This page is for those cases where the right answer depends on looking at your specific account context rather than general product guidance.',
  heroDetail: 'The best requests include the affected email address, the expected behavior, the actual behavior, and a screenshot or timestamp where possible. That context shortens resolution time significantly because it gives support something concrete to verify instead of asking basic follow-up questions first.',
  stats: [
    { label: 'Scope', value: 'User Specific', detail: 'This path is designed for issues tied to one account and its current state, not general platform guidance.' },
    { label: 'Common Need', value: 'Billing and Access', detail: 'Most requests here involve plans, payments, roles, entitlements, or session behavior.' },
    { label: 'Best Input', value: 'Precise Detail', detail: 'Clear context leads to faster diagnosis, cleaner verification, and fewer follow-up questions.' },
  ],
  highlights: [
    { title: 'This route is for account-specific investigation', body: 'If the answer depends on your exact login state, payment state, entitlement record, or role configuration, Account Support is the correct path.' },
    { title: 'Precision speeds resolution', body: 'Email address, expected outcome, screenshot, and approximate time give support a concrete starting point instead of forcing a clarification loop first.' },
    { title: 'Many issues are state mismatches', body: 'A large class of support problems comes from behavior not matching recent plan, role, or billing changes. Those cases are best handled with direct account review.' },
  ],
  process: {
    eyebrow: 'Resolution Path',
    title: 'How account issues are best reported',
    intro: 'Account-related problems are resolved faster when the report is specific enough to be checked directly against user state and recent account events.',
    steps: [
      { label: 'Account', title: 'Identify the exact user context', body: 'Start with the correct email address and clarify which account, role, or subscription state is affected.' },
      { label: 'Expectation', title: 'Describe what should have happened', body: 'Explain the intended result clearly so support can compare actual behavior against the expected account and product state.' },
      { label: 'Evidence', title: 'Attach the clearest proof available', body: 'Screenshots, timestamps, last actions, and page references help match the report against logs, payments, and recent state changes.' },
    ],
  },
  timeline: {
    eyebrow: 'Case Flow',
    title: 'How account support cases are resolved effectively',
    intro: 'Resolution speed improves when case context is complete and mapped directly to account state and recent events.',
    items: [
      { phase: 'Submission', title: 'Issue is reported with account context', body: 'The report should include account email, expected behavior, observed behavior, and evidence where possible.' },
      { phase: 'Verification', title: 'State is checked against records', body: 'Support compares the report against subscription data, entitlement state, role configuration, session behavior, and relevant event history.' },
      { phase: 'Resolution', title: 'Outcome and follow-up guidance', body: 'Once the cause is identified, corrective action and a clear follow-up path are provided to reduce recurrence.' },
    ],
  },
  sections: [
    {
      eyebrow: 'Support Scope',
      title: 'What Account Support should handle',
      intro: 'If the question depends on data unique to your account, this is usually the correct support route. These issues are best handled by reviewing the exact account, subscription, and user state involved rather than relying on general explanations.',
      cards: [
        { title: 'Login and session issues', body: 'Use this route if access state, logout state, redirect behavior, or session persistence seems inconsistent with what should happen for your account and role.' },
        { title: 'Plan and entitlement issues', body: 'Use this route if a subscription changed but the dashboard, unlocked modules, permissions, or privileges do not match what you expected after the change.' },
        { title: 'Billing and verification questions', body: 'Use this route for payment confirmation, verification flow questions, invoice logic, refund-related clarification, and account behavior after a successful, pending, or failed payment event.' },
      ],
    },
    {
      eyebrow: 'Faster Resolution',
      title: 'What to include in your request',
      intro: 'Support is faster when the request explains the issue in a way that can be checked directly against account data and product behavior. The more specific the report, the less time is lost translating it into something investigable.',
      cards: [
        { title: 'Affected account email', body: 'Always provide the exact email address involved so the correct user record can be reviewed without guesswork, duplication, or unnecessary identity clarification.' },
        { title: 'Expected outcome', body: 'Explain what should have happened, such as a role change taking effect, a plan unlocking a module, a redirect not requiring login, or a payment activating a subscription immediately.' },
        { title: 'Screenshot and time reference', body: 'Whenever possible, include the page, screenshot, approximate time, and the last action you took so the issue can be matched against logs and recent account events more accurately.' },
      ],
    },
    {
      eyebrow: 'Common Cases',
      title: 'Examples of issues that belong here',
      intro: 'Many users are not sure whether they need Help Center guidance or account-level investigation. If the issue looks like one of the cases below, Account Support is usually the right place.',
      cards: [
        { title: 'Subscription updated, but access did not', body: 'If payment completed or a plan changed but the product still behaves like the previous tier, support should review entitlement state and the latest subscription record.' },
        { title: 'Role or privileges seem incorrect', body: 'If an administrator or other authorized user cannot access expected areas, or a standard user sees the wrong restriction behavior, the account and role state should be checked directly.' },
        { title: 'Account behavior changed unexpectedly', body: 'If login, redirects, billing behavior, or permissions changed in a way that seems inconsistent with the account history, a direct review of account events is the right next step.' },
      ],
    },
  ],
  faqs: [
    {
      question: 'What kinds of account issues are most common?',
      answer: 'The most common issues usually involve subscription state, entitlement mismatches, login or redirect behavior, billing verification, and cases where product access does not match what the user expected after a change.',
    },
    {
      question: 'Why do screenshots and timestamps matter so much?',
      answer: 'They make it easier to connect the reported behavior to specific pages, events, and records. That reduces guesswork and makes investigation faster and more reliable.',
    },
    {
      question: 'Can this page help if the issue is not tied to my account?',
      answer: 'If the issue is not tied to your specific account state, the Help Center or Contact page is usually a better starting point. Account Support is most effective when the problem depends on one identifiable user context.',
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
  heroBody: 'A useful FAQ should reduce uncertainty, not just repeat marketing lines. This page is meant to help users understand what the platform does, who it is for, how it fits into real trading workflows, and how support and subscriptions work in practice once a user moves beyond initial curiosity.',
  heroDetail: 'It is especially useful for first-time evaluators who want enough context to move forward confidently without needing immediate direct support, while still understanding where to go next if their case becomes more specific.',
  stats: [
    { label: 'Purpose', value: 'Evaluation', detail: 'The FAQ is most useful when users are deciding whether the product fits their workflow and operating style.' },
    { label: 'Topics', value: 'Product to Support', detail: 'Questions cover capability, audience, plans, workflow fit, and operational support paths.' },
    { label: 'Outcome', value: 'Clearer Next Step', detail: 'Each answer should make it easier to know whether to explore, subscribe, or ask for help.' },
  ],
  highlights: [
    { title: 'The FAQ is meant to remove uncertainty', body: 'Its role is to clarify what the product does, who it fits, and how support works so users can make cleaner decisions without unnecessary guesswork.' },
    { title: 'This page is especially useful during evaluation', body: 'It is designed for people deciding whether the product fits their workflow, their maturity level, and their expected operating style.' },
    { title: 'Every answer should lead somewhere practical', body: 'A good FAQ does not just explain. It makes the next step clearer, whether that means exploring more, contacting the team, or using account support.' },
  ],
  process: {
    eyebrow: 'Reading Guide',
    title: 'How to use the FAQ well',
    intro: 'The FAQ is most useful when read as a decision aid: clarify fit, understand support paths, and identify the next page or action that matches your situation.',
    steps: [
      { label: 'Fit', title: 'Start with the product and audience questions', body: 'Use the opening questions to decide whether the platform’s workflow, depth, and operating style align with what you actually need.' },
      { label: 'Support', title: 'Then review how plans and help paths work', body: 'Understand where plan guidance ends, where general help begins, and when account-specific investigation becomes necessary.' },
      { label: 'Next Step', title: 'Use the answer to choose where to go next', body: 'If the product fits, continue to Platform, Features, or Pricing. If the issue is specific, move to Contact or Account Support instead of staying in general reading mode.' },
    ],
  },
  comparison: {
    eyebrow: 'FAQ Usage',
    title: 'Reading FAQ for evaluation versus reading FAQ for support direction',
    intro: 'The same page can answer both product-fit questions and support-routing questions when read with the right intent.',
    leftLabel: 'Evaluation Reading',
    rightLabel: 'Support Routing Reading',
    rows: [
      {
        topic: 'Primary question',
        left: 'Does this platform fit my workflow and operating style?',
        right: 'Where should I go next to resolve this issue quickly?',
      },
      {
        topic: 'Useful sections',
        left: 'Product model, audience fit, feature workflow, and plan expectations.',
        right: 'Account-support boundaries, escalation paths, and contact route guidance.',
      },
      {
        topic: 'Typical next step',
        left: 'Proceed to Platform, Features, and Pricing for deeper assessment.',
        right: 'Proceed to Help Center, Account Support, or Contact with sharper context.',
      },
    ],
  },
  sections: [
    {
      eyebrow: 'Product Questions',
      title: 'What users usually want to know first',
      intro: 'Before adoption, traders usually want to know what the platform really does, who it is for, and how it differs from normal charting software. Those questions matter because clarity of fit is often more important than raw feature count.',
      cards: [
        { title: 'What does Intel Trader actually do?', body: 'It helps traders interpret live forex markets through a combined workflow of strength, structure, breakout context, liquidity awareness, ranking, alerts, and review continuity so attention can be directed more intelligently.' },
        { title: 'Who is the platform for?', body: 'It supports ambitious retail traders, more advanced independent operators, and team workflows that need stronger structure, more consistent interpretation, and better coordination around what deserves attention.' },
        { title: 'How is it different from charting software?', body: 'A charting platform mainly displays price and leaves interpretation largely to the user. Intel Trader adds organized interpretation, prioritization, and workflow structure so the market is easier to evaluate with discipline.' },
      ],
    },
    {
      eyebrow: 'Support Questions',
      title: 'What users ask about plans and support',
      intro: 'Adoption decisions are often influenced by how clearly the platform handles support, account issues, and plan understanding. Users want to know not only what the product offers, but how smoothly it can be operated and supported in practice.',
      cards: [
        { title: 'How do I choose the right plan?', body: 'The right plan depends on how much market coverage, dashboard depth, alert flexibility, and operational workflow support you need. Simpler needs suit entry tiers, while advanced users and teams usually need broader access.' },
        { title: 'Where do I go for account problems?', body: 'If the issue involves billing, login state, plan access, role state, redirect behavior, or payment behavior, Account Support is the correct route because the answer depends on your specific account state.' },
        { title: 'Can the platform support Nigerian and international users?', body: 'Yes. Intel Trader supports both Nigerian and international usage, including NGN pricing context alongside broader global workflow needs and support pathways designed for different user types.' },
      ],
    },
    {
      eyebrow: 'Adoption Questions',
      title: 'What people want to understand before committing',
      intro: 'Before adopting a platform fully, most serious users want to understand whether it will improve their process, not just whether it has an attractive feature list.',
      cards: [
        { title: 'Will this replace my charting platform?', body: 'Intel Trader is best understood as an intelligence and decision-support layer. It can improve context, prioritization, and workflow discipline, but users may still maintain separate execution or charting tools depending on their process.' },
        { title: 'Is this useful for newer traders?', body: 'Yes, provided the user wants more structure and is willing to learn from the workflow. The platform is designed to remain understandable, but it is still built around serious interpretation rather than oversimplified signals.' },
        { title: 'Does this help with discipline?', body: 'The platform cannot replace discipline, but it can support it by reducing unnecessary noise, improving prioritization, and making it easier to work from a more consistent market-reading process.' },
      ],
    },
  ],
  faqs: [
    {
      question: 'What is the best first step if I am still evaluating the product?',
      answer: 'Start by understanding whether the platform matches your workflow needs. The Platform, Features, and Pricing pages help clarify how Intel Trader is organized and which level of access is likely to fit your use case.',
    },
    {
      question: 'Does the product target beginners or advanced traders?',
      answer: 'It is designed to be understandable for newer users while still being useful for advanced independent traders and professional teams. The key difference is how deeply each user chooses to integrate the workflow into their process.',
    },
    {
      question: 'Where should I go if my question is not answered here?',
      answer: 'If it is account-specific, use Account Support. If it is a product, onboarding, or commercial question, use Contact. The FAQ is meant to reduce uncertainty, not replace the appropriate support path when specifics matter.',
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
