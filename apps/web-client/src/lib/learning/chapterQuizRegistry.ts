/**
 * Chapter quiz registry.
 *
 * Each chapter (week) has exactly 25 questions:
 *   - 20 multiple-choice (MCQ) questions with 4 options
 *   - 5 fill-in-the-gap questions with accepted answers
 *
 * Answers and explanations are shown to the student after submitting the quiz.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type MCQQuestion = {
  id: string;
  type: 'mcq';
  question: string;
  options: [string, string, string, string];
  /** 0-based index of the correct option */
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export type FillQuestion = {
  id: string;
  type: 'fill';
  /** Use ___ to denote the blank in the question text */
  question: string;
  /** Primary display answer shown in the results view */
  answer: string;
  /** All acceptable answers — compared case-insensitively and trimmed */
  acceptedAnswers: string[];
  explanation: string;
};

export type QuizQuestion = MCQQuestion | FillQuestion;

export type ChapterQuiz = {
  week: number;
  chapterTitle: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  description: string;
  estimatedMinutes: number;
  questions: QuizQuestion[];
};

// ─── Registry ────────────────────────────────────────────────────────────────

const REGISTRY: Record<number, ChapterQuiz> = {

  // ══════════════════════════════════════════════════════════════════════════
  // WEEK 1 · Forex Ground Zero · Beginner
  // ══════════════════════════════════════════════════════════════════════════
  1: {
    week: 1,
    chapterTitle: 'Forex Ground Zero',
    level: 'Beginner',
    description:
      'Test your beginner-first understanding of what forex is, why it exists, how pricing works, when liquidity moves, and the core risk realities every new trader must know.',
    estimatedMinutes: 25,
    questions: [

      // ── Multiple Choice (Q1–Q20) ──────────────────────────────────────────

      {
        id: 'w1-q1',
        type: 'mcq',
        question:
          'Which of the following is considered the single largest long-term driver of capital flows between currencies?',
        options: [
          'GDP growth differential between two countries',
          'Interest rate differentials set by central banks',
          'Trade balance surplus of the stronger economy',
          'Employment data released by the stronger economy',
        ],
        correctIndex: 1,
        explanation:
          'Interest rate differentials are the primary driver of long-term institutional capital flows. Higher-yielding currencies attract investment capital from lower-yielding ones, creating sustained directional pressure on exchange rates.',
      },

      {
        id: 'w1-q2',
        type: 'mcq',
        question:
          'When an actual economic data release comes in significantly above the market consensus forecast, what typically happens to the related currency immediately after?',
        options: [
          'It weakens because the positive expectation was already priced in',
          'It strengthens due to the positive surprise relative to expectations',
          'It remains unchanged because forex markets ignore economic releases',
          'It weakens due to immediate profit-taking on the announcement',
        ],
        correctIndex: 1,
        explanation:
          'Forex markets react to surprises — the difference between actual and consensus. A positive surprise (actual > consensus) triggers buying of the related currency as traders reprice based on the better-than-expected data.',
      },

      {
        id: 'w1-q3',
        type: 'mcq',
        question:
          'Which macroeconomic indicator most directly determines central bank interest rate decisions?',
        options: [
          'GDP growth rate',
          'Employment/non-farm payrolls',
          'Inflation (CPI / PCE)',
          'Trade balance',
        ],
        correctIndex: 2,
        explanation:
          'Inflation is the most directly relevant indicator for central banks — their primary mandate is price stability. Rising inflation leads to rate hike expectations; falling inflation leads to rate cut expectations, which in turn drives major currency moves.',
      },

      {
        id: 'w1-q4',
        type: 'mcq',
        question:
          'The "buy the rumor, sell the news" dynamic in forex most accurately describes which market behavior?',
        options: [
          'Buying a currency when a news headline appears and selling after the second confirmation',
          'Prices moving in anticipation of expected data, then reversing once the data is confirmed',
          'Buying the currency with the highest interest rate rumor ahead of the central bank meeting',
          'Selling after any scheduled central bank announcement regardless of the outcome',
        ],
        correctIndex: 1,
        explanation:
          'When outcome is fully priced in before the event, the release triggers "sell the news" reversals even on positive data. Understanding this phenomenon prevents traders from buying breakouts that immediately reverse on confirmed announcements.',
      },

      {
        id: 'w1-q5',
        type: 'mcq',
        question:
          'EUR/USD is classified as which type of currency pair?',
        options: [
          'Minor pair',
          'Exotic pair',
          'Major pair',
          'Cross pair',
        ],
        correctIndex: 2,
        explanation:
          'Major pairs are the most traded currency pairs globally and all include the US Dollar. EUR/USD is the world\'s most traded pair and is the defining example of a major pair.',
      },

      {
        id: 'w1-q6',
        type: 'mcq',
        question:
          'In the forex quote EUR/USD = 1.0850, which is the quote currency and what does 1.0850 represent?',
        options: [
          'EUR is the quote currency; it costs 1.0850 USD to buy 1 EUR',
          'USD is the quote currency; it costs 1.0850 USD to buy 1 EUR',
          'USD is the quote currency; it costs 1.0850 EUR to buy 1 USD',
          'EUR is the quote currency; 1.0850 is the spread between bid and ask',
        ],
        correctIndex: 1,
        explanation:
          'In EUR/USD, EUR is the base currency and USD is the quote currency. The price of 1.0850 means you need 1.0850 US Dollars to buy 1 Euro. The quote currency always tells you the cost expressed in that currency.',
      },

      {
        id: 'w1-q7',
        type: 'mcq',
        question:
          'The spread in a forex quote is best defined as:',
        options: [
          'The difference between the daily opening and closing price',
          'The distance between the daily high and the daily low',
          'The difference between the bid price and the ask price',
          'The commission charged by the broker per standard lot',
        ],
        correctIndex: 2,
        explanation:
          'The spread is the gap between the bid (what the market will buy from you) and the ask (what the market will sell to you). It represents the broker\'s primary source of income on each trade and the immediate cost of entry for the trader.',
      },

      {
        id: 'w1-q8',
        type: 'mcq',
        question:
          'A cross rate currency pair is best defined as:',
        options: [
          'Any pair that moved against market expectations in the current session',
          'A pair that contains the US Dollar as the quote currency only',
          'A currency pair that does not include the US Dollar on either side',
          'A pair involving at least one emerging market currency',
        ],
        correctIndex: 2,
        explanation:
          'Cross rates (or crosses) exclude the US Dollar from both sides. Examples include EUR/GBP, GBP/JPY, and AUD/NZD. Their prices are effectively derived by crossing two USD pairs — hence the name.',
      },

      {
        id: 'w1-q9',
        type: 'mcq',
        question:
          'The London trading session opens at approximately what time in GMT?',
        options: [
          '00:00 GMT (midnight)',
          '05:00 GMT',
          '07:00 GMT',
          '13:00 GMT',
        ],
        correctIndex: 2,
        explanation:
          'The London session opens at approximately 07:00 GMT (excluding seasonal daylight saving adjustments). It is the largest single trading session by volume and typically sets the directional tone for the day on major pairs.',
      },

      {
        id: 'w1-q10',
        type: 'mcq',
        question:
          'When does the highest average volatility in the forex market typically occur?',
        options: [
          'During the Tokyo/Asia session (00:00–07:00 GMT)',
          'During the London–New York overlap window (13:00–16:00 GMT)',
          'During the Pacific session (21:00–00:00 GMT)',
          'During the midnight transition from Friday to Saturday',
        ],
        correctIndex: 1,
        explanation:
          'The London–New York overlap (roughly 13:00–16:00 GMT) concentrates the institutional flow of two of the world\'s largest financial centres simultaneously. This produces the highest average range and trading volume of the entire trading day.',
      },

      {
        id: 'w1-q11',
        type: 'mcq',
        question:
          'Why do EUR/USD price range patterns typically compress and narrow during the Asian trading session?',
        options: [
          'European central banks restrict EUR/USD trading during overnight hours',
          'The institutional order flow for this pair is concentrated in European and US business hours',
          'Asian institutional traders systematically avoid EUR/USD in favour of USD/JPY',
          'The Pacific session creates inverse range compression on all USD-based pairs',
        ],
        correctIndex: 1,
        explanation:
          'EUR/USD liquidity is tied to the activity of European and US participants. During the Asian session, these participants are largely absent, so the pair trades in tighter ranges with lower volume — classic off-session behaviour for a non-Asian pair.',
      },

      {
        id: 'w1-q12',
        type: 'mcq',
        question:
          'For a JPY-quoted pair such as USD/JPY (e.g., quoted at 149.123), what represents one pip?',
        options: [
          '0.00001 (the 5th decimal place)',
          '0.01 (the 2nd decimal place)',
          '0.001 (the 3rd decimal place)',
          '1.00 (one full unit of JPY)',
        ],
        correctIndex: 1,
        explanation:
          'JPY pairs are conventionally quoted to 3 decimal places, and the pip is the second decimal (0.01). For USD/JPY at 149.123, a move from 149.123 to 149.133 represents one pip. This differs from most pairs where the pip is the 4th decimal (0.0001).',
      },

      {
        id: 'w1-q13',
        type: 'mcq',
        question:
          'A standard lot in forex represents how many units of the base currency?',
        options: [
          '1,000 units',
          '10,000 units',
          '100,000 units',
          '1,000,000 units',
        ],
        correctIndex: 2,
        explanation:
          'A standard lot = 100,000 units of the base currency. For EUR/USD, one standard lot means you are buying or selling 100,000 Euros. This is the baseline lot size from which mini (10,000) and micro (1,000) lots are derived.',
      },

      {
        id: 'w1-q14',
        type: 'mcq',
        question:
          'A micro lot represents how many units of the base currency?',
        options: [
          '100 units',
          '1,000 units',
          '10,000 units',
          '100,000 units',
        ],
        correctIndex: 1,
        explanation:
          'The lot hierarchy is: Standard = 100,000 units, Mini = 10,000 units, Micro = 1,000 units. Micro lots are widely used by beginners to apply proper risk sizing on smaller account balances.',
      },

      {
        id: 'w1-q15',
        type: 'mcq',
        question:
          'For a standard lot on EUR/USD, approximately how much is one pip worth in USD?',
        options: [
          '$0.10',
          '$1.00',
          '$10.00',
          '$100.00',
        ],
        correctIndex: 2,
        explanation:
          'On a EUR/USD standard lot (100,000 units), each pip (0.0001) is worth approximately $10. This is a fundamental position-sizing reference: a 10-pip stop on a standard lot = $100 risk, a 50-pip stop = $500 risk.',
      },

      {
        id: 'w1-q16',
        type: 'mcq',
        question:
          'The body of a candlestick represents which element of price action?',
        options: [
          'The highest and lowest prices reached during the period',
          'The distance between the opening price and the closing price',
          'The total range of the candle including upper and lower wicks',
          'The cumulative volume traded during the candle period',
        ],
        correctIndex: 1,
        explanation:
          'The body shows the open-to-close range — the distance and direction between where price started and where it finished. A large body indicates a decisive session; a small body shows indecision. The wicks show the extremes tested beyond the open/close range.',
      },

      {
        id: 'w1-q17',
        type: 'mcq',
        question:
          'A bearish engulfing candlestick pattern is correctly identified when:',
        options: [
          'A large bullish candle forms over and fully contains the prior bearish candle',
          'A small red candle appears immediately followed by a large green candle',
          'A large bearish candle\'s body fully overlaps and covers the prior bullish candle\'s body',
          'Any candle with a lower close than the previous candle appears at resistance',
        ],
        correctIndex: 2,
        explanation:
          'A bearish engulfing requires the current bearish (red/black) candle\'s body to fully contain (engulf) the body of the immediately preceding bullish candle. The size and completeness of the engulf indicates the strength of the reversal signal.',
      },

      {
        id: 'w1-q18',
        type: 'mcq',
        question:
          'A candle with a very small body and a significantly long lower wick forming at a key support level most likely indicates:',
        options: [
          'Strong selling momentum building for a continuation move lower',
          'Rejection of lower prices and potential reversal of the bearish move',
          'Market consolidation within a range before a neutral breakout',
          'Institutional distribution on the close of the prior session',
        ],
        correctIndex: 1,
        explanation:
          'A long lower wick shows that price traded well below the open but was bought back up before the close — the wick is evidence of rejection. At a support level, this is a bullish signal: sellers tried to push lower, failed, and buyers stepped in with conviction.',
      },

      {
        id: 'w1-q19',
        type: 'mcq',
        question:
          'Which approach best describes using multiple timeframes to confirm candlestick signals?',
        options: [
          'Trade only on the 1-minute chart where candle formations are most frequent',
          'Use only the execution timeframe candle signal with a very tight stop loss',
          'Align the execution candle signal direction with the bias from a higher timeframe',
          'Trade any candle signal that forms within 5 minutes of a major news release',
        ],
        correctIndex: 2,
        explanation:
          'Higher-timeframe alignment dramatically improves the probability of a candle signal following through. When an H1 bearish engulfing at resistance aligns with a bearish H4 bias, both timeframes agree — that confluence is what distinguishes high-probability signals from noise.',
      },

      {
        id: 'w1-q20',
        type: 'mcq',
        question:
          'Why do candlestick signals on EUR/USD tend to produce less reliable follow-through during the Asian trading session?',
        options: [
          'Asian financial regulators restrict directional trading of EUR/USD pairs',
          'Lower session liquidity produces tighter ranges and weaker institutional follow-through on signals',
          'Institutional algorithms only execute orders during European and US market hours',
          'EUR/USD pip values are smaller during the Asian session due to reduced leverage',
        ],
        correctIndex: 1,
        explanation:
          'Session liquidity directly affects how much weight to assign a candle signal. During the Asian session, EUR/USD lacks the institutional volume needed to sustain directional moves, making candle breakouts and reversals less reliable despite appearing technically valid on the chart.',
      },

      // ── Fill in the Gap (Q21–Q25) ─────────────────────────────────────────

      {
        id: 'w1-q21',
        type: 'fill',
        question:
          'The most important macroeconomic variable in forex trading is ___ because it directly determines central bank interest rate policy.',
        answer: 'inflation',
        acceptedAnswers: ['inflation', 'cpi', 'consumer price index', 'price inflation', 'inflation rate'],
        explanation:
          'Inflation is the primary mandate variable for all major central banks. Whether inflation is rising, stable, or falling dictates whether a central bank will hike, hold, or cut rates — which then drives interest rate differentials and long-term capital flows.',
      },

      {
        id: 'w1-q22',
        type: 'fill',
        question:
          'In the forex quote GBP/USD = 1.2800, GBP is the ___ currency and USD is the quote currency.',
        answer: 'base',
        acceptedAnswers: ['base', 'base currency'],
        explanation:
          'In any currency pair, the first listed currency (left of the slash) is always the base currency. The price tells you how many units of the quote currency are needed to buy one unit of the base. In GBP/USD, GBP is the base you are buying or selling.',
      },

      {
        id: 'w1-q23',
        type: 'fill',
        question:
          'The London–New York overlap, which runs approximately from 13:00 to 16:00 ___, is typically the highest liquidity and volatility window of the trading day.',
        answer: 'GMT',
        acceptedAnswers: ['gmt', 'utc', 'greenwich mean time', 'coordinated universal time'],
        explanation:
          'All session times in professional forex trading are referenced in GMT (or UTC, which is equivalent for practical purposes). The 13:00–16:00 GMT window overlaps both European and North American institutional trading hours, concentrating the most volume into the fewest hours.',
      },

      {
        id: 'w1-q24',
        type: 'fill',
        question:
          'For a standard lot on EUR/USD, one pip is worth approximately USD ___.',
        answer: '10',
        acceptedAnswers: ['10', '$10', 'usd 10', '10 usd', 'ten', '10.00'],
        explanation:
          'On a 100,000-unit standard lot of EUR/USD, the pip value (0.0001 of the quote currency USD) equals 0.0001 x 100,000 = $10. This is the foundation of position sizing — knowing the dollar value of each pip allows you to calculate exact risk per trade.',
      },

      {
        id: 'w1-q25',
        type: 'fill',
        question:
          'A candlestick\'s ___ location — measured by where the close sits within the total candle range — reveals whether buyers or sellers dominated the period.',
        answer: 'close',
        acceptedAnswers: ['close', 'closing', 'close location', 'closing location', 'relative close'],
        explanation:
          'The close location within the range is one of the most important pieces of information in a candle. A close in the upper portion of the range signals bullish dominance even if the candle is small. A close in the lower portion signals bearish dominance. It is distinct from the body alone because it accounts for the wick context.',
      },
    ],
  },

};

// ─── Accessor ────────────────────────────────────────────────────────────────

/**
 * Returns the chapter quiz for a given week number, or null if none exists.
 */
export function getChapterQuiz(week: number): ChapterQuiz | null {
  return REGISTRY[week] ?? null;
}

/**
 * Returns all weeks that have a quiz registered.
 */
export function getAvailableQuizWeeks(): number[] {
  return Object.keys(REGISTRY).map(Number).sort((a, b) => a - b);
}
