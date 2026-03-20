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
  level: 'Beginner' | 'Intermediate';
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
  /** 0-based absolute position across all 108 lessons */
  lessonIndex: number;
  module: string;
  level: 'Beginner' | 'Intermediate';
  dayTheme: string;
  title: string;
  summary: string;
  type: 'lesson' | 'assignment';
};

// â”€â”€â”€ Legacy Types (kept for backward compatibility) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
