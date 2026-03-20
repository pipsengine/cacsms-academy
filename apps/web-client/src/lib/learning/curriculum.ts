// â”€â”€â”€ Core Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CurriculumDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

/** A single lesson within a day (1 of 3) */
export type DailyLesson = {
  number: 1 | 2 | 3;
  slug: string;
  title: string;
  summary: string;
  type: 'lesson' | 'assignment';
};

/** One day's teaching block: a theme and exactly 3 lessons */
export type DailyTopicSet = {
  day: CurriculumDay;
  /** Day ordinal within the week: Monday=1 â€¦ Saturday=6 */
  dayIndex: number;
  /** Overarching theme for that day e.g. "What Moves Forex Prices" */
  dayTheme: string;
  lessons: [DailyLesson, DailyLesson, DailyLesson];
};

/** One week of the full course */
export type CourseCurriculumWeek = {
  week: number;
  module: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  description: string;
  days: DailyTopicSet[];
};

/** Flat lesson record, computed from the curriculum tree */
export type LessonRecord = {
  /** e.g. "w1-d1-l1-macroeconomic-drivers-of-currency-value" */
  slug: string;
  week: number;
  day: CurriculumDay;
  dayIndex: number;
  lessonNumber: 1 | 2 | 3;
  /** 0-based absolute position across all lessons */
  lessonIndex: number;
  module: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  dayTheme: string;
  title: string;
  summary: string;
  type: 'lesson' | 'assignment';
};

// â”€â”€â”€ Legacy Types (kept for backward compatibility) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CurriculumWeek = {
  week: number;
  module: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  topics: Record<CurriculumDay, string>;
};

export type CurriculumTopicRecord = {
  slug: string;
  week: number;
  day: CurriculumDay;
  module: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  title: string;
  summary: string;
  isAssignment: boolean;
};

// â”€â”€â”€ Helper: Slug builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DAY_ABBREV: Record<CurriculumDay, string> = {
  Monday: 'mon', Tuesday: 'tue', Wednesday: 'wed',
  Thursday: 'thu', Friday: 'fri', Saturday: 'sat',
};

function lessonSlug(week: number, day: CurriculumDay, num: 1 | 2 | 3, title: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `w${week}-d${DAY_ABBREV[day]}-l${num}-${titleSlug}`;
}

