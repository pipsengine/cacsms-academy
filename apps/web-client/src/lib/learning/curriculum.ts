export type CurriculumDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type CurriculumWeek = {
  week: number;
  module: string;
  level: 'Beginner' | 'Intermediate';
  topics: Record<CurriculumDay, string>;
};

export type CurriculumTopicRecord = {
  slug: string;
  week: number;
  day: CurriculumDay;
  module: string;
  level: 'Beginner' | 'Intermediate';
  title: string;
  summary: string;
  isAssignment: boolean;
};

export const forexCourseCurriculum: CurriculumWeek[] = [
  {
    week: 1,
    module: 'Forex Foundations',
    level: 'Beginner',
    topics: {
      Monday: 'What Moves Forex Prices',
      Tuesday: 'Currency Pairs and Quote Mechanics',
      Wednesday: 'Sessions, Liquidity, and Volatility Windows',
      Thursday: 'Pips, Lot Size, and Position Value',
      Friday: 'Reading Candlesticks with Context',
      Saturday: 'Assignment: Build a Basic Market Observation Journal',
    },
  },
  {
    week: 2,
    module: 'Market Structure Basics',
    level: 'Beginner',
    topics: {
      Monday: 'Support and Resistance Fundamentals',
      Tuesday: 'Trend vs Range Identification',
      Wednesday: 'Breakout vs Fakeout Recognition',
      Thursday: 'Higher Highs and Lower Lows in Practice',
      Friday: 'Key Level Mapping Across Timeframes',
      Saturday: 'Assignment: Mark Structure on 3 Major Pairs',
    },
  },
  {
    week: 3,
    module: 'Execution and Risk Control',
    level: 'Beginner',
    topics: {
      Monday: 'Entry Triggers and Candle Close Confirmation',
      Tuesday: 'Stop-Loss Placement by Invalidation',
      Wednesday: 'Risk Per Trade and Position Sizing',
      Thursday: 'Risk-to-Reward Planning Before Entry',
      Friday: 'Trade Management: Hold, Scale, or Exit',
      Saturday: 'Assignment: Create a Rule-Based Trade Checklist',
    },
  },
  {
    week: 4,
    module: 'Confluence and Setup Quality',
    level: 'Intermediate',
    topics: {
      Monday: 'Confluence: Structure, Momentum, and Session Timing',
      Tuesday: 'Retest Entries vs Immediate Break Entries',
      Wednesday: 'Using Multi-Timeframe Bias in Daily Trading',
      Thursday: 'Filtering Low-Quality Setups',
      Friday: 'Setup Scoring Framework for Consistency',
      Saturday: 'Assignment: Grade 5 Setups with a Scoring Model',
    },
  },
  {
    week: 5,
    module: 'Liquidity and Institutional Behavior',
    level: 'Intermediate',
    topics: {
      Monday: 'Liquidity Pools and Stop Clusters',
      Tuesday: 'Liquidity Sweeps and Rejection Patterns',
      Wednesday: 'Order Flow Clues in Price Action',
      Thursday: 'Session Opens and Expansion Behavior',
      Friday: 'Combining Liquidity with Structure Entries',
      Saturday: 'Assignment: Document 3 Liquidity Sweep Cases',
    },
  },
  {
    week: 6,
    module: 'Performance and Process Optimization',
    level: 'Intermediate',
    topics: {
      Monday: 'Trade Journal Metrics that Matter',
      Tuesday: 'Expectancy and Win/Loss Distribution',
      Wednesday: 'Identifying Behavioral Errors in Execution',
      Thursday: 'Refining a Single Playbook Strategy',
      Friday: 'Weekly Review and Improvement Loop',
      Saturday: 'Assignment: Build a Weekly Performance Review Template',
    },
  },
];

export function getCurriculumTopic(week: number, day: CurriculumDay): string | null {
  const found = forexCourseCurriculum.find((item) => item.week === week);
  if (!found) return null;
  return found.topics[day] ?? null;
}

export function getCurriculumWeek(week: number): CurriculumWeek | null {
  return forexCourseCurriculum.find((item) => item.week === week) ?? null;
}

function slugifyTopic(title: string, week: number, day: CurriculumDay) {
  return `${week}-${day.toLowerCase()}-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
}

function buildTopicSummary(title: string, module: string, day: CurriculumDay, isAssignment: boolean) {
  if (isAssignment) {
    return `This ${day.toLowerCase()} assignment converts the ${module.toLowerCase()} lesson flow into a practical exercise, so the trader applies the concept on live charts instead of stopping at theory.`;
  }

  return `${title} is part of the ${module.toLowerCase()} module and gives traders a focused lesson on the concept, why it matters, and how to apply it in real forex decision-making.`;
}

export function getAllCurriculumTopics(): CurriculumTopicRecord[] {
  return forexCourseCurriculum.flatMap((week) => (
    (Object.entries(week.topics) as Array<[CurriculumDay, string]>).map(([day, title]) => {
      const isAssignment = day === 'Saturday' || /^assignment:/i.test(title);
      return {
        slug: slugifyTopic(title, week.week, day),
        week: week.week,
        day,
        module: week.module,
        level: week.level,
        title,
        summary: buildTopicSummary(title, week.module, day, isAssignment),
        isAssignment,
      } satisfies CurriculumTopicRecord;
    })
  ));
}

export function getCurriculumTopicRecord(week: number, day: CurriculumDay): CurriculumTopicRecord | null {
  return getAllCurriculumTopics().find((topic) => topic.week === week && topic.day === day) ?? null;
}

export function getCurriculumTopicRecordBySlug(slug: string): CurriculumTopicRecord | null {
  return getAllCurriculumTopics().find((topic) => topic.slug === slug) ?? null;
}

export function getAdjacentCurriculumTopics(slug: string) {
  const topics = getAllCurriculumTopics();
  const index = topics.findIndex((topic) => topic.slug === slug);

  return {
    previous: index > 0 ? topics[index - 1] : null,
    next: index >= 0 && index < topics.length - 1 ? topics[index + 1] : null,
  };
}