// â”€â”€â”€ Full 3-Lessons-Per-Day Curriculum â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const courseCurriculum: CourseCurriculumWeek[] = [
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // WEEK 1 Â· Forex Foundations Â· Beginner
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    week: 1,
    module: 'Forex Foundations',
    level: 'Beginner',
    description: 'Build an unshakeable base: learn what truly moves currencies, how quotes and pairs work, when to trade, and how to size your exposure correctly.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'What Moves Forex Prices',
        lessons: [
          { number: 1, title: 'Macroeconomic Drivers of Currency Value', type: 'lesson',
            summary: 'How GDP, inflation, employment, and trade balance shape long-term currency direction and why a single data release can move a pair 200 pips in minutes.',
            slug: lessonSlug(1, 'Monday', 1, 'Macroeconomic Drivers of Currency Value') },
          { number: 2, title: 'Central Banks, Interest Rates, and Forex Impact', type: 'lesson',
            summary: 'How rate decisions and forward guidance from central banks (Fed, ECB, BoE, BoJ) reshape currency demand overnight and what traders watch in FOMC minutes.',
            slug: lessonSlug(1, 'Monday', 2, 'Central Banks, Interest Rates, and Forex Impact') },
          { number: 3, title: 'Sentiment, Risk Events, and Short-Term Price Moves', type: 'lesson',
            summary: 'How market mood and scheduled event releases (NFP, CPI, PMI) create predictable volatility windows that professional traders prepare for days in advance.',
            slug: lessonSlug(1, 'Monday', 3, 'Sentiment, Risk Events, and Short-Term Price Moves') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Currency Pairs and Quote Mechanics',
        lessons: [
          { number: 1, title: 'Major, Minor, and Exotic Currency Pair Classifications', type: 'lesson',
            summary: 'Which pairs offer the most liquidity, lowest spreads, and cleanest technical behavior â€” and why pair selection directly affects your execution quality and results.',
            slug: lessonSlug(1, 'Tuesday', 1, 'Major, Minor, and Exotic Currency Pair Classifications') },
          { number: 2, title: 'Reading a Forex Quote: Bid, Ask, and Spread', type: 'lesson',
            summary: 'How price quotes work, what the bid/ask spread represents, when spread widens matter, and how to factor transaction cost into your trade plan.',
            slug: lessonSlug(1, 'Tuesday', 2, 'Reading a Forex Quote: Bid, Ask, and Spread') },
          { number: 3, title: 'Base Currency, Quote Currency, and Cross Rate Mechanics', type: 'lesson',
            summary: 'How currency math works when converting between non-USD pairs: calculation of cross rates, triangular arbitrage logic, and what it means for your P&L.',
            slug: lessonSlug(1, 'Tuesday', 3, 'Base Currency, Quote Currency, and Cross Rate Mechanics') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Sessions, Liquidity, and Volatility Windows',
        lessons: [
          { number: 1, title: 'The Four Major Trading Sessions: Asia, London, New York, Pacific', type: 'lesson',
            summary: 'When each session opens and closes, which currencies are most active per session, and the typical range and character each session produces.',
            slug: lessonSlug(1, 'Wednesday', 1, 'The Four Major Trading Sessions: Asia, London, New York, Pacific') },
          { number: 2, title: 'Session Overlaps and Peak Volatility Windows', type: 'lesson',
            summary: 'Why the London-New York overlap is the most active and liquid period in forex, how to trade the overlap open, and why this window produces the cleanest setups.',
            slug: lessonSlug(1, 'Wednesday', 2, 'Session Overlaps and Peak Volatility Windows') },
          { number: 3, title: 'Why Forex Volume and Range Patterns Vary by Time of Day', type: 'lesson',
            summary: 'Using time-of-day filters to avoid low-probability periods, identify expansion windows, and align entry timing with institutional activity cycles.',
            slug: lessonSlug(1, 'Wednesday', 3, 'Why Forex Volume and Range Patterns Vary by Time of Day') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Pips, Lot Size, and Position Value',
        lessons: [
          { number: 1, title: 'What a Pip Represents on Different Pairs', type: 'lesson',
            summary: 'How pip value differs between JPY pairs and others, why the same lot size carries different dollar risk on different instruments, and how to account for this.',
            slug: lessonSlug(1, 'Thursday', 1, 'What a Pip Represents on Different Pairs') },
          { number: 2, title: 'Standard, Mini, and Micro Lot Sizing Mechanics', type: 'lesson',
            summary: 'How lot sizes map to dollar risk, why micro sizing helps beginners build consistency while limiting drawdown, and when to scale position size.',
            slug: lessonSlug(1, 'Thursday', 2, 'Standard, Mini, and Micro Lot Sizing Mechanics') },
          { number: 3, title: 'Calculating Dollar Value per Pip and Real Risk per Trade', type: 'lesson',
            summary: 'A complete walkthrough of position sizing: account size Ã— risk percent Ã· pip distance Ã— pip value = correct lot size â€” the formula every trader must master.',
            slug: lessonSlug(1, 'Thursday', 3, 'Calculating Dollar Value per Pip and Real Risk per Trade') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Reading Candlesticks with Context',
        lessons: [
          { number: 1, title: 'Anatomy of a Candlestick: Body, Wicks, and Close Location', type: 'lesson',
            summary: 'What each part of a candle reveals about buyer vs seller control, why close location within the range is the most important signal, and what open gaps communicate.',
            slug: lessonSlug(1, 'Friday', 1, 'Anatomy of a Candlestick: Body, Wicks, and Close Location') },
          { number: 2, title: 'High-Probability Reversal and Continuation Candles', type: 'lesson',
            summary: 'The specific candle patterns professional traders monitor â€” pin bars, engulfing, inside bars, marubozu â€” and why context always determines whether they trigger.',
            slug: lessonSlug(1, 'Friday', 2, 'High-Probability Reversal and Continuation Candles') },
          { number: 3, title: 'Session Context and Timeframe Alignment for Candle Reliability', type: 'lesson',
            summary: 'Why the same candle pattern behaves differently at 2am versus 2pm London time, and how timeframe alignment turns marginal patterns into high-conviction signals.',
            slug: lessonSlug(1, 'Friday', 3, 'Session Context and Timeframe Alignment for Candle Reliability') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Market Observation Journal',
        lessons: [
          { number: 1, title: 'Assignment Overview: Your Market Observation Journal', type: 'assignment',
            summary: 'The purpose and structure of a trading journal as a professional development tool â€” why top traders cite journaling as the single most impactful habit in their growth.',
            slug: lessonSlug(1, 'Saturday', 1, 'Assignment Overview: Your Market Observation Journal') },
          { number: 2, title: 'Step-by-Step Setup: What to Record Each Day', type: 'assignment',
            summary: 'Exactly what fields to capture (pair, session, market state, setup, trigger, R:R, outcome), how to classify market state, and how to rate setup quality objectively.',
            slug: lessonSlug(1, 'Saturday', 2, 'Step-by-Step Setup: What to Record Each Day') },
          { number: 3, title: 'Review Criteria and Weekly Journal Evaluation Checklist', type: 'assignment',
            summary: 'How to assess your journal entries over a week, what patterns to look for, and how to extract one concrete improvement action from your data each week.',
            slug: lessonSlug(1, 'Saturday', 3, 'Review Criteria and Weekly Journal Evaluation Checklist') },
        ],
      },
    ],
  },
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // WEEK 2 Â· Market Structure Basics Â· Beginner
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    week: 2,
    module: 'Market Structure Basics',
    level: 'Beginner',
    description: 'Develop the ability to read price structure clearly: identify valid levels, classify trend and range, spot genuine breakouts, and map key zones across timeframes.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Support and Resistance Fundamentals',
        lessons: [
          { number: 1, title: 'What Makes a Level of Support or Resistance Valid', type: 'lesson',
            summary: 'High-touch count, clean price reaction, proximity to current price â€” how to distinguish significant levels from random noise using only price history.',
            slug: lessonSlug(2, 'Monday', 1, 'What Makes a Level of Support or Resistance Valid') },
          { number: 2, title: 'Fresh vs Tested Levels and How Strength Declines After Each Touch', type: 'lesson',
            summary: 'Why untested levels often offer stronger reactions than those touched multiple times, and how to classify level freshness before planning an entry.',
            slug: lessonSlug(2, 'Monday', 2, 'Fresh vs Tested Levels and How Strength Declines After Each Touch') },
          { number: 3, title: 'Static vs Dynamic Support and Resistance: Which to Trust', type: 'lesson',
            summary: 'Comparing structure-based key levels from price history to moving averages and trendlines â€” when each type is most reliable and how to use both in confluence.',
            slug: lessonSlug(2, 'Monday', 3, 'Static vs Dynamic Support and Resistance: Which to Trust') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Trend vs Range Identification',
        lessons: [
          { number: 1, title: 'Defining Trend: The Sequence of Highs and Lows in Practice', type: 'lesson',
            summary: 'Using swing points to classify trend direction without relying on indicators â€” how to identify a valid uptrend, downtrend, and the boundaries of each.',
            slug: lessonSlug(2, 'Tuesday', 1, 'Defining Trend: The Sequence of Highs and Lows in Practice') },
          { number: 2, title: 'Range Markets: How to Identify and Exploit Boundary Behavior', type: 'lesson',
            summary: 'What separates a clean tradeable range from choppy untradeable consolidation, and how to build a complete range-trading approach with low-risk entries.',
            slug: lessonSlug(2, 'Tuesday', 2, 'Range Markets: How to Identify and Exploit Boundary Behavior') },
          { number: 3, title: 'Transition Zones: When Trend Converts to Range and Back', type: 'lesson',
            summary: 'Recognizing when a trend is exhausting and a range is forming using structural signals â€” the most dangerous market phase for traders who do not adapt.',
            slug: lessonSlug(2, 'Tuesday', 3, 'Transition Zones: When Trend Converts to Range and Back') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Breakout vs Fakeout Recognition',
        lessons: [
          { number: 1, title: 'What a Genuine Breakout Looks Like Before and After Confirmation', type: 'lesson',
            summary: 'Momentum expansion, candle character, and the critical importance of the closing price beyond the level â€” the difference between a break and a body close.',
            slug: lessonSlug(2, 'Wednesday', 1, 'What a Genuine Breakout Looks Like Before and After Confirmation') },
          { number: 2, title: 'False Breakout Patterns: Entry Traps Professional Traders Set', type: 'lesson',
            summary: 'Why retail stop orders placed beyond obvious levels fuel reversals that institutional traders use to enter large positions at far superior prices.',
            slug: lessonSlug(2, 'Wednesday', 2, 'False Breakout Patterns: Entry Traps Professional Traders Set') },
          { number: 3, title: 'Post-Breakout Behavior: Retest, Follow-Through, or Failure', type: 'lesson',
            summary: 'The three outcomes after any breakout and how to position for each â€” the retest entry, the immediate follow-through, and the failed break reversal.',
            slug: lessonSlug(2, 'Wednesday', 3, 'Post-Breakout Behavior: Retest, Follow-Through, or Failure') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Higher Highs and Lower Lows in Practice',
        lessons: [
          { number: 1, title: 'Identifying Swing Highs and Swing Lows on a Clean Chart', type: 'lesson',
            summary: 'The exact criteria for marking a valid swing point â€” what constitutes a significant pivot vs minor noise, and how bar count lookback periods affect classification.',
            slug: lessonSlug(2, 'Thursday', 1, 'Identifying Swing Highs and Swing Lows on a Clean Chart') },
          { number: 2, title: 'Trend Confirmation Using Multiple Timeframe Swing Structure', type: 'lesson',
            summary: 'Why higher-timeframe structure matters more than lower-timeframe swings â€” how to use the daily to confirm what the H1 is showing before entering.',
            slug: lessonSlug(2, 'Thursday', 2, 'Trend Confirmation Using Multiple Timeframe Swing Structure') },
          { number: 3, title: 'Structure Breaks as Entry and Exit Signals', type: 'lesson',
            summary: 'Using a confirmed swing break to signal trend reversal or acceleration â€” the structure-break entry model that works across all timeframes and currency pairs.',
            slug: lessonSlug(2, 'Thursday', 3, 'Structure Breaks as Entry and Exit Signals') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Key Level Mapping Across Timeframes',
        lessons: [
          { number: 1, title: 'Why Timeframe Alignment Matters in Level Selection', type: 'lesson',
            summary: 'How higher-timeframe levels provide context while lower-timeframe precision provides execution edge â€” and how to hold both in mind simultaneously.',
            slug: lessonSlug(2, 'Friday', 1, 'Why Timeframe Alignment Matters in Level Selection') },
          { number: 2, title: 'A Top-Down Mapping Approach: Monthly Down to H1', type: 'lesson',
            summary: 'The exact process professionals use to draw meaningful levels before the week starts â€” starting at Monthly and drilling down to H1 in sequence.',
            slug: lessonSlug(2, 'Friday', 2, 'A Top-Down Mapping Approach: Monthly Down to H1') },
          { number: 3, title: 'Confluent Levels: When Multiple Timeframes Agree on a Zone', type: 'lesson',
            summary: 'Why overlapping levels from different timeframes create the highest-probability reaction zones â€” and how to prioritize trades at these confluent areas.',
            slug: lessonSlug(2, 'Friday', 3, 'Confluent Levels: When Multiple Timeframes Agree on a Zone') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Mark Structure on 3 Major Pairs',
        lessons: [
          { number: 1, title: 'Assignment Overview: Multi-Pair Structure Study', type: 'assignment',
            summary: 'Why comparative structure analysis across multiple pairs builds pattern recognition faster than studying a single pair â€” and what the three-pair study reveals.',
            slug: lessonSlug(2, 'Saturday', 1, 'Assignment Overview: Multi-Pair Structure Study') },
          { number: 2, title: 'Instructions: Structure Mapping on EUR/USD, GBP/USD, and USD/JPY', type: 'assignment',
            summary: 'The exact chart markup process: criteria for key level selection, trend classification, support/resistance zones, and multi-timeframe markup on all three pairs.',
            slug: lessonSlug(2, 'Saturday', 2, 'Instructions: Structure Mapping on EUR/USD, GBP/USD, and USD/JPY') },
          { number: 3, title: 'Grading Your Analysis: Structure Evaluation and Scoring Guide', type: 'assignment',
            summary: 'How to objectively evaluate your own structure work for accuracy, level validity, and timeframe alignment â€” with a scoring framework and improvement notes.',
            slug: lessonSlug(2, 'Saturday', 3, 'Grading Your Analysis: Structure Evaluation and Scoring Guide') },
        ],
      },
    ],
  },
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // WEEK 3 Â· Execution and Risk Control Â· Beginner
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    week: 3,
    module: 'Execution and Risk Control',
    level: 'Beginner',
    description: 'Master the operational side of trading: confirmed entry triggers, invalidation-based stops, precise position sizing, risk-to-reward planning, and active trade management.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Entry Triggers and Candle Close Confirmation',
        lessons: [
          { number: 1, title: 'Why Candle Close Confirmation Reduces Low-Quality Entries', type: 'lesson',
            summary: 'How waiting for a candle body to close beyond a level â€” rather than triggering mid-candle â€” eliminates a large percentage of false signals at zero additional cost.',
            slug: lessonSlug(3, 'Monday', 1, 'Why Candle Close Confirmation Reduces Low-Quality Entries') },
          { number: 2, title: 'Three Entry Trigger Types: Retest, Rejection, and Momentum Close', type: 'lesson',
            summary: 'When a retest entry offers better R:R than an immediate break entry, when rejection candles justify early positioning, and when momentum close entries are highest probability.',
            slug: lessonSlug(3, 'Monday', 2, 'Three Entry Trigger Types: Retest, Rejection, and Momentum Close') },
          { number: 3, title: 'Building a Pre-Entry Decision Framework as a Trader Checklist', type: 'lesson',
            summary: 'A structured mental checklist covering bias, setup condition, trigger, stop, target, and position size â€” so no live trade is entered without complete preparation.',
            slug: lessonSlug(3, 'Monday', 3, 'Building a Pre-Entry Decision Framework as a Trader Checklist') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Stop-Loss Placement by Invalidation',
        lessons: [
          { number: 1, title: 'The Invalidation Concept: Market Structure Defines Your Stop', type: 'lesson',
            summary: 'How to place stops beyond the specific level that would prove your trade thesis wrong â€” not at arbitrary pip distances or round numbers that get hunted routinely.',
            slug: lessonSlug(3, 'Tuesday', 1, 'The Invalidation Concept: Market Structure Defines Your Stop') },
          { number: 2, title: 'Stop Placement Mistakes That Get Traders Stopped Out Prematurely', type: 'lesson',
            summary: 'Arbitrary pip stops, identical stop distances across pairs, stop placement at obvious round numbers, and ignoring pair-specific volatility â€” all analyzed with examples.',
            slug: lessonSlug(3, 'Tuesday', 2, 'Stop Placement Mistakes That Get Traders Stopped Out Prematurely') },
          { number: 3, title: 'Adjusting Stop Width for Pair Volatility and Session Timing', type: 'lesson',
            summary: 'How EUR/USD and GBP/JPY require structurally different stop distances, and why the same setup in Asia vs London session needs a different stop buffer.',
            slug: lessonSlug(3, 'Tuesday', 3, 'Adjusting Stop Width for Pair Volatility and Session Timing') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Risk Per Trade and Position Sizing',
        lessons: [
          { number: 1, title: 'The One Percent Rule and Why It Compounds Into Trading Survival', type: 'lesson',
            summary: 'Mathematical proof of why fixed percentage risk beats fixed lot sizing long-term â€” the drawdown math, recovery curve, and psychological benefit of structured risk.',
            slug: lessonSlug(3, 'Wednesday', 1, 'The One Percent Rule and Why It Compounds Into Trading Survival') },
          { number: 2, title: 'Position Sizing Formula Every Active Trader Must Know', type: 'lesson',
            summary: 'Account size Ã— risk percent Ã· (stop pips Ã— pip value) = lot size â€” the complete calculation with worked examples across EUR/USD, GBP/USD, and USD/JPY.',
            slug: lessonSlug(3, 'Wednesday', 2, 'Position Sizing Formula Every Active Trader Must Know') },
          { number: 3, title: 'Scaling Risk Based on Confidence Level and Setup Grade', type: 'lesson',
            summary: 'How to allocate 0.5%, 1%, or 1.5% of risk based on a personal setup scoring system â€” so your highest-conviction setups receive the most capital, not random ones.',
            slug: lessonSlug(3, 'Wednesday', 3, 'Scaling Risk Based on Confidence Level and Setup Grade') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Risk-to-Reward Planning Before Entry',
        lessons: [
          { number: 1, title: 'What Reward-to-Risk Ratio Actually Means in Live Trading', type: 'lesson',
            summary: 'Why a 1:2 R:R doesn\'t simply mean you need 33% accuracy to profit â€” the real interaction between win rate, R:R, trade frequency, and net expectancy.',
            slug: lessonSlug(3, 'Thursday', 1, 'What Reward-to-Risk Ratio Actually Means in Live Trading') },
          { number: 2, title: 'Setting Targets at Logical Structure Levels Not Fixed Multiples', type: 'lesson',
            summary: 'Why take-profit targets must be placed at levels where price has historically reversed â€” not at arbitrary multiples of the stop distance that ignore actual market structure.',
            slug: lessonSlug(3, 'Thursday', 2, 'Setting Targets at Logical Structure Levels Not Fixed Multiples') },
          { number: 3, title: 'Win Rate and R:R Interaction: Expectancy Calculation for Traders', type: 'lesson',
            summary: 'E = (Win Rate Ã— Avg Win) âˆ’ (Loss Rate Ã— Avg Loss): the formula that reveals why a 40% win rate at 1:3 R:R outperforms a 60% win rate at 1:1 over 100 trades.',
            slug: lessonSlug(3, 'Thursday', 3, 'Win Rate and R:R Interaction: Expectancy Calculation for Traders') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Trade Management: Hold, Scale, or Exit',
        lessons: [
          { number: 1, title: 'When to Hold Full Size, Partial Exit, or Close a Trade Early', type: 'lesson',
            summary: 'Decision criteria for managing open positions without emotional interference â€” what price behavior justifies holding for full target vs what signals premature exit.',
            slug: lessonSlug(3, 'Friday', 1, 'When to Hold Full Size, Partial Exit, or Close a Trade Early') },
          { number: 2, title: 'Trailing Stops and Breakeven Moves: When They Help vs Hurt', type: 'lesson',
            summary: 'Common trade management errors that reduce profitable trades before they reach target â€” when moving to breakeven too early turns winning setups into breakeven frustration.',
            slug: lessonSlug(3, 'Friday', 2, 'Trailing Stops and Breakeven Moves: When They Help vs Hurt') },
          { number: 3, title: 'Reading Momentum During a Trade: Continuation vs Exhaustion Signals', type: 'lesson',
            summary: 'In-trade signals suggesting an adjustment in management strategy: slowing momentum candles, counter-structure formations, and session close as exit signals.',
            slug: lessonSlug(3, 'Friday', 3, 'Reading Momentum During a Trade: Continuation vs Exhaustion Signals') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Rule-Based Trade Checklist',
        lessons: [
          { number: 1, title: 'Assignment Overview: Your Personal Trade Execution Checklist', type: 'assignment',
            summary: 'Why a written rules document is more valuable than intuition for developing traders â€” and how the discipline of following a written checklist accelerates skill growth.',
            slug: lessonSlug(3, 'Saturday', 1, 'Assignment Overview: Your Personal Trade Execution Checklist') },
          { number: 2, title: 'Designing Your Checklist: Pre-Entry, Execution, and Post-Trade Sections', type: 'assignment',
            summary: 'What to include in each phase of the checklist with example entries across bias definition, setup condition, trigger confirmation, risk calculation, and post-trade review.',
            slug: lessonSlug(3, 'Saturday', 2, 'Designing Your Checklist: Pre-Entry, Execution, and Post-Trade Sections') },
          { number: 3, title: 'Testing Your Checklist Against 5 Recent or Historical Setups', type: 'assignment',
            summary: 'The backtesting process for validating whether the checklist actually describes your best historical trades â€” and how to refine it based on what the test reveals.',
            slug: lessonSlug(3, 'Saturday', 3, 'Testing Your Checklist Against 5 Recent or Historical Setups') },
        ],
      },
    ],
  },
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // WEEK 4 Â· Confluence and Setup Quality Â· Intermediate
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    week: 4,
    module: 'Confluence and Setup Quality',
    level: 'Intermediate',
    description: 'Raise the quality bar on every trade: stack multiple filters, distinguish retest from immediate entries, apply multi-timeframe bias, and score setups before risk is placed.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Confluence: Structure, Momentum, and Session Timing',
        lessons: [
          { number: 1, title: 'What Confluence Means and Why Single-Reason Entries Fail', type: 'lesson',
            summary: 'Why aligning multiple independent factors before entry dramatically improves probability â€” and why a trade valid for only one reason is speculative rather than edge-based.',
            slug: lessonSlug(4, 'Monday', 1, 'What Confluence Means and Why Single-Reason Entries Fail') },
          { number: 2, title: 'Building a Confluence Stack: Structure, Momentum, Session, and Level', type: 'lesson',
            summary: 'The four layers that professional traders align simultaneously: structure direction, momentum quality, session relevance, and key level proximity â€” all before a single click.',
            slug: lessonSlug(4, 'Monday', 2, 'Building a Confluence Stack: Structure, Momentum, Session, and Level') },
          { number: 3, title: 'Scoring Confluence: Rating Setup Quality Before Risk Is Placed', type: 'lesson',
            summary: 'A numerical approach to filtering trades â€” assign a score for each factor present and establish a minimum threshold below which no live risk is placed regardless of conviction.',
            slug: lessonSlug(4, 'Monday', 3, 'Scoring Confluence: Rating Setup Quality Before Risk Is Placed') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Retest Entries vs Immediate Break Entries',
        lessons: [
          { number: 1, title: 'Immediate Breakout Entries: When Speed Has a Structural Edge', type: 'lesson',
            summary: 'Session context and momentum alignment conditions where waiting for a retest means missing the entire move â€” and the specific signals that justify an impulsive entry.',
            slug: lessonSlug(4, 'Tuesday', 1, 'Immediate Breakout Entries: When Speed Has a Structural Edge') },
          { number: 2, title: 'Retest Entries: Patient Approach for Superior Risk Management', type: 'lesson',
            summary: 'Why waiting for price to return to a broken level offers better R:R, tighter stops at proven structure, and higher confidence â€” even at the cost of some missed trades.',
            slug: lessonSlug(4, 'Tuesday', 2, 'Retest Entries: Patient Approach for Superior Risk Management') },
          { number: 3, title: 'Failed Retest Recognition: When a Retest Becomes a Rollback', type: 'lesson',
            summary: 'How to distinguish healthy consolidation above a broken level from a structural rejection that invalidates the entire breakout thesis â€” and how to manage both outcomes.',
            slug: lessonSlug(4, 'Tuesday', 3, 'Failed Retest Recognition: When a Retest Becomes a Rollback') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Using Multi-Timeframe Bias in Daily Trading',
        lessons: [
          { number: 1, title: 'Top-Down Bias Definition: Monthly Context to Entry Timeframe', type: 'lesson',
            summary: 'The weekly structure explains daily range direction; the daily explains H4 entries â€” how to define directional bias at each level and cascade it down to execution.',
            slug: lessonSlug(4, 'Wednesday', 1, 'Top-Down Bias Definition: Monthly Context to Entry Timeframe') },
          { number: 2, title: 'How Higher-Timeframe Bias Filters Lower-Timeframe Entries', type: 'lesson',
            summary: 'The operational rule: only take longs on H1 when D1 and H4 are both in a defined uptrend â€” how to mechanically apply this filter before scanning for entries.',
            slug: lessonSlug(4, 'Wednesday', 2, 'How Higher-Timeframe Bias Filters Lower-Timeframe Entries') },
          { number: 3, title: 'Timeframe Conflict Resolution: When Timeframes Disagree', type: 'lesson',
            summary: 'When D1 is bullish but H4 is in a counter-structure pullback â€” strategies for managing bias ambiguity, waiting for realignment, and when to skip the week entirely.',
            slug: lessonSlug(4, 'Wednesday', 3, 'Timeframe Conflict Resolution: When Timeframes Disagree') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Filtering Low-Quality Setups',
        lessons: [
          { number: 1, title: 'Defining a Low-Quality Setup: The Five Failure Patterns', type: 'lesson',
            summary: 'Over-touched levels, low momentum confirmation, disaligned timeframes, poor session timing, and absent invalidation â€” the five patterns that precede most losing trades.',
            slug: lessonSlug(4, 'Thursday', 1, 'Defining a Low-Quality Setup: The Five Failure Patterns') },
          { number: 2, title: 'The No-Reason-Not-To Trap: Overtrading From Market Boredom', type: 'lesson',
            summary: 'Why taking setups with no edge simply because price is moving is the single most expensive mistake in active trading â€” and the psychological triggers behind it.',
            slug: lessonSlug(4, 'Thursday', 2, 'The No-Reason-Not-To Trap: Overtrading From Market Boredom') },
          { number: 3, title: 'Creating a Minimum Entry Condition Filter for Consistency', type: 'lesson',
            summary: 'Setting hard rules that automatically disqualify setups below a defined quality threshold â€” creating a systemic filter that removes discretionary slip in marginal scenarios.',
            slug: lessonSlug(4, 'Thursday', 3, 'Creating a Minimum Entry Condition Filter for Consistency') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Setup Scoring Framework for Consistency',
        lessons: [
          { number: 1, title: 'Designing a Setup Scoring Matrix Across 4 to 6 Criteria', type: 'lesson',
            summary: 'Turning discretionary judgment into a repeatable number â€” how to design a scoring matrix, weight the criteria by edge impact, and establish a minimum score threshold.',
            slug: lessonSlug(4, 'Friday', 1, 'Designing a Setup Scoring Matrix Across 4 to 6 Criteria') },
          { number: 2, title: 'Live Application: Scoring 3 Setups Using the Framework', type: 'lesson',
            summary: 'Walk-through of applying the scoring matrix to three real or demo chart examples â€” interpreting the scores, identifying which pass the threshold, and journaling the result.',
            slug: lessonSlug(4, 'Friday', 2, 'Live Application: Scoring 3 Setups Using the Framework') },
          { number: 3, title: 'Score Calibration Over Time: Improving Your Filter Accuracy', type: 'lesson',
            summary: 'Review historical trades by score, analyze whether high-scoring setups outperformed low-scoring ones, and fine-tune criteria weighting based on what the data reveals.',
            slug: lessonSlug(4, 'Friday', 3, 'Score Calibration Over Time: Improving Your Filter Accuracy') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Grade 5 Setups with a Scoring Model',
        lessons: [
          { number: 1, title: 'Assignment Overview: Setup Grading Practice with Your Matrix', type: 'assignment',
            summary: 'Why grading setups with a scoring model builds objective independent judgment faster than intuitive chart review â€” the transition from feelings to evidence-based filtering.',
            slug: lessonSlug(4, 'Saturday', 1, 'Assignment Overview: Setup Grading Practice with Your Matrix') },
          { number: 2, title: 'Scoring 5 Setups: Criteria Application Worksheet', type: 'assignment',
            summary: 'Walk through each of the 5 setups, assigning scores against each criterion and arriving at a total â€” with comparison against your defined entry threshold.',
            slug: lessonSlug(4, 'Saturday', 2, 'Scoring 5 Setups: Criteria Application Worksheet') },
          { number: 3, title: 'Reflection Report: What Your Scores Reveal About Your Decisions', type: 'assignment',
            summary: 'Analyzing score patterns to identify systematic weaknesses in setup selection â€” what the data says about which criteria you are underweighting or misapplying.',
            slug: lessonSlug(4, 'Saturday', 3, 'Reflection Report: What Your Scores Reveal About Your Decisions') },
        ],
      },
    ],
  },
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // WEEK 5 Â· Liquidity and Institutional Behavior Â· Intermediate
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    week: 5,
    module: 'Liquidity and Institutional Behavior',
    level: 'Intermediate',
    description: 'Understand how institutional order flow drives price â€” identifying stop clusters, reading liquidity sweeps, tracking session expansion, and entering at institutional footprints.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Liquidity Pools and Stop Clusters',
        lessons: [
          { number: 1, title: 'Where Retail Stop Orders Accumulate in the Market', type: 'lesson',
            summary: 'Why obvious placements above swing highs and below swing lows create predictable liquidity concentrations that institutional algorithms are designed to reach before reversing.',
            slug: lessonSlug(5, 'Monday', 1, 'Where Retail Stop Orders Accumulate in the Market') },
          { number: 2, title: 'Equal Highs, Equal Lows, and Round Numbers as Stop Attractors', type: 'lesson',
            summary: 'Price structures that signal high stop cluster density â€” equal swing points, psychological round numbers, and prior day highs and lows â€” and what happens as price approaches them.',
            slug: lessonSlug(5, 'Monday', 2, 'Equal Highs, Equal Lows, and Round Numbers as Stop Attractors') },
          { number: 3, title: 'Why Price Must Clear Liquidity Before Reversing or Sustaining', type: 'lesson',
            summary: 'The mechanics of how institutional orders use stop liquidation to enter large positions efficiently â€” why every major trend reversal is preceded by a liquidity sweep.',
            slug: lessonSlug(5, 'Monday', 3, 'Why Price Must Clear Liquidity Before Reversing or Sustaining') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Liquidity Sweeps and Rejection Patterns',
        lessons: [
          { number: 1, title: 'What a Liquidity Sweep Looks Like: The Long Wick Candle', type: 'lesson',
            summary: 'Identifying the sweep candle characteristics â€” wick breach beyond the level, body close back within range, strong closing rejection â€” across multiple timeframes.',
            slug: lessonSlug(5, 'Tuesday', 1, 'What a Liquidity Sweep Looks Like: The Long Wick Candle') },
          { number: 2, title: 'Trading the Sweep: Entry Timing After a Liquidity Grab', type: 'lesson',
            summary: 'How to enter after a confirmed liquidity sweep with precision: the wick extreme as the stop level, the rejection candle close as the trigger, and the structure high as the target.',
            slug: lessonSlug(5, 'Tuesday', 2, 'Trading the Sweep: Entry Timing After a Liquidity Grab') },
          { number: 3, title: 'Failed Sweep Follow-Through: When Rejection Turns Into Extension', type: 'lesson',
            summary: 'Distinguishing a true reversal sweep from a continuation wick that traps sellers prematurely â€” the specific candle sequence that reveals institutional continuation intent.',
            slug: lessonSlug(5, 'Tuesday', 3, 'Failed Sweep Follow-Through: When Rejection Turns Into Extension') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Order Flow Clues in Price Action',
        lessons: [
          { number: 1, title: 'Impulsive vs Corrective Price Moves and Institutional Intent', type: 'lesson',
            summary: 'Why impulsive three-candle moves signal strong institutional conviction and how corrective quality â€” shallow vs deep, overlapping vs clean â€” reveals probability of continuation.',
            slug: lessonSlug(5, 'Wednesday', 1, 'Impulsive vs Corrective Price Moves and Institutional Intent') },
          { number: 2, title: 'Imbalance, Displacement, and Fair Value Gaps in Price Structure', type: 'lesson',
            summary: 'The gaps and inefficiencies in price action that arise from impulsive institutional moves â€” why price often returns to fill these inefficiencies before resuming direction.',
            slug: lessonSlug(5, 'Wednesday', 2, 'Imbalance, Displacement, and Fair Value Gaps in Price Structure') },
          { number: 3, title: 'Using Price Delivery Rhythm to Anticipate the Next Move', type: 'lesson',
            summary: 'How institutions consistently sequence impulsive â†’ corrective â†’ impulsive moves and how aligning entry timing with this rhythm dramatically improves probability and R:R.',
            slug: lessonSlug(5, 'Wednesday', 3, 'Using Price Delivery Rhythm to Anticipate the Next Move') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Session Opens and Expansion Behavior',
        lessons: [
          { number: 1, title: 'London and New York Open: Directional Expansion Patterns', type: 'lesson',
            summary: 'Why the session open is one of the highest-probability entry windows in professional trading â€” the structural behavior that occurs within the first 30 minutes of each major session.',
            slug: lessonSlug(5, 'Thursday', 1, 'London and New York Open: Directional Expansion Patterns') },
          { number: 2, title: 'Pre-Open Accumulation and the Stop Run Setup', type: 'lesson',
            summary: 'How price often sweeps prior session lows or highs minutes before major session opens â€” creating the liquidity needed for a directional expansion into the new session.',
            slug: lessonSlug(5, 'Thursday', 2, 'Pre-Open Accumulation and the Stop Run Setup') },
          { number: 3, title: 'High-Probability Trade Windows and Time-Based Entry Filtering', type: 'lesson',
            summary: 'Concentrating entry attempts in the 2-3 highest-probability time windows per day â€” the ICT kill zone concept adapted to structured, consistent daily preparation.',
            slug: lessonSlug(5, 'Thursday', 3, 'High-Probability Trade Windows and Time-Based Entry Filtering') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Combining Liquidity with Structure Entries',
        lessons: [
          { number: 1, title: 'Liquidity-Structure Confluence: Sweep Plus Key Level Alignment', type: 'lesson',
            summary: 'The single most repeatable high-probability confluence in institutional trading: a liquidity sweep that occurs precisely at a major structure level during a key session window.',
            slug: lessonSlug(5, 'Friday', 1, 'Liquidity-Structure Confluence: Sweep Plus Key Level Alignment') },
          { number: 2, title: 'Building a Liquidity-Aware Entry Checklist for Live Trading', type: 'lesson',
            summary: 'What to verify before entering any trade that depends on institutional liquidity behavior â€” a six-point verification process for the highest-quality setups in your model.',
            slug: lessonSlug(5, 'Friday', 2, 'Building a Liquidity-Aware Entry Checklist for Live Trading') },
          { number: 3, title: 'Three Liquidity-Structure Entry Case Studies Analyzed', type: 'lesson',
            summary: 'Three real-pattern examples showing sweep â†’ rejection candle â†’ confirmation â†’ measured entry with annotated R:R, stop placement, and post-trade analysis.',
            slug: lessonSlug(5, 'Friday', 3, 'Three Liquidity-Structure Entry Case Studies Analyzed') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Document 3 Liquidity Sweep Cases',
        lessons: [
          { number: 1, title: 'Assignment Overview: Building Your Liquidity Case Library', type: 'assignment',
            summary: 'Why building a personal library of documented sweep patterns accelerates live recognition speed â€” the principle of pattern exposure compounding into faster trade identification.',
            slug: lessonSlug(5, 'Saturday', 1, 'Assignment Overview: Building Your Liquidity Case Library') },
          { number: 2, title: 'Step-by-Step: Identifying and Documenting Each Sweep Case', type: 'assignment',
            summary: 'Exact verification criteria: wick breach and body close confirmation, confluence level alignment, volume character, session timing, and annotated screenshot documentation.',
            slug: lessonSlug(5, 'Saturday', 2, 'Step-by-Step: Identifying and Documenting Each Sweep Case') },
          { number: 3, title: 'Analysis Report: What Your 3 Cases Reveal About Institutional Behavior', type: 'assignment',
            summary: 'Cross-case comparison template to identify consistent institutional behavior patterns across your three documented sweeps â€” and how this analysis informs your live trading model.',
            slug: lessonSlug(5, 'Saturday', 3, 'Analysis Report: What Your 3 Cases Reveal About Institutional Behavior') },
        ],
      },
    ],
  },
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // WEEK 6 Â· Performance and Process Optimization Â· Intermediate
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    week: 6,
    module: 'Performance and Process Optimization',
    level: 'Intermediate',
    description: 'Close the loop on your trading process: track the metrics that matter, identify behavioral errors, calculate your edge, refine a single playbook, and build a sustainable improvement loop.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Trade Journal Metrics that Matter',
        lessons: [
          { number: 1, title: 'The 8 Journal Metrics That Separate Average from Elite Traders', type: 'lesson',
            summary: 'Win rate, expectancy, max drawdown, missed setups, impulsive entries, time-of-day distribution, pair focus clarity, and R:R consistency â€” what each metric reveals about your current edge.',
            slug: lessonSlug(6, 'Monday', 1, 'The 8 Journal Metrics That Separate Average from Elite Traders') },
          { number: 2, title: 'Building a Data-Driven Trading Dashboard in a Spreadsheet', type: 'lesson',
            summary: 'Exact column headers, formulas, and chart types for tracking performance metrics weekly â€” a complete spreadsheet structure that surfaces your edge or exposes its absence.',
            slug: lessonSlug(6, 'Monday', 2, 'Building a Data-Driven Trading Dashboard in a Spreadsheet') },
          { number: 3, title: 'How to Conduct a Weekly Performance Audit from Your Journal', type: 'lesson',
            summary: 'A structured 20-minute Friday review process: what you planned, what actually triggered, what deviated, and the single most valuable action to improve next week.',
            slug: lessonSlug(6, 'Monday', 3, 'How to Conduct a Weekly Performance Audit from Your Journal') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Expectancy and Win/Loss Distribution',
        lessons: [
          { number: 1, title: 'Expectancy Formula: The Single Number That Defines System Quality', type: 'lesson',
            summary: 'E = (Win Rate Ã— Avg Win) âˆ’ (Loss Rate Ã— Avg Loss): how to calculate it, what a positive expectancy means, and how to use it as the primary benchmark for any trading system.',
            slug: lessonSlug(6, 'Tuesday', 1, 'Expectancy Formula: The Single Number That Defines System Quality') },
          { number: 2, title: 'Running Expectancy Analysis on Your Past 20 Trades', type: 'lesson',
            summary: 'The practical calculation process using 20 real or demo trades to baseline your current edge â€” what the result reveals and how to interpret positive vs negative expectancy in context.',
            slug: lessonSlug(6, 'Tuesday', 2, 'Running Expectancy Analysis on Your Past 20 Trades') },
          { number: 3, title: 'Improving Expectancy: Which Variable Has the Highest Leverage', type: 'lesson',
            summary: 'Whether to focus on increasing win rate, improving average win size, or tightening average loss based on your current data pattern â€” and the fastest path to improving each.',
            slug: lessonSlug(6, 'Tuesday', 3, 'Improving Expectancy: Which Variable Has the Highest Leverage') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Identifying Behavioral Errors in Execution',
        lessons: [
          { number: 1, title: 'The Five Most Expensive Behavioral Trading Errors and Their Signatures', type: 'lesson',
            summary: 'Revenge trading, premature profit exit, outsized position sizing, entry hesitation, and journal abandonment â€” the behavioral patterns that silently destroy edge over months.',
            slug: lessonSlug(6, 'Wednesday', 1, 'The Five Most Expensive Behavioral Trading Errors and Their Signatures') },
          { number: 2, title: 'Creating a Behavioral Self-Audit Template for Weekly Review', type: 'lesson',
            summary: 'A weekly form to honestly assess whether behavioral errors occurred, what preceded each error, and what rule or limit would prevent recurrence in the following week.',
            slug: lessonSlug(6, 'Wednesday', 2, 'Creating a Behavioral Self-Audit Template for Weekly Review') },
          { number: 3, title: 'Pattern Interruption Strategies for Persistent Trading Errors', type: 'lesson',
            summary: 'Practical interventions: hard position limits, mandatory waiting periods after losses, session exit rules after N errors, and peer accountability structures â€” all tested approaches.',
            slug: lessonSlug(6, 'Wednesday', 3, 'Pattern Interruption Strategies for Persistent Trading Errors') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Refining a Single Playbook Strategy',
        lessons: [
          { number: 1, title: 'Why Strategy Overload Prevents Progress and the Refinement Solution', type: 'lesson',
            summary: 'How constantly switching between strategies resets the learning curve and prevents consistent data from accumulating â€” the mathematical case for single-strategy mastery.',
            slug: lessonSlug(6, 'Thursday', 1, 'Why Strategy Overload Prevents Progress and the Refinement Solution') },
          { number: 2, title: 'Defining Your Playbook: One Setup, One Market, One Session Window', type: 'lesson',
            summary: 'How to narrow your focus to a single strategy on a single pair during a single daily session â€” building expertise in one pattern before any expansion.',
            slug: lessonSlug(6, 'Thursday', 2, 'Defining Your Playbook: One Setup, One Market, One Session Window') },
          { number: 3, title: 'Documenting and Stress-Testing Your Playbook on Historical Data', type: 'lesson',
            summary: 'Back-review 50 historical instances of your setup, calculate expected outcomes, measure variance, and prove statistical edge before committing live capital to the model.',
            slug: lessonSlug(6, 'Thursday', 3, 'Documenting and Stress-Testing Your Playbook on Historical Data') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Weekly Review and Improvement Loop',
        lessons: [
          { number: 1, title: 'Building Your Weekly Review Ritual: A 30-Minute Process Design', type: 'lesson',
            summary: 'How to structure a consistent weekly review for maximum efficiency: what you intended, what you executed, the gap between them, and the single rule change for next week.',
            slug: lessonSlug(6, 'Friday', 1, 'Building Your Weekly Review Ritual: A 30-Minute Process Design') },
          { number: 2, title: 'The Improvement Loop: From Observation to Rule to Verified Result', type: 'lesson',
            summary: 'Converting a performance observation into a written rule change, executing it for exactly two weeks, then reviewing its impact before deciding to keep, modify, or discard it.',
            slug: lessonSlug(6, 'Friday', 2, 'The Improvement Loop: From Observation to Rule to Verified Result') },
          { number: 3, title: 'Compound Growth in Trading: How Small Process Improvements Accumulate', type: 'lesson',
            summary: 'The math and psychology of marginal gains â€” why a 1% process improvement each week compounds into dramatically superior results over 6-12 months of consistent practice.',
            slug: lessonSlug(6, 'Friday', 3, 'Compound Growth in Trading: How Small Process Improvements Accumulate') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Build a Weekly Performance Review Template',
        lessons: [
          { number: 1, title: 'Assignment Overview: Your Personal Performance Review System', type: 'assignment',
            summary: 'Why closing the week with structured reflection compounds skill development more than any single trade outcome â€” and what separates traders who improve from those who plateau.',
            slug: lessonSlug(6, 'Saturday', 1, 'Assignment Overview: Your Personal Performance Review System') },
          { number: 2, title: 'Designing Your Review Template: Section-by-Section Build', type: 'assignment',
            summary: 'The complete section design: weekly metrics summary, behavioral checklist, what worked and why, what failed and why, and next week\'s single most important improvement focus.',
            slug: lessonSlug(6, 'Saturday', 2, 'Designing Your Review Template: Section-by-Section Build') },
          { number: 3, title: 'Testing Your Template: Apply It to Your Most Recent Week Now', type: 'assignment',
            summary: 'Walk through filling out your new review template for the just-completed week, identify the single highest-value action it surfaces, and commit to implementing it next week.',
            slug: lessonSlug(6, 'Saturday', 3, 'Testing Your Template: Apply It to Your Most Recent Week Now') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 7 · Advanced Chart Patterns · Advanced
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 7,
    module: 'Advanced Chart Patterns',
    level: 'Advanced',
    description: 'Move beyond basic price structure into high-probability classical and Fibonacci-based chart patterns — recognising them early, measuring targets precisely, and filtering poor-quality setups.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Head and Shoulders Patterns in Context',
        lessons: [
          { number: 1, title: 'Head and Shoulders: Anatomy, Measurement, and Neckline Role', type: 'lesson',
            summary: 'How to identify a valid H&S formation — the structural criteria for shoulder symmetry, volume distribution across the pattern, and precise price target calculation using the neckline projection rule.',
            slug: lessonSlug(7, 'Monday', 1, 'Head and Shoulders: Anatomy, Measurement, and Neckline Role') },
          { number: 2, title: 'Inverse Head and Shoulders and the Bullish Reversal Setup', type: 'lesson',
            summary: 'The bullish H&S variant that signals the end of a downtrend — confirming entries at neckline breakout or retest, filtering false formations, and managing trades through the measured-move target.',
            slug: lessonSlug(7, 'Monday', 2, 'Inverse Head and Shoulders and the Bullish Reversal Setup') },
          { number: 3, title: 'Head and Shoulders Failure: When the Neckline Holds Back Price', type: 'lesson',
            summary: 'What happens when a H&S formation fails to break the neckline — how to recognise failure early, flip bias, and turn the failed pattern into a high-probability continuation trade.',
            slug: lessonSlug(7, 'Monday', 3, 'Head and Shoulders Failure: When the Neckline Holds Back Price') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Double and Triple Tops and Bottoms',
        lessons: [
          { number: 1, title: 'Double Top and Double Bottom Structure and Target Projection', type: 'lesson',
            summary: 'The criteria for a valid double top — equal highs, declining momentum into the second peak, and confirmation close. How to project the measured move and filter out premature neckline breaks.',
            slug: lessonSlug(7, 'Tuesday', 1, 'Double Top and Double Bottom Structure and Target Projection') },
          { number: 2, title: 'Triple Tops and Bottoms: Implications of a Third Test', type: 'lesson',
            summary: 'Why a third test of the same level carries more weight than the second — how accumulation or distribution deepens with each test and what candle behaviour at the third touch reveals about probability.',
            slug: lessonSlug(7, 'Tuesday', 2, 'Triple Tops and Bottoms: Implications of a Third Test') },
          { number: 3, title: 'Volume and Momentum Divergence at Double and Triple Formations', type: 'lesson',
            summary: 'Using RSI and MACD divergence alongside volume contraction to confirm the weakness behind a failing high or strengthening low — adding a second filter to reduce false pattern triggers.',
            slug: lessonSlug(7, 'Tuesday', 3, 'Volume and Momentum Divergence at Double and Triple Formations') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Triangles, Wedges, and Flag Patterns',
        lessons: [
          { number: 1, title: 'Symmetrical, Ascending, and Descending Triangles: Entry Rules', type: 'lesson',
            summary: 'The three triangle variants, how each biases direction probability differently, and the exact breakout entry trigger — including volume confirmation requirements and false breakout filtering criteria.',
            slug: lessonSlug(7, 'Wednesday', 1, 'Symmetrical, Ascending, and Descending Triangles: Entry Rules') },
          { number: 2, title: 'Rising and Falling Wedge Patterns as Reversal and Continuation Signals', type: 'lesson',
            summary: 'How wedges differ fundamentally from channels in structure and implication — the shrinking momentum inside a wedge that signals pending breakout and why wedge breaks are often violent.',
            slug: lessonSlug(7, 'Wednesday', 2, 'Rising and Falling Wedge Patterns as Reversal and Continuation Signals') },
          { number: 3, title: 'Bull and Bear Flag Continuation Patterns with Measured Targets', type: 'lesson',
            summary: 'The tight consolidation that follows a strong impulse move — how to identify the pole and flag structure, calculate the continuation target, and enter with a pullback or breakout trigger.',
            slug: lessonSlug(7, 'Wednesday', 3, 'Bull and Bear Flag Continuation Patterns with Measured Targets') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Fibonacci Retracements and Extensions',
        lessons: [
          { number: 1, title: 'Fibonacci Retracement: How to Draw It Correctly and Use Key Levels', type: 'lesson',
            summary: 'The correct swing to anchor Fibonacci tools, the significance of the 38.2%, 50%, and 61.8% retracement zones in active trends, and how structure levels that align with Fib zones create optimal entries.',
            slug: lessonSlug(7, 'Thursday', 1, 'Fibonacci Retracement: How to Draw It Correctly and Use Key Levels') },
          { number: 2, title: 'Fibonacci Extensions for Profit Target Projection', type: 'lesson',
            summary: 'Using 127.2%, 161.8%, and 261.8% extensions to project where impulse moves are likely to complete — how to pre-mark targets before entry and use multiple extensions as partial exit levels.',
            slug: lessonSlug(7, 'Thursday', 2, 'Fibonacci Extensions for Profit Target Projection') },
          { number: 3, title: 'Fibonacci Confluence Zones: When Structure, Fib, and Session Align', type: 'lesson',
            summary: 'The highest-probability application of Fibonacci — when a key Fib retracement lands precisely on a structural level like a daily support or prior week high, creating a confluent reaction zone.',
            slug: lessonSlug(7, 'Thursday', 3, 'Fibonacci Confluence Zones: When Structure, Fib, and Session Align') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Harmonic Patterns: Gartley, Bat, and Crab',
        lessons: [
          { number: 1, title: 'Introduction to Harmonic Pattern Theory and Fibonacci Ratios', type: 'lesson',
            summary: 'How harmonic patterns use specific Fibonacci ratios between their swing legs to define high-probability reversal zones — the XABCD structure shared by all harmonic families.',
            slug: lessonSlug(7, 'Friday', 1, 'Introduction to Harmonic Pattern Theory and Fibonacci Ratios') },
          { number: 2, title: 'Gartley and Bat Patterns: Identification and Entry at the PRZ', type: 'lesson',
            summary: 'The precise Fibonacci ratio requirements for each pattern variant, how to identify the Potential Reversal Zone, and the two-candle confirmation entry at the D leg before target projection.',
            slug: lessonSlug(7, 'Friday', 2, 'Gartley and Bat Patterns: Identification and Entry at the PRZ') },
          { number: 3, title: 'Crab and Butterfly Patterns as Deep Extension Reversal Setups', type: 'lesson',
            summary: 'The wider-extension harmonic families that require deeper D-leg moves to the 161.8% or 127.2% extension — when deep harmonics produce the most explosive reversals and how to filter invalid formations.',
            slug: lessonSlug(7, 'Friday', 3, 'Crab and Butterfly Patterns as Deep Extension Reversal Setups') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Pattern Recognition Chart Study',
        lessons: [
          { number: 1, title: 'Assignment Overview: Building a Pattern Recognition Library', type: 'assignment',
            summary: 'Why deliberate pattern documentation across multiple pairs and timeframes is the fastest route to live pattern recognition speed — and what this week\'s study reveals about pattern frequency.',
            slug: lessonSlug(7, 'Saturday', 1, 'Assignment Overview: Building a Pattern Recognition Library') },
          { number: 2, title: 'Find and Document 5 Valid Chart Patterns Across Major Pairs', type: 'assignment',
            summary: 'Criteria for each pattern type, annotation requirements including Fibonacci levels and target projections, and documentation format to build a searchable reference library.',
            slug: lessonSlug(7, 'Saturday', 2, 'Find and Document 5 Valid Chart Patterns Across Major Pairs') },
          { number: 3, title: 'Reflection: Pattern Validity Assessment and False Pattern Filtering', type: 'assignment',
            summary: 'Review the 5 patterns against validity criteria, identify any that fail threshold conditions, and document which contextual filters would have prevented acting on the false formations.',
            slug: lessonSlug(7, 'Saturday', 3, 'Reflection: Pattern Validity Assessment and False Pattern Filtering') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 8 · Indicators, Oscillators, and Momentum Tools · Advanced
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 8,
    module: 'Indicators, Oscillators, and Momentum Tools',
    level: 'Advanced',
    description: 'Use technical indicators correctly as momentum and trend filters — not as standalone signals — with deep understanding of RSI divergence, MACD histogram behaviour, moving average systems, and volatility-based tools.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Moving Average Systems and Trend Filtering',
        lessons: [
          { number: 1, title: 'SMA vs EMA vs WMA: How Weighting Affects Responsiveness', type: 'lesson',
            summary: 'The mathematical difference between simple, exponential, and weighted moving averages — why EMA reacts faster to recent price, when SMA provides cleaner trend context, and which purpose each serves.',
            slug: lessonSlug(8, 'Monday', 1, 'SMA vs EMA vs WMA: How Weighting Affects Responsiveness') },
          { number: 2, title: 'Moving Average Crossovers: Golden Cross, Death Cross, and Their Limits', type: 'lesson',
            summary: 'The 50/200 MA crossover system — why it generates long-term trend confirmation but lags badly on entries, how to combine crossovers with structure for earlier signals, and when crossovers completely fail.',
            slug: lessonSlug(8, 'Monday', 2, 'Moving Average Crossovers: Golden Cross, Death Cross, and Their Limits') },
          { number: 3, title: 'Using Moving Averages as Dynamic Support, Resistance, and Bias Filter', type: 'lesson',
            summary: 'The 20, 50, and 200 EMA as dynamic S/R zones during active trends — how price consistently returns to test these averages, and using MA relationship as a directional bias pre-filter.',
            slug: lessonSlug(8, 'Monday', 3, 'Using Moving Averages as Dynamic Support, Resistance, and Bias Filter') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'RSI: Divergence, Extremes, and Trend Context',
        lessons: [
          { number: 1, title: 'RSI Mechanics: Period Settings, Overbought/Oversold in Trending Markets', type: 'lesson',
            summary: 'Why standard RSI overbought/oversold readings fail in trending conditions — how to adjust interpretation for trends by shifting threshold levels and using mid-line cross as a bias signal.',
            slug: lessonSlug(8, 'Tuesday', 1, 'RSI Mechanics: Period Settings, Overbought/Oversold in Trending Markets') },
          { number: 2, title: 'Classic and Hidden RSI Divergence: Two Different Trade Signals', type: 'lesson',
            summary: 'Classic divergence as a reversal warning signal vs hidden divergence as a trend continuation signal — the exact price-indicator relationship that defines each, with real chart examples.',
            slug: lessonSlug(8, 'Tuesday', 2, 'Classic and Hidden RSI Divergence: Two Different Trade Signals') },
          { number: 3, title: 'RSI Failure Swings: The High-Probability Momentum Reversal Setup', type: 'lesson',
            summary: 'The underused RSI failure swing — when RSI fails to reach back into overbought/oversold from the previous extreme, signalling a momentum shift before it is visible in price structure.',
            slug: lessonSlug(8, 'Tuesday', 3, 'RSI Failure Swings: The High-Probability Momentum Reversal Setup') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'MACD: Histogram, Signal Line, and Crossovers',
        lessons: [
          { number: 1, title: 'MACD Structure: Fast Line, Slow Line, Signal Line, and Histogram', type: 'lesson',
            summary: 'How the MACD is calculated, what each component measures, and why the histogram (MACD minus signal) is the earliest component to signal momentum change in either direction.',
            slug: lessonSlug(8, 'Wednesday', 1, 'MACD Structure: Fast Line, Slow Line, Signal Line, and Histogram') },
          { number: 2, title: 'MACD Divergence and Histogram Declining Momentum Signals', type: 'lesson',
            summary: 'Using MACD histogram peak-decline sequences to identify exhausting momentum before price breaks structure — the professional application of MACD as a momentum filter, not a crossover trigger.',
            slug: lessonSlug(8, 'Wednesday', 2, 'MACD Divergence and Histogram Declining Momentum Signals') },
          { number: 3, title: 'MACD Zero-Line Cross and Trend Bias Classification', type: 'lesson',
            summary: 'The MACD zero line as a trend gauge — why sustained trading above zero classifies bullish momentum phases and below zero classifies bearish ones, regardless of crossover signal direction.',
            slug: lessonSlug(8, 'Wednesday', 3, 'MACD Zero-Line Cross and Trend Bias Classification') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Bollinger Bands and Volatility Indicators',
        lessons: [
          { number: 1, title: 'Bollinger Band Structure: Standard Deviation and Band Width', type: 'lesson',
            summary: 'How Bollinger Bands expand and contract with volatility cycles — the squeeze as a pre-breakout low-volatility signal, band walk as a trend continuation signal, and mean-reversion readings during ranges.',
            slug: lessonSlug(8, 'Thursday', 1, 'Bollinger Band Structure: Standard Deviation and Band Width') },
          { number: 2, title: 'ATR: Measuring True Range for Stop Distance and Position Sizing', type: 'lesson',
            summary: 'Average True Range as the most practical indicator in professional risk management — using ATR multiples for stop placement that adapts to current market volatility rather than arbitrary pip distances.',
            slug: lessonSlug(8, 'Thursday', 2, 'ATR: Measuring True Range for Stop Distance and Position Sizing') },
          { number: 3, title: 'Stochastic Oscillator: Cross Signals and Divergence in Range Markets', type: 'lesson',
            summary: 'How Stochastic diverges from RSI in construction and optimal use-case — why Stochastic performs best in ranging markets for overbought/oversold identification and fails in trending conditions.',
            slug: lessonSlug(8, 'Thursday', 3, 'Stochastic Oscillator: Cross Signals and Divergence in Range Markets') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Combining Indicators with Price Action Correctly',
        lessons: [
          { number: 1, title: 'The Confirmation Hierarchy: Price Action Leads, Indicators Confirm', type: 'lesson',
            summary: 'Why indicators are derivative of price — they can only confirm what price has already done, never predict it — and the discipline of always checking price structure before reading any indicator.',
            slug: lessonSlug(8, 'Friday', 1, 'The Confirmation Hierarchy: Price Action Leads, Indicators Confirm') },
          { number: 2, title: 'Avoiding Indicator Overload: The Three-Layer Maximum Rule', type: 'lesson',
            summary: 'Why adding more indicators creates false confidence without adding edge — the three-layer maximum (trend, momentum, volatility) that covers every independent dimension without redundancy.',
            slug: lessonSlug(8, 'Friday', 2, 'Avoiding Indicator Overload: The Three-Layer Maximum Rule') },
          { number: 3, title: 'Building a Personal Indicator Stack Matched to Your Trading Style', type: 'lesson',
            summary: 'Selecting indicators based on your strategy type — scalper vs swing trader indicator needs differ completely. How to test whether each indicator in your stack genuinely improves your historical trade outcomes.',
            slug: lessonSlug(8, 'Friday', 3, 'Building a Personal Indicator Stack Matched to Your Trading Style') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Indicator Audit and Setup Comparison',
        lessons: [
          { number: 1, title: 'Assignment Overview: Testing Your Indicator Stack Against Historical Trades', type: 'assignment',
            summary: 'The process of objectively testing whether each indicator currently on your chart genuinely contributed to your best trades — or whether it was post-rationalised to explain decisions already made.',
            slug: lessonSlug(8, 'Saturday', 1, 'Assignment Overview: Testing Your Indicator Stack Against Historical Trades') },
          { number: 2, title: 'Back-Test 10 Trades With and Without Each Indicator', type: 'assignment',
            summary: 'Review 10 recent closed trades: would the outcome have been different without each specific indicator? Document each finding systematically to expose which indicators add genuine value.',
            slug: lessonSlug(8, 'Saturday', 2, 'Back-Test 10 Trades With and Without Each Indicator') },
          { number: 3, title: 'Trim or Rebuild: Your Optimised Indicator Configuration Report', type: 'assignment',
            summary: 'Based on the back-test evidence, document the final indicator configuration — what stays, what is removed, what is replaced — and the rational justification for each decision.',
            slug: lessonSlug(8, 'Saturday', 3, 'Trim or Rebuild: Your Optimised Indicator Configuration Report') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 9 · Price Action Mastery · Advanced
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 9,
    module: 'Price Action Mastery',
    level: 'Advanced',
    description: 'Develop expert-level reading of pure price behaviour — multi-candle patterns, compression breakouts, sequential analysis, and the discipline to trade without indicator dependency.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Pin Bars, Doji, and Rejection Candles at Key Levels',
        lessons: [
          { number: 1, title: 'High-Grade Pin Bar Criteria: Wick Ratio, Body Position, and Context', type: 'lesson',
            summary: 'Not all pin bars are equal — the specific body size, wick ratio, and close location within the bar that define a high-grade pin bar versus a common noise candle that should not trigger a trade.',
            slug: lessonSlug(9, 'Monday', 1, 'High-Grade Pin Bar Criteria: Wick Ratio, Body Position, and Context') },
          { number: 2, title: 'Doji and Spinning Top Candles: Indecision vs Transition Signal', type: 'lesson',
            summary: 'Why a doji on its own means nothing but a doji at the right structure level after an extended trend move signals a high-probability transition — distinguishing random indecision from meaningful hesitation.',
            slug: lessonSlug(9, 'Monday', 2, 'Doji and Spinning Top Candles: Indecision vs Transition Signal') },
          { number: 3, title: 'Rejection Candle Psychology: Why Price Reversed and What It Signals', type: 'lesson',
            summary: 'Understanding rejection candles in terms of buy/sell pressure dynamics — what a long lower wick at support reveals about institutional absorption, and how this differs from a wick at resistance.',
            slug: lessonSlug(9, 'Monday', 3, 'Rejection Candle Psychology: Why Price Reversed and What It Signals') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Inside Bar Compression and Breakout Strategy',
        lessons: [
          { number: 1, title: 'Inside Bar Mechanics: Compression, Energy, and Range Contraction', type: 'lesson',
            summary: 'Why the inside bar requires the high to be lower than the prior candle and the low to be higher — what this level of compression means about the balance between buyers and sellers before the next move.',
            slug: lessonSlug(9, 'Tuesday', 1, 'Inside Bar Mechanics: Compression, Energy, and Range Contraction') },
          { number: 2, title: 'Inside Bar Entry and Failure Management Strategies', type: 'lesson',
            summary: 'The two entry methods — aggressive entry at the inside bar boundary or confirmation entry on breakout — and how to manage the trade when the initial break reverses back through the inside bar range.',
            slug: lessonSlug(9, 'Tuesday', 2, 'Inside Bar Entry and Failure Management Strategies') },
          { number: 3, title: 'Multiple Inside Bar Chains: Increasing Compression and Explosive Breaks', type: 'lesson',
            summary: 'When two or three consecutive inside bars form — the compounding compression effect that makes these chains produce some of the most explosive breakouts available to price action traders.',
            slug: lessonSlug(9, 'Tuesday', 3, 'Multiple Inside Bar Chains: Increasing Compression and Explosive Breaks') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Engulfing Patterns and Momentum Reversals',
        lessons: [
          { number: 1, title: 'Bullish and Bearish Engulfing: Minimum Criteria and Context Requirements', type: 'lesson',
            summary: 'The exact body size requirements for a valid engulfing candle — why partial body engulfment is insufficient, why close location is more important than size, and the structural context that makes engulfing patterns reliable.',
            slug: lessonSlug(9, 'Wednesday', 1, 'Bullish and Bearish Engulfing: Minimum Criteria and Context Requirements') },
          { number: 2, title: 'Multi-Candle Engulfing and the Expansion Continuation Pattern', type: 'lesson',
            summary: 'When a single engulfing body is followed by a second expansion candle in the same direction — how this two-candle combination increases confirmation probability and when to add size on the second candle close.',
            slug: lessonSlug(9, 'Wednesday', 2, 'Multi-Candle Engulfing and the Expansion Continuation Pattern') },
          { number: 3, title: 'Three-Candle Reversal Sequences at Structural Highs and Lows', type: 'lesson',
            summary: 'Evening star, morning star, and three-outside-up/down patterns — how three-candle sequences tell a complete story of failed push, hesitation, and confirmed reversal direction.',
            slug: lessonSlug(9, 'Wednesday', 3, 'Three-Candle Reversal Sequences at Structural Highs and Lows') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Sequential Price Action and Narrative Reading',
        lessons: [
          { number: 1, title: 'Reading a 10-Candle Sequence as a Complete Market Story', type: 'lesson',
            summary: 'Advanced price action reading treats a sequence of candles as a narrative — how bodies and wicks change in size, close location shifts, and momentum accumulates or fades across ten consecutive candles.',
            slug: lessonSlug(9, 'Thursday', 1, 'Reading a 10-Candle Sequence as a Complete Market Story') },
          { number: 2, title: 'Momentum Candles vs Consolidation Candles: The Two States of Price', type: 'lesson',
            summary: 'Categorising each candle as either directional (large body, close at extreme) or consolidating (small body, central close) — and using the sequence of these states to anticipate when the next impulse arrives.',
            slug: lessonSlug(9, 'Thursday', 2, 'Momentum Candles vs Consolidation Candles: The Two States of Price') },
          { number: 3, title: 'Bar-by-Bar Price Analysis: Decision-Making at Each Candle Close', type: 'lesson',
            summary: 'The professional approach of reassessing trade conditions at every candle close rather than setting and forgetting — how bar-by-bar analysis improves exit timing without introducing emotional interference.',
            slug: lessonSlug(9, 'Thursday', 3, 'Bar-by-Bar Price Analysis: Decision-Making at Each Candle Close') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Trading Without Indicators: Pure PA Systems',
        lessons: [
          { number: 1, title: 'Building a Complete Edge Using Only Price, Structure, and Sessions', type: 'lesson',
            summary: 'A full trading system using only price action, structural levels, and session timing — no indicators whatsoever. How the cleanest charts often produce the clearest thinking and best execution decisions.',
            slug: lessonSlug(9, 'Friday', 1, 'Building a Complete Edge Using Only Price, Structure, and Sessions') },
          { number: 2, title: 'Testing Pure Price Action vs Indicator-Assisted on Identical Setups', type: 'lesson',
            summary: 'Side-by-side comparison methodology — taking the same setup on a clean chart versus a standard indicator setup and comparing decision quality, entry timing, and outcome across 20 historical instances.',
            slug: lessonSlug(9, 'Friday', 2, 'Testing Pure Price Action vs Indicator-Assisted on Identical Setups') },
          { number: 3, title: 'The Psychological Advantage of a Clean Chart in Live Trading', type: 'lesson',
            summary: 'How indicator-free charts reduce cognitive load, accelerate pattern recognition, and eliminate the analysis-paralysis that comes with contradictory indicator signals during live market hours.',
            slug: lessonSlug(9, 'Friday', 3, 'The Psychological Advantage of a Clean Chart in Live Trading') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Price Action Narrative Exercise',
        lessons: [
          { number: 1, title: 'Assignment Overview: Chart Narrative Annotation Exercise', type: 'assignment',
            summary: 'The purpose of articulating aloud what price is saying before acting on it — how converting visual patterns into written narrative builds the language for fast live decision-making.',
            slug: lessonSlug(9, 'Saturday', 1, 'Assignment Overview: Chart Narrative Annotation Exercise') },
          { number: 2, title: 'Annotate 3 Hours of Live Price Action with Candle-by-Candle Commentary', type: 'assignment',
            summary: 'Using a replay or live market session, write a brief commentary on every candle — what it tells you, whether it aligns with or contradicts the current direction, and what the next candle should confirm.',
            slug: lessonSlug(9, 'Saturday', 2, 'Annotate 3 Hours of Live Price Action with Candle-by-Candle Commentary') },
          { number: 3, title: 'Review and Scoring: Were Your Narrative Predictions Accurate', type: 'assignment',
            summary: 'Measure prediction accuracy from the annotation exercise — which reads were correct, where the narrative diverged from price, and what the dominant pattern of misreading reveals about your current price action gaps.',
            slug: lessonSlug(9, 'Saturday', 3, 'Review and Scoring: Were Your Narrative Predictions Accurate') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 10 · Fundamental Analysis and Economic Data · Advanced
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 10,
    module: 'Fundamental Analysis and Economic Data',
    level: 'Advanced',
    description: 'Integrate macroeconomic data into your trading framework — understanding which releases move markets, how to position before and after events, and when fundamental context overrides technical signals.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'The Economic Calendar and High-Impact Events',
        lessons: [
          { number: 1, title: 'How to Use an Economic Calendar as a Daily Trading Preparation Tool', type: 'lesson',
            summary: 'Reading event importance tiers, understanding consensus vs actual vs prior relationships, and building a weekly event awareness map before the trading week starts — the professional pre-session routine.',
            slug: lessonSlug(10, 'Monday', 1, 'How to Use an Economic Calendar as a Daily Trading Preparation Tool') },
          { number: 2, title: 'Tier-1 Economic Events: NFP, CPI, GDP, and Their Forex Impact', type: 'lesson',
            summary: 'The four events that consistently produce the largest forex moves — the typical volatility window each creates, the pairs most affected by each release, and positioning logic before and after announcement.',
            slug: lessonSlug(10, 'Monday', 2, 'Tier-1 Economic Events: NFP, CPI, GDP, and Their Forex Impact') },
          { number: 3, title: 'Surprise Factor: When Actual vs Consensus Deviations Move Markets', type: 'lesson',
            summary: 'Why markets move on surprise magnitude, not absolute value — how to calculate the deviation from consensus, which direction the surprise creates currency pressure, and how quickly the move fades.',
            slug: lessonSlug(10, 'Monday', 3, 'Surprise Factor: When Actual vs Consensus Deviations Move Markets') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Inflation, Employment, and Growth Data',
        lessons: [
          { number: 1, title: 'CPI, PPI, and PCE: Inflation Measures and Their Central Bank Implications', type: 'lesson',
            summary: 'The three inflation gauges that central banks monitor most closely, how each is weighted differently, which central banks prioritise each metric, and how higher-than-expected readings affect their rate decisions.',
            slug: lessonSlug(10, 'Tuesday', 1, 'CPI, PPI, and PCE: Inflation Measures and Their Central Bank Implications') },
          { number: 2, title: 'Non-Farm Payrolls: Reading the Full Report Beyond the Headline Number', type: 'lesson',
            summary: 'Why the headline jobs number is often the least important part of the NFP release — average hourly earnings, participation rate changes, prior month revision, and sector breakdown as the real market movers.',
            slug: lessonSlug(10, 'Tuesday', 2, 'Non-Farm Payrolls: Reading the Full Report Beyond the Headline Number') },
          { number: 3, title: 'GDP Growth Rate and Quarterly Revision Impact on Currency Trends', type: 'lesson',
            summary: 'How preliminary, revised, and final GDP readings affect long-term currency direction — when GDP surprises trigger multi-day trend continuation and when they cause short-lived spikes that reverse quickly.',
            slug: lessonSlug(10, 'Tuesday', 3, 'GDP Growth Rate and Quarterly Revision Impact on Currency Trends') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'PMI, Trade Balance, and Leading Indicators',
        lessons: [
          { number: 1, title: 'PMI Reports: Manufacturing vs Services and What Each Signals', type: 'lesson',
            summary: 'The Purchasing Managers Index as the most forward-looking of all economic indicators — how readings above and below 50 signal expansion and contraction, and why the rate of change matters more than the level.',
            slug: lessonSlug(10, 'Wednesday', 1, 'PMI Reports: Manufacturing vs Services and What Each Signals') },
          { number: 2, title: 'Trade Balance and Current Account as Long-Term Currency Pressure Indicators', type: 'lesson',
            summary: 'How persistent trade deficits create sustained currency outflow pressure and surpluses create inflow demand — why trade balance is a fundamental determinant of long-term currency trend direction.',
            slug: lessonSlug(10, 'Wednesday', 2, 'Trade Balance and Current Account as Long-Term Currency Pressure Indicators') },
          { number: 3, title: 'Retail Sales, Consumer Confidence, and Durable Goods as Leading Signals', type: 'lesson',
            summary: 'The consumer-facing indicators that anticipate central bank action before inflation data catches up — how retail sales surprise informs rate expectations and how confidence surveys precede spending shifts.',
            slug: lessonSlug(10, 'Wednesday', 3, 'Retail Sales, Consumer Confidence, and Durable Goods as Leading Signals') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Geopolitical Risk and Safe-Haven Flows',
        lessons: [
          { number: 1, title: 'Safe-Haven Currencies: USD, JPY, CHF and When They Activate', type: 'lesson',
            summary: 'The specific conditions that trigger institutional capital flows into safe-haven currencies — geopolitical crises, financial system stress, and equity market drawdowns — and the typical magnitude and duration of these moves.',
            slug: lessonSlug(10, 'Thursday', 1, 'Safe-Haven Currencies: USD, JPY, CHF and When They Activate') },
          { number: 2, title: 'Risk-On vs Risk-Off Market Regimes and Currency Positioning', type: 'lesson',
            summary: 'How to classify the prevailing risk environment using equity indices, VIX, credit spreads, and commodity prices — and how the regime classification changes which currency pairs offer the cleanest directional setups.',
            slug: lessonSlug(10, 'Thursday', 2, 'Risk-On vs Risk-Off Market Regimes and Currency Positioning') },
          { number: 3, title: 'Geopolitical Events: Immediate Reaction vs Medium-Term Repositioning', type: 'lesson',
            summary: 'Why the initial spike on a geopolitical headline is rarely a tradeable signal — how to wait for the repositioning phase when institutional players rebalance portfolios in response to changed risk assessments.',
            slug: lessonSlug(10, 'Thursday', 3, 'Geopolitical Events: Immediate Reaction vs Medium-Term Repositioning') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Combining Fundamentals with Technical Trade Triggers',
        lessons: [
          { number: 1, title: 'The Fundamental-Technical Hybrid: Bias from Macro, Entry from Structure', type: 'lesson',
            summary: 'The most professional approach to forex trading — using macro fundamentals to establish directional bias and structural price action to time precise low-risk entries within that bias.',
            slug: lessonSlug(10, 'Friday', 1, 'The Fundamental-Technical Hybrid: Bias from Macro, Entry from Structure') },
          { number: 2, title: 'News Trading Entries: Positioning Before or After the Release', type: 'lesson',
            summary: 'The pre-release setup vs the post-release reaction trade — why pre-release positioning carries extreme risk and why waiting for the immediate-reaction candle to close provides a safer, higher-quality entry.',
            slug: lessonSlug(10, 'Friday', 2, 'News Trading Entries: Positioning Before or After the Release') },
          { number: 3, title: 'When Technical Levels Override Fundamental Expectations', type: 'lesson',
            summary: 'The situations where a strong technical level absorbs a fundamentally-driven move — why a daily support level can halt a bearish data-driven selloff, and how to recognise the institutional absorption in real time.',
            slug: lessonSlug(10, 'Friday', 3, 'When Technical Levels Override Fundamental Expectations') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Economic Event Trading Journal',
        lessons: [
          { number: 1, title: 'Assignment Overview: Documenting Your Fundamental Data Reactions', type: 'assignment',
            summary: 'Why tracking how markets actually respond to specific data releases — versus how you expected them to respond — is one of the most valuable exercises in developing fundamental analysis skill.',
            slug: lessonSlug(10, 'Saturday', 1, 'Assignment Overview: Documenting Your Fundamental Data Reactions') },
          { number: 2, title: 'Track 3 High-Impact Events This Week: Actual Reaction vs Expectation', type: 'assignment',
            summary: 'For each event: record the consensus, the actual, the surprise direction, the immediate price reaction, the 4-hour follow-through, and whether the technical structure confirmed or rejected the fundamental move.',
            slug: lessonSlug(10, 'Saturday', 2, 'Track 3 High-Impact Events This Week: Actual Reaction vs Expectation') },
          { number: 3, title: 'Post-Event Analysis: What the Market Was Already Pricing In', type: 'assignment',
            summary: 'The concept of pre-positioning and buy-the-rumour-sell-the-news — assessing from your tracked events whether the move was a genuine surprise or a reversal of pre-positioned directional bias.',
            slug: lessonSlug(10, 'Saturday', 3, 'Post-Event Analysis: What the Market Was Already Pricing In') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 11 · Central Banks, Monetary Policy, and Rate Cycles · Advanced
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 11,
    module: 'Central Banks, Monetary Policy, and Rate Cycles',
    level: 'Advanced',
    description: 'Understand the engine behind long-term currency trends — central bank mandates, interest rate cycles, forward guidance, and how diverging monetary policy between two economies creates multi-month directional moves.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Federal Reserve Structure, Mandate, and Decision Process',
        lessons: [
          { number: 1, title: 'How the FOMC Operates: Meeting Schedule, Voting Members, and Minutes', type: 'lesson',
            summary: 'The structure of the Federal Open Market Committee, which members vote, how the voting rotates annually, and why FOMC minutes released three weeks post-meeting often produce larger market moves than the decision itself.',
            slug: lessonSlug(11, 'Monday', 1, 'How the FOMC Operates: Meeting Schedule, Voting Members, and Minutes') },
          { number: 2, title: 'Dual Mandate: Inflation Target and Maximum Employment and Their Tension', type: 'lesson',
            summary: 'Understanding the inherent conflict in the Fed\'s dual mandate — when inflation is high and unemployment is also rising, how the Fed communicates its priority ordering and what this signals for USD direction.',
            slug: lessonSlug(11, 'Monday', 2, 'Dual Mandate: Inflation Target and Maximum Employment and Their Tension') },
          { number: 3, title: 'Fed Chair Speeches, Jackson Hole, and Forward Guidance as Forex Catalysts', type: 'lesson',
            summary: 'Why the annual Jackson Hole symposium consistently produces major USD volatility — how to read central banker speech tone and language shifts as early policy signals before formal decision announcements.',
            slug: lessonSlug(11, 'Monday', 3, 'Fed Chair Speeches, Jackson Hole, and Forward Guidance as Forex Catalysts') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'ECB, BoE, BoJ — Comparative Policy Frameworks',
        lessons: [
          { number: 1, title: 'European Central Bank: Single Mandate Inflation Target and EUR Implications', type: 'lesson',
            summary: 'The ECB\'s single price-stability mandate differs fundamentally from the Fed — how this affects ECB decision communication, why EUR is particularly sensitive to Draghi/Lagarde language, and the role of the governing council.',
            slug: lessonSlug(11, 'Tuesday', 1, 'European Central Bank: Single Mandate Inflation Target and EUR Implications') },
          { number: 2, title: 'Bank of England: Inflation Report, MPC Voting, and GBP Sensitivity', type: 'lesson',
            summary: 'The Bank of England\'s Monetary Policy Committee structure, how the quarterly Inflation Report reshapes GBP expectations, and why split voting decisions create outsized GBP volatility during announcement windows.',
            slug: lessonSlug(11, 'Tuesday', 2, 'Bank of England: Inflation Report, MPC Voting, and GBP Sensitivity') },
          { number: 3, title: 'Bank of Japan: Yield Curve Control, Intervention History, and JPY Dynamics', type: 'lesson',
            summary: 'The BoJ\'s extraordinary policy stance including negative rates and yield curve control — how these unconventional measures create structural JPY weakness, and the risk of sudden policy reversal on JPY pairs.',
            slug: lessonSlug(11, 'Tuesday', 3, 'Bank of Japan: Yield Curve Control, Intervention History, and JPY Dynamics') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Interest Rate Differentials and Carry Trade',
        lessons: [
          { number: 1, title: 'Interest Rate Differential Theory and Long-Term Currency Direction', type: 'lesson',
            summary: 'How the difference in interest rates between two central banks drives sustained capital flows into the higher-yielding currency — the fundamental mechanism behind multi-year currency trends in EUR/USD and USD/JPY.',
            slug: lessonSlug(11, 'Wednesday', 1, 'Interest Rate Differential Theory and Long-Term Currency Direction') },
          { number: 2, title: 'The Carry Trade: Borrowing Low to Invest High Across Currency Pairs', type: 'lesson',
            summary: 'The mechanics of a carry trade position — borrowing in a low-rate currency (JPY/CHF) to fund a position in a high-rate currency (AUD/NZD) — and how carry unwind events create violent, rapid currency reversals.',
            slug: lessonSlug(11, 'Wednesday', 2, 'The Carry Trade: Borrowing Low to Invest High Across Currency Pairs') },
          { number: 3, title: 'Using Rate Expectations, Not Current Rates, to Position Currency Bias', type: 'lesson',
            summary: 'Markets price future rate expectations, not current levels — how to read futures markets, swaps, and central bank forward guidance to anticipate where rates are heading before the currency trend establishes.',
            slug: lessonSlug(11, 'Wednesday', 3, 'Using Rate Expectations, Not Current Rates, to Position Currency Bias') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'QE, QT, Tapering, and Balance Sheet Policy',
        lessons: [
          { number: 1, title: 'Quantitative Easing: How Asset Purchases Rewrite Currency Expectations', type: 'lesson',
            summary: 'Why QE programs weaken the implementing currency — the transmission mechanism through bond yields, currency supply expansion, and risk appetite — and why EUR/USD reversed on every ECB QE announcement.',
            slug: lessonSlug(11, 'Thursday', 1, 'Quantitative Easing: How Asset Purchases Rewrite Currency Expectations') },
          { number: 2, title: 'Tapering and Quantitative Tightening as Currency Strengthening Signals', type: 'lesson',
            summary: 'The currency strengthening effect of reducing asset purchases or shrinking the balance sheet — how to trade the taper announcement cycle and why the currency move typically begins before the formal announcement.',
            slug: lessonSlug(11, 'Thursday', 2, 'Tapering and Quantitative Tightening as Currency Strengthening Signals') },
          { number: 3, title: 'Central Bank Divergence Trades: The Most Reliable Long-Term Setup', type: 'lesson',
            summary: 'When one central bank is hiking and another is cutting or holding — this policy divergence creates the most structurally sound, multi-week directional bias in professional forex trading.',
            slug: lessonSlug(11, 'Thursday', 3, 'Central Bank Divergence Trades: The Most Reliable Long-Term Setup') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Building a Central Bank Calendar and Policy Tracker',
        lessons: [
          { number: 1, title: 'Monthly Policy Meeting Calendar: All 8 Central Banks Mapped', type: 'lesson',
            summary: 'Building a personal calendar tracking all FOMC, ECB, BoE, BoJ, RBA, RBNZ, BoC, and SNB decision dates — and the quarterly inflation reports, minutes releases, and speech events that supplement each cycle.',
            slug: lessonSlug(11, 'Friday', 1, 'Monthly Policy Meeting Calendar: All 8 Central Banks Mapped') },
          { number: 2, title: 'Building a Live Policy Stance Scorecard for 8 Central Banks', type: 'lesson',
            summary: 'A simple Dovish / Neutral / Hawkish scoring matrix updated after each central bank meeting — how to use this scorecard as the foundation for weekly directional bias formulation across all major pairs.',
            slug: lessonSlug(11, 'Friday', 2, 'Building a Live Policy Stance Scorecard for 8 Central Banks') },
          { number: 3, title: 'Translating Policy Scorecard Differentials Into Weekly Trading Bias', type: 'lesson',
            summary: 'The operational translation of central bank scorecard differentials into specific pair biases — a Hawkish USD vs Dovish EUR stance means short EUR/USD bias. How to quantify the differential and assign confidence level.',
            slug: lessonSlug(11, 'Friday', 3, 'Translating Policy Scorecard Differentials Into Weekly Trading Bias') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Central Bank Scorecard Update',
        lessons: [
          { number: 1, title: 'Assignment Overview: Building Your First Central Bank Policy Tracker', type: 'assignment',
            summary: 'Why maintaining an up-to-date central bank stance tracker transforms your weekly preparation from technical chart review alone into a fully-informed fundamental-plus-technical analysis process.',
            slug: lessonSlug(11, 'Saturday', 1, 'Assignment Overview: Building Your First Central Bank Policy Tracker') },
          { number: 2, title: 'Research and Score All 8 Central Banks Based on Current Stance', type: 'assignment',
            summary: 'Using the most recent meeting statements, minutes, and speeches from all 8 major central banks — classify each as Hawkish, Neutral, or Dovish and document the specific statement that justifies each classification.',
            slug: lessonSlug(11, 'Saturday', 2, 'Research and Score All 8 Central Banks Based on Current Stance') },
          { number: 3, title: 'Translate Scorecard Into 3 Pair Biases for Next Week', type: 'assignment',
            summary: 'Using the maximum differential pairs from your scorecard, identify the 3 currency pairs with the strongest fundamental directional case for next week — and document how you will look for a technical entry trigger.',
            slug: lessonSlug(11, 'Saturday', 3, 'Translate Scorecard Into 3 Pair Biases for Next Week') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 12 · Intermarket Analysis and Currency Correlation · Advanced
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 12,
    module: 'Intermarket Analysis and Currency Correlation',
    level: 'Advanced',
    description: 'Expand your market intelligence by understanding how equity indices, commodities, and bond yields influence currency pairs — and how correlation awareness prevents overexposure and surfaces cross-market confirmation.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Currency Pair Correlation Mechanics',
        lessons: [
          { number: 1, title: 'Understanding Positive and Negative Correlation Between Currency Pairs', type: 'lesson',
            summary: 'Why EUR/USD and GBP/USD typically move in the same direction while EUR/USD and USD/CHF move inversely — the USD component as the source of correlated behaviour and how to quantify the relationship.',
            slug: lessonSlug(12, 'Monday', 1, 'Understanding Positive and Negative Correlation Between Currency Pairs') },
          { number: 2, title: 'Correlation Coefficients: Reading and Using Currency Correlation Tables', type: 'lesson',
            summary: 'How to read a correlation table — interpreting values from -1 to +1, what constitutes a strong vs weak correlation, and how correlations shift during risk events while remaining stable during normal conditions.',
            slug: lessonSlug(12, 'Monday', 2, 'Correlation Coefficients: Reading and Using Currency Correlation Tables') },
          { number: 3, title: 'Portfolio Exposure: How Correlated Pairs Multiply Hidden Risk', type: 'lesson',
            summary: 'Why trading both EUR/USD and GBP/USD long simultaneously is equivalent to doubling USD short exposure — how to calculate total effective exposure across correlated positions and maintain intended risk levels.',
            slug: lessonSlug(12, 'Monday', 3, 'Portfolio Exposure: How Correlated Pairs Multiply Hidden Risk') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Commodity Currencies and Their Drivers',
        lessons: [
          { number: 1, title: 'AUD, NZD, CAD: The Three Commodity-Linked Currencies and Their Drivers', type: 'lesson',
            summary: 'How Australian iron ore and coal exports underpin AUD, dairy products drive NZD, and crude oil underpins CAD — understanding the commodity correlation allows you to forecast currency direction from commodity prices.',
            slug: lessonSlug(12, 'Tuesday', 1, 'AUD, NZD, CAD: The Three Commodity-Linked Currencies and Their Drivers') },
          { number: 2, title: 'Oil Price and CAD Correlation: Trading USD/CAD with Crude Intelligence', type: 'lesson',
            summary: 'The inverse relationship between WTI crude oil and USD/CAD — why a sharp crude decline strengthens USD/CAD and a crude rally strengthens CAD, and how to use crude oil charts as a leading indicator for the pair.',
            slug: lessonSlug(12, 'Tuesday', 2, 'Oil Price and CAD Correlation: Trading USD/CAD with Crude Intelligence') },
          { number: 3, title: 'China Demand and Its Impact on AUD and NZD Across All Timeframes', type: 'lesson',
            summary: 'How Chinese PMI data, property sector news, and PBOC policy announcements ripple through to AUD and NZD pairs — the Asia session as the primary liquidity window for China-impacted currency moves.',
            slug: lessonSlug(12, 'Tuesday', 3, 'China Demand and Its Impact on AUD and NZD Across All Timeframes') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Gold, Silver, and Safe-Haven Currency Flows',
        lessons: [
          { number: 1, title: 'Gold as a USD Inverse: The XAU/USD Relationship Explained', type: 'lesson',
            summary: 'The inverse relationship between gold and the USD Dollar Index — why gold rallies when USD weakens and the conditions under which this correlation breaks down, creating divergence trading opportunities.',
            slug: lessonSlug(12, 'Wednesday', 1, 'Gold as a USD Inverse: The XAU/USD Relationship Explained') },
          { number: 2, title: 'CHF and JPY as Pure Safe-Haven Flows: When to Trade Them', type: 'lesson',
            summary: 'The specific macro conditions that activate institutional CHF and JPY demand — financial system stress, equity market crashes, and geopolitical escalation — and the typical move duration and retracement pattern.',
            slug: lessonSlug(12, 'Wednesday', 2, 'CHF and JPY as Pure Safe-Haven Flows: When to Trade Them') },
          { number: 3, title: 'Using Gold and VIX as Pre-Confirmation for Safe-Haven Currency Entries', type: 'lesson',
            summary: 'How rising gold prices and VIX spikes ahead of an obvious CHF or JPY move provide earlier confirmation than the currency itself — building a multi-asset pre-confirmation checklist for safe-haven trades.',
            slug: lessonSlug(12, 'Wednesday', 3, 'Using Gold and VIX as Pre-Confirmation for Safe-Haven Currency Entries') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Bond Yields, DXY, and Macro Currency Flows',
        lessons: [
          { number: 1, title: 'US 10-Year Treasury Yield and USD Direction — A Working Relationship', type: 'lesson',
            summary: 'Why rising US 10-year yields tend to strengthen USD by attracting foreign capital into US assets — the mechanism, the lag between yield moves and USD follow-through, and when the relationship temporarily decouples.',
            slug: lessonSlug(12, 'Thursday', 1, 'US 10-Year Treasury Yield and USD Direction — A Working Relationship') },
          { number: 2, title: 'Dollar Index DXY: Composition, Reading, and Its Impact on All USD Pairs', type: 'lesson',
            summary: 'The six-currency composition of DXY and how its major components (EUR, JPY, GBP) weight the index — using DXY direction and structure to confirm trade bias on individual USD pairs before entry.',
            slug: lessonSlug(12, 'Thursday', 2, 'Dollar Index DXY: Composition, Reading, and Its Impact on All USD Pairs') },
          { number: 3, title: 'Yield Curve Shape as a Recession Signal and Currency Impact', type: 'lesson',
            summary: 'The inverted yield curve as a leading recession indicator — how a 2s10s inversion historically precedes USD strength in the early phase followed by weakness as rate cut expectations build.',
            slug: lessonSlug(12, 'Thursday', 3, 'Yield Curve Shape as a Recession Signal and Currency Impact') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Building a Multi-Asset Pre-Trade Checklist',
        lessons: [
          { number: 1, title: 'The Intermarket Pre-Trade Confirmation Matrix', type: 'lesson',
            summary: 'A structured checklist that cross-checks correlated asset behaviour before a forex entry — equity direction, bond yield movement, commodity price action, and currency index strength all assessed in under five minutes.',
            slug: lessonSlug(12, 'Friday', 1, 'The Intermarket Pre-Trade Confirmation Matrix') },
          { number: 2, title: 'Cross-Market Divergence as a Warning Signal for Trade Avoidance', type: 'lesson',
            summary: 'When the intermarket context contradicts the technical setup — how uptrending equities conflicting with a USD/JPY short setup signals lower probability, and when to stand aside rather than force the trade.',
            slug: lessonSlug(12, 'Friday', 2, 'Cross-Market Divergence as a Warning Signal for Trade Avoidance') },
          { number: 3, title: 'Case Studies: Three Intermarket Confirmation Trades Analyzed', type: 'lesson',
            summary: 'Three professional trade examples where intermarket confirmation was the decisive factor — showing oil confirming the CAD entry, DXY confirming the EUR/USD short, and gold confirming the CHF long.',
            slug: lessonSlug(12, 'Friday', 3, 'Case Studies: Three Intermarket Confirmation Trades Analyzed') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Intermarket Analysis Workflow',
        lessons: [
          { number: 1, title: 'Assignment Overview: Designing Your Intermarket Morning Routine', type: 'assignment',
            summary: 'How a structured pre-market intermarket scan transforms your daily preparation quality — and why traders who check correlated asset context make fewer impulsive entries against prevailing macro flows.',
            slug: lessonSlug(12, 'Saturday', 1, 'Assignment Overview: Designing Your Intermarket Morning Routine') },
          { number: 2, title: 'Build and Test a 5-Minute Intermarket Confirmation Checklist', type: 'assignment',
            summary: 'Design a concise daily intermarket checklist covering DXY, gold, 10-year yields, and the relevant commodity for your traded pairs — test it against 5 recent trades to assess what it would have confirmed or rejected.',
            slug: lessonSlug(12, 'Saturday', 2, 'Build and Test a 5-Minute Intermarket Confirmation Checklist') },
          { number: 3, title: 'Document One Full Week of Intermarket Pre-Trade Analysis', type: 'assignment',
            summary: 'For every setup considered during the coming week, run the intermarket checklist first and document the result — tracking whether the checklist confirmation correlated with trade outcome over 5 trading days.',
            slug: lessonSlug(12, 'Saturday', 3, 'Document One Full Week of Intermarket Pre-Trade Analysis') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 13 · Smart Money Concepts Deep Dive · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 13,
    module: 'Smart Money Concepts Deep Dive',
    level: 'Professional',
    description: 'Master the institutional trading framework that underlies every significant market move — order blocks, breaks of structure, change of character, market maker models, and the complete Smart Money Concepts (SMC) methodology.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Order Block Theory and Identification',
        lessons: [
          { number: 1, title: 'What an Order Block Is and Why Institutions Create Them', type: 'lesson',
            summary: 'An order block is the last opposing candle before a significant impulsive move — the origin zone where institutional orders were placed. Why price returns to these zones to fill remaining orders before continuing.',
            slug: lessonSlug(13, 'Monday', 1, 'What an Order Block Is and Why Institutions Create Them') },
          { number: 2, title: 'Identifying Bullish and Bearish Order Blocks on Live Charts', type: 'lesson',
            summary: 'The exact visual criteria for a valid order block — the last bearish candle before a bullish impulse (bullish OB) and the last bullish candle before a bearish impulse (bearish OB) — and the volume signature that confirms each.',
            slug: lessonSlug(13, 'Monday', 2, 'Identifying Bullish and Bearish Order Blocks on Live Charts') },
          { number: 3, title: 'Order Block Entry Model: Entry, Stop, and Target Architecture', type: 'lesson',
            summary: 'How to enter precisely at the order block zone — entry at the 50% retracement or the candle open/close, stop below the OB low, and target at the next key level or liquidity pool above the impulse origin.',
            slug: lessonSlug(13, 'Monday', 3, 'Order Block Entry Model: Entry, Stop, and Target Architecture') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Break of Structure and Change of Character',
        lessons: [
          { number: 1, title: 'Break of Structure (BOS): Trend Continuation Confirmation in SMC', type: 'lesson',
            summary: 'In SMC, a BOS occurs when price breaks a significant swing high in an uptrend or swing low in a downtrend — confirming that the dominant trend is continuing and providing a directional bias for the period ahead.',
            slug: lessonSlug(13, 'Tuesday', 1, 'Break of Structure (BOS): Trend Continuation Confirmation in SMC') },
          { number: 2, title: 'Change of Character (CHoCH): The First Signal of Trend Reversal', type: 'lesson',
            summary: 'The CHoCH occurs when price breaks the most recent swing low in an uptrend — the earliest structural signal that the trend is shifting. Why this is more reliable than any indicator divergence as a reversal warning.',
            slug: lessonSlug(13, 'Tuesday', 2, 'Change of Character (CHoCH): The First Signal of Trend Reversal') },
          { number: 3, title: 'Internal and External Structure: Micro and Macro Market Views', type: 'lesson',
            summary: 'Internal structure refers to swings within a trend leg; external structure refers to the major highs and lows of the broader trend. How to read both simultaneously for entries that align with macro direction but use micro precision.',
            slug: lessonSlug(13, 'Tuesday', 3, 'Internal and External Structure: Micro and Macro Market Views') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Liquidity Internal and External',
        lessons: [
          { number: 1, title: 'Internal Liquidity: Equal Highs, Lows, and Consolidation Pools', type: 'lesson',
            summary: 'Internal liquidity lies within a current price range — equal highs and lows, tight consolidation zones, and obvious support/resistance clusters where retail stops concentrate before a continuation move.',
            slug: lessonSlug(13, 'Wednesday', 1, 'Internal Liquidity: Equal Highs, Lows, and Consolidation Pools') },
          { number: 2, title: 'External Liquidity: Old Highs, Weekly Lows, and Significant Swing Points', type: 'lesson',
            summary: 'External liquidity is the target — old weekly highs, monthly swing points, and major structural levels where sufficient stop volume accumulates to absorb large institutional orders. How price always targets these before turning.',
            slug: lessonSlug(13, 'Wednesday', 2, 'External Liquidity: Old Highs, Weekly Lows, and Significant Swing Points') },
          { number: 3, title: 'Price Delivery from Liquidity Grab to Next Liquidity Target', type: 'lesson',
            summary: 'The complete SMC price delivery model: price sweeps internal liquidity, creates a CHoCH, then delivers to an order block, then targets the external liquidity. How to map this sequence in advance and enter at the OB.',
            slug: lessonSlug(13, 'Wednesday', 3, 'Price Delivery from Liquidity Grab to Next Liquidity Target') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Market Maker Models and Manipulation Phases',
        lessons: [
          { number: 1, title: 'The Four Market Maker Phases: Consolidation, Manipulation, Distribution, and Continuation', type: 'lesson',
            summary: 'The institutional price cycle that repeats across all timeframes — how consolidation accumulates orders, manipulation hunts retail stops, distribution accelerates in the true direction, and continuation delivers to target.',
            slug: lessonSlug(13, 'Thursday', 1, 'The Four Market Maker Phases: Consolidation, Manipulation, Distribution, and Continuation') },
          { number: 2, title: 'Identifying Manipulation Phases: The Stop Hunt Before the Real Move', type: 'lesson',
            summary: 'Why the market consistently spikes beyond an obvious level before reversing with explosive force — how to identify when a move is a manipulation sweep versus a genuine breakout, using wick characteristics and session timing.',
            slug: lessonSlug(13, 'Thursday', 2, 'Identifying Manipulation Phases: The Stop Hunt Before the Real Move') },
          { number: 3, title: 'Trading the True Distribution Phase After Confirmed Manipulation', type: 'lesson',
            summary: 'Entering the real move after the manipulation phase has completed — confirmation criteria including the displacement candle, structure break, and order block that forms at the manipulation reversal point.',
            slug: lessonSlug(13, 'Thursday', 3, 'Trading the True Distribution Phase After Confirmed Manipulation') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Premium and Discount Zones for Entry Timing',
        lessons: [
          { number: 1, title: 'Premium and Discount Framework Using the 50% Equilibrium Model', type: 'lesson',
            summary: 'The range between any two significant swing points is divided at 50% — above 50% is premium (expensive for buys), below 50% is discount (optimal for longs). How to identify the current zone before every entry.',
            slug: lessonSlug(13, 'Friday', 1, 'Premium and Discount Framework Using the 50% Equilibrium Model') },
          { number: 2, title: 'Optimal Trade Entry (OTE): Combining Fib with Premium/Discount', type: 'lesson',
            summary: 'The 62%-79% Fibonacci retracement zone within the discount range is the Optimal Trade Entry (OTE) — combining this Fibonacci window with an order block for the highest-quality institutional entry possible.',
            slug: lessonSlug(13, 'Friday', 2, 'Optimal Trade Entry (OTE): Combining Fib with Premium/Discount') },
          { number: 3, title: 'Full SMC Trade Model: From Liquidity Hunt to OTE Entry to HTF Target', type: 'lesson',
            summary: 'The complete professional SMC trade model assembled from all week\'s components — liquidity identification, CHoCH confirmation, order block OTE entry, and delivery to the external liquidity target on the higher timeframe.',
            slug: lessonSlug(13, 'Friday', 3, 'Full SMC Trade Model: From Liquidity Hunt to OTE Entry to HTF Target') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Full SMC Setup Documentation',
        lessons: [
          { number: 1, title: 'Assignment Overview: Applying the Full SMC Model to Real Charts', type: 'assignment',
            summary: 'Why practicing the complete SMC model sequence — from liquidity mapping through manipulation identification to OTE entry — on real charts builds the pattern recognition that makes the model automatic in live markets.',
            slug: lessonSlug(13, 'Saturday', 1, 'Assignment Overview: Applying the Full SMC Model to Real Charts') },
          { number: 2, title: 'Map 3 Complete SMC Setups: Liquidity, BOS/CHoCH, OB/OTE, and Target', type: 'assignment',
            summary: 'For each setup: annotate the liquidity zone targeted, identify the CHoCH or BOS that confirmed direction, mark the relevant order block, apply OTE Fibonacci, and project the external liquidity target.',
            slug: lessonSlug(13, 'Saturday', 2, 'Map 3 Complete SMC Setups: Liquidity, BOS/CHoCH, OB/OTE, and Target') },
          { number: 3, title: 'Peer Review Criteria: Validating Your SMC Analysis Standards', type: 'assignment',
            summary: 'A self-assessment checklist for validating SMC analysis quality — confirming the OB was the last opposing candle before displacement, the CHoCH was a genuine structural break, and the OTE was in the discount zone.',
            slug: lessonSlug(13, 'Saturday', 3, 'Peer Review Criteria: Validating Your SMC Analysis Standards') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 14 · Order Blocks, Fair Value Gaps, and Breaker Blocks · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 14,
    module: 'Order Blocks, Fair Value Gaps, and Breaker Blocks',
    level: 'Professional',
    description: 'Build precision in SMC execution — distinguishing mitigated from valid order blocks, using fair value gaps as entry zones, identifying breaker blocks after failed OBs, and combining these concepts into a complete institutional entry framework.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Mitigated vs Valid Order Blocks',
        lessons: [
          { number: 1, title: 'What It Means for an Order Block to Be Mitigated', type: 'lesson',
            summary: 'An order block is mitigated when price returns to it and closes through it — at that point the institutional orders have been filled and the OB loses its significance. Distinguishing live OBs from already-used zones.',
            slug: lessonSlug(14, 'Monday', 1, 'What It Means for an Order Block to Be Mitigated') },
          { number: 2, title: 'Volume Imbalance: Identifying the Strongest Order Blocks', type: 'lesson',
            summary: 'Order blocks created with a volume imbalance (price jumped away leaving an unfilled gap) carry the highest institutional weight — how to identify volume imbalance within the OB candle and why these react most reliably.',
            slug: lessonSlug(14, 'Monday', 2, 'Volume Imbalance: Identifying the Strongest Order Blocks') },
          { number: 3, title: 'Multi-Timeframe Order Block Hierarchy for Entry Precision', type: 'lesson',
            summary: 'A daily OB defines the high-level trading zone; an H1 OB within it provides the specific entry level. How to use higher-timeframe OBs as the destination and lower-timeframe OBs as the trigger for layered precision entries.',
            slug: lessonSlug(14, 'Monday', 3, 'Multi-Timeframe Order Block Hierarchy for Entry Precision') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Fair Value Gaps (FVG) and Imbalance Zones',
        lessons: [
          { number: 1, title: 'What Is a Fair Value Gap and Why Price Returns to Fill It', type: 'lesson',
            summary: 'A Fair Value Gap is a three-candle structure where the first and third candles do not overlap — leaving an imbalance (gap) between their wicks. Why auction market theory predicts price will return to fill this inefficiency.',
            slug: lessonSlug(14, 'Tuesday', 1, 'What Is a Fair Value Gap and Why Price Returns to Fill It') },
          { number: 2, title: 'Trading at the FVG: Entry Types, Stop Placement, and Probability Filters', type: 'lesson',
            summary: 'The three FVG entry approaches — entering at the leading edge (highest probability, higher risk of early entry), the 50% of the gap (balanced risk), or the trailing edge (highest confirmation, tightest stop). When to use each.',
            slug: lessonSlug(14, 'Tuesday', 2, 'Trading at the FVG: Entry Types, Stop Placement, and Probability Filters') },
          { number: 3, title: 'Combining FVG with Order Blocks for the Highest-Grade SMC Setup', type: 'lesson',
            summary: 'When a Fair Value Gap and an Order Block overlap in the same price zone — the strongest institutional entry you can find. How the OB provides the accumulation zone and the FVG provides the precision entry level.',
            slug: lessonSlug(14, 'Tuesday', 3, 'Combining FVG with Order Blocks for the Highest-Grade SMC Setup') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Breaker Blocks as Failed OB Reversals',
        lessons: [
          { number: 1, title: 'What Is a Breaker Block and How It Forms from a Failed Order Block', type: 'lesson',
            summary: 'When price returns to an OB and trades through it — the OB has failed but now becomes a Breaker Block. Why the failed OB zone now acts as resistance in bullish breakers and support in bearish breakers after the structural break.',
            slug: lessonSlug(14, 'Wednesday', 1, 'What Is a Breaker Block and How It Forms from a Failed Order Block') },
          { number: 2, title: 'Trading the Breaker Block Retest: Structure, Entry, and Target Logic', type: 'lesson',
            summary: 'The entry setup after a Breaker Block forms — wait for price to return to the breaker zone, confirm rejection at the zone boundary, and target the next liquidity level in the new direction established by the structural break.',
            slug: lessonSlug(14, 'Wednesday', 2, 'Trading the Breaker Block Retest: Structure, Entry, and Target Logic') },
          { number: 3, title: 'Breaker Block vs Mitigation Block: Two Distinct Institutional Concepts', type: 'lesson',
            summary: 'A mitigation block is the last opposing candle at the origin of a corrective move — different from a breaker in its formation logic and trading application. How to distinguish them visually and use each correctly.',
            slug: lessonSlug(14, 'Wednesday', 3, 'Breaker Block vs Mitigation Block: Two Distinct Institutional Concepts') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Rejection Blocks and Propulsion Blocks',
        lessons: [
          { number: 1, title: 'Rejection Block: The Wick-Heavy Candle as a High-Volume Reaction Zone', type: 'lesson',
            summary: 'A Rejection Block is formed by candles with large wicks that signal strong price rejection — the wick range itself becomes an institutional zone. How to identify the upper or lower 50% of the wick as the precise entry area.',
            slug: lessonSlug(14, 'Thursday', 1, 'Rejection Block: The Wick-Heavy Candle as a High-Volume Reaction Zone') },
          { number: 2, title: 'Propulsion Block: The Continuation Zone Within an Impulsive Move', type: 'lesson',
            summary: 'A propulsion block is a consolidation candle embedded within a displacement move — the zone where institutional orders partially filled during the impulse and which becomes a support/resistance area on the first retest.',
            slug: lessonSlug(14, 'Thursday', 2, 'Propulsion Block: The Continuation Zone Within an Impulsive Move') },
          { number: 3, title: 'Combining All Block Types in a Multi-Layer SMC Zone Framework', type: 'lesson',
            summary: 'Building a complete institutional zone framework across OBs, Breakers, Rejection Blocks, and FVGs — how to prioritise when multiple zone types exist at the same price level and which takes precedence for entry timing.',
            slug: lessonSlug(14, 'Thursday', 3, 'Combining All Block Types in a Multi-Layer SMC Zone Framework') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'High-Probability SMC Confluence Model',
        lessons: [
          { number: 1, title: 'The Five-Layer SMC Confluence Stack for Maximum Probability Entries', type: 'lesson',
            summary: 'HTF bias + BOS/CHoCH confirmation + valid OB + FVG overlap + OTE Fibonacci entry = the five-layer SMC stack that represents a professional-grade trade opportunity. Each layer and its contribution to overall probability.',
            slug: lessonSlug(14, 'Friday', 1, 'The Five-Layer SMC Confluence Stack for Maximum Probability Entries') },
          { number: 2, title: 'Patience in SMC: Why Most of the Calendar Is a No-Trade Period', type: 'lesson',
            summary: 'The five-layer stack occurs infrequently — perhaps 2-5 times per week per pair. How professional SMC traders spend most of their time mapping, waiting, and declining setups that do not meet all five conditions.',
            slug: lessonSlug(14, 'Friday', 2, 'Patience in SMC: Why Most of the Calendar Is a No-Trade Period') },
          { number: 3, title: 'SMC Case Study: Three Full-Model Trade Examples Annotated', type: 'lesson',
            summary: 'Three complete SMC trade examples from entry to exit — each showing the five-layer stack aligned, the entry at the OTE within the OB, stop below the OB low, and delivery to external liquidity target with the full R:R calculated.',
            slug: lessonSlug(14, 'Friday', 3, 'SMC Case Study: Three Full-Model Trade Examples Annotated') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: SMC Annotated Chart Study',
        lessons: [
          { number: 1, title: 'Assignment Overview: Building Your SMC Annotation Reference Library', type: 'assignment',
            summary: 'Why building an annotated library of own-discovered SMC setups is the fastest route to recognising them in real time — the pattern accumulation effect that makes live identification instantaneous.',
            slug: lessonSlug(14, 'Saturday', 1, 'Assignment Overview: Building Your SMC Annotation Reference Library') },
          { number: 2, title: 'Annotate 4 Pairs with Full SMC Layer Markup: OBs, FVGs, and Liquidity', type: 'assignment',
            summary: 'On EUR/USD, GBP/USD, USD/JPY, and one commodity currency pair — mark all visible order blocks, fair value gaps, liquidity pools, and the most recent BOS and CHoCH on both the daily and H4 timeframe.',
            slug: lessonSlug(14, 'Saturday', 2, 'Annotate 4 Pairs with Full SMC Layer Markup: OBs, FVGs, and Liquidity') },
          { number: 3, title: 'Identify the Single Highest-Quality Setup from Your Annotation Work', type: 'assignment',
            summary: 'Review all annotated pairs and select the single setup with the most SMC confluence layers aligned — document precisely why it qualifies, what the entry would be, the stop level, and the target.',
            slug: lessonSlug(14, 'Saturday', 3, 'Identify the Single Highest-Quality Setup from Your Annotation Work') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 15 · Institutional Market Structure and Volume Analysis · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 15,
    module: 'Institutional Market Structure and Volume Analysis',
    level: 'Professional',
    description: 'Understand how institutional participants use volume, auctions, and market profile to locate value — applying volume profile, auction market theory, and opening range concepts to add an institutional dimension to every trade.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Auction Market Theory and Price as Information',
        lessons: [
          { number: 1, title: 'Auction Market Theory: Markets Seek Buyers, Sellers, and Value Areas', type: 'lesson',
            summary: 'Every market is a continuous two-way auction — price moves up to find sellers and down to find buyers. How understanding the auction process explains range extension, value area acceptance, and trend development.',
            slug: lessonSlug(15, 'Monday', 1, 'Auction Market Theory: Markets Seek Buyers, Sellers, and Value Areas') },
          { number: 2, title: 'Value Area High, Value Area Low, and Point of Control Explained', type: 'lesson',
            summary: 'The Value Area is where 70% of volume traded in a session. VAH is value area high, VAL is value area low, and POC is the single price level with the most volume. How these levels become support and resistance.',
            slug: lessonSlug(15, 'Monday', 2, 'Value Area High, Value Area Low, and Point of Control Explained') },
          { number: 3, title: 'Balancing and Imbalance in Auction Market Theory', type: 'lesson',
            summary: 'A balanced market creates a recognisable bell curve distribution with a clear value area. An imbalanced market shows a skewed or double distribution — signalling institutional price discovery and directional thrust.',
            slug: lessonSlug(15, 'Monday', 3, 'Balancing and Imbalance in Auction Market Theory') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Volume Profile for Forex and CFD Trading',
        lessons: [
          { number: 1, title: 'Reading a Volume Profile: Distribution Shape and Price Acceptance', type: 'lesson',
            summary: 'How the volume profile histogram reveals which price levels attracted the most transaction volume — the shape of the distribution (single print, balanced, p-shape, b-shape) and what each signals about market behaviour.',
            slug: lessonSlug(15, 'Tuesday', 1, 'Reading a Volume Profile: Distribution Shape and Price Acceptance') },
          { number: 2, title: 'Using POC as a Magnet: Entries When Price Returns to High-Volume Nodes', type: 'lesson',
            summary: 'The Point of Control attracts price like a magnet — how to use POC from prior sessions, prior weeks, and developing profiles as high-probability reaction zones for both entries and trade management decisions.',
            slug: lessonSlug(15, 'Tuesday', 2, 'Using POC as a Magnet: Entries When Price Returns to High-Volume Nodes') },
          { number: 3, title: 'Low Volume Nodes: The Fast-Move Zones Between High Volume Areas', type: 'lesson',
            summary: 'Low Volume Nodes are price zones where little volume traded — price moves through these areas quickly with minimal resistance. How to identify them and use LVN gaps as acceleration zones for target setting.',
            slug: lessonSlug(15, 'Tuesday', 3, 'Low Volume Nodes: The Fast-Move Zones Between High Volume Areas') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Opening Range and Initial Balance Concepts',
        lessons: [
          { number: 1, title: 'The Opening Range: Definition, Timeframes, and Institutional Importance', type: 'lesson',
            summary: 'The opening range (OR) is defined as the high and low of the first 30 minutes of a new session. Why institutional traders use the OR boundaries as the first key levels of every day and how extensions of OR define the day\'s range.',
            slug: lessonSlug(15, 'Wednesday', 1, 'The Opening Range: Definition, Timeframes, and Institutional Importance') },
          { number: 2, title: 'Initial Balance and Day Type Classification for Trade Bias', type: 'lesson',
            summary: 'The Initial Balance (IB) is the first hour range. Day type classification — Normal Day, Trend Day, Double Distribution — based on whether price extends IB and to which side. How day type determines strategy selection.',
            slug: lessonSlug(15, 'Wednesday', 2, 'Initial Balance and Day Type Classification for Trade Bias') },
          { number: 3, title: 'OR Breakout Entries and Fade Trades When Context Disagrees', type: 'lesson',
            summary: 'Two OR-based strategies: trend-aligned OR breakout on high-momentum days and OR fade on range days when the break is weak and returns quickly. How context from previous sessions determines which strategy to apply.',
            slug: lessonSlug(15, 'Wednesday', 3, 'OR Breakout Entries and Fade Trades When Context Disagrees') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Institutional Order Flow and Delta Analysis',
        lessons: [
          { number: 1, title: 'Delta: Difference Between Aggressive Buyers and Sellers at Each Candle', type: 'lesson',
            summary: 'Delta measures aggressive buying minus aggressive selling — positive delta on up-close candles confirms buying conviction. Bearish delta divergence (price rises but delta drops) is one of the earliest reversal warning signals.',
            slug: lessonSlug(15, 'Thursday', 1, 'Delta: Difference Between Aggressive Buyers and Sellers at Each Candle') },
          { number: 2, title: 'Cumulative Delta Divergence as a Leading Reversal Indicator', type: 'lesson',
            summary: 'Cumulative delta tracks the running total of delta across sessions — when cumulative delta diverges from price (new price highs but falling cumulative delta), institutional distribution is likely occurring before the price reversal.',
            slug: lessonSlug(15, 'Thursday', 2, 'Cumulative Delta Divergence as a Leading Reversal Indicator') },
          { number: 3, title: 'Building a Footprint Chart Competence for Precise Entry Timing', type: 'lesson',
            summary: 'Footprint charts display bid-ask volume at every price level within each candle — providing direct visibility into where aggressive buyers and sellers are transacting. How to use the footprint for entry precision within an OB or FVG.',
            slug: lessonSlug(15, 'Thursday', 3, 'Building a Footprint Chart Competence for Precise Entry Timing') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Combining Volume Profile and SMC for Professional Entries',
        lessons: [
          { number: 1, title: 'When Volume Profile POC Aligns with an SMC Order Block: Maximum Edge', type: 'lesson',
            summary: 'The highest-probability trade setup in professional forex combines an SMC order block that coincides with a high-volume node or POC from the volume profile — institutional intent confirmed by both price structure and volume distribution.',
            slug: lessonSlug(15, 'Friday', 1, 'When Volume Profile POC Aligns with an SMC Order Block: Maximum Edge') },
          { number: 2, title: 'Using Initial Balance Extension for Daily Directional Target Setting', type: 'lesson',
            summary: 'How to project 100%, 150%, and 200% Initial Balance extensions as institutional profit targets — using these projections alongside SMC external liquidity targets to select which level to use as your trade exit.',
            slug: lessonSlug(15, 'Friday', 2, 'Using Initial Balance Extension for Daily Directional Target Setting') },
          { number: 3, title: 'Institutional Intelligence: Building a Full Daily Pre-Market Protocol', type: 'lesson',
            summary: 'The complete pre-market routine of a professional forex trader — central bank stance, intermarket check, previous day volume profile assessment, SMC zone mapping, and Initial Balance preparation before any live chart analysis.',
            slug: lessonSlug(15, 'Friday', 3, 'Institutional Intelligence: Building a Full Daily Pre-Market Protocol') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Volume Profile Mapping Exercise',
        lessons: [
          { number: 1, title: 'Assignment Overview: Adding Volume Intelligence to Your Chart Analysis', type: 'assignment',
            summary: 'The practical exercise of placing volume profile on three pairs and interpreting what the distribution shape reveals about institutional positioning — building a working fluency with VP concepts over one week.',
            slug: lessonSlug(15, 'Saturday', 1, 'Assignment Overview: Adding Volume Intelligence to Your Chart Analysis') },
          { number: 2, title: 'Apply Volume Profile to 5 Recent Sessions: Mark VAH, VAL, and POC', type: 'assignment',
            summary: 'For five consecutive daily sessions on EUR/USD — apply session volume profiles, mark VAH/VAL/POC, and review the next session to see how price interacted with the previous day\'s profile levels.',
            slug: lessonSlug(15, 'Saturday', 2, 'Apply Volume Profile to 5 Recent Sessions: Mark VAH, VAL, and POC') },
          { number: 3, title: 'Combine VP Levels with SMC Zones: Find 2 High-Confluence Setups', type: 'assignment',
            summary: 'Using the volume profile data alongside existing SMC analysis — identify two setups where a VP level (POC or HVN) overlaps with an SMC order block or FVG, and document the full five-layer stack for each.',
            slug: lessonSlug(15, 'Saturday', 3, 'Combine VP Levels with SMC Zones: Find 2 High-Confluence Setups') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 16 · Swing Trading and Position Trading Mastery · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 16,
    module: 'Swing Trading and Position Trading Mastery',
    level: 'Professional',
    description: 'Master longer-timeframe professional trading approaches — swing trade architectures across multi-day structures, carry trade positioning, scaling in and out of large moves, and the patience discipline that separates traders from speculators.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Swing Trading Framework Across Multi-Day Structures',
        lessons: [
          { number: 1, title: 'Defining a Swing Trade: Timeframe, Hold Period, and Target Profile', type: 'lesson',
            summary: 'A swing trade holds for 2-10 days, targeting multi-day structural moves identified on the D1 or H4 — the complete framework comparison: setup identification on daily, entry trigger on H4/H1, stop at multi-day structure.',
            slug: lessonSlug(16, 'Monday', 1, 'Defining a Swing Trade: Timeframe, Hold Period, and Target Profile') },
          { number: 2, title: 'Weekly Structure Analysis: Identifying the Dominant Weekly Bias', type: 'lesson',
            summary: 'How to analyse the weekly chart for the dominant trend, map the current weekly range, and identify whether price is at a premium, discount, or neutral zone relative to the weekly structure before selecting trade direction.',
            slug: lessonSlug(16, 'Monday', 2, 'Weekly Structure Analysis: Identifying the Dominant Weekly Bias') },
          { number: 3, title: 'Entry Timing on H4: Precision Entry Within a Swing Trade Bias', type: 'lesson',
            summary: 'The daily structure provides the bias and the H4 provides the SMC entry trigger — how to wait for an H4 order block, CHoCH, or OTE to materialise in the direction of the weekly trend before committing swing capital.',
            slug: lessonSlug(16, 'Monday', 3, 'Entry Timing on H4: Precision Entry Within a Swing Trade Bias') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Scaling Into and Out of Swing Positions',
        lessons: [
          { number: 1, title: 'Scaling In: Adding to Winners at Structural Confirmation Points', type: 'lesson',
            summary: 'How to add size to a swing trade as it confirms — adding at the first retest of a broken structure with a partial close risk management plan that locks in the initial position at breakeven while adding at a lower-risk level.',
            slug: lessonSlug(16, 'Tuesday', 1, 'Scaling In: Adding to Winners at Structural Confirmation Points') },
          { number: 2, title: 'Partial Exit Strategy for Multi-Day Swing Trades', type: 'lesson',
            summary: 'Taking 50% off at the first structural target, moving the remaining stop to breakeven, and running the second half to the extended target — the mechanics of this classic professional risk management approach.',
            slug: lessonSlug(16, 'Tuesday', 2, 'Partial Exit Strategy for Multi-Day Swing Trades') },
          { number: 3, title: 'Trailing Stop Mechanisms for Swing Positions Over Multiple Days', type: 'lesson',
            summary: 'Different trailing approaches for swing trades — structure-based trailing (stop moves after each new swing forms), ATR-based trailing (floor set at N ATR below price), and candle-close trailing (stop below last confirmed HH/LL).',
            slug: lessonSlug(16, 'Tuesday', 3, 'Trailing Stop Mechanisms for Swing Positions Over Multiple Days') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Position Trading: Weeks to Months',
        lessons: [
          { number: 1, title: 'Position Trading Framework: Monthly Structure, Weekly Timing, Daily Entry', type: 'lesson',
            summary: 'Position trades hold for weeks to months based on macroeconomic and monthly structural analysis — the complete timeframe cascade and how central bank divergence plus monthly SMC alignment creates position trade opportunities.',
            slug: lessonSlug(16, 'Wednesday', 1, 'Position Trading Framework: Monthly Structure, Weekly Timing, Daily Entry') },
          { number: 2, title: 'Managing Drawdown During a Valid Position Trade', type: 'lesson',
            summary: 'How to distinguish a normal pullback within a valid position trade from a structural break that invalidates the thesis — the specific criteria that require exit versus the price behaviour that demands holding through.',
            slug: lessonSlug(16, 'Wednesday', 2, 'Managing Drawdown During a Valid Position Trade') },
          { number: 3, title: 'Currency Pairs Best Suited to Position Trading vs Day Trading', type: 'lesson',
            summary: 'EUR/USD, GBP/USD, and USD/JPY trend cleanly on monthly timeframes for position trades. Exotic pairs and cross pairs are often too noisy. How pair selection differs completely between position and intraday strategies.',
            slug: lessonSlug(16, 'Wednesday', 3, 'Currency Pairs Best Suited to Position Trading vs Day Trading') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Carry Trade Strategy and Rollover Management',
        lessons: [
          { number: 1, title: 'Carry Trade Setup: Selecting the Optimal Currency Pair for the Rate Cycle', type: 'lesson',
            summary: 'The carry trade pairs highest-yielding currency with lowest-yielding — selecting pairs where the rate differential is highest, the trend aligns with carry direction, and volatility is low enough that daily swap income exceeds risk.',
            slug: lessonSlug(16, 'Thursday', 1, 'Carry Trade Setup: Selecting the Optimal Currency Pair for the Rate Cycle') },
          { number: 2, title: 'Daily Rollover and Overnight Swap: Calculating Positive Carry Income', type: 'lesson',
            summary: 'How to calculate daily swap received from a carry position, the annual equivalent return at different lot sizes, and the break-even volatility level where carry income no longer compensates for adverse price movement.',
            slug: lessonSlug(16, 'Thursday', 2, 'Daily Rollover and Overnight Swap: Calculating Positive Carry Income') },
          { number: 3, title: 'Carry Trade Unwind Risk: Volatility Spikes and Rapid Reversal Management', type: 'lesson',
            summary: 'Carry trades are vulnerable to sudden risk-off events that trigger rapid unwinding — how to size carry positions conservatively, use structural stops rather than close stops, and recognise the unwind signal before the damage compounds.',
            slug: lessonSlug(16, 'Thursday', 3, 'Carry Trade Unwind Risk: Volatility Spikes and Rapid Reversal Management') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Patience Discipline: The Professional Trader Attribute',
        lessons: [
          { number: 1, title: 'Why Patience Is the Highest-Value Skill in Swing and Position Trading', type: 'lesson',
            summary: 'Professional swing and position traders earn their edge by waiting — the statistical case for why fewer, higher-quality setups outperform frequent, mediocre ones over any 12-month period.',
            slug: lessonSlug(16, 'Friday', 1, 'Why Patience Is the Highest-Value Skill in Swing and Position Trading') },
          { number: 2, title: 'Managing Non-Trading Time: Preparation, Research, and Market Study', type: 'lesson',
            summary: 'What professional traders do between high-quality trades — maintaining the policy tracker, volume profile study, SMC zone mapping, and trade library documentation that sustains edge quality over time.',
            slug: lessonSlug(16, 'Friday', 2, 'Managing Non-Trading Time: Preparation, Research, and Market Study') },
          { number: 3, title: 'Building a Professional Swing Trade Plan Template and Using It Consistently', type: 'lesson',
            summary: 'A written trade plan prepared before entry that specifies bias source, entry trigger, stop level, target level, position size, and management rules — the written plan as the foundation of professional execution discipline.',
            slug: lessonSlug(16, 'Friday', 3, 'Building a Professional Swing Trade Plan Template and Using It Consistently') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: 5-Day Swing Trade Simulation',
        lessons: [
          { number: 1, title: 'Assignment Overview: Weekly Bias-to-Entry Simulation', type: 'assignment',
            summary: 'Why simulating the full swing trade process — from bias formulation to entry trigger to trade management — in real-time conditions is more valuable than reviewing completed historical trades for building live execution discipline.',
            slug: lessonSlug(16, 'Saturday', 1, 'Assignment Overview: Weekly Bias-to-Entry Simulation') },
          { number: 2, title: 'Conduct a Full Weekly Bias Analysis on 4 Major Pairs and Select 2 Trades', type: 'assignment',
            summary: 'Using the weekly and daily structure analysis process, identify directional bias for EUR/USD, GBP/USD, USD/JPY, and AUD/USD. Select the 2 setups with the strongest multi-timeframe confluence and document entry criteria.',
            slug: lessonSlug(16, 'Saturday', 2, 'Conduct a Full Weekly Bias Analysis on 4 Major Pairs and Select 2 Trades') },
          { number: 3, title: 'Review Simulation Outcome: What the Week Confirmed or Rejected', type: 'assignment',
            summary: 'After 5 trading days, review both selected setups — did the entry trigger materialise, was the stop placement valid, did price reach the target, and what would have been the R:R outcome? Document key learning.',
            slug: lessonSlug(16, 'Saturday', 3, 'Review Simulation Outcome: What the Week Confirmed or Rejected') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 17 · Advanced Risk, Drawdown, and Capital Management · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 17,
    module: 'Advanced Risk, Drawdown, and Capital Management',
    level: 'Professional',
    description: 'Operate at a professional capital management standard — understanding drawdown mathematics, optimal sizing with Kelly Criterion, portfolio-level correlation risk, hedging techniques, and building a risk framework that survives 10 years.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Drawdown Mathematics and Capital Recovery',
        lessons: [
          { number: 1, title: 'Maximum Drawdown, Average Drawdown, and Their Psychological Impact', type: 'lesson',
            summary: 'Maximum drawdown is the largest peak-to-trough decline in account equity. How to calculate it, what a realistic expectation is for your strategy\'s MDD, and why even statistically expected drawdowns create severe psychological pressure.',
            slug: lessonSlug(17, 'Monday', 1, 'Maximum Drawdown, Average Drawdown, and Their Psychological Impact') },
          { number: 2, title: 'The Non-Linear Recovery Problem: Why 25% Down Needs 33% Up', type: 'lesson',
            summary: 'The mathematics of loss recovery — a 10% loss requires 11.1% to recover, a 25% loss requires 33.3%, and a 50% loss requires 100%. Why larger drawdowns create existential capital threats that smaller drawdowns do not.',
            slug: lessonSlug(17, 'Monday', 2, 'The Non-Linear Recovery Problem: Why 25% Down Needs 33% Up') },
          { number: 3, title: 'Setting Hard Drawdown Limits and Mandatory Review Triggers', type: 'lesson',
            summary: 'Professional risk management uses hard drawdown limits — a daily, weekly, and monthly maximum loss that triggers mandatory trading cessation and strategy review. How to set these levels and enforce them with rules that override emotions.',
            slug: lessonSlug(17, 'Monday', 3, 'Setting Hard Drawdown Limits and Mandatory Review Triggers') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Kelly Criterion and Optimal Position Sizing',
        lessons: [
          { number: 1, title: 'Kelly Criterion Formula: Mathematical Optimal Bet Sizing for Traders', type: 'lesson',
            summary: 'Kelly% = W - [(1-W)/R] where W is win rate and R is win/loss ratio. How this formula maximises long-term capital growth — and why full Kelly is too aggressive for trading, making half-Kelly the practical professional standard.',
            slug: lessonSlug(17, 'Tuesday', 1, 'Kelly Criterion Formula: Mathematical Optimal Bet Sizing for Traders') },
          { number: 2, title: 'Fractional Kelly in Practice: Reducing Volatility Without Sacrificing Edge', type: 'lesson',
            summary: 'Using 25-50% of the Kelly-calculated position size reduces drawdown variance dramatically while preserving most of the long-term growth advantage — the risk/growth trade-off that makes fractional Kelly the institutional standard.',
            slug: lessonSlug(17, 'Tuesday', 2, 'Fractional Kelly in Practice: Reducing Volatility Without Sacrificing Edge') },
          { number: 3, title: 'Calculating Your Current Kelly Percentage from Journal Data', type: 'lesson',
            summary: 'Using your last 50 closed trades to calculate W, R, and Kelly% — applying fractional Kelly to your current account and comparing it to your existing 1% fixed-risk approach to determine which produces better outcomes.',
            slug: lessonSlug(17, 'Tuesday', 3, 'Calculating Your Current Kelly Percentage from Journal Data') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Portfolio-Level Correlation and Exposure Control',
        lessons: [
          { number: 1, title: 'Effective Exposure: Calculating True Risk Across Correlated Positions', type: 'lesson',
            summary: 'When trading three USD pairs simultaneously, the effective USD exposure is the sum of all correlated positions — not three independent 1% risks. How to calculate true net exposure and manage it back to intended risk levels.',
            slug: lessonSlug(17, 'Wednesday', 1, 'Effective Exposure: Calculating True Risk Across Correlated Positions') },
          { number: 2, title: 'Diversification Across Uncorrelated Pairs for Smoother Equity Curves', type: 'lesson',
            summary: 'Selecting trades across genuinely uncorrelated pairs — EUR/USD, USD/JPY, and a commodity currency — rather than three USD-direction trades. How diversification reduces equity curve volatility without reducing expected return.',
            slug: lessonSlug(17, 'Wednesday', 2, 'Diversification Across Uncorrelated Pairs for Smoother Equity Curves') },
          { number: 3, title: 'Maximum Simultaneous Trade Count and Open Risk Management', type: 'lesson',
            summary: 'Why professional traders cap simultaneous open trades — the cognitive load argument, the correlation concentration risk, and the practical rule that total open risk at any moment should not exceed 3-5% of account equity.',
            slug: lessonSlug(17, 'Wednesday', 3, 'Maximum Simultaneous Trade Count and Open Risk Management') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Hedging Techniques and Correlated Pair Hedges',
        lessons: [
          { number: 1, title: 'Direct Hedging: The Mechanics and Legitimate Use Cases', type: 'lesson',
            summary: 'Direct hedging (holding long and short the same pair) is banned by some regulators and misunderstood by many traders — when it has a genuine application, the cost of maintaining a hedge, and when a stop-loss is always superior.',
            slug: lessonSlug(17, 'Thursday', 1, 'Direct Hedging: The Mechanics and Legitimate Use Cases') },
          { number: 2, title: 'Cross-Pair Hedging: Using Correlation to Reduce Specific Risk', type: 'lesson',
            summary: 'A position in EUR/USD can be partially hedged with an opposing position in a highly correlated pair — how to calculate the hedge ratio, the residual exposure that remains, and when cross-pair hedging reduces risk versus simply adding noise.',
            slug: lessonSlug(17, 'Thursday', 2, 'Cross-Pair Hedging: Using Correlation to Reduce Specific Risk') },
          { number: 3, title: 'Options-Based Hedging Concepts for Forex Traders', type: 'lesson',
            summary: 'How FX options provide protective hedges against adverse event risk — buying puts to protect long currency exposure, protective collar strategies for large position trades, and the cost-benefit decision of option-based versus stop-loss protection.',
            slug: lessonSlug(17, 'Thursday', 3, 'Options-Based Hedging Concepts for Forex Traders') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Risk-Adjusted Return Metrics and Performance Attribution',
        lessons: [
          { number: 1, title: 'Sharpe Ratio, Sortino Ratio, and Calmar Ratio: Professional Performance Metrics', type: 'lesson',
            summary: 'Sharpe = (Return - Risk-Free Rate) / Volatility. Sortino penalises only downside volatility. Calmar = Annual Return / Maximum Drawdown. Which metrics institutional allocators use to evaluate trading performance quality.',
            slug: lessonSlug(17, 'Friday', 1, 'Sharpe Ratio, Sortino Ratio, and Calmar Ratio: Professional Performance Metrics') },
          { number: 2, title: 'Performance Attribution: Separating Skill from Luck in Your Results', type: 'lesson',
            summary: 'Statistical methods for attributing performance to system edge versus random variance — sample size requirements for statistical significance, confidence intervals around win rate estimates, and when results are statistically meaningful.',
            slug: lessonSlug(17, 'Friday', 2, 'Performance Attribution: Separating Skill from Luck in Your Results') },
          { number: 3, title: 'Building a Professional Risk Management Policy Document', type: 'lesson',
            summary: 'A complete written risk management policy covering: daily loss limit, weekly loss limit, monthly drawdown trigger, maximum simultaneous positions, maximum correlation exposure, mandatory review conditions, and position sizing methodology.',
            slug: lessonSlug(17, 'Friday', 3, 'Building a Professional Risk Management Policy Document') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Personal Risk Policy Document',
        lessons: [
          { number: 1, title: 'Assignment Overview: Documenting Your Professional Risk Management Framework', type: 'assignment',
            summary: 'Why a written, rule-based risk policy is more valuable than any trading strategy — it is the framework that keeps you in the game long enough for your edge to pay out. This document should take 2-3 hours to complete properly.',
            slug: lessonSlug(17, 'Saturday', 1, 'Assignment Overview: Documenting Your Professional Risk Management Framework') },
          { number: 2, title: 'Write Your Risk Policy: All 7 Sections Defined and Completed', type: 'assignment',
            summary: 'Section by section: daily loss limit, weekly loss limit, monthly drawdown trigger, maximum open trades, correlation exposure limit, mandatory review conditions, and position sizing methodology — all with specific numbers.',
            slug: lessonSlug(17, 'Saturday', 2, 'Write Your Risk Policy: All 7 Sections Defined and Completed') },
          { number: 3, title: 'Backtest Your Risk Policy Against Your Last 3 Months of Trading', type: 'assignment',
            summary: 'Apply your new risk policy retroactively to the last three months of your trading history — at what points would the daily, weekly, or monthly limits have triggered? What would the equity curve look like with the policy enforced?',
            slug: lessonSlug(17, 'Saturday', 3, 'Backtest Your Risk Policy Against Your Last 3 Months of Trading') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 18 · Modern Forex Trading Stack and Career Operations · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 18,
    module: 'Modern Forex Trading Stack and Career Operations',
    level: 'Professional',
    description: 'Operate like a 2026 professional trader by combining discretionary edge with execution technology, AI-assisted research workflows, broker microstructure awareness, and data-driven performance operations.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'System Design for 2026 Market Conditions',
        lessons: [
          { number: 1, title: 'Designing a Hybrid System: Discretionary Bias with Rule-Based Execution', type: 'lesson',
            summary: 'Modern systems blend human contextual judgement with strict execution rules. Define what is discretionary (macro bias, regime classification) and what must be rule-locked (entry trigger, stop, sizing, and invalidation).',
            slug: lessonSlug(18, 'Monday', 1, 'Designing a Hybrid System: Discretionary Bias with Rule-Based Execution') },
          { number: 2, title: 'System Documentation 2.0: Playbooks, Checklists, and Prompt Libraries', type: 'lesson',
            summary: 'Professional traders now maintain a full operating manual: setup playbooks, pre-trade checklists, post-trade review templates, and vetted prompt libraries for research assistance while avoiding model hallucination risk.',
            slug: lessonSlug(18, 'Monday', 2, 'System Documentation 2.0: Playbooks, Checklists, and Prompt Libraries') },
          { number: 3, title: 'From Backtest to Forward Test: Walk-Forward and Monte Carlo Validation', type: 'lesson',
            summary: 'Beyond raw backtesting, modern validation uses walk-forward segmentation and Monte Carlo resampling to measure robustness under slippage, spread expansion, and sequence randomness before live capital deployment.',
            slug: lessonSlug(18, 'Monday', 3, 'From Backtest to Forward Test: Walk-Forward and Monte Carlo Validation') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Broker Microstructure and Execution Quality',
        lessons: [
          { number: 1, title: 'Spread Regimes, Slippage, and Latency: The Real Cost of Execution', type: 'lesson',
            summary: 'Execution quality defines profitability at scale. Learn how spread widens by session and event risk, how slippage distributions behave during volatility spikes, and how latency compounds hidden cost on market and stop orders.',
            slug: lessonSlug(18, 'Tuesday', 1, 'Spread Regimes, Slippage, and Latency: The Real Cost of Execution') },
          { number: 2, title: 'Order Types in Practice: Market, Limit, Stop-Limit, and Partial Fills', type: 'lesson',
            summary: 'Modern execution requires precise order selection by context. Compare market speed versus limit precision, stop-limit protection, partial fill behavior, and when each order type should be default in your workflow.',
            slug: lessonSlug(18, 'Tuesday', 2, 'Order Types in Practice: Market, Limit, Stop-Limit, and Partial Fills') },
          { number: 3, title: 'Prop Firm and Broker Rule Engineering for Strategy Compatibility', type: 'lesson',
            summary: 'Map your strategy against practical constraints: news restrictions, max lot limits, consistency rules, minimum trade time, and prohibited tactics. Build a compatibility matrix before committing capital or challenge fees.',
            slug: lessonSlug(18, 'Tuesday', 3, 'Prop Firm and Broker Rule Engineering for Strategy Compatibility') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Automation and AI-Assisted Trading Workflow',
        lessons: [
          { number: 1, title: 'No-Code and API Automation for Alerts, Routing, and Journaling', type: 'lesson',
            summary: 'Use modern tooling to automate repetitive work: economic alert routing, watchlist updates, screenshot capture, trade log ingestion, and post-session report generation without handing over final trade authority.',
            slug: lessonSlug(18, 'Wednesday', 1, 'No-Code and API Automation for Alerts, Routing, and Journaling') },
          { number: 2, title: 'Using AI Assistants Safely for Research and Scenario Generation', type: 'lesson',
            summary: 'AI can accelerate macro synthesis and scenario mapping, but outputs must be verified. Apply a safe workflow: source grounding, contradiction checks, and explicit separation between generated ideas and execution decisions.',
            slug: lessonSlug(18, 'Wednesday', 2, 'Using AI Assistants Safely for Research and Scenario Generation') },
          { number: 3, title: 'Human-in-the-Loop Governance: What Must Never Be Delegated', type: 'lesson',
            summary: 'Risk ownership remains human. Define non-delegable controls: max daily loss, override authority, kill-switch conditions, and mandatory manual approval for live order execution during macro-event windows.',
            slug: lessonSlug(18, 'Wednesday', 3, 'Human-in-the-Loop Governance: What Must Never Be Delegated') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Data Pipeline and Performance Analytics',
        lessons: [
          { number: 1, title: 'Structured Trade Journaling Schema: Tags, Context, and Regime Labels', type: 'lesson',
            summary: 'Modern journaling is database-ready, not diary-style. Capture structured fields for setup type, session, volatility regime, catalyst class, execution quality, and rule compliance to unlock reliable analytics.',
            slug: lessonSlug(18, 'Thursday', 1, 'Structured Trade Journaling Schema: Tags, Context, and Regime Labels') },
          { number: 2, title: 'Build a Performance Dashboard: Expectancy, MAE/MFE, and Edge Decay', type: 'lesson',
            summary: 'Track the metrics that matter: expectancy by setup, maximum adverse/favorable excursion, win-rate drift, and rolling edge decay. Use these to detect when a strategy needs adaptation before losses compound.',
            slug: lessonSlug(18, 'Thursday', 2, 'Build a Performance Dashboard: Expectancy, MAE/MFE, and Edge Decay') },
          { number: 3, title: 'Experiment Framework: A-B Testing Rules Without Overfitting', type: 'lesson',
            summary: 'Improve systems with controlled experiments: isolate one variable, hold sample quality constant, require minimum observations, and define acceptance criteria in advance to avoid narrative-driven overfitting.',
            slug: lessonSlug(18, 'Thursday', 3, 'Experiment Framework: A-B Testing Rules Without Overfitting') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Professional Operations, Compliance, and Scale',
        lessons: [
          { number: 1, title: 'Compliance-Aware Communication, Records, and Risk Disclosure', type: 'lesson',
            summary: 'If you manage external capital or publish signals, operational compliance matters. Learn baseline standards for record retention, disclosure language, marketing claims, and performance presentation integrity.',
            slug: lessonSlug(18, 'Friday', 1, 'Compliance-Aware Communication, Records, and Risk Disclosure') },
          { number: 2, title: 'Weekly Risk Committee Routine for Solo Traders and Small Teams', type: 'lesson',
            summary: 'Adopt an institutional ritual: weekly review of exposure concentration, execution slippage, rule violations, and strategy drift. Formal governance meetings improve discipline and reduce blind-spot risk.',
            slug: lessonSlug(18, 'Friday', 2, 'Weekly Risk Committee Routine for Solo Traders and Small Teams') },
          { number: 3, title: 'Career Scale Paths: Prop Capital, Managed Accounts, or Independent Book', type: 'lesson',
            summary: 'Choose a scale path based on edge profile and operating strengths. Compare prop firm scaling, managed account mandates, and independent trading books using constraints, upside, and operational burden trade-offs.',
            slug: lessonSlug(18, 'Friday', 3, 'Career Scale Paths: Prop Capital, Managed Accounts, or Independent Book') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Final Assignment: Build Your Modern Trading Operating System',
        lessons: [
          { number: 1, title: 'Assignment Overview: Your Personal 2026 Forex Operating Model', type: 'assignment',
            summary: 'The capstone is a modern operating system, not only a strategy. Integrate process design, execution controls, analytics, and governance into one professional framework you can run consistently.',
            slug: lessonSlug(18, 'Saturday', 1, 'Assignment Overview: Your Personal 2026 Forex Operating Model') },
          { number: 2, title: 'Deliverable: Strategy Playbook, Automation Map, and Risk Governance Pack', type: 'assignment',
            summary: 'Produce three artifacts: a setup playbook, an automation architecture map (alerts, journaling, reporting), and a risk governance document with hard limits, escalation rules, and event-day constraints.',
            slug: lessonSlug(18, 'Saturday', 2, 'Deliverable: Strategy Playbook, Automation Map, and Risk Governance Pack') },
          { number: 3, title: 'Final Review: 90-Day Implementation Sprint with Measurable Milestones', type: 'assignment',
            summary: 'Create a 90-day rollout with weekly milestones and KPIs: checklist compliance rate, execution slippage reduction, review cadence adherence, and performance stability across a statistically meaningful sample.',
            slug: lessonSlug(18, 'Saturday', 3, 'Final Review: 90-Day Implementation Sprint with Measurable Milestones') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 19 · Quantum Forex Trading Foundations · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 19,
    module: 'Quantum Forex Trading Foundations',
    level: 'Professional',
    description: 'Introduce quantum and quantum-inspired methods for forex research, portfolio construction, and scenario analysis, with strict emphasis on practical use and risk-aware deployment.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Quantum Concepts for Traders',
        lessons: [
          { number: 1, title: 'Qubits, Superposition, and Why Traders Should Care', type: 'lesson',
            summary: 'Translate core quantum computing concepts into trading language so you can evaluate real use cases versus hype in forex model development.',
            slug: lessonSlug(19, 'Monday', 1, 'Qubits, Superposition, and Why Traders Should Care') },
          { number: 2, title: 'Classical vs Quantum Computation in Financial Workloads', type: 'lesson',
            summary: 'Compare where classical systems remain superior and where quantum or quantum-inspired approaches may help with optimization and search tasks.',
            slug: lessonSlug(19, 'Monday', 2, 'Classical vs Quantum Computation in Financial Workloads') },
          { number: 3, title: 'Quantum Hype Filter: Evidence-Based Evaluation Framework', type: 'lesson',
            summary: 'Build a checklist to assess claims about quantum trading tools using reproducibility, benchmark quality, and production feasibility.',
            slug: lessonSlug(19, 'Monday', 3, 'Quantum Hype Filter: Evidence-Based Evaluation Framework') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Quantum-Inspired Optimization for FX',
        lessons: [
          { number: 1, title: 'Portfolio Optimization with QUBO Formulations', type: 'lesson',
            summary: 'Map forex allocation and constraint problems into quadratic unconstrained binary optimization for experimentation with quantum-inspired solvers.',
            slug: lessonSlug(19, 'Tuesday', 1, 'Portfolio Optimization with QUBO Formulations') },
          { number: 2, title: 'Position Sizing Under Multi-Constraint Regimes', type: 'lesson',
            summary: 'Use optimization frameworks to balance drawdown caps, pair correlation limits, and prop-firm restrictions simultaneously.',
            slug: lessonSlug(19, 'Tuesday', 2, 'Position Sizing Under Multi-Constraint Regimes') },
          { number: 3, title: 'Regime-Aware Rebalancing with Quantum-Inspired Heuristics', type: 'lesson',
            summary: 'Apply annealing-style search to rebalance forex portfolios across volatility regimes without overfitting to one market condition.',
            slug: lessonSlug(19, 'Tuesday', 3, 'Regime-Aware Rebalancing with Quantum-Inspired Heuristics') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Probabilistic Forecasting and Scenario Trees',
        lessons: [
          { number: 1, title: 'Amplitude-Inspired Probability Thinking for Trade Scenarios', type: 'lesson',
            summary: 'Adopt probabilistic scenario weighting to avoid single-outcome bias and improve entry and exit planning in uncertain sessions.',
            slug: lessonSlug(19, 'Wednesday', 1, 'Amplitude-Inspired Probability Thinking for Trade Scenarios') },
          { number: 2, title: 'Branching Scenario Trees for Event-Driven Forex Weeks', type: 'lesson',
            summary: 'Design event scenario trees for CPI, NFP, and central bank announcements with explicit probability and risk responses.',
            slug: lessonSlug(19, 'Wednesday', 2, 'Branching Scenario Trees for Event-Driven Forex Weeks') },
          { number: 3, title: 'From Scenario Probabilities to Position Plans', type: 'lesson',
            summary: 'Convert scenario trees into practical execution plans with size tiers, invalidation levels, and contingency actions.',
            slug: lessonSlug(19, 'Wednesday', 3, 'From Scenario Probabilities to Position Plans') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Quantum-Ready Data Engineering',
        lessons: [
          { number: 1, title: 'Feature Encoding for Hybrid Classical-Quantum Pipelines', type: 'lesson',
            summary: 'Structure FX features so they can be consumed by both classical ML models and quantum-inspired optimization workflows.',
            slug: lessonSlug(19, 'Thursday', 1, 'Feature Encoding for Hybrid Classical-Quantum Pipelines') },
          { number: 2, title: 'Noise, Drift, and Robustness Testing in Experimental Models', type: 'lesson',
            summary: 'Stress-test model outputs under data noise, latency, and spread expansion to ensure resilience before live deployment.',
            slug: lessonSlug(19, 'Thursday', 2, 'Noise, Drift, and Robustness Testing in Experimental Models') },
          { number: 3, title: 'Benchmarking Quantum-Inspired Models Against Baselines', type: 'lesson',
            summary: 'Run disciplined benchmark comparisons against simple classical baselines to validate whether complexity adds real edge.',
            slug: lessonSlug(19, 'Thursday', 3, 'Benchmarking Quantum-Inspired Models Against Baselines') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Risk Governance for Experimental Trading Models',
        lessons: [
          { number: 1, title: 'Model Risk Controls and Kill-Switch Architecture', type: 'lesson',
            summary: 'Define hard risk controls for experimental systems including kill-switch thresholds, auto-deleveraging, and fallback execution paths.',
            slug: lessonSlug(19, 'Friday', 1, 'Model Risk Controls and Kill-Switch Architecture') },
          { number: 2, title: 'Versioning, Audit Logs, and Reproducibility Standards', type: 'lesson',
            summary: 'Implement research governance with versioned datasets, parameter tracking, and reproducible experiment logs for accountability.',
            slug: lessonSlug(19, 'Friday', 2, 'Versioning, Audit Logs, and Reproducibility Standards') },
          { number: 3, title: 'Capital Allocation Policy for Emerging Strategies', type: 'lesson',
            summary: 'Use staged capital ramps to graduate experimental strategies from paper trade to micro live and then production size.',
            slug: lessonSlug(19, 'Friday', 3, 'Capital Allocation Policy for Emerging Strategies') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Quantum Forex Research Blueprint',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build Your Quantum Forex Playbook', type: 'assignment',
            summary: 'Create a practical playbook defining one quantum-inspired use case, required data, benchmarks, and deployment boundaries.',
            slug: lessonSlug(19, 'Saturday', 1, 'Assignment Overview: Build Your Quantum Forex Playbook') },
          { number: 2, title: 'Design and Backtest One Quantum-Inspired Allocation Model', type: 'assignment',
            summary: 'Build a constrained allocation experiment, benchmark it against a classical baseline, and document all assumptions and controls.',
            slug: lessonSlug(19, 'Saturday', 2, 'Design and Backtest One Quantum-Inspired Allocation Model') },
          { number: 3, title: 'Peer Review: Robustness, Risk, and Production Readiness', type: 'assignment',
            summary: 'Evaluate your model on reproducibility, drawdown behavior, and operational risk before approving any live trial phase.',
            slug: lessonSlug(19, 'Saturday', 3, 'Peer Review: Robustness, Risk, and Production Readiness') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 20 · Quantitative Signal Engineering for Forex · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 20,
    module: 'Quantitative Signal Engineering for Forex',
    level: 'Professional',
    description: 'Build modern alpha pipelines by engineering robust FX features, testing regime-aware signals, and deploying statistically defensible strategy components.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Feature Engineering and Data Quality',
        lessons: [
          { number: 1, title: 'Building Multi-Horizon Feature Sets for FX', type: 'lesson',
            summary: 'Engineer features across intraday, daily, and weekly horizons to capture both momentum and mean-reversion behavior.',
            slug: lessonSlug(20, 'Monday', 1, 'Building Multi-Horizon Feature Sets for FX') },
          { number: 2, title: 'Labeling Methods: Threshold, Triple-Barrier, and Event Labels', type: 'lesson',
            summary: 'Compare labeling methods to reduce leakage and align model targets with real trading decision windows.',
            slug: lessonSlug(20, 'Monday', 2, 'Labeling Methods: Threshold, Triple-Barrier, and Event Labels') },
          { number: 3, title: 'Data Integrity: Missing Ticks, Outliers, and Session Gaps', type: 'lesson',
            summary: 'Establish data cleaning and validation standards that preserve signal quality while avoiding accidental bias.',
            slug: lessonSlug(20, 'Monday', 3, 'Data Integrity: Missing Ticks, Outliers, and Session Gaps') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Regime Detection and Adaptive Models',
        lessons: [
          { number: 1, title: 'Volatility Regime Classification for Strategy Routing', type: 'lesson',
            summary: 'Detect volatility regimes and route trades to the strategy variant most suited to current market conditions.',
            slug: lessonSlug(20, 'Tuesday', 1, 'Volatility Regime Classification for Strategy Routing') },
          { number: 2, title: 'Trend-Ranging State Models and Transition Risk', type: 'lesson',
            summary: 'Model trend and range states while handling transition periods where most false signals are generated.',
            slug: lessonSlug(20, 'Tuesday', 2, 'Trend-Ranging State Models and Transition Risk') },
          { number: 3, title: 'Adaptive Parameter Policies Without Curve Fitting', type: 'lesson',
            summary: 'Create adaptation rules with bounded parameter movement to remain flexible without destabilizing your edge.',
            slug: lessonSlug(20, 'Tuesday', 3, 'Adaptive Parameter Policies Without Curve Fitting') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Signal Validation and Statistical Confidence',
        lessons: [
          { number: 1, title: 't-Stats, Bootstrap, and Confidence Intervals for Traders', type: 'lesson',
            summary: 'Use robust statistical tools to determine whether a signal has real predictive value beyond random variation.',
            slug: lessonSlug(20, 'Wednesday', 1, 't-Stats, Bootstrap, and Confidence Intervals for Traders') },
          { number: 2, title: 'Multiple Testing Problem and False Discovery Control', type: 'lesson',
            summary: 'Avoid false positives when testing many ideas by applying correction methods and strict validation discipline.',
            slug: lessonSlug(20, 'Wednesday', 2, 'Multiple Testing Problem and False Discovery Control') },
          { number: 3, title: 'Out-of-Sample Monitoring and Live Drift Detection', type: 'lesson',
            summary: 'Track live signal decay with drift monitors that trigger review before prolonged underperformance occurs.',
            slug: lessonSlug(20, 'Wednesday', 3, 'Out-of-Sample Monitoring and Live Drift Detection') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Execution-Aware Quant Design',
        lessons: [
          { number: 1, title: 'Modeling Slippage and Spread Into Backtests', type: 'lesson',
            summary: 'Integrate realistic execution costs into backtests so paper alpha translates into live performance.',
            slug: lessonSlug(20, 'Thursday', 1, 'Modeling Slippage and Spread Into Backtests') },
          { number: 2, title: 'Queue Priority and Fill Probability for Limit Orders', type: 'lesson',
            summary: 'Estimate fill probability and adverse selection risk before relying on limit-order-heavy strategies.',
            slug: lessonSlug(20, 'Thursday', 2, 'Queue Priority and Fill Probability for Limit Orders') },
          { number: 3, title: 'Execution Policy Selection by Market State', type: 'lesson',
            summary: 'Switch between passive and aggressive execution policies according to liquidity and volatility conditions.',
            slug: lessonSlug(20, 'Thursday', 3, 'Execution Policy Selection by Market State') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'From Research Notebook to Production',
        lessons: [
          { number: 1, title: 'MLOps for Trading: Versioning, CI Checks, and Deploy Gates', type: 'lesson',
            summary: 'Set up release gates that prevent unvalidated model updates from reaching live trading environments.',
            slug: lessonSlug(20, 'Friday', 1, 'MLOps for Trading: Versioning, CI Checks, and Deploy Gates') },
          { number: 2, title: 'Canary Deployment and Capital Throttling for New Signals', type: 'lesson',
            summary: 'Launch new models with tiny capital and escalate only when live metrics confirm expected behavior.',
            slug: lessonSlug(20, 'Friday', 2, 'Canary Deployment and Capital Throttling for New Signals') },
          { number: 3, title: 'Incident Response for Model and Execution Failures', type: 'lesson',
            summary: 'Define response runbooks for model drift, data outages, and execution anomalies to protect capital quickly.',
            slug: lessonSlug(20, 'Friday', 3, 'Incident Response for Model and Execution Failures') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: End-to-End Quant Strategy Pack',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build a Full Quant Signal Pipeline', type: 'assignment',
            summary: 'Create a complete pipeline from feature engineering to validation report and production readiness checklist.',
            slug: lessonSlug(20, 'Saturday', 1, 'Assignment Overview: Build a Full Quant Signal Pipeline') },
          { number: 2, title: 'Deliverable: Research Report, Backtest, and Drift Monitor Plan', type: 'assignment',
            summary: 'Submit a documented strategy pack including statistical confidence evidence and live monitoring design.',
            slug: lessonSlug(20, 'Saturday', 2, 'Deliverable: Research Report, Backtest, and Drift Monitor Plan') },
          { number: 3, title: 'Post-Mortem Exercise: Failure Modes and Safeguard Design', type: 'assignment',
            summary: 'Map top failure modes for your strategy and define explicit safeguards for each risk path.',
            slug: lessonSlug(20, 'Saturday', 3, 'Post-Mortem Exercise: Failure Modes and Safeguard Design') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 21 · Algorithmic Execution and Liquidity Engineering · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 21,
    module: 'Algorithmic Execution and Liquidity Engineering',
    level: 'Professional',
    description: 'Develop modern execution capabilities including session-aware routing, event-risk handling, and liquidity-sensitive order management for professional forex operations.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Execution Benchmarks and TCA',
        lessons: [
          { number: 1, title: 'Transaction Cost Analysis for FX Strategies', type: 'lesson',
            summary: 'Measure realized execution quality against expected benchmarks to find hidden cost drag on performance.',
            slug: lessonSlug(21, 'Monday', 1, 'Transaction Cost Analysis for FX Strategies') },
          { number: 2, title: 'Arrival Price, VWAP, and Session Benchmarks', type: 'lesson',
            summary: 'Use benchmark models to evaluate whether your entries and exits are adding or losing execution edge.',
            slug: lessonSlug(21, 'Monday', 2, 'Arrival Price, VWAP, and Session Benchmarks') },
          { number: 3, title: 'Building an Execution Scorecard for Continuous Improvement', type: 'lesson',
            summary: 'Track fill quality, slippage tails, rejection rates, and latency to improve execution policy over time.',
            slug: lessonSlug(21, 'Monday', 3, 'Building an Execution Scorecard for Continuous Improvement') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Liquidity Mapping and Session Strategy',
        lessons: [
          { number: 1, title: 'Liquidity Heatmaps Across Asia, London, and New York', type: 'lesson',
            summary: 'Map intraday liquidity profiles so strategy timing aligns with tradable depth and cleaner execution windows.',
            slug: lessonSlug(21, 'Tuesday', 1, 'Liquidity Heatmaps Across Asia, London, and New York') },
          { number: 2, title: 'Spread and Depth Behavior Around Session Opens', type: 'lesson',
            summary: 'Understand the first-minutes behavior at session open to avoid avoidable slippage and false breakout fills.',
            slug: lessonSlug(21, 'Tuesday', 2, 'Spread and Depth Behavior Around Session Opens') },
          { number: 3, title: 'Event-Day Liquidity Protocols for High-Impact Releases', type: 'lesson',
            summary: 'Design event-day execution constraints for CPI, NFP, and rate decisions to control tail risk and execution chaos.',
            slug: lessonSlug(21, 'Tuesday', 3, 'Event-Day Liquidity Protocols for High-Impact Releases') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Order Logic and Smart Routing',
        lessons: [
          { number: 1, title: 'Smart Order Routing Concepts for Retail and Pro Platforms', type: 'lesson',
            summary: 'Apply routing logic to choose venue and execution path that best fits spread, latency, and fill probability conditions.',
            slug: lessonSlug(21, 'Wednesday', 1, 'Smart Order Routing Concepts for Retail and Pro Platforms') },
          { number: 2, title: 'Adaptive Limit-OffSet and Child-Order Design', type: 'lesson',
            summary: 'Split larger orders into child orders with adaptive offsets to reduce impact and improve blended execution price.',
            slug: lessonSlug(21, 'Wednesday', 2, 'Adaptive Limit-OffSet and Child-Order Design') },
          { number: 3, title: 'Protection Layers: Timeouts, Requotes, and Slippage Caps', type: 'lesson',
            summary: 'Use safety layers that cancel or reroute orders when execution quality falls outside acceptable boundaries.',
            slug: lessonSlug(21, 'Wednesday', 3, 'Protection Layers: Timeouts, Requotes, and Slippage Caps') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Automation Reliability and Monitoring',
        lessons: [
          { number: 1, title: 'Heartbeat Monitoring for Trading Services', type: 'lesson',
            summary: 'Implement service health checks and automated alerts to detect routing failures before they impact live trades.',
            slug: lessonSlug(21, 'Thursday', 1, 'Heartbeat Monitoring for Trading Services') },
          { number: 2, title: 'Fallback Execution Paths During Infrastructure Failure', type: 'lesson',
            summary: 'Define failover logic to preserve risk control when a broker API, data feed, or execution module goes down.',
            slug: lessonSlug(21, 'Thursday', 2, 'Fallback Execution Paths During Infrastructure Failure') },
          { number: 3, title: 'Live Dashboards for Execution Anomaly Detection', type: 'lesson',
            summary: 'Monitor execution anomalies in real time with thresholds for spread spikes, fill delays, and reject clusters.',
            slug: lessonSlug(21, 'Thursday', 3, 'Live Dashboards for Execution Anomaly Detection') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Operational Excellence in Live Trading',
        lessons: [
          { number: 1, title: 'Runbooks for Pre-Session, Live Session, and Shutdown', type: 'lesson',
            summary: 'Create standard operating runbooks that make execution consistent regardless of stress or market volatility.',
            slug: lessonSlug(21, 'Friday', 1, 'Runbooks for Pre-Session, Live Session, and Shutdown') },
          { number: 2, title: 'Team Handovers and Shift Protocols for 24-Hour Markets', type: 'lesson',
            summary: 'Use handover checklists and accountability logs to maintain continuity across trading shifts and sessions.',
            slug: lessonSlug(21, 'Friday', 2, 'Team Handovers and Shift Protocols for 24-Hour Markets') },
          { number: 3, title: 'KPI-Driven Execution Improvement Cycle', type: 'lesson',
            summary: 'Run weekly KPI reviews to prioritize specific execution upgrades with measurable business impact.',
            slug: lessonSlug(21, 'Friday', 3, 'KPI-Driven Execution Improvement Cycle') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Build an Execution Command Center',
        lessons: [
          { number: 1, title: 'Assignment Overview: Design an Execution Operations Blueprint', type: 'assignment',
            summary: 'Draft a full execution operations blueprint including routing policy, safeguards, and monitoring requirements.',
            slug: lessonSlug(21, 'Saturday', 1, 'Assignment Overview: Design an Execution Operations Blueprint') },
          { number: 2, title: 'Deliverable: TCA Dashboard Spec and Incident Runbook', type: 'assignment',
            summary: 'Submit a transaction cost dashboard specification and an incident response runbook for execution failures.',
            slug: lessonSlug(21, 'Saturday', 2, 'Deliverable: TCA Dashboard Spec and Incident Runbook') },
          { number: 3, title: 'Simulation: Event-Day Execution Drill and Debrief', type: 'assignment',
            summary: 'Run a simulated high-impact event day and document execution decisions, outcomes, and improvement actions.',
            slug: lessonSlug(21, 'Saturday', 3, 'Simulation: Event-Day Execution Drill and Debrief') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 22 · Multi-Strategy Portfolio and Alpha Combination · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 22,
    module: 'Multi-Strategy Portfolio and Alpha Combination',
    level: 'Professional',
    description: 'Scale into professional portfolio management by combining discretionary, quant, and event-driven strategies under a unified capital allocation and risk framework.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Strategy Taxonomy and Alpha Buckets',
        lessons: [
          { number: 1, title: 'Classifying Strategies by Edge Source and Holding Horizon', type: 'lesson',
            summary: 'Organize your strategy stack into distinct alpha buckets to avoid overlap and improve diversification.',
            slug: lessonSlug(22, 'Monday', 1, 'Classifying Strategies by Edge Source and Holding Horizon') },
          { number: 2, title: 'Correlation Mapping Between Alpha Streams', type: 'lesson',
            summary: 'Measure correlation between strategies rather than pairs to identify true diversification potential.',
            slug: lessonSlug(22, 'Monday', 2, 'Correlation Mapping Between Alpha Streams') },
          { number: 3, title: 'Capacity and Scalability Limits per Strategy Type', type: 'lesson',
            summary: 'Estimate how each strategy behaves as size increases to prevent capacity-related edge deterioration.',
            slug: lessonSlug(22, 'Monday', 3, 'Capacity and Scalability Limits per Strategy Type') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Capital Allocation and Dynamic Budgeting',
        lessons: [
          { number: 1, title: 'Risk Budgeting by Volatility and Drawdown Sensitivity', type: 'lesson',
            summary: 'Allocate capital by each strategy risk profile so one regime shift does not dominate portfolio results.',
            slug: lessonSlug(22, 'Tuesday', 1, 'Risk Budgeting by Volatility and Drawdown Sensitivity') },
          { number: 2, title: 'Dynamic Reallocation Rules Using Rolling Performance Windows', type: 'lesson',
            summary: 'Apply rules-based capital shifts across strategies using rolling metrics while avoiding overreaction to short-term noise.',
            slug: lessonSlug(22, 'Tuesday', 2, 'Dynamic Reallocation Rules Using Rolling Performance Windows') },
          { number: 3, title: 'Hard Floors and Ceilings for Strategy Capital', type: 'lesson',
            summary: 'Set practical min and max allocation limits so no strategy is starved or overconcentrated.',
            slug: lessonSlug(22, 'Tuesday', 3, 'Hard Floors and Ceilings for Strategy Capital') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Portfolio Risk Overlay',
        lessons: [
          { number: 1, title: 'Portfolio VaR and Expected Shortfall for FX Books', type: 'lesson',
            summary: 'Use portfolio-level risk measures to understand total downside exposure across combined strategy positions.',
            slug: lessonSlug(22, 'Wednesday', 1, 'Portfolio VaR and Expected Shortfall for FX Books') },
          { number: 2, title: 'Macro Shock Stress Testing and Scenario Replay', type: 'lesson',
            summary: 'Run macro shock scenarios to evaluate how the full book behaves under correlated market stress events.',
            slug: lessonSlug(22, 'Wednesday', 2, 'Macro Shock Stress Testing and Scenario Replay') },
          { number: 3, title: 'Cross-Strategy Circuit Breakers and Exposure Nets', type: 'lesson',
            summary: 'Implement risk overlays that neutralize aggregate exposure when strategy interactions create unintended concentration.',
            slug: lessonSlug(22, 'Wednesday', 3, 'Cross-Strategy Circuit Breakers and Exposure Nets') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Performance Attribution and Review Architecture',
        lessons: [
          { number: 1, title: 'Attribution by Strategy, Session, and Catalyst Type', type: 'lesson',
            summary: 'Break PnL down by strategy, session, and catalyst to reveal where your real edge is being generated.',
            slug: lessonSlug(22, 'Thursday', 1, 'Attribution by Strategy, Session, and Catalyst Type') },
          { number: 2, title: 'Decision Quality Scoring and Rule Adherence Metrics', type: 'lesson',
            summary: 'Track process quality metrics to separate execution discipline from temporary profit variance.',
            slug: lessonSlug(22, 'Thursday', 2, 'Decision Quality Scoring and Rule Adherence Metrics') },
          { number: 3, title: 'Quarterly Strategy Retirement and Promotion Process', type: 'lesson',
            summary: 'Use objective promotion and retirement gates so portfolio composition evolves with evidence, not bias.',
            slug: lessonSlug(22, 'Thursday', 3, 'Quarterly Strategy Retirement and Promotion Process') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Institutional-Grade Portfolio Operations',
        lessons: [
          { number: 1, title: 'Governance Cadence: Daily Standup, Weekly Risk, Monthly IC', type: 'lesson',
            summary: 'Adopt a governance cadence similar to institutional desks for alignment, accountability, and controlled growth.',
            slug: lessonSlug(22, 'Friday', 1, 'Governance Cadence: Daily Standup, Weekly Risk, Monthly IC') },
          { number: 2, title: 'Investor Reporting Stack for Managed FX Portfolios', type: 'lesson',
            summary: 'Build transparent reporting for returns, risk, drawdown, and process quality suited to external capital standards.',
            slug: lessonSlug(22, 'Friday', 2, 'Investor Reporting Stack for Managed FX Portfolios') },
          { number: 3, title: 'Scaling Plan: Solo Trader to Desk-Level Operation', type: 'lesson',
            summary: 'Design a practical roadmap for scaling operations, tooling, and team structure without diluting execution quality.',
            slug: lessonSlug(22, 'Friday', 3, 'Scaling Plan: Solo Trader to Desk-Level Operation') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Final Assignment: Multi-Strategy Portfolio Blueprint',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build Your Multi-Strategy FX Portfolio Plan', type: 'assignment',
            summary: 'Assemble a full portfolio blueprint with alpha buckets, allocation policy, and risk overlays.',
            slug: lessonSlug(22, 'Saturday', 1, 'Assignment Overview: Build Your Multi-Strategy FX Portfolio Plan') },
          { number: 2, title: 'Deliverable: Allocation Model, Stress Tests, and Governance Calendar', type: 'assignment',
            summary: 'Submit a complete package covering capital allocation, stress test outcomes, and operational governance cadence.',
            slug: lessonSlug(22, 'Saturday', 2, 'Deliverable: Allocation Model, Stress Tests, and Governance Calendar') },
          { number: 3, title: 'Capstone Review: 12-Month Portfolio Implementation Roadmap', type: 'assignment',
            summary: 'Present a 12-month roadmap with milestones, KPIs, and risk controls for live deployment at increasing capital tiers.',
            slug: lessonSlug(22, 'Saturday', 3, 'Capstone Review: 12-Month Portfolio Implementation Roadmap') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 23 · AI Agentic Trading and Autonomous Risk Controls · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 23,
    module: 'AI Agentic Trading and Autonomous Risk Controls',
    level: 'Professional',
    description: 'Build a modern agentic trading stack where AI assistants support decision quality, while strict human-governed risk controls protect capital in live forex environments.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Agentic System Architecture',
        lessons: [
          { number: 1, title: 'Designing Agent Roles: Research, Execution Support, and Risk Monitor', type: 'lesson',
            summary: 'Split AI responsibilities into specialist agents so each has clear boundaries and measurable output quality.',
            slug: lessonSlug(23, 'Monday', 1, 'Designing Agent Roles: Research, Execution Support, and Risk Monitor') },
          { number: 2, title: 'Prompt Contracts, Tool Permissions, and Safety Boundaries', type: 'lesson',
            summary: 'Use explicit prompt contracts and restricted tool access to prevent unsafe behavior and drift in assistant actions.',
            slug: lessonSlug(23, 'Monday', 2, 'Prompt Contracts, Tool Permissions, and Safety Boundaries') },
          { number: 3, title: 'Human Approval Gates for Live Trade Actions', type: 'lesson',
            summary: 'Implement mandatory approval checkpoints so AI outputs can inform decisions but never bypass final human risk ownership.',
            slug: lessonSlug(23, 'Monday', 3, 'Human Approval Gates for Live Trade Actions') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'AI-Assisted Market Intelligence',
        lessons: [
          { number: 1, title: 'Automated Macro Briefing Generation for Daily Prep', type: 'lesson',
            summary: 'Create structured daily macro briefings from economic calendar, central bank commentary, and market context inputs.',
            slug: lessonSlug(23, 'Tuesday', 1, 'Automated Macro Briefing Generation for Daily Prep') },
          { number: 2, title: 'Narrative Conflict Detection Across Data Sources', type: 'lesson',
            summary: 'Use AI to identify contradictory narratives and force explicit scenario mapping before committing trade capital.',
            slug: lessonSlug(23, 'Tuesday', 2, 'Narrative Conflict Detection Across Data Sources') },
          { number: 3, title: 'Signal Triage: Ranking Opportunities by Confluence', type: 'lesson',
            summary: 'Build ranking logic that scores potential setups by technical, macro, liquidity, and event-risk confluence.',
            slug: lessonSlug(23, 'Tuesday', 3, 'Signal Triage: Ranking Opportunities by Confluence') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Autonomous Risk Oversight',
        lessons: [
          { number: 1, title: 'Real-Time Exposure Watchers and Alert Escalation', type: 'lesson',
            summary: 'Deploy automated monitors that track exposure concentration and trigger alerts before limits are breached.',
            slug: lessonSlug(23, 'Wednesday', 1, 'Real-Time Exposure Watchers and Alert Escalation') },
          { number: 2, title: 'Behavioral Risk Detection: Revenge Trading and Rule Drift', type: 'lesson',
            summary: 'Use process analytics to flag behavioral breakdowns and rule violations that commonly precede drawdown expansion.',
            slug: lessonSlug(23, 'Wednesday', 2, 'Behavioral Risk Detection: Revenge Trading and Rule Drift') },
          { number: 3, title: 'Auto-Pause and Kill-Switch Policies for Live Sessions', type: 'lesson',
            summary: 'Define hard auto-pause conditions for slippage spikes, strategy drift, or drawdown thresholds in live execution.',
            slug: lessonSlug(23, 'Wednesday', 3, 'Auto-Pause and Kill-Switch Policies for Live Sessions') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Model Reliability and Governance',
        lessons: [
          { number: 1, title: 'Drift Detection for Prompts, Models, and Market Regimes', type: 'lesson',
            summary: 'Track model behavior drift across changing market regimes and trigger controlled prompt and policy updates.',
            slug: lessonSlug(23, 'Thursday', 1, 'Drift Detection for Prompts, Models, and Market Regimes') },
          { number: 2, title: 'Auditability: Logging Decisions, Inputs, and Overrides', type: 'lesson',
            summary: 'Maintain full decision lineage so every trade action can be traced, reviewed, and improved systematically.',
            slug: lessonSlug(23, 'Thursday', 2, 'Auditability: Logging Decisions, Inputs, and Overrides') },
          { number: 3, title: 'Governance Calendar for Agentic Trading Teams', type: 'lesson',
            summary: 'Establish weekly and monthly governance rituals for review, control updates, and incident post-mortems.',
            slug: lessonSlug(23, 'Thursday', 3, 'Governance Calendar for Agentic Trading Teams') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Production Deployment and Operations',
        lessons: [
          { number: 1, title: 'Sandbox to Live: Staged Release Path for Trading Agents', type: 'lesson',
            summary: 'Deploy agents in stages from simulation to micro capital before any meaningful live exposure is approved.',
            slug: lessonSlug(23, 'Friday', 1, 'Sandbox to Live: Staged Release Path for Trading Agents') },
          { number: 2, title: 'Incident Runbooks for Agent Failures and Data Outages', type: 'lesson',
            summary: 'Build runbooks for common failure modes so teams respond consistently under live market pressure.',
            slug: lessonSlug(23, 'Friday', 2, 'Incident Runbooks for Agent Failures and Data Outages') },
          { number: 3, title: 'KPIs for Agent Performance, Safety, and Trader Productivity', type: 'lesson',
            summary: 'Track operational KPIs that measure edge contribution without sacrificing risk discipline and transparency.',
            slug: lessonSlug(23, 'Friday', 3, 'KPIs for Agent Performance, Safety, and Trader Productivity') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Build an Agentic Forex Control Tower',
        lessons: [
          { number: 1, title: 'Assignment Overview: Agentic Operating Model Design', type: 'assignment',
            summary: 'Design a complete agentic operating model with clear boundaries, controls, and accountability paths.',
            slug: lessonSlug(23, 'Saturday', 1, 'Assignment Overview: Agentic Operating Model Design') },
          { number: 2, title: 'Deliverable: Agent Policy Pack, Risk Rules, and Monitoring Map', type: 'assignment',
            summary: 'Produce a policy pack that defines permissions, risk gates, and real-time monitoring specifications.',
            slug: lessonSlug(23, 'Saturday', 2, 'Deliverable: Agent Policy Pack, Risk Rules, and Monitoring Map') },
          { number: 3, title: 'Simulation Drill: Agent Failure Scenario and Recovery Review', type: 'assignment',
            summary: 'Run a simulated failure event and document containment actions, recovery timeline, and lessons learned.',
            slug: lessonSlug(23, 'Saturday', 3, 'Simulation Drill: Agent Failure Scenario and Recovery Review') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 24 · Institutional Macro Desk Simulation · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 24,
    module: 'Institutional Macro Desk Simulation',
    level: 'Professional',
    description: 'Train like an institutional macro desk with role-based workflows, event-risk protocols, and committee-level decision processes for forex portfolio management.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Desk Structure and Role Specialization',
        lessons: [
          { number: 1, title: 'Macro Analyst, Execution Trader, and Risk Officer Roles', type: 'lesson',
            summary: 'Define desk roles and interfaces so information flow and decision rights are clear before market open.',
            slug: lessonSlug(24, 'Monday', 1, 'Macro Analyst, Execution Trader, and Risk Officer Roles') },
          { number: 2, title: 'Morning Investment Meeting and Bias Formation Workflow', type: 'lesson',
            summary: 'Create a structured morning meeting format that converts macro inputs into tradeable directional bias.',
            slug: lessonSlug(24, 'Monday', 2, 'Morning Investment Meeting and Bias Formation Workflow') },
          { number: 3, title: 'Watchlist Construction by Catalyst and Liquidity Profile', type: 'lesson',
            summary: 'Prioritize pairs by expected catalysts, liquidity windows, and execution feasibility for the session.',
            slug: lessonSlug(24, 'Monday', 3, 'Watchlist Construction by Catalyst and Liquidity Profile') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Event-Risk Command Protocols',
        lessons: [
          { number: 1, title: 'Pre-Event Positioning Rules for CPI, NFP, and Central Banks', type: 'lesson',
            summary: 'Define event-risk guardrails for leverage, position size, and order policy before major data releases.',
            slug: lessonSlug(24, 'Tuesday', 1, 'Pre-Event Positioning Rules for CPI, NFP, and Central Banks') },
          { number: 2, title: 'Real-Time Communication During High-Volatility Windows', type: 'lesson',
            summary: 'Use concise communication protocols so teams stay aligned while volatility compresses decision time.',
            slug: lessonSlug(24, 'Tuesday', 2, 'Real-Time Communication During High-Volatility Windows') },
          { number: 3, title: 'Post-Event Repositioning and Bias Reconciliation', type: 'lesson',
            summary: 'Run a structured post-event review to update bias and avoid anchoring to invalidated pre-event views.',
            slug: lessonSlug(24, 'Tuesday', 3, 'Post-Event Repositioning and Bias Reconciliation') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Committee-Level Decision Frameworks',
        lessons: [
          { number: 1, title: 'Base Case, Bull Case, Bear Case Portfolio Mapping', type: 'lesson',
            summary: 'Map portfolio actions to multiple macro scenarios rather than betting entirely on one narrative.',
            slug: lessonSlug(24, 'Wednesday', 1, 'Base Case, Bull Case, Bear Case Portfolio Mapping') },
          { number: 2, title: 'Vote-Based Trade Approval and Dissent Documentation', type: 'lesson',
            summary: 'Introduce formal approval workflows and dissent logs to improve decision quality and accountability.',
            slug: lessonSlug(24, 'Wednesday', 2, 'Vote-Based Trade Approval and Dissent Documentation') },
          { number: 3, title: 'Decision Journaling for Process Improvement at Desk Level', type: 'lesson',
            summary: 'Capture decision rationale, alternatives considered, and execution outcomes for iterative desk learning.',
            slug: lessonSlug(24, 'Wednesday', 3, 'Decision Journaling for Process Improvement at Desk Level') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Cross-Asset Integration in Macro FX',
        lessons: [
          { number: 1, title: 'Using Bonds, Equities, and Commodities to Confirm FX Bias', type: 'lesson',
            summary: 'Integrate cross-asset signals to strengthen macro conviction and reduce false directional bets.',
            slug: lessonSlug(24, 'Thursday', 1, 'Using Bonds, Equities, and Commodities to Confirm FX Bias') },
          { number: 2, title: 'Yield Differential Dashboard and DXY Overlay Construction', type: 'lesson',
            summary: 'Build operational dashboards that tie rate differentials and dollar index behavior into trade process.',
            slug: lessonSlug(24, 'Thursday', 2, 'Yield Differential Dashboard and DXY Overlay Construction') },
          { number: 3, title: 'Global Risk Regime Detection and FX Pair Rotation', type: 'lesson',
            summary: 'Rotate pair focus according to risk-on or risk-off regime shifts to align with macro flow structure.',
            slug: lessonSlug(24, 'Thursday', 3, 'Global Risk Regime Detection and FX Pair Rotation') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Desk Performance and Governance',
        lessons: [
          { number: 1, title: 'Attribution by Analyst Thesis, Execution Quality, and Timing', type: 'lesson',
            summary: 'Break PnL into component drivers to identify whether alpha came from thesis quality or execution skill.',
            slug: lessonSlug(24, 'Friday', 1, 'Attribution by Analyst Thesis, Execution Quality, and Timing') },
          { number: 2, title: 'Risk Review Council and Weekly Drawdown Hearings', type: 'lesson',
            summary: 'Institute weekly risk hearings to evaluate losses, identify avoidable errors, and tighten controls.',
            slug: lessonSlug(24, 'Friday', 2, 'Risk Review Council and Weekly Drawdown Hearings') },
          { number: 3, title: 'Quarterly Desk Upgrade Plan and Capability Roadmap', type: 'lesson',
            summary: 'Define capability upgrades across tooling, process, and personnel for continuous desk evolution.',
            slug: lessonSlug(24, 'Friday', 3, 'Quarterly Desk Upgrade Plan and Capability Roadmap') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: One-Week Macro Desk Simulation',
        lessons: [
          { number: 1, title: 'Assignment Overview: Run a Full Macro Desk Cycle', type: 'assignment',
            summary: 'Execute a full simulation from morning meeting to post-close review with role-specific outputs.',
            slug: lessonSlug(24, 'Saturday', 1, 'Assignment Overview: Run a Full Macro Desk Cycle') },
          { number: 2, title: 'Deliverable: Meeting Minutes, Trade Tickets, and Risk Notes', type: 'assignment',
            summary: 'Submit complete desk artifacts showing governance quality, decision rationale, and trade discipline.',
            slug: lessonSlug(24, 'Saturday', 2, 'Deliverable: Meeting Minutes, Trade Tickets, and Risk Notes') },
          { number: 3, title: 'Debrief: Desk Lessons, Bias Errors, and Process Upgrades', type: 'assignment',
            summary: 'Conduct a formal debrief identifying the highest-value process improvements for the next simulation cycle.',
            slug: lessonSlug(24, 'Saturday', 3, 'Debrief: Desk Lessons, Bias Errors, and Process Upgrades') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 25 · Advanced Options-Based FX Hedging · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 25,
    module: 'Advanced Options-Based FX Hedging',
    level: 'Professional',
    description: 'Use options structures to hedge spot FX exposure, control tail risk, and design asymmetric payoff profiles around macro-event uncertainty.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'FX Options Foundations for Spot Traders',
        lessons: [
          { number: 1, title: 'Calls, Puts, and Option Premium in FX Context', type: 'lesson',
            summary: 'Understand FX option building blocks so spot traders can design practical protective structures.',
            slug: lessonSlug(25, 'Monday', 1, 'Calls, Puts, and Option Premium in FX Context') },
          { number: 2, title: 'Implied Volatility and Event Premium Dynamics', type: 'lesson',
            summary: 'Learn how implied volatility rises into events and changes option pricing before spot moves materialize.',
            slug: lessonSlug(25, 'Monday', 2, 'Implied Volatility and Event Premium Dynamics') },
          { number: 3, title: 'Greeks for Risk Managers: Delta, Gamma, Vega, Theta', type: 'lesson',
            summary: 'Use core Greeks to understand hedge sensitivity across price, time, and volatility conditions.',
            slug: lessonSlug(25, 'Monday', 3, 'Greeks for Risk Managers: Delta, Gamma, Vega, Theta') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Protective Hedging Structures',
        lessons: [
          { number: 1, title: 'Protective Put Design for Long Spot Exposure', type: 'lesson',
            summary: 'Design protective puts that cap downside while preserving upside participation in spot positions.',
            slug: lessonSlug(25, 'Tuesday', 1, 'Protective Put Design for Long Spot Exposure') },
          { number: 2, title: 'Collar Structures for Budget-Constrained Hedging', type: 'lesson',
            summary: 'Build collars to reduce premium cost while controlling downside and capping upside intentionally.',
            slug: lessonSlug(25, 'Tuesday', 2, 'Collar Structures for Budget-Constrained Hedging') },
          { number: 3, title: 'Zero-Cost Risk Reversal and Its Trade-Offs', type: 'lesson',
            summary: 'Evaluate risk reversal structures and understand when cost savings justify payoff limitations.',
            slug: lessonSlug(25, 'Tuesday', 3, 'Zero-Cost Risk Reversal and Its Trade-Offs') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Volatility Strategies Around Macro Events',
        lessons: [
          { number: 1, title: 'Straddles and Strangles for Event Volatility Trading', type: 'lesson',
            summary: 'Use volatility structures when directional conviction is low but movement expectation is high.',
            slug: lessonSlug(25, 'Wednesday', 1, 'Straddles and Strangles for Event Volatility Trading') },
          { number: 2, title: 'Post-Event Vol Crush and Position Management', type: 'lesson',
            summary: 'Manage options through post-event implied volatility collapse to avoid edge erosion after releases.',
            slug: lessonSlug(25, 'Wednesday', 2, 'Post-Event Vol Crush and Position Management') },
          { number: 3, title: 'Blending Spot and Options for Hybrid Event Playbooks', type: 'lesson',
            summary: 'Combine spot entries with options overlays to shape risk during high-uncertainty event windows.',
            slug: lessonSlug(25, 'Wednesday', 3, 'Blending Spot and Options for Hybrid Event Playbooks') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Portfolio Hedging and Tail-Risk Defense',
        lessons: [
          { number: 1, title: 'Hedging Correlated Spot Books with Options Baskets', type: 'lesson',
            summary: 'Design options baskets that protect correlated portfolios rather than isolated single-pair positions.',
            slug: lessonSlug(25, 'Thursday', 1, 'Hedging Correlated Spot Books with Options Baskets') },
          { number: 2, title: 'Tail Event Scenario Planning and Insurance Budgeting', type: 'lesson',
            summary: 'Allocate hedge budget for low-probability high-impact events without sacrificing core strategy returns.',
            slug: lessonSlug(25, 'Thursday', 2, 'Tail Event Scenario Planning and Insurance Budgeting') },
          { number: 3, title: 'Hedge Effectiveness Measurement and Recalibration', type: 'lesson',
            summary: 'Evaluate hedge outcomes quantitatively and recalibrate strike, tenor, and size policy over time.',
            slug: lessonSlug(25, 'Thursday', 3, 'Hedge Effectiveness Measurement and Recalibration') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Operationalizing FX Options Workflows',
        lessons: [
          { number: 1, title: 'Execution Checklist for FX Options Trades', type: 'lesson',
            summary: 'Standardize options execution workflow to reduce operational errors and improve consistency.',
            slug: lessonSlug(25, 'Friday', 1, 'Execution Checklist for FX Options Trades') },
          { number: 2, title: 'Reporting Greeks and Hedge Status to Stakeholders', type: 'lesson',
            summary: 'Build clear reports that communicate current hedge posture, residual risk, and expected behavior.',
            slug: lessonSlug(25, 'Friday', 2, 'Reporting Greeks and Hedge Status to Stakeholders') },
          { number: 3, title: 'Governance Rules for Optionality Use in Trading Books', type: 'lesson',
            summary: 'Set governance standards for allowable structures, sizing limits, and approval workflows.',
            slug: lessonSlug(25, 'Friday', 3, 'Governance Rules for Optionality Use in Trading Books') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: FX Hedge Book Design',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build a Practical Hedge Framework', type: 'assignment',
            summary: 'Create a full options-based hedge framework tied to your live or simulated spot strategy book.',
            slug: lessonSlug(25, 'Saturday', 1, 'Assignment Overview: Build a Practical Hedge Framework') },
          { number: 2, title: 'Deliverable: Hedge Matrix by Pair, Event Type, and Risk Tier', type: 'assignment',
            summary: 'Submit a hedge matrix with selected structures, trigger rules, and expected payoff profiles.',
            slug: lessonSlug(25, 'Saturday', 2, 'Deliverable: Hedge Matrix by Pair, Event Type, and Risk Tier') },
          { number: 3, title: 'Review: Hedge Cost-Benefit and Capital Efficiency Analysis', type: 'assignment',
            summary: 'Evaluate whether hedge costs delivered sufficient drawdown protection and portfolio resilience.',
            slug: lessonSlug(25, 'Saturday', 3, 'Review: Hedge Cost-Benefit and Capital Efficiency Analysis') },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEK 26 · High-Frequency Event Trading Lab · Professional
  // ═══════════════════════════════════════════════════════════════════════════
  {
    week: 26,
    module: 'High-Frequency Event Trading Lab',
    level: 'Professional',
    description: 'Develop a professional event-trading lab for ultra-short horizon forex opportunities, focused on execution precision, latency awareness, and strict risk containment.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Event Microstructure and Opportunity Windows',
        lessons: [
          { number: 1, title: 'First-Second Microstructure After Data Releases', type: 'lesson',
            summary: 'Study post-release microstructure to identify where opportunities exist and where slippage risk dominates.',
            slug: lessonSlug(26, 'Monday', 1, 'First-Second Microstructure After Data Releases') },
          { number: 2, title: 'Liquidity Vacuum Phases and Requote Risk', type: 'lesson',
            summary: 'Map liquidity vacuum periods where execution quality collapses and protective constraints are mandatory.',
            slug: lessonSlug(26, 'Monday', 2, 'Liquidity Vacuum Phases and Requote Risk') },
          { number: 3, title: 'Timing Bands: Immediate, Delayed, and Confirmation Entries', type: 'lesson',
            summary: 'Define event entry timing bands and choose strategy archetypes suited to each band profile.',
            slug: lessonSlug(26, 'Monday', 3, 'Timing Bands: Immediate, Delayed, and Confirmation Entries') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Latency, Infrastructure, and Execution Stack',
        lessons: [
          { number: 1, title: 'Latency Budget Mapping for Event Trading Systems', type: 'lesson',
            summary: 'Measure and optimize latency across data ingest, signal generation, routing, and broker response stages.',
            slug: lessonSlug(26, 'Tuesday', 1, 'Latency Budget Mapping for Event Trading Systems') },
          { number: 2, title: 'Data Feed Redundancy and Failover Design', type: 'lesson',
            summary: 'Use redundant feeds and failover logic to protect event strategies against data interruptions.',
            slug: lessonSlug(26, 'Tuesday', 2, 'Data Feed Redundancy and Failover Design') },
          { number: 3, title: 'Broker Connectivity Health and Throughput Monitoring', type: 'lesson',
            summary: 'Monitor connectivity and throughput metrics in real time to detect degradation before losses compound.',
            slug: lessonSlug(26, 'Tuesday', 3, 'Broker Connectivity Health and Throughput Monitoring') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Event Strategy Archetypes',
        lessons: [
          { number: 1, title: 'Spike Fade vs Momentum Follow-Through Models', type: 'lesson',
            summary: 'Compare spike fade and momentum continuation models and define strict conditions for each.',
            slug: lessonSlug(26, 'Wednesday', 1, 'Spike Fade vs Momentum Follow-Through Models') },
          { number: 2, title: 'News Surprise Magnitude Threshold Modeling', type: 'lesson',
            summary: 'Map historical surprise thresholds to expected move profiles and strategy activation rules.',
            slug: lessonSlug(26, 'Wednesday', 2, 'News Surprise Magnitude Threshold Modeling') },
          { number: 3, title: 'Regime Filters for Event-Day Strategy Selection', type: 'lesson',
            summary: 'Use volatility and liquidity regime filters so event strategies are selected with contextual discipline.',
            slug: lessonSlug(26, 'Wednesday', 3, 'Regime Filters for Event-Day Strategy Selection') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Risk Control Under Extreme Volatility',
        lessons: [
          { number: 1, title: 'Dynamic Stop Policies in Fast Markets', type: 'lesson',
            summary: 'Apply dynamic stop logic that balances protection with market noise during rapid repricing periods.',
            slug: lessonSlug(26, 'Thursday', 1, 'Dynamic Stop Policies in Fast Markets') },
          { number: 2, title: 'Slippage Caps, Position Throttles, and Auto-Cancel Logic', type: 'lesson',
            summary: 'Implement hard control layers that throttle risk when execution degrades beyond acceptable limits.',
            slug: lessonSlug(26, 'Thursday', 2, 'Slippage Caps, Position Throttles, and Auto-Cancel Logic') },
          { number: 3, title: 'Drawdown Containment Protocol for Event Strategy Books', type: 'lesson',
            summary: 'Define drawdown containment plans that halt event trading before psychological or capital damage escalates.',
            slug: lessonSlug(26, 'Thursday', 3, 'Drawdown Containment Protocol for Event Strategy Books') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Lab Analytics and Continuous Improvement',
        lessons: [
          { number: 1, title: 'Event Replay Analytics and Fill Quality Diagnostics', type: 'lesson',
            summary: 'Use replay analytics to evaluate decision timing and execution quality at sub-minute granularity.',
            slug: lessonSlug(26, 'Friday', 1, 'Event Replay Analytics and Fill Quality Diagnostics') },
          { number: 2, title: 'Experiment Tracking for Event Strategy Variants', type: 'lesson',
            summary: 'Track variant experiments systematically so improvements are evidence-driven and reproducible.',
            slug: lessonSlug(26, 'Friday', 2, 'Experiment Tracking for Event Strategy Variants') },
          { number: 3, title: 'Weekly Lab Review and Upgrade Backlog Prioritization', type: 'lesson',
            summary: 'Run weekly lab reviews that prioritize the highest-value execution and strategy upgrades.',
            slug: lessonSlug(26, 'Friday', 3, 'Weekly Lab Review and Upgrade Backlog Prioritization') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: End-to-End Event Trading Lab Build',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build Your Event Trading Lab Blueprint', type: 'assignment',
            summary: 'Assemble a full event trading lab blueprint with strategy specs, controls, and monitoring components.',
            slug: lessonSlug(26, 'Saturday', 1, 'Assignment Overview: Build Your Event Trading Lab Blueprint') },
          { number: 2, title: 'Deliverable: Event Playbooks, Latency Map, and Risk Control Matrix', type: 'assignment',
            summary: 'Submit a complete operating pack for event trading including playbooks, infrastructure map, and safeguards.',
            slug: lessonSlug(26, 'Saturday', 2, 'Deliverable: Event Playbooks, Latency Map, and Risk Control Matrix') },
          { number: 3, title: 'Capstone Drill: Live-Sim Event Session and Post-Mortem', type: 'assignment',
            summary: 'Execute a live simulation session and present a post-mortem with measurable improvement actions.',
            slug: lessonSlug(26, 'Saturday', 3, 'Capstone Drill: Live-Sim Event Session and Post-Mortem') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 27 - DeFi and Tokenized FX Market Structure - Professional
  // ===========================================================================
  {
    week: 27,
    module: 'DeFi and Tokenized FX Market Structure',
    level: 'Professional',
    description: 'Understand how tokenized FX, stablecoin rails, and on-chain liquidity can complement traditional forex workflows in modern market operations.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Tokenized FX Fundamentals',
        lessons: [
          { number: 1, title: 'What Tokenized FX Is and How It Differs from Spot FX', type: 'lesson',
            summary: 'Learn the structure, settlement, and custody differences between tokenized currency pairs and broker-based spot FX.',
            slug: lessonSlug(27, 'Monday', 1, 'What Tokenized FX Is and How It Differs from Spot FX') },
          { number: 2, title: 'Stablecoins, Synthetic FX Tokens, and Settlement Risk', type: 'lesson',
            summary: 'Compare settlement layers, collateral models, and depeg risk when using stablecoin-linked instruments.',
            slug: lessonSlug(27, 'Monday', 2, 'Stablecoins, Synthetic FX Tokens, and Settlement Risk') },
          { number: 3, title: 'Liquidity Sources: CEX, DEX, and Prime Broker Bridges', type: 'lesson',
            summary: 'Map where tokenized FX liquidity comes from and how it interacts with centralized and OTC liquidity.',
            slug: lessonSlug(27, 'Monday', 3, 'Liquidity Sources: CEX, DEX, and Prime Broker Bridges') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'On-Chain Market Microstructure',
        lessons: [
          { number: 1, title: 'AMM Pricing Mechanics for FX-Like Pairs', type: 'lesson',
            summary: 'Understand AMM curve behavior, slippage math, and inventory effects in low-depth pools.',
            slug: lessonSlug(27, 'Tuesday', 1, 'AMM Pricing Mechanics for FX-Like Pairs') },
          { number: 2, title: 'Order Book DEX Microstructure and Fill Behavior', type: 'lesson',
            summary: 'Study limit book depth, queue priority, and fill quality differences relative to classic FX venues.',
            slug: lessonSlug(27, 'Tuesday', 2, 'Order Book DEX Microstructure and Fill Behavior') },
          { number: 3, title: 'MEV, Sandwich Risk, and Execution Protection Techniques', type: 'lesson',
            summary: 'Identify MEV risks and implement practical execution safeguards in on-chain environments.',
            slug: lessonSlug(27, 'Tuesday', 3, 'MEV, Sandwich Risk, and Execution Protection Techniques') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Cross-Market Arbitrage and Basis',
        lessons: [
          { number: 1, title: 'Spot FX vs Tokenized FX Basis Monitoring', type: 'lesson',
            summary: 'Track basis dislocations and understand when cross-market pricing gaps are actionable.',
            slug: lessonSlug(27, 'Wednesday', 1, 'Spot FX vs Tokenized FX Basis Monitoring') },
          { number: 2, title: 'Latency and Settlement Constraints in Arbitrage Workflows', type: 'lesson',
            summary: 'Model transfer delays, confirmation times, and operational constraints in arbitrage strategies.',
            slug: lessonSlug(27, 'Wednesday', 2, 'Latency and Settlement Constraints in Arbitrage Workflows') },
          { number: 3, title: 'Risk Controls for Cross-Venue Execution', type: 'lesson',
            summary: 'Implement controls for transfer risk, venue outages, and failed hedges during basis trades.',
            slug: lessonSlug(27, 'Wednesday', 3, 'Risk Controls for Cross-Venue Execution') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Regulation, Custody, and Operational Risk',
        lessons: [
          { number: 1, title: 'Compliance Considerations for Tokenized FX Operations', type: 'lesson',
            summary: 'Review governance and compliance implications when integrating tokenized assets into trading operations.',
            slug: lessonSlug(27, 'Thursday', 1, 'Compliance Considerations for Tokenized FX Operations') },
          { number: 2, title: 'Custody Models: Self-Custody, MPC, and Qualified Custodians', type: 'lesson',
            summary: 'Compare custody models and define an operational security framework for institutional-grade usage.',
            slug: lessonSlug(27, 'Thursday', 2, 'Custody Models: Self-Custody, MPC, and Qualified Custodians') },
          { number: 3, title: 'Counterparty and Smart Contract Risk Framework', type: 'lesson',
            summary: 'Create due diligence checklists for protocol, issuer, and smart contract reliability.',
            slug: lessonSlug(27, 'Thursday', 3, 'Counterparty and Smart Contract Risk Framework') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Hybrid FX Architecture Design',
        lessons: [
          { number: 1, title: 'Designing a Hybrid TradFi-DeFi FX Workflow', type: 'lesson',
            summary: 'Build a practical architecture that combines broker execution with tokenized settlement rails.',
            slug: lessonSlug(27, 'Friday', 1, 'Designing a Hybrid TradFi-DeFi FX Workflow') },
          { number: 2, title: 'Monitoring Stack for On-Chain and Off-Chain Exposures', type: 'lesson',
            summary: 'Unify dashboards for spot exposure, stablecoin risk, and venue-level operational health.',
            slug: lessonSlug(27, 'Friday', 2, 'Monitoring Stack for On-Chain and Off-Chain Exposures') },
          { number: 3, title: 'Policy Design for Hybrid Capital Allocation', type: 'lesson',
            summary: 'Define allocation limits and escalation policies for hybrid portfolio operations.',
            slug: lessonSlug(27, 'Friday', 3, 'Policy Design for Hybrid Capital Allocation') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Tokenized FX Integration Plan',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build a Tokenized FX Playbook', type: 'assignment',
            summary: 'Create a practical playbook for tokenized FX participation with controls and governance.',
            slug: lessonSlug(27, 'Saturday', 1, 'Assignment Overview: Build a Tokenized FX Playbook') },
          { number: 2, title: 'Deliverable: Venue Matrix, Risk Matrix, and Execution Plan', type: 'assignment',
            summary: 'Submit a full operating package covering venues, risk controls, and execution rules.',
            slug: lessonSlug(27, 'Saturday', 2, 'Deliverable: Venue Matrix, Risk Matrix, and Execution Plan') },
          { number: 3, title: 'Review: Simulation Outcomes and Policy Revisions', type: 'assignment',
            summary: 'Run a simulated week and document required policy upgrades before production use.',
            slug: lessonSlug(27, 'Saturday', 3, 'Review: Simulation Outcomes and Policy Revisions') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 28 - Cross-Border Payment Flow Trading Models - Professional
  // ===========================================================================
  {
    week: 28,
    module: 'Cross-Border Payment Flow Trading Models',
    level: 'Professional',
    description: 'Use payment flow intelligence and corridor dynamics to build modern forex models that anticipate liquidity pressure and directional bias.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Payment Corridors and Flow Mechanics',
        lessons: [
          { number: 1, title: 'Global Payment Corridors and FX Demand Drivers', type: 'lesson',
            summary: 'Map major payment corridors and understand how recurring commercial flows influence FX demand.',
            slug: lessonSlug(28, 'Monday', 1, 'Global Payment Corridors and FX Demand Drivers') },
          { number: 2, title: 'Settlement Timing Effects on Intraday Liquidity', type: 'lesson',
            summary: 'Analyze how settlement windows and cut-off times shape intraday liquidity patterns.',
            slug: lessonSlug(28, 'Monday', 2, 'Settlement Timing Effects on Intraday Liquidity') },
          { number: 3, title: 'Corporate Hedging Flows and Market Impact', type: 'lesson',
            summary: 'Model how corporate hedging programs can amplify or dampen directional moves.',
            slug: lessonSlug(28, 'Monday', 3, 'Corporate Hedging Flows and Market Impact') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Flow Data Sources and Signal Extraction',
        lessons: [
          { number: 1, title: 'Public and Alternative Data for Flow Proxies', type: 'lesson',
            summary: 'Identify usable proxy datasets for flow pressure without depending on privileged information.',
            slug: lessonSlug(28, 'Tuesday', 1, 'Public and Alternative Data for Flow Proxies') },
          { number: 2, title: 'Feature Engineering for Corridor Strength Indicators', type: 'lesson',
            summary: 'Build robust features that capture recurring corridor pressure and liquidity stress.',
            slug: lessonSlug(28, 'Tuesday', 2, 'Feature Engineering for Corridor Strength Indicators') },
          { number: 3, title: 'Detecting Flow Regime Changes', type: 'lesson',
            summary: 'Use change-point methods to detect structural shifts in corridor behavior and model reliability.',
            slug: lessonSlug(28, 'Tuesday', 3, 'Detecting Flow Regime Changes') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Flow-Driven Strategy Design',
        lessons: [
          { number: 1, title: 'Intraday Flow Momentum Models', type: 'lesson',
            summary: 'Design short-horizon models that exploit persistent flow pressure in liquid pairs.',
            slug: lessonSlug(28, 'Wednesday', 1, 'Intraday Flow Momentum Models') },
          { number: 2, title: 'Mean-Reversion Models Around Settlement Extremes', type: 'lesson',
            summary: 'Develop reversal logic for temporary dislocations around payment settlement windows.',
            slug: lessonSlug(28, 'Wednesday', 2, 'Mean-Reversion Models Around Settlement Extremes') },
          { number: 3, title: 'Risk Filters for Flow Signal Degradation', type: 'lesson',
            summary: 'Apply filters that disable weak signals under abnormal volatility or thin liquidity.',
            slug: lessonSlug(28, 'Wednesday', 3, 'Risk Filters for Flow Signal Degradation') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Execution and Cost Modeling',
        lessons: [
          { number: 1, title: 'Execution Policies for Flow-Based Signals', type: 'lesson',
            summary: 'Choose order tactics and timing policies that preserve edge after spread and slippage.',
            slug: lessonSlug(28, 'Thursday', 1, 'Execution Policies for Flow-Based Signals') },
          { number: 2, title: 'Transaction Cost Modeling by Corridor and Session', type: 'lesson',
            summary: 'Estimate costs by corridor-session combinations to avoid false profitability.',
            slug: lessonSlug(28, 'Thursday', 2, 'Transaction Cost Modeling by Corridor and Session') },
          { number: 3, title: 'Capacity Constraints and Scale Testing', type: 'lesson',
            summary: 'Measure strategy capacity so growth does not invalidate execution assumptions.',
            slug: lessonSlug(28, 'Thursday', 3, 'Capacity Constraints and Scale Testing') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Productionization and Monitoring',
        lessons: [
          { number: 1, title: 'Deploying Flow Models with Safety Controls', type: 'lesson',
            summary: 'Deploy in stages with circuit breakers, exposure caps, and live metric monitoring.',
            slug: lessonSlug(28, 'Friday', 1, 'Deploying Flow Models with Safety Controls') },
          { number: 2, title: 'Drift Monitoring for Flow Features', type: 'lesson',
            summary: 'Track feature drift and trigger retraining or deactivation when reliability declines.',
            slug: lessonSlug(28, 'Friday', 2, 'Drift Monitoring for Flow Features') },
          { number: 3, title: 'Flow Desk KPI Framework', type: 'lesson',
            summary: 'Use KPI dashboards for hit rate, expectancy, execution quality, and drawdown control.',
            slug: lessonSlug(28, 'Friday', 3, 'Flow Desk KPI Framework') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Payment Flow Strategy Pack',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build a Flow-Based Trading Framework', type: 'assignment',
            summary: 'Design a complete framework from data inputs to execution and governance.',
            slug: lessonSlug(28, 'Saturday', 1, 'Assignment Overview: Build a Flow-Based Trading Framework') },
          { number: 2, title: 'Deliverable: Feature Set, Backtest, and Monitoring Plan', type: 'assignment',
            summary: 'Submit a documented strategy package with evidence and production safeguards.',
            slug: lessonSlug(28, 'Saturday', 2, 'Deliverable: Feature Set, Backtest, and Monitoring Plan') },
          { number: 3, title: 'Review: Failure Modes and Contingency Upgrades', type: 'assignment',
            summary: 'Identify top failure risks and define operational contingency actions.',
            slug: lessonSlug(28, 'Saturday', 3, 'Review: Failure Modes and Contingency Upgrades') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 29 - Institutional Liquidity Prediction with ML - Professional
  // ===========================================================================
  {
    week: 29,
    module: 'Institutional Liquidity Prediction with ML',
    level: 'Professional',
    description: 'Build machine learning pipelines that forecast liquidity conditions and improve timing, sizing, and execution quality in professional forex trading.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Liquidity Forecasting Problem Design',
        lessons: [
          { number: 1, title: 'Defining Liquidity Targets for Predictive Models', type: 'lesson',
            summary: 'Choose actionable targets such as spread state, depth proxy, and fill probability classes.',
            slug: lessonSlug(29, 'Monday', 1, 'Defining Liquidity Targets for Predictive Models') },
          { number: 2, title: 'Labeling and Horizon Selection for Liquidity Prediction', type: 'lesson',
            summary: 'Align label horizons with execution use-cases to avoid mismatch between model output and action.',
            slug: lessonSlug(29, 'Monday', 2, 'Labeling and Horizon Selection for Liquidity Prediction') },
          { number: 3, title: 'Data Leakage Pitfalls in Liquidity Models', type: 'lesson',
            summary: 'Prevent leakage with strict temporal validation and clean feature cutoffs.',
            slug: lessonSlug(29, 'Monday', 3, 'Data Leakage Pitfalls in Liquidity Models') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Modeling Approaches and Validation',
        lessons: [
          { number: 1, title: 'Tree Models vs Sequence Models for Liquidity Signals', type: 'lesson',
            summary: 'Compare model families by interpretability, latency, and production stability.',
            slug: lessonSlug(29, 'Tuesday', 1, 'Tree Models vs Sequence Models for Liquidity Signals') },
          { number: 2, title: 'Walk-Forward Validation for Time-Series Reliability', type: 'lesson',
            summary: 'Use walk-forward evaluation to measure realistic out-of-sample performance over regimes.',
            slug: lessonSlug(29, 'Tuesday', 2, 'Walk-Forward Validation for Time-Series Reliability') },
          { number: 3, title: 'Calibration and Probability Reliability Checks', type: 'lesson',
            summary: 'Calibrate probability outputs so confidence levels match observed outcomes.',
            slug: lessonSlug(29, 'Tuesday', 3, 'Calibration and Probability Reliability Checks') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Execution Integration',
        lessons: [
          { number: 1, title: 'Using Liquidity Forecasts for Order Type Selection', type: 'lesson',
            summary: 'Map forecast states to market, limit, or staged execution decisions.',
            slug: lessonSlug(29, 'Wednesday', 1, 'Using Liquidity Forecasts for Order Type Selection') },
          { number: 2, title: 'Dynamic Position Sizing by Liquidity State', type: 'lesson',
            summary: 'Scale exposure according to predicted liquidity to reduce execution slippage tails.',
            slug: lessonSlug(29, 'Wednesday', 2, 'Dynamic Position Sizing by Liquidity State') },
          { number: 3, title: 'Adaptive Session Playbooks from ML Outputs', type: 'lesson',
            summary: 'Turn model output into session-level execution playbooks with explicit risk limits.',
            slug: lessonSlug(29, 'Wednesday', 3, 'Adaptive Session Playbooks from ML Outputs') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'MLOps and Reliability Controls',
        lessons: [
          { number: 1, title: 'Feature Store and Versioning for Trading Models', type: 'lesson',
            summary: 'Implement reproducible pipelines with versioned features and model artifacts.',
            slug: lessonSlug(29, 'Thursday', 1, 'Feature Store and Versioning for Trading Models') },
          { number: 2, title: 'Drift Alerts, Retraining Triggers, and Rollback Plans', type: 'lesson',
            summary: 'Create operational controls for model drift, safe retraining, and rapid rollback.',
            slug: lessonSlug(29, 'Thursday', 2, 'Drift Alerts, Retraining Triggers, and Rollback Plans') },
          { number: 3, title: 'Latency Budgets for Inference in Live Trading', type: 'lesson',
            summary: 'Manage model inference latency so predictive value is not lost before order placement.',
            slug: lessonSlug(29, 'Thursday', 3, 'Latency Budgets for Inference in Live Trading') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Governance and Risk Oversight',
        lessons: [
          { number: 1, title: 'Model Risk Framework for Liquidity Forecast Systems', type: 'lesson',
            summary: 'Define governance for approvals, limits, and monitoring at model and portfolio levels.',
            slug: lessonSlug(29, 'Friday', 1, 'Model Risk Framework for Liquidity Forecast Systems') },
          { number: 2, title: 'Explainability and Audit Requirements for ML Trading', type: 'lesson',
            summary: 'Maintain explainability artifacts and audit trails for decision accountability.',
            slug: lessonSlug(29, 'Friday', 2, 'Explainability and Audit Requirements for ML Trading') },
          { number: 3, title: 'Capital Gating for ML Strategy Promotion', type: 'lesson',
            summary: 'Promote models through staged capital gates only after objective performance evidence.',
            slug: lessonSlug(29, 'Friday', 3, 'Capital Gating for ML Strategy Promotion') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Liquidity ML Production Blueprint',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build a Liquidity Prediction Program', type: 'assignment',
            summary: 'Design an end-to-end program from data engineering to live monitoring and governance.',
            slug: lessonSlug(29, 'Saturday', 1, 'Assignment Overview: Build a Liquidity Prediction Program') },
          { number: 2, title: 'Deliverable: Model Card, Validation Report, and Runbook', type: 'assignment',
            summary: 'Submit a production-grade package for model operation and risk management.',
            slug: lessonSlug(29, 'Saturday', 2, 'Deliverable: Model Card, Validation Report, and Runbook') },
          { number: 3, title: 'Review: Live-Sim Results and Promotion Decision', type: 'assignment',
            summary: 'Use objective thresholds to decide promotion, hold, or retirement of the model.',
            slug: lessonSlug(29, 'Saturday', 3, 'Review: Live-Sim Results and Promotion Decision') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 30 - Professional Certification and Final Competency Exam - Professional
  // ===========================================================================
  {
    week: 30,
    module: 'Professional Certification and Final Competency Exam',
    level: 'Professional',
    description: 'Consolidate the full program into a certification-grade final assessment that tests strategy, execution, risk governance, and operational professionalism.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Comprehensive Knowledge Consolidation',
        lessons: [
          { number: 1, title: 'Program-Wide Concept Map: Beginner to Professional', type: 'lesson',
            summary: 'Integrate all modules into a single conceptual framework for practical live usage.',
            slug: lessonSlug(30, 'Monday', 1, 'Program-Wide Concept Map: Beginner to Professional') },
          { number: 2, title: 'Strategy Selection Matrix by Regime and Objective', type: 'lesson',
            summary: 'Build a decision matrix that maps market regimes to the best-fit strategy families.',
            slug: lessonSlug(30, 'Monday', 2, 'Strategy Selection Matrix by Regime and Objective') },
          { number: 3, title: 'Risk Hierarchy and Governance Recertification', type: 'lesson',
            summary: 'Re-validate all hard risk controls and governance practices before certification testing.',
            slug: lessonSlug(30, 'Monday', 3, 'Risk Hierarchy and Governance Recertification') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Practical Exam Part I: Strategy and Analysis',
        lessons: [
          { number: 1, title: 'Case Study Exam: Multi-Timeframe Market Analysis', type: 'lesson',
            summary: 'Complete a structured analysis exam using technical, macro, and flow context.',
            slug: lessonSlug(30, 'Tuesday', 1, 'Case Study Exam: Multi-Timeframe Market Analysis') },
          { number: 2, title: 'Case Study Exam: Scenario Planning and Bias Justification', type: 'lesson',
            summary: 'Produce base, bull, and bear scenario trees with clear decision criteria.',
            slug: lessonSlug(30, 'Tuesday', 2, 'Case Study Exam: Scenario Planning and Bias Justification') },
          { number: 3, title: 'Case Study Exam: Trade Plan Design and Validation', type: 'lesson',
            summary: 'Submit a fully specified trade plan with measurable triggers and invalidation logic.',
            slug: lessonSlug(30, 'Tuesday', 3, 'Case Study Exam: Trade Plan Design and Validation') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Practical Exam Part II: Execution and Risk',
        lessons: [
          { number: 1, title: 'Execution Quality Exam: Order Tactics and Cost Control', type: 'lesson',
            summary: 'Demonstrate high-quality execution decisions under varying liquidity states.',
            slug: lessonSlug(30, 'Wednesday', 1, 'Execution Quality Exam: Order Tactics and Cost Control') },
          { number: 2, title: 'Risk Response Exam: Drawdown, Slippage, and Incident Handling', type: 'lesson',
            summary: 'Respond to stress scenarios using your risk framework and incident runbooks.',
            slug: lessonSlug(30, 'Wednesday', 2, 'Risk Response Exam: Drawdown, Slippage, and Incident Handling') },
          { number: 3, title: 'Governance Exam: Compliance, Documentation, and Auditability', type: 'lesson',
            summary: 'Prove that your operating model is transparent, documented, and governance-ready.',
            slug: lessonSlug(30, 'Wednesday', 3, 'Governance Exam: Compliance, Documentation, and Auditability') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Capstone Portfolio Construction',
        lessons: [
          { number: 1, title: 'Building a Multi-Strategy Portfolio Capstone', type: 'lesson',
            summary: 'Construct a professional portfolio that combines your strongest validated strategy components.',
            slug: lessonSlug(30, 'Thursday', 1, 'Building a Multi-Strategy Portfolio Capstone') },
          { number: 2, title: 'Capital Allocation and Stress-Test Defense', type: 'lesson',
            summary: 'Defend allocation choices with stress tests, downside limits, and expected return logic.',
            slug: lessonSlug(30, 'Thursday', 2, 'Capital Allocation and Stress-Test Defense') },
          { number: 3, title: 'Monitoring and Review Cadence for 12-Month Deployment', type: 'lesson',
            summary: 'Define operational cadence and KPI thresholds for a year-long live deployment plan.',
            slug: lessonSlug(30, 'Thursday', 3, 'Monitoring and Review Cadence for 12-Month Deployment') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Final Oral Defense and Professional Readiness',
        lessons: [
          { number: 1, title: 'Presentation: End-to-End Trading Operating Model', type: 'lesson',
            summary: 'Present your full operating model from research to execution and governance.',
            slug: lessonSlug(30, 'Friday', 1, 'Presentation: End-to-End Trading Operating Model') },
          { number: 2, title: 'Q and A Defense: Assumptions, Risks, and Contingencies', type: 'lesson',
            summary: 'Defend your model assumptions and show robust contingency planning under challenge.',
            slug: lessonSlug(30, 'Friday', 2, 'Q and A Defense: Assumptions, Risks, and Contingencies') },
          { number: 3, title: 'Professional Development Plan: Next 12 Months', type: 'lesson',
            summary: 'Submit a realistic professional growth plan with milestones and accountability metrics.',
            slug: lessonSlug(30, 'Friday', 3, 'Professional Development Plan: Next 12 Months') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Final Assignment: Certification Submission Package',
        lessons: [
          { number: 1, title: 'Assignment Overview: Compile Your Full Certification Dossier', type: 'assignment',
            summary: 'Assemble all required artifacts into a single certification submission package.',
            slug: lessonSlug(30, 'Saturday', 1, 'Assignment Overview: Compile Your Full Certification Dossier') },
          { number: 2, title: 'Deliverable: Strategy Book, Risk Policy, and Operating Runbooks', type: 'assignment',
            summary: 'Submit your final professional documents with versioned evidence and review notes.',
            slug: lessonSlug(30, 'Saturday', 2, 'Deliverable: Strategy Book, Risk Policy, and Operating Runbooks') },
          { number: 3, title: 'Graduation Review: Certification Decision and Feedback', type: 'assignment',
            summary: 'Complete final evaluation and record key development actions after certification outcome.',
            slug: lessonSlug(30, 'Saturday', 3, 'Graduation Review: Certification Decision and Feedback') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 31 - Multi-Agent Autonomous Trading Lab - Professional
  // ===========================================================================
  {
    week: 31,
    module: 'Multi-Agent Autonomous Trading Lab',
    level: 'Professional',
    description: 'Design and test a multi-agent trading workflow where specialized agents coordinate research, execution support, and risk supervision under strict governance.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Agent Roles and Coordination Protocols',
        lessons: [
          { number: 1, title: 'Research Agent, Execution Agent, and Risk Agent Design', type: 'lesson',
            summary: 'Define specialized responsibilities so each agent contributes without role overlap.',
            slug: lessonSlug(31, 'Monday', 1, 'Research Agent, Execution Agent, and Risk Agent Design') },
          { number: 2, title: 'Message Passing and Decision Hand-Off Rules', type: 'lesson',
            summary: 'Build clear hand-off protocols to prevent ambiguity during live market conditions.',
            slug: lessonSlug(31, 'Monday', 2, 'Message Passing and Decision Hand-Off Rules') },
          { number: 3, title: 'Consensus and Conflict Resolution Between Agents', type: 'lesson',
            summary: 'Set conflict rules when agents disagree on bias, timing, or risk posture.',
            slug: lessonSlug(31, 'Monday', 3, 'Consensus and Conflict Resolution Between Agents') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Safety Boundaries and Human Oversight',
        lessons: [
          { number: 1, title: 'Permissioning Models for Agent Actions', type: 'lesson',
            summary: 'Apply least-privilege permissions so agents cannot exceed defined operational boundaries.',
            slug: lessonSlug(31, 'Tuesday', 1, 'Permissioning Models for Agent Actions') },
          { number: 2, title: 'Human Override and Mandatory Approval Gates', type: 'lesson',
            summary: 'Implement mandatory human checkpoints for all capital-impacting decisions.',
            slug: lessonSlug(31, 'Tuesday', 2, 'Human Override and Mandatory Approval Gates') },
          { number: 3, title: 'Guardrail Policies for High-Volatility Events', type: 'lesson',
            summary: 'Define stricter constraints for agents during macro releases and liquidity shocks.',
            slug: lessonSlug(31, 'Tuesday', 3, 'Guardrail Policies for High-Volatility Events') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Autonomous Workflow Simulation',
        lessons: [
          { number: 1, title: 'Backtesting Agent Coordination Strategies', type: 'lesson',
            summary: 'Evaluate whether multi-agent orchestration improves decisions versus single-agent systems.',
            slug: lessonSlug(31, 'Wednesday', 1, 'Backtesting Agent Coordination Strategies') },
          { number: 2, title: 'Latency and Queue Effects in Agent Pipelines', type: 'lesson',
            summary: 'Measure coordination delay and its impact on execution timing quality.',
            slug: lessonSlug(31, 'Wednesday', 2, 'Latency and Queue Effects in Agent Pipelines') },
          { number: 3, title: 'Failure Injection and Recovery Testing', type: 'lesson',
            summary: 'Inject failures into the agent pipeline and validate containment and recovery paths.',
            slug: lessonSlug(31, 'Wednesday', 3, 'Failure Injection and Recovery Testing') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Monitoring and Explainability',
        lessons: [
          { number: 1, title: 'Observability Dashboards for Agent Operations', type: 'lesson',
            summary: 'Track agent actions, confidence, latency, and risk flags in one operational view.',
            slug: lessonSlug(31, 'Thursday', 1, 'Observability Dashboards for Agent Operations') },
          { number: 2, title: 'Decision Trace Logging and Auditability', type: 'lesson',
            summary: 'Log complete decision traces for review, accountability, and process improvement.',
            slug: lessonSlug(31, 'Thursday', 2, 'Decision Trace Logging and Auditability') },
          { number: 3, title: 'Explainability Standards for Production Agent Systems', type: 'lesson',
            summary: 'Define explainability requirements before agents are allowed on larger capital.',
            slug: lessonSlug(31, 'Thursday', 3, 'Explainability Standards for Production Agent Systems') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Production Readiness and Governance',
        lessons: [
          { number: 1, title: 'Stage-Gated Deployment for Agentic Trading', type: 'lesson',
            summary: 'Promote from sandbox to micro live capital using objective readiness gates.',
            slug: lessonSlug(31, 'Friday', 1, 'Stage-Gated Deployment for Agentic Trading') },
          { number: 2, title: 'Risk Committee Review for Agent Promotion', type: 'lesson',
            summary: 'Use formal governance review before expanding any autonomous capabilities.',
            slug: lessonSlug(31, 'Friday', 2, 'Risk Committee Review for Agent Promotion') },
          { number: 3, title: 'Incident Response Playbooks for Agent Misbehavior', type: 'lesson',
            summary: 'Prepare rapid-response actions for unexpected outputs, drift, or control failure.',
            slug: lessonSlug(31, 'Friday', 3, 'Incident Response Playbooks for Agent Misbehavior') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Multi-Agent Trading Control Framework',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build Your Multi-Agent Architecture', type: 'assignment',
            summary: 'Design an end-to-end architecture including roles, controls, and escalation paths.',
            slug: lessonSlug(31, 'Saturday', 1, 'Assignment Overview: Build Your Multi-Agent Architecture') },
          { number: 2, title: 'Deliverable: Governance Policies and Monitoring Blueprint', type: 'assignment',
            summary: 'Submit policy documents and dashboards required for safe autonomous operation.',
            slug: lessonSlug(31, 'Saturday', 2, 'Deliverable: Governance Policies and Monitoring Blueprint') },
          { number: 3, title: 'Simulation Review: Performance, Safety, and Readiness', type: 'assignment',
            summary: 'Run a simulation week and document readiness decisions with evidence.',
            slug: lessonSlug(31, 'Saturday', 3, 'Simulation Review: Performance, Safety, and Readiness') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 32 - FX Prime Brokerage and Institutional Operations - Professional
  // ===========================================================================
  {
    week: 32,
    module: 'FX Prime Brokerage and Institutional Operations',
    level: 'Professional',
    description: 'Learn institutional operating models around prime brokerage, credit lines, settlement processes, and operational controls used by professional FX desks.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Prime Brokerage Fundamentals',
        lessons: [
          { number: 1, title: 'Prime Brokerage Structure and Participant Roles', type: 'lesson',
            summary: 'Understand the relationship between funds, prime brokers, liquidity providers, and venues.',
            slug: lessonSlug(32, 'Monday', 1, 'Prime Brokerage Structure and Participant Roles') },
          { number: 2, title: 'Credit Intermediation and Counterparty Access', type: 'lesson',
            summary: 'Learn how prime brokers provide credit intermediation and market access at scale.',
            slug: lessonSlug(32, 'Monday', 2, 'Credit Intermediation and Counterparty Access') },
          { number: 3, title: 'Margining and Collateral Mechanics in Institutional FX', type: 'lesson',
            summary: 'Model collateral usage, margin calls, and funding impact on strategy operations.',
            slug: lessonSlug(32, 'Monday', 3, 'Margining and Collateral Mechanics in Institutional FX') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Execution Venues and Routing',
        lessons: [
          { number: 1, title: 'ECN, Single-Dealer, and Multi-Dealer Venue Trade-Offs', type: 'lesson',
            summary: 'Compare venue models by spread quality, depth, and execution consistency.',
            slug: lessonSlug(32, 'Tuesday', 1, 'ECN, Single-Dealer, and Multi-Dealer Venue Trade-Offs') },
          { number: 2, title: 'Smart Routing Policy in Institutional Environments', type: 'lesson',
            summary: 'Design routing rules based on liquidity quality and venue behavior.',
            slug: lessonSlug(32, 'Tuesday', 2, 'Smart Routing Policy in Institutional Environments') },
          { number: 3, title: 'Execution Performance Benchmarking', type: 'lesson',
            summary: 'Benchmark fills against expected standards to identify venue-specific edge and drag.',
            slug: lessonSlug(32, 'Tuesday', 3, 'Execution Performance Benchmarking') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Post-Trade and Settlement Operations',
        lessons: [
          { number: 1, title: 'Confirmation, Netting, and Settlement Workflows', type: 'lesson',
            summary: 'Understand post-trade workflow dependencies that affect operational reliability.',
            slug: lessonSlug(32, 'Wednesday', 1, 'Confirmation, Netting, and Settlement Workflows') },
          { number: 2, title: 'CLS and Payment-versus-Payment Risk Reduction', type: 'lesson',
            summary: 'Learn how CLS-style mechanisms reduce settlement and principal risk exposure.',
            slug: lessonSlug(32, 'Wednesday', 2, 'CLS and Payment-versus-Payment Risk Reduction') },
          { number: 3, title: 'Operational Breaks and Exception Management', type: 'lesson',
            summary: 'Implement break management procedures to resolve mismatches quickly and safely.',
            slug: lessonSlug(32, 'Wednesday', 3, 'Operational Breaks and Exception Management') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Institutional Risk and Control Functions',
        lessons: [
          { number: 1, title: 'Three Lines of Defense in Trading Operations', type: 'lesson',
            summary: 'Apply operational governance structures that separate front office, risk, and audit control.',
            slug: lessonSlug(32, 'Thursday', 1, 'Three Lines of Defense in Trading Operations') },
          { number: 2, title: 'Limit Frameworks: Trader, Desk, and Portfolio Levels', type: 'lesson',
            summary: 'Define hard limit architecture to control exposure across multiple levels.',
            slug: lessonSlug(32, 'Thursday', 2, 'Limit Frameworks: Trader, Desk, and Portfolio Levels') },
          { number: 3, title: 'Incident Governance and Escalation Trees', type: 'lesson',
            summary: 'Use structured escalation trees for fast response during operational incidents.',
            slug: lessonSlug(32, 'Thursday', 3, 'Incident Governance and Escalation Trees') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Institutional Reporting and Oversight',
        lessons: [
          { number: 1, title: 'Daily Desk Reporting Standards and KPIs', type: 'lesson',
            summary: 'Create reporting packs for PnL, risk, execution, and compliance indicators.',
            slug: lessonSlug(32, 'Friday', 1, 'Daily Desk Reporting Standards and KPIs') },
          { number: 2, title: 'Board-Level Risk Summaries for Trading Businesses', type: 'lesson',
            summary: 'Translate desk detail into executive-level risk narratives and decision support.',
            slug: lessonSlug(32, 'Friday', 2, 'Board-Level Risk Summaries for Trading Businesses') },
          { number: 3, title: 'Quarterly Control Testing and Process Improvement', type: 'lesson',
            summary: 'Run quarterly control tests and convert findings into concrete process upgrades.',
            slug: lessonSlug(32, 'Friday', 3, 'Quarterly Control Testing and Process Improvement') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Institutional FX Operations Manual',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build an Institutional Operations Stack', type: 'assignment',
            summary: 'Create an operations stack covering execution, post-trade, controls, and governance.',
            slug: lessonSlug(32, 'Saturday', 1, 'Assignment Overview: Build an Institutional Operations Stack') },
          { number: 2, title: 'Deliverable: Control Matrix, Reporting Templates, and Runbooks', type: 'assignment',
            summary: 'Submit practical templates and runbooks required for professional desk operations.',
            slug: lessonSlug(32, 'Saturday', 2, 'Deliverable: Control Matrix, Reporting Templates, and Runbooks') },
          { number: 3, title: 'Audit Drill: Operational Readiness Assessment', type: 'assignment',
            summary: 'Conduct a mock audit and document remediation priorities.',
            slug: lessonSlug(32, 'Saturday', 3, 'Audit Drill: Operational Readiness Assessment') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 33 - Real-Time Risk Engine Design - Professional
  // ===========================================================================
  {
    week: 33,
    module: 'Real-Time Risk Engine Design',
    level: 'Professional',
    description: 'Design a real-time risk engine that monitors exposures continuously and enforces automatic controls for drawdown, concentration, and execution degradation.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Risk Engine Architecture',
        lessons: [
          { number: 1, title: 'Core Components of a Real-Time Risk Engine', type: 'lesson',
            summary: 'Define data ingest, exposure calculators, alerting, and policy enforcement modules.',
            slug: lessonSlug(33, 'Monday', 1, 'Core Components of a Real-Time Risk Engine') },
          { number: 2, title: 'Event-Driven vs Polling-Based Risk Monitoring', type: 'lesson',
            summary: 'Compare monitoring models for latency, reliability, and operational simplicity.',
            slug: lessonSlug(33, 'Monday', 2, 'Event-Driven vs Polling-Based Risk Monitoring') },
          { number: 3, title: 'Data Quality Requirements for Risk Accuracy', type: 'lesson',
            summary: 'Set data quality thresholds so risk signals remain trustworthy in live trading.',
            slug: lessonSlug(33, 'Monday', 3, 'Data Quality Requirements for Risk Accuracy') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Exposure and Limit Modeling',
        lessons: [
          { number: 1, title: 'Net and Gross Exposure Calculators Across Portfolios', type: 'lesson',
            summary: 'Build calculators for net and gross risk across multiple pairs and strategies.',
            slug: lessonSlug(33, 'Tuesday', 1, 'Net and Gross Exposure Calculators Across Portfolios') },
          { number: 2, title: 'Correlation-Aware Risk Limits', type: 'lesson',
            summary: 'Incorporate correlation effects so hidden concentration is detected early.',
            slug: lessonSlug(33, 'Tuesday', 2, 'Correlation-Aware Risk Limits') },
          { number: 3, title: 'Dynamic Limit Adjustments by Regime', type: 'lesson',
            summary: 'Adjust risk limits by volatility regime without losing policy consistency.',
            slug: lessonSlug(33, 'Tuesday', 3, 'Dynamic Limit Adjustments by Regime') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Automated Controls and Enforcement',
        lessons: [
          { number: 1, title: 'Alert Severity Tiers and Escalation Logic', type: 'lesson',
            summary: 'Implement tiered alerts that trigger appropriate operational responses.',
            slug: lessonSlug(33, 'Wednesday', 1, 'Alert Severity Tiers and Escalation Logic') },
          { number: 2, title: 'Auto-Deleveraging and Position Throttle Rules', type: 'lesson',
            summary: 'Apply enforcement rules to reduce risk when limits are approached or breached.',
            slug: lessonSlug(33, 'Wednesday', 2, 'Auto-Deleveraging and Position Throttle Rules') },
          { number: 3, title: 'Kill-Switch Design and Safe Recovery Procedures', type: 'lesson',
            summary: 'Design kill-switch logic that can halt risk safely and recover in controlled stages.',
            slug: lessonSlug(33, 'Wednesday', 3, 'Kill-Switch Design and Safe Recovery Procedures') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Stress Testing and Scenario Engines',
        lessons: [
          { number: 1, title: 'Historical Shock Replay for Risk Validation', type: 'lesson',
            summary: 'Replay historical stress events to validate protection behavior and policy thresholds.',
            slug: lessonSlug(33, 'Thursday', 1, 'Historical Shock Replay for Risk Validation') },
          { number: 2, title: 'Hypothetical Scenario Generator for Tail Events', type: 'lesson',
            summary: 'Generate tail-event scenarios to test edge cases beyond historical samples.',
            slug: lessonSlug(33, 'Thursday', 2, 'Hypothetical Scenario Generator for Tail Events') },
          { number: 3, title: 'Stress Outcome Dashboards and Decision Rules', type: 'lesson',
            summary: 'Create dashboards that translate stress outputs into concrete policy decisions.',
            slug: lessonSlug(33, 'Thursday', 3, 'Stress Outcome Dashboards and Decision Rules') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Risk Engine Operations and Governance',
        lessons: [
          { number: 1, title: 'SLA and Reliability Standards for Risk Systems', type: 'lesson',
            summary: 'Define uptime and response-time standards for mission-critical risk tooling.',
            slug: lessonSlug(33, 'Friday', 1, 'SLA and Reliability Standards for Risk Systems') },
          { number: 2, title: 'Change Management for Risk Policy Updates', type: 'lesson',
            summary: 'Use controlled release and approval processes for risk policy changes.',
            slug: lessonSlug(33, 'Friday', 2, 'Change Management for Risk Policy Updates') },
          { number: 3, title: 'Audit and Compliance Evidence for Risk Controls', type: 'lesson',
            summary: 'Maintain auditable records proving controls behaved as designed.',
            slug: lessonSlug(33, 'Friday', 3, 'Audit and Compliance Evidence for Risk Controls') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Build a Real-Time Risk Engine Spec',
        lessons: [
          { number: 1, title: 'Assignment Overview: Design Your Risk Engine Blueprint', type: 'assignment',
            summary: 'Design a complete blueprint including architecture, limits, alerts, and controls.',
            slug: lessonSlug(33, 'Saturday', 1, 'Assignment Overview: Design Your Risk Engine Blueprint') },
          { number: 2, title: 'Deliverable: Policy Rules, Dashboards, and Escalation Tree', type: 'assignment',
            summary: 'Submit production-grade design artifacts for operational deployment.',
            slug: lessonSlug(33, 'Saturday', 2, 'Deliverable: Policy Rules, Dashboards, and Escalation Tree') },
          { number: 3, title: 'Simulation Report: Stress Test Results and Upgrades', type: 'assignment',
            summary: 'Run stress simulations and document upgrades before go-live approval.',
            slug: lessonSlug(33, 'Saturday', 3, 'Simulation Report: Stress Test Results and Upgrades') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 34 - Global Macro Trading Simulation and Graduation - Professional
  // ===========================================================================
  {
    week: 34,
    module: 'Global Macro Trading Simulation and Graduation',
    level: 'Professional',
    description: 'Conclude the academy with a full global macro simulation week that tests strategy design, execution discipline, risk control, and professional operating maturity.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Simulation Kickoff and Macro Thesis Building',
        lessons: [
          { number: 1, title: 'Building Weekly Macro Thesis Across Major Economies', type: 'lesson',
            summary: 'Develop a structured thesis framework across rates, inflation, and growth narratives.',
            slug: lessonSlug(34, 'Monday', 1, 'Building Weekly Macro Thesis Across Major Economies') },
          { number: 2, title: 'Scenario Matrix: Base, Alternative, and Tail Cases', type: 'lesson',
            summary: 'Prepare scenario matrix with explicit triggers and action plans for each case.',
            slug: lessonSlug(34, 'Monday', 2, 'Scenario Matrix: Base, Alternative, and Tail Cases') },
          { number: 3, title: 'Portfolio Construction for Simulation Week', type: 'lesson',
            summary: 'Allocate risk across strategies and pairs with clear limits before simulation starts.',
            slug: lessonSlug(34, 'Monday', 3, 'Portfolio Construction for Simulation Week') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Live-Sim Session I: Trend and Event Management',
        lessons: [
          { number: 1, title: 'Session Execution: Trend Continuation and Pullback Models', type: 'lesson',
            summary: 'Apply trend and pullback tactics under simulated live conditions.',
            slug: lessonSlug(34, 'Tuesday', 1, 'Session Execution: Trend Continuation and Pullback Models') },
          { number: 2, title: 'Event Handling: News Risk and Post-Release Repositioning', type: 'lesson',
            summary: 'Execute event protocols and update positioning after high-impact releases.',
            slug: lessonSlug(34, 'Tuesday', 2, 'Event Handling: News Risk and Post-Release Repositioning') },
          { number: 3, title: 'Intra-Day Debrief and Adjustment Cycle', type: 'lesson',
            summary: 'Run structured debriefs to improve decisions for subsequent sessions.',
            slug: lessonSlug(34, 'Tuesday', 3, 'Intra-Day Debrief and Adjustment Cycle') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Live-Sim Session II: Multi-Strategy Coordination',
        lessons: [
          { number: 1, title: 'Coordinating Discretionary, Quant, and Event Models', type: 'lesson',
            summary: 'Coordinate multiple strategies while maintaining coherent risk posture.',
            slug: lessonSlug(34, 'Wednesday', 1, 'Coordinating Discretionary, Quant, and Event Models') },
          { number: 2, title: 'Conflict Resolution Between Strategy Signals', type: 'lesson',
            summary: 'Resolve conflicting signals using pre-defined hierarchy and decision criteria.',
            slug: lessonSlug(34, 'Wednesday', 2, 'Conflict Resolution Between Strategy Signals') },
          { number: 3, title: 'Midweek Risk Rebalancing and Capital Reallocation', type: 'lesson',
            summary: 'Rebalance risk based on updated performance and regime information.',
            slug: lessonSlug(34, 'Wednesday', 3, 'Midweek Risk Rebalancing and Capital Reallocation') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Stress Day Simulation and Incident Response',
        lessons: [
          { number: 1, title: 'Extreme Volatility Scenario Playbook Execution', type: 'lesson',
            summary: 'Execute stress-day controls under simulated liquidity and slippage shock.',
            slug: lessonSlug(34, 'Thursday', 1, 'Extreme Volatility Scenario Playbook Execution') },
          { number: 2, title: 'Operational Incident Drill: Data or Execution Outage', type: 'lesson',
            summary: 'Run outage drills and recover trading operations under governance controls.',
            slug: lessonSlug(34, 'Thursday', 2, 'Operational Incident Drill: Data or Execution Outage') },
          { number: 3, title: 'Post-Incident Analysis and Corrective Actions', type: 'lesson',
            summary: 'Document root causes and corrective actions using professional incident methodology.',
            slug: lessonSlug(34, 'Thursday', 3, 'Post-Incident Analysis and Corrective Actions') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Final Performance Attribution and Defense',
        lessons: [
          { number: 1, title: 'Performance Attribution by Strategy, Session, and Catalyst', type: 'lesson',
            summary: 'Attribute outcomes to strategy quality, execution quality, and market context.',
            slug: lessonSlug(34, 'Friday', 1, 'Performance Attribution by Strategy, Session, and Catalyst') },
          { number: 2, title: 'Risk Governance Defense and Committee Q and A', type: 'lesson',
            summary: 'Defend your risk framework and decisions before a structured review panel.',
            slug: lessonSlug(34, 'Friday', 2, 'Risk Governance Defense and Committee Q and A') },
          { number: 3, title: 'Professional Growth Plan Beyond Graduation', type: 'lesson',
            summary: 'Define post-program milestones for skill growth, capital scaling, and governance maturity.',
            slug: lessonSlug(34, 'Friday', 3, 'Professional Growth Plan Beyond Graduation') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Final Assignment: Graduation Portfolio Submission',
        lessons: [
          { number: 1, title: 'Assignment Overview: Submit Final Trading and Operations Portfolio', type: 'assignment',
            summary: 'Assemble final portfolio with strategy, risk, execution, and governance evidence.',
            slug: lessonSlug(34, 'Saturday', 1, 'Assignment Overview: Submit Final Trading and Operations Portfolio') },
          { number: 2, title: 'Deliverable: Capstone Report, Metrics, and Lessons Learned', type: 'assignment',
            summary: 'Submit capstone performance report with metrics and documented improvement actions.',
            slug: lessonSlug(34, 'Saturday', 2, 'Deliverable: Capstone Report, Metrics, and Lessons Learned') },
          { number: 3, title: 'Graduation Review: Certification Outcome and Next Steps', type: 'assignment',
            summary: 'Complete final review and define a realistic post-graduation execution roadmap.',
            slug: lessonSlug(34, 'Saturday', 3, 'Graduation Review: Certification Outcome and Next Steps') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 35 - Live Execution Mastery Lab - Professional
  // ===========================================================================
  {
    week: 35,
    module: 'Live Execution Mastery Lab',
    level: 'Professional',
    description: 'Sharpen real-time execution skills through practical drills, strict process discipline, and measurable execution quality scorecards.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Pre-Market Planning Discipline',
        lessons: [
          { number: 1, title: 'Session Preparation Checklist and Bias Declaration', type: 'lesson',
            summary: 'Run a fixed pre-market checklist and declare scenario-based bias before any chart interaction.',
            slug: lessonSlug(35, 'Monday', 1, 'Session Preparation Checklist and Bias Declaration') },
          { number: 2, title: 'Execution Intention Mapping by Pair and Session', type: 'lesson',
            summary: 'Define entry type, risk budget, and invalidation logic for each planned setup.',
            slug: lessonSlug(35, 'Monday', 2, 'Execution Intention Mapping by Pair and Session') },
          { number: 3, title: 'No-Trade Conditions and Capital Preservation Rules', type: 'lesson',
            summary: 'Set non-negotiable stand-down conditions to avoid low-quality execution periods.',
            slug: lessonSlug(35, 'Monday', 3, 'No-Trade Conditions and Capital Preservation Rules') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Entry and Exit Timing Drills',
        lessons: [
          { number: 1, title: 'Precision Entry Drill: Pullback, Breakout, and Rejection Models', type: 'lesson',
            summary: 'Practice selecting the correct entry model by structure, liquidity, and volatility conditions.',
            slug: lessonSlug(35, 'Tuesday', 1, 'Precision Entry Drill: Pullback, Breakout, and Rejection Models') },
          { number: 2, title: 'Stop Placement Drill: Structural vs Volatility Anchors', type: 'lesson',
            summary: 'Train consistent stop placement logic tied to setup context and expected noise.',
            slug: lessonSlug(35, 'Tuesday', 2, 'Stop Placement Drill: Structural vs Volatility Anchors') },
          { number: 3, title: 'Exit Management Drill: Partials, Trailing, and Hard Targets', type: 'lesson',
            summary: 'Apply deterministic exit protocols to reduce emotional interference mid-trade.',
            slug: lessonSlug(35, 'Tuesday', 3, 'Exit Management Drill: Partials, Trailing, and Hard Targets') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Execution Quality Analytics',
        lessons: [
          { number: 1, title: 'Execution Scorecard Metrics: Slippage, Delay, and Rule Compliance', type: 'lesson',
            summary: 'Measure execution performance with objective metrics rather than PnL alone.',
            slug: lessonSlug(35, 'Wednesday', 1, 'Execution Scorecard Metrics: Slippage, Delay, and Rule Compliance') },
          { number: 2, title: 'MAE and MFE Review for Entry Timing Feedback', type: 'lesson',
            summary: 'Use MAE/MFE distribution to identify systematic timing errors and edge leakage.',
            slug: lessonSlug(35, 'Wednesday', 2, 'MAE and MFE Review for Entry Timing Feedback') },
          { number: 3, title: 'Rule Violation Heatmap and Corrective Plan', type: 'lesson',
            summary: 'Build a violation heatmap and assign corrective actions with weekly follow-up.',
            slug: lessonSlug(35, 'Wednesday', 3, 'Rule Violation Heatmap and Corrective Plan') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'High-Pressure Scenario Simulation',
        lessons: [
          { number: 1, title: 'Fast Market Drill: Volatility Spike Execution', type: 'lesson',
            summary: 'Simulate fast-market conditions and apply predefined risk-first execution behavior.',
            slug: lessonSlug(35, 'Thursday', 1, 'Fast Market Drill: Volatility Spike Execution') },
          { number: 2, title: 'News Window Drill: Entry Discipline Under Uncertainty', type: 'lesson',
            summary: 'Practice standing aside, reducing size, or using confirmation entries during event risk.',
            slug: lessonSlug(35, 'Thursday', 2, 'News Window Drill: Entry Discipline Under Uncertainty') },
          { number: 3, title: 'Recovery Drill: Post-Loss Process Stabilization', type: 'lesson',
            summary: 'Use reset protocols to recover process quality after a losing sequence.',
            slug: lessonSlug(35, 'Thursday', 3, 'Recovery Drill: Post-Loss Process Stabilization') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Weekly Execution Review Board',
        lessons: [
          { number: 1, title: 'Top 3 Good Trades and Why They Worked', type: 'lesson',
            summary: 'Extract repeatable behaviors from high-quality trade executions.',
            slug: lessonSlug(35, 'Friday', 1, 'Top 3 Good Trades and Why They Worked') },
          { number: 2, title: 'Top 3 Bad Trades and Root-Cause Diagnosis', type: 'lesson',
            summary: 'Identify process failures, not just outcome failures, and assign fixes.',
            slug: lessonSlug(35, 'Friday', 2, 'Top 3 Bad Trades and Root-Cause Diagnosis') },
          { number: 3, title: 'Execution Upgrade Plan for Next Week', type: 'lesson',
            summary: 'Create targeted process upgrades with measurable execution KPIs.',
            slug: lessonSlug(35, 'Friday', 3, 'Execution Upgrade Plan for Next Week') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Execution Competency Scorecard',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build Your Execution Rubric', type: 'assignment',
            summary: 'Create a rubric scoring preparation, timing, risk discipline, and review quality.',
            slug: lessonSlug(35, 'Saturday', 1, 'Assignment Overview: Build Your Execution Rubric') },
          { number: 2, title: 'Deliverable: 20-Trade Audit with Scores and Notes', type: 'assignment',
            summary: 'Audit 20 trades and submit a scored review with evidence and screenshots.',
            slug: lessonSlug(35, 'Saturday', 2, 'Deliverable: 20-Trade Audit with Scores and Notes') },
          { number: 3, title: 'Action Plan: 3 High-Impact Fixes for Next Cycle', type: 'assignment',
            summary: 'Commit to three process changes with deadlines and verification criteria.',
            slug: lessonSlug(35, 'Saturday', 3, 'Action Plan: 3 High-Impact Fixes for Next Cycle') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 36 - Prop-Firm and Funded Account Challenge Lab - Professional
  // ===========================================================================
  {
    week: 36,
    module: 'Prop-Firm and Funded Account Challenge Lab',
    level: 'Professional',
    description: 'Train specifically for funded account evaluations with challenge-rule engineering, consistency control, and survival-first risk behavior.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Challenge Rule Engineering',
        lessons: [
          { number: 1, title: 'Rulebook Deconstruction and Hidden Failure Triggers', type: 'lesson',
            summary: 'Map challenge rules and identify hidden failure points before day one.',
            slug: lessonSlug(36, 'Monday', 1, 'Rulebook Deconstruction and Hidden Failure Triggers') },
          { number: 2, title: 'Daily Loss, Max Drawdown, and Consistency Constraints', type: 'lesson',
            summary: 'Convert firm rules into concrete position sizing and stop policies.',
            slug: lessonSlug(36, 'Monday', 2, 'Daily Loss, Max Drawdown, and Consistency Constraints') },
          { number: 3, title: 'Challenge Strategy Selection by Rule Compatibility', type: 'lesson',
            summary: 'Choose strategies that fit constraints rather than forcing incompatible approaches.',
            slug: lessonSlug(36, 'Monday', 3, 'Challenge Strategy Selection by Rule Compatibility') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Consistency and Risk Smoothness',
        lessons: [
          { number: 1, title: 'Smoothing PnL Path Without Overtrading', type: 'lesson',
            summary: 'Design trade frequency and size policy to meet consistency criteria sustainably.',
            slug: lessonSlug(36, 'Tuesday', 1, 'Smoothing PnL Path Without Overtrading') },
          { number: 2, title: 'Risk Compression During Drawdown Phases', type: 'lesson',
            summary: 'Apply automatic risk compression to preserve challenge survival probability.',
            slug: lessonSlug(36, 'Tuesday', 2, 'Risk Compression During Drawdown Phases') },
          { number: 3, title: 'Scaling Back Up After Recovery Milestones', type: 'lesson',
            summary: 'Use milestone-based risk restoration instead of emotional size changes.',
            slug: lessonSlug(36, 'Tuesday', 3, 'Scaling Back Up After Recovery Milestones') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Evaluation Simulation Week',
        lessons: [
          { number: 1, title: 'Mock Challenge Day 1 and 2 Execution', type: 'lesson',
            summary: 'Run realistic execution under challenge constraints and capture all metrics.',
            slug: lessonSlug(36, 'Wednesday', 1, 'Mock Challenge Day 1 and 2 Execution') },
          { number: 2, title: 'Mock Challenge Day 3 and 4 Adaptive Control', type: 'lesson',
            summary: 'Adapt strategy behavior to midweek drawdown and opportunity profile changes.',
            slug: lessonSlug(36, 'Wednesday', 2, 'Mock Challenge Day 3 and 4 Adaptive Control') },
          { number: 3, title: 'Mock Challenge Day 5 Finish-Line Decision-Making', type: 'lesson',
            summary: 'Manage end-of-week decisions with rule safety as the highest priority.',
            slug: lessonSlug(36, 'Wednesday', 3, 'Mock Challenge Day 5 Finish-Line Decision-Making') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Performance and Rule Compliance Analytics',
        lessons: [
          { number: 1, title: 'Compliance Dashboard: Real-Time Breach Probability', type: 'lesson',
            summary: 'Track current breach risk and adjust behavior proactively.',
            slug: lessonSlug(36, 'Thursday', 1, 'Compliance Dashboard: Real-Time Breach Probability') },
          { number: 2, title: 'Consistency Score and Daily Return Distribution Analysis', type: 'lesson',
            summary: 'Measure whether your return path satisfies evaluation stability expectations.',
            slug: lessonSlug(36, 'Thursday', 2, 'Consistency Score and Daily Return Distribution Analysis') },
          { number: 3, title: 'Edge Preservation Under Constraint Testing', type: 'lesson',
            summary: 'Verify that your constrained strategy still retains positive expectancy.',
            slug: lessonSlug(36, 'Thursday', 3, 'Edge Preservation Under Constraint Testing') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Challenge Readiness Review',
        lessons: [
          { number: 1, title: 'Pass-Fail Probability Modeling for Next Attempt', type: 'lesson',
            summary: 'Estimate realistic pass probability using your audit metrics.',
            slug: lessonSlug(36, 'Friday', 1, 'Pass-Fail Probability Modeling for Next Attempt') },
          { number: 2, title: 'Pre-Challenge Checklist and Execution Contract', type: 'lesson',
            summary: 'Prepare a final checklist and signed process contract for challenge launch.',
            slug: lessonSlug(36, 'Friday', 2, 'Pre-Challenge Checklist and Execution Contract') },
          { number: 3, title: 'Capital Protection First: No-Ego Operating Rules', type: 'lesson',
            summary: 'Reinforce survival-first rules that prevent emotional rule breaches.',
            slug: lessonSlug(36, 'Friday', 3, 'Capital Protection First: No-Ego Operating Rules') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Funded Challenge Readiness Dossier',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build Your Challenge Dossier', type: 'assignment',
            summary: 'Create a complete challenge-readiness package with plans and controls.',
            slug: lessonSlug(36, 'Saturday', 1, 'Assignment Overview: Build Your Challenge Dossier') },
          { number: 2, title: 'Deliverable: Rule Matrix, Risk Plan, and Simulation Results', type: 'assignment',
            summary: 'Submit all operational artifacts required for a disciplined challenge attempt.',
            slug: lessonSlug(36, 'Saturday', 2, 'Deliverable: Rule Matrix, Risk Plan, and Simulation Results') },
          { number: 3, title: 'Go-No-Go Decision and Improvement Backlog', type: 'assignment',
            summary: 'Make a data-driven go-no-go decision with a prioritized upgrade backlog.',
            slug: lessonSlug(36, 'Saturday', 3, 'Go-No-Go Decision and Improvement Backlog') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 37 - Portfolio Scaling and Capital Growth Lab - Professional
  // ===========================================================================
  {
    week: 37,
    module: 'Portfolio Scaling and Capital Growth Lab',
    level: 'Professional',
    description: 'Develop a practical scaling framework to grow capital responsibly through staged sizing, diversification, and governance-driven portfolio evolution.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Scaling Framework Design',
        lessons: [
          { number: 1, title: 'Capital Tiers and Position Size Escalation Rules', type: 'lesson',
            summary: 'Design staged size escalation tied to objective performance milestones.',
            slug: lessonSlug(37, 'Monday', 1, 'Capital Tiers and Position Size Escalation Rules') },
          { number: 2, title: 'Scaling Risk Without Scaling Drawdown', type: 'lesson',
            summary: 'Use risk-normalized scaling to prevent drawdown from expanding proportionally with capital.',
            slug: lessonSlug(37, 'Monday', 2, 'Scaling Risk Without Scaling Drawdown') },
          { number: 3, title: 'Capacity Testing Across Strategy Components', type: 'lesson',
            summary: 'Test each strategy component for capacity limits before increasing deployment size.',
            slug: lessonSlug(37, 'Monday', 3, 'Capacity Testing Across Strategy Components') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Diversification and Correlation Control',
        lessons: [
          { number: 1, title: 'Alpha Stream Diversification Beyond Pair Selection', type: 'lesson',
            summary: 'Diversify by edge source and strategy horizon, not only by currency pair count.',
            slug: lessonSlug(37, 'Tuesday', 1, 'Alpha Stream Diversification Beyond Pair Selection') },
          { number: 2, title: 'Correlation Stress Analysis for Scaled Books', type: 'lesson',
            summary: 'Stress correlated exposures to detect hidden concentration before scale-up.',
            slug: lessonSlug(37, 'Tuesday', 2, 'Correlation Stress Analysis for Scaled Books') },
          { number: 3, title: 'Risk Budget Rebalancing by Regime and Opportunity', type: 'lesson',
            summary: 'Reallocate risk budgets dynamically with explicit regime and opportunity criteria.',
            slug: lessonSlug(37, 'Tuesday', 3, 'Risk Budget Rebalancing by Regime and Opportunity') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Performance Attribution at Scale',
        lessons: [
          { number: 1, title: 'Contribution Analysis by Strategy and Risk Unit', type: 'lesson',
            summary: 'Measure contribution and efficiency by strategy per risk unit consumed.',
            slug: lessonSlug(37, 'Wednesday', 1, 'Contribution Analysis by Strategy and Risk Unit') },
          { number: 2, title: 'Scaling Winners Without Overfitting Past Conditions', type: 'lesson',
            summary: 'Promote strategy capital with controls against regime-specific overconfidence.',
            slug: lessonSlug(37, 'Wednesday', 2, 'Scaling Winners Without Overfitting Past Conditions') },
          { number: 3, title: 'Retiring Underperforming Strategy Components', type: 'lesson',
            summary: 'Define retirement criteria to free risk budget for higher-quality edges.',
            slug: lessonSlug(37, 'Wednesday', 3, 'Retiring Underperforming Strategy Components') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Operational Scaling and Team Readiness',
        lessons: [
          { number: 1, title: 'Process Scalability: From Solo to Team Operation', type: 'lesson',
            summary: 'Upgrade process documentation and handover standards for team-based scaling.',
            slug: lessonSlug(37, 'Thursday', 1, 'Process Scalability: From Solo to Team Operation') },
          { number: 2, title: 'Control Stack Expansion for Larger AUM', type: 'lesson',
            summary: 'Add governance and monitoring layers required as assets under management grow.',
            slug: lessonSlug(37, 'Thursday', 2, 'Control Stack Expansion for Larger AUM') },
          { number: 3, title: 'Technology and Infrastructure Upgrade Planning', type: 'lesson',
            summary: 'Prioritize infrastructure upgrades based on risk and execution bottlenecks.',
            slug: lessonSlug(37, 'Thursday', 3, 'Technology and Infrastructure Upgrade Planning') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Growth Governance and Investment Committee',
        lessons: [
          { number: 1, title: 'Monthly Investment Committee Format for Scaling Decisions', type: 'lesson',
            summary: 'Use committee governance to approve scaling changes with evidence.',
            slug: lessonSlug(37, 'Friday', 1, 'Monthly Investment Committee Format for Scaling Decisions') },
          { number: 2, title: 'Capital Allocation Change Control and Documentation', type: 'lesson',
            summary: 'Apply change control procedures before modifying allocation or limits.',
            slug: lessonSlug(37, 'Friday', 2, 'Capital Allocation Change Control and Documentation') },
          { number: 3, title: 'Long-Term Capital Growth Roadmap and Milestones', type: 'lesson',
            summary: 'Define 6, 12, and 24-month milestones for sustainable growth.',
            slug: lessonSlug(37, 'Friday', 3, 'Long-Term Capital Growth Roadmap and Milestones') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Portfolio Scaling Blueprint',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build a 12-Month Scaling Plan', type: 'assignment',
            summary: 'Design a complete scaling plan with risk controls and governance checkpoints.',
            slug: lessonSlug(37, 'Saturday', 1, 'Assignment Overview: Build a 12-Month Scaling Plan') },
          { number: 2, title: 'Deliverable: Risk Budgets, Milestones, and Committee Calendar', type: 'assignment',
            summary: 'Submit a professional scaling package for real-world deployment.',
            slug: lessonSlug(37, 'Saturday', 2, 'Deliverable: Risk Budgets, Milestones, and Committee Calendar') },
          { number: 3, title: 'Review: Capacity Limits and Growth Readiness Score', type: 'assignment',
            summary: 'Assess growth readiness with objective capacity and control criteria.',
            slug: lessonSlug(37, 'Saturday', 3, 'Review: Capacity Limits and Growth Readiness Score') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 38 - Professional Mastery Assessment and Elite Track Graduation - Professional
  // ===========================================================================
  {
    week: 38,
    module: 'Professional Mastery Assessment and Elite Track Graduation',
    level: 'Professional',
    description: 'Final mastery phase combining live simulation, measured competency scoring, and elite-level operating standards for professional forex practitioners.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Mastery Benchmark Setup',
        lessons: [
          { number: 1, title: 'Mastery Rubric: Strategy, Execution, Risk, and Governance', type: 'lesson',
            summary: 'Set weighted competency rubric for objective final evaluation.',
            slug: lessonSlug(38, 'Monday', 1, 'Mastery Rubric: Strategy, Execution, Risk, and Governance') },
          { number: 2, title: 'Baseline Assessment and Gap Identification', type: 'lesson',
            summary: 'Run baseline diagnostics to identify final development priorities.',
            slug: lessonSlug(38, 'Monday', 2, 'Baseline Assessment and Gap Identification') },
          { number: 3, title: 'Final Week Operating Contract', type: 'lesson',
            summary: 'Define non-negotiable behavior standards for the final mastery week.',
            slug: lessonSlug(38, 'Monday', 3, 'Final Week Operating Contract') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Mastery Simulation I',
        lessons: [
          { number: 1, title: 'Live-Sim Trade Session with Full Process Capture', type: 'lesson',
            summary: 'Execute and document every decision from setup to review in real time.',
            slug: lessonSlug(38, 'Tuesday', 1, 'Live-Sim Trade Session with Full Process Capture') },
          { number: 2, title: 'Risk Control Challenge Under Adverse Conditions', type: 'lesson',
            summary: 'Demonstrate discipline during adverse market and psychological stress.',
            slug: lessonSlug(38, 'Tuesday', 2, 'Risk Control Challenge Under Adverse Conditions') },
          { number: 3, title: 'Session Debrief and Scorecard Update', type: 'lesson',
            summary: 'Update competency scores with evidence from session performance.',
            slug: lessonSlug(38, 'Tuesday', 3, 'Session Debrief and Scorecard Update') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Mastery Simulation II',
        lessons: [
          { number: 1, title: 'Multi-Scenario Execution and Adaptation Test', type: 'lesson',
            summary: 'Adapt strategy in real time across shifting conditions without violating rules.',
            slug: lessonSlug(38, 'Wednesday', 1, 'Multi-Scenario Execution and Adaptation Test') },
          { number: 2, title: 'Execution Efficiency and Slippage Minimization Drill', type: 'lesson',
            summary: 'Prove execution quality through measurable cost-control metrics.',
            slug: lessonSlug(38, 'Wednesday', 2, 'Execution Efficiency and Slippage Minimization Drill') },
          { number: 3, title: 'Process Consistency Audit', type: 'lesson',
            summary: 'Audit process adherence versus outcome to validate professional maturity.',
            slug: lessonSlug(38, 'Wednesday', 3, 'Process Consistency Audit') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Committee Defense and Review',
        lessons: [
          { number: 1, title: 'Thesis Defense Before Review Panel', type: 'lesson',
            summary: 'Defend trade rationale, risk logic, and alternatives considered.',
            slug: lessonSlug(38, 'Thursday', 1, 'Thesis Defense Before Review Panel') },
          { number: 2, title: 'Risk Governance and Incident Handling Defense', type: 'lesson',
            summary: 'Demonstrate mastery of governance controls and incident response standards.',
            slug: lessonSlug(38, 'Thursday', 2, 'Risk Governance and Incident Handling Defense') },
          { number: 3, title: 'Improvement Plan Negotiation and Approval', type: 'lesson',
            summary: 'Convert panel feedback into an approved next-cycle improvement plan.',
            slug: lessonSlug(38, 'Thursday', 3, 'Improvement Plan Negotiation and Approval') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Final Competency Scoring',
        lessons: [
          { number: 1, title: 'Comprehensive Scorecard Finalization', type: 'lesson',
            summary: 'Finalize weighted competency scoring across all mastery dimensions.',
            slug: lessonSlug(38, 'Friday', 1, 'Comprehensive Scorecard Finalization') },
          { number: 2, title: 'Elite Track Qualification Criteria Review', type: 'lesson',
            summary: 'Apply qualification thresholds for elite-track progression.',
            slug: lessonSlug(38, 'Friday', 2, 'Elite Track Qualification Criteria Review') },
          { number: 3, title: 'Professional Roadmap Commitment Ceremony', type: 'lesson',
            summary: 'Commit to a 12-month professional roadmap with measurable milestones.',
            slug: lessonSlug(38, 'Friday', 3, 'Professional Roadmap Commitment Ceremony') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Final Assignment: Elite Graduation Package',
        lessons: [
          { number: 1, title: 'Assignment Overview: Compile Elite Graduation Submission', type: 'assignment',
            summary: 'Assemble final evidence package across trading, risk, execution, and governance.',
            slug: lessonSlug(38, 'Saturday', 1, 'Assignment Overview: Compile Elite Graduation Submission') },
          { number: 2, title: 'Deliverable: Scorecards, Reports, and 12-Month Action Plan', type: 'assignment',
            summary: 'Submit final scorecards and long-horizon action plan for post-program execution.',
            slug: lessonSlug(38, 'Saturday', 2, 'Deliverable: Scorecards, Reports, and 12-Month Action Plan') },
          { number: 3, title: 'Graduation Decision and Professional Accreditation Record', type: 'assignment',
            summary: 'Complete final accreditation record and archive all supporting documents.',
            slug: lessonSlug(38, 'Saturday', 3, 'Graduation Decision and Professional Accreditation Record') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 39 - Institutional Residency I: Live Desk Shadowing - Professional
  // ===========================================================================
  {
    week: 39,
    module: 'Institutional Residency I: Live Desk Shadowing',
    level: 'Professional',
    description: 'Start residency by emulating institutional desk routines with role clarity, shift handovers, and execution discipline under time pressure.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Desk Onboarding and Role Assignment',
        lessons: [
          { number: 1, title: 'Residency Orientation and Desk Operating Standards', type: 'lesson',
            summary: 'Set standards for communication, execution, and accountability across the residency.',
            slug: lessonSlug(39, 'Monday', 1, 'Residency Orientation and Desk Operating Standards') },
          { number: 2, title: 'Role Rotation: Analyst, Execution, and Risk Supervisor', type: 'lesson',
            summary: 'Assign and rotate roles to build cross-functional operational competence.',
            slug: lessonSlug(39, 'Monday', 2, 'Role Rotation: Analyst, Execution, and Risk Supervisor') },
          { number: 3, title: 'Shift Handover Protocol and Information Integrity', type: 'lesson',
            summary: 'Train robust shift handovers to prevent context loss and execution mistakes.',
            slug: lessonSlug(39, 'Monday', 3, 'Shift Handover Protocol and Information Integrity') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Live Desk Shadow Session I',
        lessons: [
          { number: 1, title: 'Market Open Checklist and Risk Briefing', type: 'lesson',
            summary: 'Run institutional open procedures with explicit risk brief and session priorities.',
            slug: lessonSlug(39, 'Tuesday', 1, 'Market Open Checklist and Risk Briefing') },
          { number: 2, title: 'Execution Shadowing: Order Flow and Timing Decisions', type: 'lesson',
            summary: 'Observe and emulate execution timing under realistic liquidity constraints.',
            slug: lessonSlug(39, 'Tuesday', 2, 'Execution Shadowing: Order Flow and Timing Decisions') },
          { number: 3, title: 'Mid-Session Debrief and Tactical Adjustments', type: 'lesson',
            summary: 'Perform structured debrief and tactical adjustment cycle during session.',
            slug: lessonSlug(39, 'Tuesday', 3, 'Mid-Session Debrief and Tactical Adjustments') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Live Desk Shadow Session II',
        lessons: [
          { number: 1, title: 'News Risk Coordination and Trade Gating', type: 'lesson',
            summary: 'Apply coordinated trade gating around high-impact events.',
            slug: lessonSlug(39, 'Wednesday', 1, 'News Risk Coordination and Trade Gating') },
          { number: 2, title: 'Execution Quality Logging in Real Time', type: 'lesson',
            summary: 'Capture slippage, delay, and compliance metrics while trading.',
            slug: lessonSlug(39, 'Wednesday', 2, 'Execution Quality Logging in Real Time') },
          { number: 3, title: 'Decision Escalation and Override Procedures', type: 'lesson',
            summary: 'Practice escalation when uncertainty exceeds pre-approved thresholds.',
            slug: lessonSlug(39, 'Wednesday', 3, 'Decision Escalation and Override Procedures') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Process Compliance and Review',
        lessons: [
          { number: 1, title: 'Residency Compliance Audit: Rule-by-Rule Check', type: 'lesson',
            summary: 'Audit residency behavior against process and risk standards.',
            slug: lessonSlug(39, 'Thursday', 1, 'Residency Compliance Audit: Rule-by-Rule Check') },
          { number: 2, title: 'Error Taxonomy and Recurrence Prevention', type: 'lesson',
            summary: 'Classify operational errors and define recurrence prevention controls.',
            slug: lessonSlug(39, 'Thursday', 2, 'Error Taxonomy and Recurrence Prevention') },
          { number: 3, title: 'Process Upgrade Sprint Planning', type: 'lesson',
            summary: 'Create a one-week sprint for targeted process improvements.',
            slug: lessonSlug(39, 'Thursday', 3, 'Process Upgrade Sprint Planning') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Residency Scorecard Day',
        lessons: [
          { number: 1, title: 'Competency Scoring: Execution, Risk, and Communication', type: 'lesson',
            summary: 'Score each residency dimension using objective rubrics.',
            slug: lessonSlug(39, 'Friday', 1, 'Competency Scoring: Execution, Risk, and Communication') },
          { number: 2, title: 'Panel Feedback and Individual Development Targets', type: 'lesson',
            summary: 'Convert panel feedback into measurable targets for next residency week.',
            slug: lessonSlug(39, 'Friday', 2, 'Panel Feedback and Individual Development Targets') },
          { number: 3, title: 'Residency I Pass-Fail Criteria Review', type: 'lesson',
            summary: 'Apply transparent pass-fail standards and progression decisions.',
            slug: lessonSlug(39, 'Friday', 3, 'Residency I Pass-Fail Criteria Review') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Residency I Evidence Pack',
        lessons: [
          { number: 1, title: 'Assignment Overview: Compile Residency I Artifacts', type: 'assignment',
            summary: 'Assemble logs, scorecards, and review notes from all sessions.',
            slug: lessonSlug(39, 'Saturday', 1, 'Assignment Overview: Compile Residency I Artifacts') },
          { number: 2, title: 'Deliverable: Compliance Report and Upgrade Backlog', type: 'assignment',
            summary: 'Submit compliance findings and prioritized improvement backlog.',
            slug: lessonSlug(39, 'Saturday', 2, 'Deliverable: Compliance Report and Upgrade Backlog') },
          { number: 3, title: 'Progression Decision: Residency II Eligibility', type: 'assignment',
            summary: 'Document eligibility decision and conditions for progression.',
            slug: lessonSlug(39, 'Saturday', 3, 'Progression Decision: Residency II Eligibility') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 40 - Institutional Residency II: High-Pressure Decisioning - Professional
  // ===========================================================================
  {
    week: 40,
    module: 'Institutional Residency II: High-Pressure Decisioning',
    level: 'Professional',
    description: 'Advance to high-pressure decision scenarios with strict risk governance, multi-strategy coordination, and real-time accountability.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Pressure-Test Framework',
        lessons: [
          { number: 1, title: 'Defining Pressure Scenarios and Response Rules', type: 'lesson',
            summary: 'Define specific pressure scenarios and pre-approved response pathways.',
            slug: lessonSlug(40, 'Monday', 1, 'Defining Pressure Scenarios and Response Rules') },
          { number: 2, title: 'Decision Latency Budgets Under Stress', type: 'lesson',
            summary: 'Set timing budgets to prevent delayed decisions during volatility spikes.',
            slug: lessonSlug(40, 'Monday', 2, 'Decision Latency Budgets Under Stress') },
          { number: 3, title: 'Team Communication Compression Protocols', type: 'lesson',
            summary: 'Use concise communication templates for high-speed coordination.',
            slug: lessonSlug(40, 'Monday', 3, 'Team Communication Compression Protocols') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Stress Session I: Volatility Shock',
        lessons: [
          { number: 1, title: 'Volatility Shock Entry Control Drill', type: 'lesson',
            summary: 'Practice reduced-size and confirmation-based entries during volatility shock.',
            slug: lessonSlug(40, 'Tuesday', 1, 'Volatility Shock Entry Control Drill') },
          { number: 2, title: 'Dynamic Risk Compression in Live Conditions', type: 'lesson',
            summary: 'Apply real-time risk compression to preserve daily risk limits.',
            slug: lessonSlug(40, 'Tuesday', 2, 'Dynamic Risk Compression in Live Conditions') },
          { number: 3, title: 'Post-Shock Recovery and Re-Engagement Rules', type: 'lesson',
            summary: 'Use re-engagement rules to avoid impulsive post-shock trading.',
            slug: lessonSlug(40, 'Tuesday', 3, 'Post-Shock Recovery and Re-Engagement Rules') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Stress Session II: Data and Execution Degradation',
        lessons: [
          { number: 1, title: 'Fallback Decision Trees for Data Instability', type: 'lesson',
            summary: 'Operate safely when key data feeds degrade or conflict.',
            slug: lessonSlug(40, 'Wednesday', 1, 'Fallback Decision Trees for Data Instability') },
          { number: 2, title: 'Execution Degradation Controls and Trade Gating', type: 'lesson',
            summary: 'Gate or halt trading when execution quality drops below threshold.',
            slug: lessonSlug(40, 'Wednesday', 2, 'Execution Degradation Controls and Trade Gating') },
          { number: 3, title: 'Incident Response Lead Rotation Drill', type: 'lesson',
            summary: 'Rotate incident lead responsibilities for resilience and readiness.',
            slug: lessonSlug(40, 'Wednesday', 3, 'Incident Response Lead Rotation Drill') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Governance Under Stress',
        lessons: [
          { number: 1, title: 'Risk Committee Escalation Simulation', type: 'lesson',
            summary: 'Simulate escalation with formal committee-level decisions.',
            slug: lessonSlug(40, 'Thursday', 1, 'Risk Committee Escalation Simulation') },
          { number: 2, title: 'Policy Adherence Audit in Adverse Conditions', type: 'lesson',
            summary: 'Audit policy adherence when pressure is highest.',
            slug: lessonSlug(40, 'Thursday', 2, 'Policy Adherence Audit in Adverse Conditions') },
          { number: 3, title: 'Stress Governance Report Drafting', type: 'lesson',
            summary: 'Draft professional governance report documenting decisions and rationale.',
            slug: lessonSlug(40, 'Thursday', 3, 'Stress Governance Report Drafting') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Residency II Scoring and Advancement',
        lessons: [
          { number: 1, title: 'Pass-Fail Rubric: Stress Resilience and Control Integrity', type: 'lesson',
            summary: 'Score resilience and control behavior against pass-fail rubric.',
            slug: lessonSlug(40, 'Friday', 1, 'Pass-Fail Rubric: Stress Resilience and Control Integrity') },
          { number: 2, title: 'Performance Review Panel and Gap Prioritization', type: 'lesson',
            summary: 'Prioritize highest-impact gaps before final residency phase.',
            slug: lessonSlug(40, 'Friday', 2, 'Performance Review Panel and Gap Prioritization') },
          { number: 3, title: 'Advancement Gate: Residency III Readiness', type: 'lesson',
            summary: 'Decide readiness for final residency and placement simulation.',
            slug: lessonSlug(40, 'Friday', 3, 'Advancement Gate: Residency III Readiness') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Stress-Test Operations Portfolio',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build Stress-Test Portfolio', type: 'assignment',
            summary: 'Compile stress-session evidence and governance artifacts.',
            slug: lessonSlug(40, 'Saturday', 1, 'Assignment Overview: Build Stress-Test Portfolio') },
          { number: 2, title: 'Deliverable: Incident Logs, Decisions, and Controls Audit', type: 'assignment',
            summary: 'Submit complete incident and control audit package.',
            slug: lessonSlug(40, 'Saturday', 2, 'Deliverable: Incident Logs, Decisions, and Controls Audit') },
          { number: 3, title: 'Readiness Statement for Final Residency', type: 'assignment',
            summary: 'Issue formal readiness statement with measurable commitments.',
            slug: lessonSlug(40, 'Saturday', 3, 'Readiness Statement for Final Residency') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 41 - Institutional Residency III: Desk Placement Simulation - Professional
  // ===========================================================================
  {
    week: 41,
    module: 'Institutional Residency III: Desk Placement Simulation',
    level: 'Professional',
    description: 'Run a full desk placement simulation with role-based accountability, multi-session continuity, and institutional reporting standards.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Placement Simulation Setup',
        lessons: [
          { number: 1, title: 'Desk Placement Objectives and Evaluation Criteria', type: 'lesson',
            summary: 'Set placement objectives and transparent final evaluation criteria.',
            slug: lessonSlug(41, 'Monday', 1, 'Desk Placement Objectives and Evaluation Criteria') },
          { number: 2, title: 'Role Assignment and Responsibility Charter', type: 'lesson',
            summary: 'Assign final roles and lock responsibility charter for the week.',
            slug: lessonSlug(41, 'Monday', 2, 'Role Assignment and Responsibility Charter') },
          { number: 3, title: 'Simulation Governance and Escalation Matrix', type: 'lesson',
            summary: 'Finalize escalation matrix and governance lines before go-live.',
            slug: lessonSlug(41, 'Monday', 3, 'Simulation Governance and Escalation Matrix') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Placement Session I',
        lessons: [
          { number: 1, title: 'Session Execution with Full Desk Protocol', type: 'lesson',
            summary: 'Operate under full desk protocol with no procedural shortcuts.',
            slug: lessonSlug(41, 'Tuesday', 1, 'Session Execution with Full Desk Protocol') },
          { number: 2, title: 'Real-Time Risk and Compliance Oversight', type: 'lesson',
            summary: 'Demonstrate continuous risk oversight and compliance adherence.',
            slug: lessonSlug(41, 'Tuesday', 2, 'Real-Time Risk and Compliance Oversight') },
          { number: 3, title: 'Close Report and Performance Attribution', type: 'lesson',
            summary: 'Produce end-of-day report with attribution and process analysis.',
            slug: lessonSlug(41, 'Tuesday', 3, 'Close Report and Performance Attribution') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Placement Session II',
        lessons: [
          { number: 1, title: 'Cross-Session Continuity and Position Management', type: 'lesson',
            summary: 'Manage continuity between sessions with disciplined handovers.',
            slug: lessonSlug(41, 'Wednesday', 1, 'Cross-Session Continuity and Position Management') },
          { number: 2, title: 'Execution Efficiency and Cost Control Benchmarking', type: 'lesson',
            summary: 'Benchmark execution costs against predefined desk targets.',
            slug: lessonSlug(41, 'Wednesday', 2, 'Execution Efficiency and Cost Control Benchmarking') },
          { number: 3, title: 'Midweek Committee Review and Directive Updates', type: 'lesson',
            summary: 'Run committee review and issue directive updates for remaining sessions.',
            slug: lessonSlug(41, 'Wednesday', 3, 'Midweek Committee Review and Directive Updates') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Placement Session III',
        lessons: [
          { number: 1, title: 'Advanced Scenario Handling and Decision Defense', type: 'lesson',
            summary: 'Handle complex scenarios and defend decisions with evidence.',
            slug: lessonSlug(41, 'Thursday', 1, 'Advanced Scenario Handling and Decision Defense') },
          { number: 2, title: 'Operational Incident Drill in Placement Context', type: 'lesson',
            summary: 'Respond to operational incidents while preserving risk integrity.',
            slug: lessonSlug(41, 'Thursday', 2, 'Operational Incident Drill in Placement Context') },
          { number: 3, title: 'Recovery Plan and Control Reinforcement', type: 'lesson',
            summary: 'Deploy recovery plan and verify control reinforcement under pressure.',
            slug: lessonSlug(41, 'Thursday', 3, 'Recovery Plan and Control Reinforcement') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Placement Final Review',
        lessons: [
          { number: 1, title: 'Final Placement Scorecard Compilation', type: 'lesson',
            summary: 'Compile complete scorecard across execution, risk, and governance.',
            slug: lessonSlug(41, 'Friday', 1, 'Final Placement Scorecard Compilation') },
          { number: 2, title: 'Panel Interview and Professional Defense', type: 'lesson',
            summary: 'Defend performance and decision framework before review panel.',
            slug: lessonSlug(41, 'Friday', 2, 'Panel Interview and Professional Defense') },
          { number: 3, title: 'Desk Placement Recommendation Outcome', type: 'lesson',
            summary: 'Issue recommendation outcome and development conditions.',
            slug: lessonSlug(41, 'Friday', 3, 'Desk Placement Recommendation Outcome') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Placement Simulation Dossier',
        lessons: [
          { number: 1, title: 'Assignment Overview: Compile Placement Dossier', type: 'assignment',
            summary: 'Assemble all placement week outputs into one dossier.',
            slug: lessonSlug(41, 'Saturday', 1, 'Assignment Overview: Compile Placement Dossier') },
          { number: 2, title: 'Deliverable: Reports, Scorecards, and Governance Records', type: 'assignment',
            summary: 'Submit full package of reports and governance evidence.',
            slug: lessonSlug(41, 'Saturday', 2, 'Deliverable: Reports, Scorecards, and Governance Records') },
          { number: 3, title: 'Placement Feedback Integration Plan', type: 'assignment',
            summary: 'Create final plan to integrate placement feedback into operations.',
            slug: lessonSlug(41, 'Saturday', 3, 'Placement Feedback Integration Plan') },
        ],
      },
    ],
  },

  // ===========================================================================
  // WEEK 42 - Final Institutional Residency Graduation - Professional
  // ===========================================================================
  {
    week: 42,
    module: 'Final Institutional Residency Graduation',
    level: 'Professional',
    description: 'Complete the full residency with final competency validation, long-term professional operating plan, and graduation certification.',
    days: [
      {
        day: 'Monday', dayIndex: 1, dayTheme: 'Final Baseline and Competency Lock',
        lessons: [
          { number: 1, title: 'Residency Competency Matrix Final Baseline', type: 'lesson',
            summary: 'Lock final baseline before graduation assessments begin.',
            slug: lessonSlug(42, 'Monday', 1, 'Residency Competency Matrix Final Baseline') },
          { number: 2, title: 'Gap Closure Sprint Planning', type: 'lesson',
            summary: 'Plan focused sprint to close final competency gaps.',
            slug: lessonSlug(42, 'Monday', 2, 'Gap Closure Sprint Planning') },
          { number: 3, title: 'Graduation Standards and Accreditation Criteria', type: 'lesson',
            summary: 'Review accreditation criteria and evidence requirements.',
            slug: lessonSlug(42, 'Monday', 3, 'Graduation Standards and Accreditation Criteria') },
        ],
      },
      {
        day: 'Tuesday', dayIndex: 2, dayTheme: 'Final Live Assessment I',
        lessons: [
          { number: 1, title: 'Live Assessment Session: Full Process Integrity', type: 'lesson',
            summary: 'Demonstrate complete process integrity in a live assessment session.',
            slug: lessonSlug(42, 'Tuesday', 1, 'Live Assessment Session: Full Process Integrity') },
          { number: 2, title: 'Risk Governance Adherence Under Performance Pressure', type: 'lesson',
            summary: 'Maintain strict risk governance while pursuing performance objectives.',
            slug: lessonSlug(42, 'Tuesday', 2, 'Risk Governance Adherence Under Performance Pressure') },
          { number: 3, title: 'Assessment Debrief and Scoring Update', type: 'lesson',
            summary: 'Update competency scores based on first assessment evidence.',
            slug: lessonSlug(42, 'Tuesday', 3, 'Assessment Debrief and Scoring Update') },
        ],
      },
      {
        day: 'Wednesday', dayIndex: 3, dayTheme: 'Final Live Assessment II',
        lessons: [
          { number: 1, title: 'Scenario Rotation and Adaptive Decision Quality', type: 'lesson',
            summary: 'Prove adaptive decision quality across rotating market scenarios.',
            slug: lessonSlug(42, 'Wednesday', 1, 'Scenario Rotation and Adaptive Decision Quality') },
          { number: 2, title: 'Execution Benchmark Challenge', type: 'lesson',
            summary: 'Meet predefined execution benchmark thresholds under live pressure.',
            slug: lessonSlug(42, 'Wednesday', 2, 'Execution Benchmark Challenge') },
          { number: 3, title: 'Control Integrity Verification', type: 'lesson',
            summary: 'Verify control integrity with zero critical policy breaches.',
            slug: lessonSlug(42, 'Wednesday', 3, 'Control Integrity Verification') },
        ],
      },
      {
        day: 'Thursday', dayIndex: 4, dayTheme: 'Final Defense and Accreditation Review',
        lessons: [
          { number: 1, title: 'Comprehensive Defense Before Accreditation Panel', type: 'lesson',
            summary: 'Defend full operating model and performance evidence before panel.',
            slug: lessonSlug(42, 'Thursday', 1, 'Comprehensive Defense Before Accreditation Panel') },
          { number: 2, title: 'Risk and Compliance Record Verification', type: 'lesson',
            summary: 'Verify complete risk and compliance record for accreditation.',
            slug: lessonSlug(42, 'Thursday', 2, 'Risk and Compliance Record Verification') },
          { number: 3, title: 'Final Improvement Commitments and Governance Pact', type: 'lesson',
            summary: 'Commit to post-graduation governance and improvement obligations.',
            slug: lessonSlug(42, 'Thursday', 3, 'Final Improvement Commitments and Governance Pact') },
        ],
      },
      {
        day: 'Friday', dayIndex: 5, dayTheme: 'Graduation Decision Day',
        lessons: [
          { number: 1, title: 'Final Score Aggregation and Accreditation Outcome', type: 'lesson',
            summary: 'Aggregate final scores and determine accreditation outcome.',
            slug: lessonSlug(42, 'Friday', 1, 'Final Score Aggregation and Accreditation Outcome') },
          { number: 2, title: 'Professional Placement Path and Career Track Mapping', type: 'lesson',
            summary: 'Map post-graduation placement path and career track options.',
            slug: lessonSlug(42, 'Friday', 2, 'Professional Placement Path and Career Track Mapping') },
          { number: 3, title: 'Graduation Ceremony and Institutional Oath', type: 'lesson',
            summary: 'Complete graduation with formal professional standards commitment.',
            slug: lessonSlug(42, 'Friday', 3, 'Graduation Ceremony and Institutional Oath') },
        ],
      },
      {
        day: 'Saturday', dayIndex: 6, dayTheme: 'Assignment: Final Residency Accreditation Archive',
        lessons: [
          { number: 1, title: 'Assignment Overview: Build Final Accreditation Archive', type: 'assignment',
            summary: 'Assemble final archive with complete residency evidence.',
            slug: lessonSlug(42, 'Saturday', 1, 'Assignment Overview: Build Final Accreditation Archive') },
          { number: 2, title: 'Deliverable: Master Portfolio, Scorecards, and Governance Artifacts', type: 'assignment',
            summary: 'Submit master portfolio with all scorecards and governance records.',
            slug: lessonSlug(42, 'Saturday', 2, 'Deliverable: Master Portfolio, Scorecards, and Governance Artifacts') },
          { number: 3, title: 'Certification Archive and Long-Horizon Operating Plan', type: 'assignment',
            summary: 'Finalize certification archive and 24-month operating plan.',
            slug: lessonSlug(42, 'Saturday', 3, 'Certification Archive and Long-Horizon Operating Plan') },
        ],
      },
    ],
  },
];

// â”€â”€â”€ Flat Lesson Record Builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function getAllLessons(): LessonRecord[] {
  const records: LessonRecord[] = [];
  let index = 0;
  for (const week of courseCurriculum) {
    for (const daySet of week.days) {
      for (const lesson of daySet.lessons) {
        records.push({
          slug: lesson.slug,
          week: week.week,
          day: daySet.day,
          dayIndex: daySet.dayIndex,
          lessonNumber: lesson.number,
          lessonIndex: index++,
          module: week.module,
          level: week.level,
          dayTheme: daySet.dayTheme,
          title: lesson.title,
          summary: lesson.summary,
          type: lesson.type,
        });
      }
    }
  }
  return records;
}

export function getLessonBySlug(slug: string): LessonRecord | null {
  return getAllLessons().find((l) => l.slug === slug) ?? null;
}

export function getAdjacentLessons(slug: string): { previous: LessonRecord | null; next: LessonRecord | null } {
  const all = getAllLessons();
  const idx = all.findIndex((l) => l.slug === slug);
  if (idx < 0) return { previous: null, next: null };
  return { previous: idx > 0 ? all[idx - 1]! : null, next: idx < all.length - 1 ? all[idx + 1]! : null };
}

/** Return the 3 lessons for a given week and day */
export function getDayLessons(week: number, day: CurriculumDay): LessonRecord[] {
  return getAllLessons().filter((l) => l.week === week && l.day === day);
}

/** Return the day topic set metadata (theme + lessons) for a given week/day */
export function getDayTopicSet(week: number, day: CurriculumDay): DailyTopicSet | null {
  const weekRecord = courseCurriculum.find((item) => item.week === week);
  if (!weekRecord) return null;
  return weekRecord.days.find((item) => item.day === day) ?? null;
}

/** Return all lessons for a specific module (week) */
export function getModuleLessons(week: number): LessonRecord[] {
  return getAllLessons().filter((l) => l.week === week);
}

// â”€â”€â”€ Legacy Compatibility Layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Retained so existing pages/components that use forexCourseCurriculum, getCurriculumTopic,
// getCurriculumTopicRecord, etc. continue to compile without changes.

export const forexCourseCurriculum: CurriculumWeek[] = courseCurriculum.map((week) => ({
  week: week.week,
  module: week.module,
  level: week.level,
  topics: Object.fromEntries(
    week.days.map((d) => [d.day, d.dayTheme])
  ) as Record<CurriculumDay, string>,
}));

function slugifyTopic(title: string, week: number, day: CurriculumDay) {
  return `${week}-${day.toLowerCase()}-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
}

function buildTopicSummary(title: string, module: string, day: CurriculumDay, isAssignment: boolean) {
  if (isAssignment) {
    return `This ${day.toLowerCase()} assignment converts the ${module.toLowerCase()} lesson flow into a practical exercise.`;
  }
  return `${title} is part of the ${module.toLowerCase()} module and gives traders a focused lesson on the concept and how to apply it.`;
}

export function getAllCurriculumTopics(): CurriculumTopicRecord[] {
  return forexCourseCurriculum.flatMap((week) =>
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
  );
}

export function getCurriculumTopic(week: number, day: CurriculumDay): string | null {
  return forexCourseCurriculum.find((item) => item.week === week)?.topics[day] ?? null;
}

export function getCurriculumWeek(week: number): CurriculumWeek | null {
  return forexCourseCurriculum.find((item) => item.week === week) ?? null;
}

export function getCurriculumTopicRecord(week: number, day: CurriculumDay): CurriculumTopicRecord | null {
  return getAllCurriculumTopics().find((t) => t.week === week && t.day === day) ?? null;
}

export function getCurriculumTopicRecordBySlug(slug: string): CurriculumTopicRecord | null {
  return getAllCurriculumTopics().find((t) => t.slug === slug) ?? null;
}

export function getAdjacentCurriculumTopics(slug: string) {
  const topics = getAllCurriculumTopics();
  const index = topics.findIndex((t) => t.slug === slug);
  return {
    previous: index > 0 ? topics[index - 1] : null,
    next: index >= 0 && index < topics.length - 1 ? topics[index + 1] : null,
  };
}

// â”€â”€â”€ Legacy forexCourseCurriculum definition removed (now derived above) â”€â”€â”€â”€â”€
export const _legacyCompatibilityNote = 'forexCourseCurriculum is now derived from courseCurriculum';
