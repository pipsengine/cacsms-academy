import { GoogleGenAI } from '@google/genai';
import { getDayLessons, type LessonRecord } from '@/lib/learning/curriculum';
import { getStaticLessonContent } from './lessonContentRegistry.ts';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type TopicType = 'lesson' | 'assignment';

export type ForexCourseUnitInput = {
  topic_title: string;
  week_number: number;
  day_of_week: DayOfWeek;
  topic_type: TopicType;
};

export type ForexCourseUnitOutput = {
  title: string;
  summary: string;
  content: string;
  sections: string[];
  example: string;
  is_assignment: boolean;
  assignment: string;
  difficulty_level: 'Beginner' | 'Intermediate';
  image_prompt: string;
};

const REQUIRED_SECTIONS = [
  'Introduction',
  'Key Concepts',
  'Detailed Explanation',
  'Example',
  'Practical Application',
  'Key Takeaways',
];

const DEFAULT_IMAGE_PROMPT = 'A clean educational forex illustration showing charts, patterns, or annotated examples, minimal clutter, high-quality, professional style';

type LessonContext = {
  lesson: LessonRecord | null;
  dayLessons: LessonRecord[];
};

const SCENARIO_BY_DAY: Record<DayOfWeek, string> = {
  Monday: 'London open momentum after an economic release',
  Tuesday: 'session continuation after early pullback during London-New York overlap',
  Wednesday: 'mid-week structure test around a prior swing level',
  Thursday: 'pre-event compression and breakout behavior around key levels',
  Friday: 'late-week profit-taking and reversal pressure near weekly extremes',
  Saturday: 'journal review and process refinement using completed chart history',
};

const PAIR_CANDIDATES = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'EUR/JPY', 'GBP/JPY'];
const TIMEFRAME_CANDIDATES = ['M15', 'H1', 'H4'];
const CATALYST_CANDIDATES = [
  'a CPI surprise',
  'a central-bank speech',
  'a prior day high sweep',
  'a session-open volatility burst',
  'a failed breakout retest',
  'a range expansion after compression',
];
const CONFIRMATION_CANDIDATES = [
  'a decisive body close beyond the trigger level',
  'a rejection wick followed by continuation close',
  'a clean retest and hold above/below structure',
  'a momentum candle with strong close location',
  'a lower-timeframe structure break in trade direction',
];
const INVALIDATION_CANDIDATES = [
  'beyond the sweep extreme',
  'past the invalidation swing point',
  'outside the structure zone that invalidates the setup',
  'beyond the most recent correction pivot',
  'past the opposite edge of the entry range',
];
const TARGET_CANDIDATES = [
  'the next liquidity pool',
  'the nearest higher-timeframe reaction level',
  'the opposite side of the active range',
  'the prior session high/low',
  'the measured move projection based on impulse leg',
];
const MISTAKE_LIBRARY = [
  'executing before full confirmation appears',
  'using fixed pip stops that ignore structure',
  'forcing entries during low-liquidity periods',
  'moving stops because of emotional discomfort',
  'taking partial profits without a predefined rule',
  'ignoring multi-timeframe context before entry',
  'chasing price after missing the planned trigger',
  'skipping post-trade review when the outcome is positive',
];

const INTRO_VARIANTS = [
  'This lesson turns the concept into a step-by-step execution routine you can repeat in live conditions.',
  'The focus here is not theory alone; it is translating the idea into decisions you can make quickly and consistently.',
  'You will treat this subtopic as an execution model with explicit context, trigger, and risk conditions.',
];

const DETAIL_VARIANTS = [
  'The workflow is context first, then trigger validation, then risk framing. If context is weak, you skip. If trigger is missing, you wait. If invalidation is unclear, you do not enter.',
  'Execution quality improves when each decision is sequenced: map structure, confirm participation, and define risk before clicking. This keeps the process objective under pressure.',
  'Consistency comes from sequence discipline. First locate the structural condition, then verify trigger quality, then anchor stop and target to invalidation and liquidity.',
];

const TAKEAWAY_VARIANTS = [
  'A valid setup is one that matches the written process, not one that simply wins.',
  'Your edge is preserved by filtering and discipline, not by adding more indicators.',
  'Process adherence is the metric that compounds over many trades.',
  'The lesson is complete only when the rule can be executed and reviewed objectively.',
];

const CONTEXT_BULLET_PREFIXES = [
  'Day Theme Context',
  'Session Focus',
  'Execution Lens',
  'Primary Context',
];

const CONSISTENCY_VARIANTS = [
  'At this level, consistency beats complexity. One precise model repeated with discipline outperforms strategy-hopping.',
  'Execution consistency is the edge multiplier here. Keep one model, one rule-set, and one review loop.',
  'Progress comes from repeatability: apply the same decision sequence until it is stable under pressure.',
];

const PRACTICAL_PREFIXES = [
  'Execution drill',
  'Desk routine',
  'Live-practice sequence',
  'Application workflow',
];

const PROCESS_EDGE_VARIANTS = [
  'Your process is the edge container; outcomes fluctuate, process quality compounds.',
  'The repeatable edge is procedural: context, trigger, and risk discipline in order.',
  'Long-term performance is built by rule adherence, not isolated winning trades.',
];

type RecentUnitEntry = { lessonKey: string; corpus: string };

const RECENT_UNIT_TEXTS: RecentUnitEntry[] = [];
const RECENT_UNIT_CAP = 80;
const DUPLICATE_SIMILARITY_THRESHOLD = 0.62;

function sentenceCount(text: string): number {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function wordCount(text: string): number {
  return text
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function hashText(text: string): number {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickBySeed<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function buildSeed(input: ForexCourseUnitInput, context: LessonContext, variantSalt = 0): number {
  const identity = [
    String(input.week_number),
    input.day_of_week,
    context.lesson?.slug ?? input.topic_title,
    context.lesson?.title ?? '',
    String(variantSalt),
  ].join('|');
  return hashText(identity);
}

function extractConceptBullets(context: LessonContext, input: ForexCourseUnitInput): string[] {
  const source = (context.lesson?.summary ?? input.topic_title)
    .replace(/\s+/g, ' ')
    .trim();

  const chunks = source
    .split(/,| and |\.|:|\u2014| - /i)
    .map((part) => part.trim())
    .filter((part) => part.length > 18);

  const unique: string[] = [];
  for (const chunk of chunks) {
    const normalized = chunk.toLowerCase();
    if (!unique.some((item) => item.toLowerCase() === normalized)) {
      unique.push(chunk);
    }
    if (unique.length === 3) break;
  }

  if (unique.length >= 3) return unique;

  return [
    `Core lens: ${context.lesson?.title ?? input.topic_title}.`,
    `Execution context: ${context.lesson?.dayTheme ?? input.topic_title}.`,
    `Module progression: ${context.lesson?.module ?? `Week ${input.week_number} curriculum`}.`,
  ];
}

function buildUniqueExample(context: LessonContext, input: ForexCourseUnitInput, seed: number): string {
  const pair = pickBySeed(PAIR_CANDIDATES, seed, 1);
  const timeframe = pickBySeed(TIMEFRAME_CANDIDATES, seed, 2);
  const catalyst = pickBySeed(CATALYST_CANDIDATES, seed, 3);
  const confirmation = pickBySeed(CONFIRMATION_CANDIDATES, seed, 4);
  const invalidation = pickBySeed(INVALIDATION_CANDIDATES, seed, 5);
  const target = pickBySeed(TARGET_CANDIDATES, seed, 6);

  return [
    `During ${SCENARIO_BY_DAY[input.day_of_week]}, ${pair} on ${timeframe} reacts to ${catalyst}.`,
    `The setup is valid only after ${confirmation}.`,
    `Risk is placed ${invalidation}, while the first objective is ${target}.`,
    `The review then scores whether execution matched ${context.lesson?.title ?? input.topic_title} rather than just focusing on P/L.`,
  ].join(' ');
}

function buildMistakeBullets(seed: number): string[] {
  return [
    `- ${pickBySeed(MISTAKE_LIBRARY, seed, 0)}.`,
    `- ${pickBySeed(MISTAKE_LIBRARY, seed, 2)}.`,
    `- ${pickBySeed(MISTAKE_LIBRARY, seed, 5)}.`,
  ];
}

function buildUnitCorpus(unit: ForexCourseUnitOutput): string {
  return `${unit.title}\n${unit.summary}\n${unit.content}\n${unit.example}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLessonKey(input: ForexCourseUnitInput): string {
  return [String(input.week_number), input.day_of_week, input.topic_title.toLowerCase().trim(), input.topic_type].join('|');
}

function toTokenSet(text: string): Set<string> {
  const tokens = text
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);
  return new Set(tokens);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  if (union === 0) return 0;
  return intersection / union;
}

function isNearRecentDuplicate(unit: ForexCourseUnitOutput, input: ForexCourseUnitInput): boolean {
  const corpus = buildUnitCorpus(unit);
  const tokens = toTokenSet(corpus);
  const lessonKey = buildLessonKey(input);

  return RECENT_UNIT_TEXTS.some((recent) => {
    if (recent.lessonKey === lessonKey) {
      return false;
    }

    const similarity = jaccardSimilarity(tokens, toTokenSet(recent.corpus));
    return similarity >= DUPLICATE_SIMILARITY_THRESHOLD;
  });
}

function rememberUnit(unit: ForexCourseUnitOutput, input: ForexCourseUnitInput): ForexCourseUnitOutput {
  RECENT_UNIT_TEXTS.push({ lessonKey: buildLessonKey(input), corpus: buildUnitCorpus(unit) });
  if (RECENT_UNIT_TEXTS.length > RECENT_UNIT_CAP) {
    RECENT_UNIT_TEXTS.shift();
  }
  return unit;
}

function ensureUnitUniqueness(unit: ForexCourseUnitOutput, input: ForexCourseUnitInput): ForexCourseUnitOutput {
  if (!isNearRecentDuplicate(unit, input)) {
    return rememberUnit(unit, input);
  }

  // If too similar to recently generated units, regenerate deterministic variants.
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const alternative = buildFallbackUnit(input, attempt);
    if (!isNearRecentDuplicate(alternative, input)) {
      return rememberUnit(alternative, input);
    }
  }

  return rememberUnit(unit, input);
}

function extractTopicKeywords(topicTitle: string): string[] {
  return topicTitle
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4)
    .slice(0, 5);
}

function countKeywordHits(text: string, keywords: string[]): number {
  const normalized = text.toLowerCase();
  return keywords.filter((keyword) => normalized.includes(keyword)).length;
}

function hasSufficientSpecificity(unit: ForexCourseUnitOutput, input: ForexCourseUnitInput): boolean {
  const combined = `${unit.title}\n${unit.summary}\n${unit.content}\n${unit.example}`;
  const keywords = extractTopicKeywords(input.topic_title);
  const topicHits = countKeywordHits(combined, keywords);
  const weekMarker = combined.includes(`Week ${input.week_number}`) || combined.includes(`week ${input.week_number}`);
  const dayMarker = combined.includes(input.day_of_week);
  const hasDifferentExample = !/EUR\/USD approaches a key structural zone|disciplined trader waits for confirmation/i.test(combined);
  return topicHits >= Math.min(2, Math.max(1, keywords.length)) && weekMarker && dayMarker && hasDifferentExample;
}

function hasDetailedExpansionStandard(unit: ForexCourseUnitOutput, input: ForexCourseUnitInput): boolean {
  const content = unit.content;
  const contentWords = wordCount(content);

  const hasRequiredHeadings =
    content.includes('## Introduction') &&
    content.includes('## Key Concepts') &&
    content.includes('## Detailed Explanation') &&
    content.includes('## Example') &&
    content.includes('## Practical Application') &&
    content.includes('## Key Takeaways');

  const detailSubsections = (content.match(/^###\s+/gm) ?? []).length;
  const keyTakeawayBullets = (content.match(/^-\s+/gm) ?? []).length;

  if (input.topic_type === 'assignment' || unit.is_assignment) {
    return hasRequiredHeadings && contentWords >= 420;
  }

  return hasRequiredHeadings && contentWords >= 650 && detailSubsections >= 3 && keyTakeawayBullets >= 4;
}

function normalizeDay(input: string): DayOfWeek {
  const value = input.trim().toLowerCase();
  const map: Record<string, DayOfWeek> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
  };
  return map[value] ?? 'Monday';
}

function normalizeTopicKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function resolveLessonContext(input: ForexCourseUnitInput): LessonContext {
  const dayLessons = getDayLessons(input.week_number, input.day_of_week);
  const targetKey = normalizeTopicKey(input.topic_title);
  const lesson = dayLessons.find((item) => normalizeTopicKey(item.title) === targetKey) ?? null;
  return { lesson, dayLessons };
}

function buildRelatedTopicText(context: LessonContext): string {
  if (!context.lesson) return 'Related lesson context is based on this day\'s trading objective.';

  const related = context.dayLessons
    .filter((item) => item.slug !== context.lesson!.slug)
    .map((item) => item.title)
    .slice(0, 2);

  if (related.length === 0) {
    return `This lesson stands as the core focus for ${context.lesson.day} in Week ${context.lesson.week}.`;
  }

  return `This lesson connects directly to: ${related.join(' and ')}.`;
}

function buildExecutionChecklist(context: LessonContext, seed: number): string[] {
  const entryLabel = pickBySeed(['trigger', 'entry condition', 'confirmation event', 'execution signal'], seed, 10);
  const reviewLabel = pickBySeed(['review note', 'post-trade audit note', 'improvement note', 'reflection note'], seed, 12);

  if (!context.lesson) {
    return [
      'Confirm market state before choosing any setup model.',
      `Define ${entryLabel}, invalidation, and target before execution.`,
      'Size position from fixed percentage risk, not emotion.',
      `Record outcome and one ${reviewLabel} in your journal.`,
    ];
  }

  return [
    `Confirm bias for Week ${context.lesson.week} ${context.lesson.day} theme: ${context.lesson.dayTheme}.`,
    `Wait for ${entryLabel} aligned with lesson objective: ${context.lesson.title}.`,
    'Set stop at invalidation level beyond structure, not arbitrary distance.',
    `Document execution quality, rule adherence, and emotional state in a ${reviewLabel}.`,
  ];
}

function buildLessonMarkdown(
  input: ForexCourseUnitInput,
  difficulty: 'Beginner' | 'Intermediate',
  context: LessonContext,
  variantSalt = 0
): string {
  const seed = buildSeed(input, context, variantSalt);
  const header = `# ${context.lesson?.title ?? input.topic_title}`;
  const module = context.lesson?.module ?? `Week ${input.week_number} Curriculum`;
  const dayTheme = context.lesson?.dayTheme ?? input.topic_title;
  const concepts = extractConceptBullets(context, input);
  const scenario = buildUniqueExample(context, input, seed);
  const checklist = buildExecutionChecklist(context, seed);
  const relatedTopicText = buildRelatedTopicText(context);
  const chapterContext = `Chapter ${input.week_number} - ${module} | Topic ${context.lesson?.dayIndex ?? '?'} (${input.day_of_week}) - ${dayTheme} | Subtopic ${context.lesson?.lessonNumber ?? '?'} - ${context.lesson?.title ?? input.topic_title}`;
  const mistakeBullets = buildMistakeBullets(seed);
  const introVariant = pickBySeed(INTRO_VARIANTS, seed, 0);
  const detailVariant = pickBySeed(DETAIL_VARIANTS, seed, 1);
  const takeawayA = pickBySeed(TAKEAWAY_VARIANTS, seed, 2);
  const takeawayB = pickBySeed(TAKEAWAY_VARIANTS, seed, 3);
  const contextPrefix = pickBySeed(CONTEXT_BULLET_PREFIXES, seed, 4);
  const consistencyVariant = pickBySeed(CONSISTENCY_VARIANTS, seed, 5);
  const practicalPrefix = pickBySeed(PRACTICAL_PREFIXES, seed, 6);
  const processEdgeVariant = pickBySeed(PROCESS_EDGE_VARIANTS, seed, 7);

  return [
    header,
    '',
    '## Introduction',
    `${context.lesson?.title ?? input.topic_title} is a core part of ${module}. ${introVariant}`,
    `Learning path context: ${chapterContext}.`,
    `${relatedTopicText}`,
    '',
    '## Key Concepts',
    `- ${contextPrefix}: ${dayTheme}.`,
    `- ${concepts[0]}`,
    `- ${concepts[1]}`,
    `- ${concepts[2]}`,
    '',
    '## Detailed Explanation',
    `In week ${input.week_number}, this lesson is applied through a three-step workflow: context, trigger, and risk framing. First, map structure and identify where order flow is likely to react for this exact subtopic. Second, wait for confirmation behavior that directly matches ${context.lesson?.title ?? input.topic_title}. Third, commit to invalidation-based risk so quality is measured by process, not by any single outcome.`,
    detailVariant,
    '',
    `${consistencyVariant} In this lesson, the focal execution context is ${dayTheme.toLowerCase()}.`,
    '',
    '### Common Mistakes to Avoid',
    ...mistakeBullets,
    '',
    '## Example',
    scenario,
    '',
    '## Practical Application',
    `1. ${practicalPrefix}: write your chapter-topic-subtopic objective in one line -> ${chapterContext}.`,
    ...checklist.map((step, index) => `${index + 1}. ${step}`),
    '',
    '## Key Takeaways',
    `- ${processEdgeVariant}`,
    `- ${context.lesson?.title ?? input.topic_title} should be evaluated with rule adherence first and P/L second.`,
    `- ${takeawayA}`,
    `- ${takeawayB}`,
  ].join('\n');
}

function buildAssignmentMarkdown(input: ForexCourseUnitInput, context: LessonContext, variantSalt = 0): { content: string; assignment: string } {
  const seed = buildSeed(input, context, variantSalt);
  const module = context.lesson?.module ?? `Week ${input.week_number} Curriculum`;
  const scenario = buildUniqueExample(context, input, seed);
  const dayTheme = context.lesson?.dayTheme ?? input.topic_title;
  const relatedTopicText = buildRelatedTopicText(context);
  const pairA = pickBySeed(PAIR_CANDIDATES, seed, 7);
  const pairB = pickBySeed(PAIR_CANDIDATES, seed, 9);
  const pairC = pickBySeed(PAIR_CANDIDATES, seed, 11);
  const timeA = pickBySeed(TIMEFRAME_CANDIDATES, seed, 2);
  const timeB = pickBySeed(TIMEFRAME_CANDIDATES, seed, 4);
  const timeC = pickBySeed(TIMEFRAME_CANDIDATES, seed, 6);
  const chapterContext = `Chapter ${input.week_number} - ${module} | Topic ${context.lesson?.dayIndex ?? '?'} (${input.day_of_week}) - ${dayTheme} | Subtopic ${context.lesson?.lessonNumber ?? '?'} - ${context.lesson?.title ?? input.topic_title}`;

  const content = [
    `# ${input.topic_title} Assignment`,
    '',
    '## Objective of Exercise',
    `Apply ${input.topic_title.toLowerCase()} in a full process simulation: context mapping, trigger selection, risk planning, and post-trade review.`,
    `Assignment context: ${chapterContext}.`,
    `${relatedTopicText}`,
    '',
    '## Step-by-Step Instructions',
    `1. Choose three pairs: ${pairA}, ${pairB}, and ${pairC}.`,
    `2. Use ${timeA}, ${timeB}, and ${timeC} as your primary execution charts respectively.`,
    '3. Map higher-timeframe structure and current session context before setup selection.',
    '4. Classify each pair as trend, range, or transition and justify in one sentence.',
    '5. Build one setup per pair with entry trigger, invalidation stop, and primary target.',
    '6. Define position size from fixed risk and note estimated R:R before entry.',
    '7. Add a pre-trade checklist score (0-10) for setup quality and discipline confidence.',
    '8. Capture post-trade notes: rule adherence, emotional control, and execution timing quality.',
    '9. Write one improvement action that will be tested next week.',
    '',
    '## Expected Learning Outcome',
    'You should be able to convert a concept into a repeatable execution process and measure your decision quality independently from short-term P/L.',
    '',
    '## Introduction',
    `This Saturday task consolidates ${module} into practical execution habits.`,
    '',
    '## Key Concepts',
    '- Setup quality over setup quantity',
    '- Confirmation before execution',
    '- Fixed risk for consistency',
    `- Theme alignment: ${dayTheme}`,
    '',
    '## Detailed Explanation',
    `Week ${input.week_number} should end with proof of process quality, not just outcome quality. Your review must confirm whether each trade decision matched your written rules under live conditions.`,
    `Reference scenario: ${scenario}. Use this context to evaluate whether your timing and risk framing were appropriate.`,
    '',
    '## Example',
    scenario,
    '',
    '## Practical Application',
    'Submit annotated chart screenshots, checklist scores, and post-trade commentary for all three pairs. Highlight one repeated mistake and one specific correction for next week.',
    '',
    '## Key Takeaways',
    '- Strong process compounds over time.',
    '- Assignment quality is measured by clarity and discipline.',
    '- Improvement loops must be specific, testable, and reviewed weekly.',
  ].join('\n');

  const assignment = [
    `Complete a Saturday exercise for ${input.topic_title}:`,
    `1. Analyze ${pairA}, ${pairB}, and ${pairC}; classify each as trend/range/transition.`,
    '2. Build one setup per pair with entry, stop-loss, take-profit, and invalidation notes.',
    '3. Keep risk fixed at 1% per setup and calculate projected R:R before execution.',
    '4. Score each setup (0-10) for structure quality, timing, and trigger confirmation.',
    `5. Include one screenshot per pair and label the chart timeframe (${timeA}, ${timeB}, ${timeC}).`,
    '6. Write a weekly review with one concrete behavioral improvement for next week.',
  ].join('\n');

  return { content, assignment };
}

function buildFallbackUnit(input: ForexCourseUnitInput, variantSalt = 0): ForexCourseUnitOutput {
  const isAssignment = input.day_of_week === 'Saturday' || input.topic_type === 'assignment';
  const difficulty: 'Beginner' | 'Intermediate' = input.week_number <= 3 ? 'Beginner' : 'Intermediate';
  const context = resolveLessonContext(input);
  const seed = buildSeed(input, context, variantSalt);
  const title = context.lesson?.title ?? input.topic_title;
  const summary = context.lesson?.summary;

  if (isAssignment) {
    const assignmentPayload = buildAssignmentMarkdown(input, context, variantSalt);
    return {
      title: `${title} Practice Assignment`,
      summary: summary
        ? summary
        : `This unit turns ${title.toLowerCase()} into a structured Saturday execution exercise. You will apply context mapping, trigger discipline, and risk control in a measurable workflow.`,
      content: assignmentPayload.content,
      sections: REQUIRED_SECTIONS,
      example: buildUniqueExample(context, input, seed),
      is_assignment: true,
      assignment: assignmentPayload.assignment,
      difficulty_level: difficulty,
      image_prompt: DEFAULT_IMAGE_PROMPT,
    };
  }

  return {
    title,
    summary: summary
      ? summary
      : `${title} helps traders shift from reactive entries to rule-based execution. This lesson explains the concept and shows how to apply it with session context, confirmation logic, and disciplined risk framing.`,
    content: buildLessonMarkdown(input, difficulty, context, variantSalt),
    sections: REQUIRED_SECTIONS,
    example: buildUniqueExample(context, input, seed),
    is_assignment: false,
    assignment: '',
    difficulty_level: difficulty,
    image_prompt: DEFAULT_IMAGE_PROMPT,
  };
}

function extractJson(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return null;
}

function normalizeOutput(raw: Partial<ForexCourseUnitOutput>, input: ForexCourseUnitInput): ForexCourseUnitOutput {
  const fallback = buildFallbackUnit(input);

  const isAssignment = input.day_of_week === 'Saturday' || input.topic_type === 'assignment' || raw.is_assignment === true;

  const title = typeof raw.title === 'string' && raw.title.trim().length > 0
    ? raw.title.trim()
    : fallback.title;

  let summary = typeof raw.summary === 'string' && raw.summary.trim().length > 0
    ? raw.summary.trim()
    : fallback.summary;

  const summarySentenceCount = sentenceCount(summary);
  if (summarySentenceCount < 2 || summarySentenceCount > 3) {
    summary = fallback.summary;
  }

  const content = typeof raw.content === 'string' && raw.content.trim().length > 0
    ? raw.content.trim()
    : fallback.content;

  const sections = REQUIRED_SECTIONS;

  const example = typeof raw.example === 'string' && raw.example.trim().length > 0
    ? raw.example.trim()
    : fallback.example;

  const assignment = isAssignment
    ? (typeof raw.assignment === 'string' && raw.assignment.trim().length > 0 ? raw.assignment.trim() : fallback.assignment)
    : '';

  const difficultyLevel: 'Beginner' | 'Intermediate' = raw.difficulty_level === 'Intermediate'
    ? 'Intermediate'
    : raw.difficulty_level === 'Beginner'
      ? 'Beginner'
      : fallback.difficulty_level;

  const imagePrompt = typeof raw.image_prompt === 'string' && raw.image_prompt.trim().length > 0
    ? raw.image_prompt.trim()
    : DEFAULT_IMAGE_PROMPT;

  const normalized = {
    title,
    summary,
    content,
    sections,
    example,
    is_assignment: isAssignment,
    assignment,
    difficulty_level: difficultyLevel,
    image_prompt: imagePrompt,
  } satisfies ForexCourseUnitOutput;

  if (isAssignment && !normalized.assignment) {
    return fallback;
  }

  if (!hasSufficientSpecificity(normalized, input)) {
    return fallback;
  }

  if (!hasDetailedExpansionStandard(normalized, input)) {
    return fallback;
  }

  return normalized;
}

function buildPrompt(input: ForexCourseUnitInput): string {
  return `SYSTEM ROLE:
You are a professional Forex educator and curriculum expert for Intel Trader. You are responsible for generating structured, high-quality educational content for a daily learning system.

OBJECTIVE:
Generate ONE learning unit that includes:
1. A short summary (for landing page card)
2. A detailed lesson (for Read More page)
3. A practical example
4. Optional assignment (if it is a Saturday topic)

INPUTS:
- Topic title: ${input.topic_title}
- Week number: ${input.week_number}
- Day of week: ${input.day_of_week}
- Topic type: ${input.topic_type}

STRICT RULES:
1. Content must be structured and progressive
2. Must be beginner-friendly but insightful
3. Use clear headings and logical flow
4. Include real trading examples
5. Avoid unnecessary jargon
6. Saturday topics MUST be assignments/exercises
7. Lessons must teach both concept + application
8. This lesson must be unique to its chapter, topic, and subtopic (do not reuse generic paragraphs from other lessons)
9. Example must be specific to this topic title and not a reusable boilerplate scenario
10. Match the platform's detailed expansion standard: fully elaborated wording, explicit logic, and practical execution framing
11. For non-assignment lessons, Detailed Explanation must include at least 3 level-3 subsections (### headings)
12. Non-assignment lesson content length target: 700-1200 words
13. Assignment content length target: 450-900 words
14. Key Takeaways section must include at least 4 bullet points
15. Practical Application must be step-by-step and actionable (minimum 5 numbered steps)

OUTPUT FORMAT (STRICT JSON):
{
"title": "string",
"summary": "2-3 sentence concise explanation",
"content": "markdown formatted lesson with sections",
"sections": [
"Introduction",
"Key Concepts",
"Detailed Explanation",
"Example",
"Practical Application",
"Key Takeaways"
],
"example": "real-world forex scenario with explanation",
"is_assignment": true,
"assignment": "detailed task only if is_assignment = true",
"difficulty_level": "Beginner | Intermediate",
"image_prompt": "A clean educational forex illustration showing charts, patterns, or annotated examples, minimal clutter, high-quality, professional style"
}

CONTENT STRUCTURE REQUIREMENTS:
FOR LESSON:
- Introduction -> What and why
- Key Concepts -> Definitions
- Detailed Explanation -> Deep dive with layered reasoning and practical nuance
- Example -> Real market scenario
- Practical Application -> How trader uses it
- Key Takeaways -> Bullet points

FOR ASSIGNMENT (SATURDAY):
- Objective of exercise
- Step-by-step instructions
- Expected learning outcome

QUALITY CHECKS:
- Ensure logical flow
- Ensure clarity
- Ensure no missing sections
- Ensure content is useful for real trading

FAILSAFE:
If topic is complex:
- Simplify explanation
- Focus on clarity over depth

Return only valid JSON.`;
}

export async function generateForexCourseUnit(inputRaw: {
  topic_title: string;
  week_number: number;
  day_of_week: string;
  topic_type: string;
}): Promise<ForexCourseUnitOutput> {
  const input: ForexCourseUnitInput = {
    topic_title: inputRaw.topic_title.trim() || 'Market Structure Basics',
    week_number: Number.isFinite(inputRaw.week_number)
      ? Math.min(52, Math.max(1, Math.round(inputRaw.week_number)))
      : 1,
    day_of_week: normalizeDay(inputRaw.day_of_week),
    topic_type: inputRaw.topic_type === 'assignment' ? 'assignment' : 'lesson',
  };

  if (input.day_of_week === 'Saturday') {
    input.topic_type = 'assignment';
  }

  // ── Static content registry: highest-priority lookup ──────────────────────
  // Check for hand-crafted lesson content before calling AI or the fallback.
  const staticContext = resolveLessonContext(input);
  if (staticContext.lesson?.slug) {
    const staticContent = getStaticLessonContent(staticContext.lesson.slug);
    if (staticContent) return staticContent;
  }
  // ─────────────────────────────────────────────────────────────────────────

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return ensureUnitUniqueness(buildFallbackUnit(input), input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: buildPrompt(input),
    });

    const candidate = extractJson(response.text ?? '');
    if (!candidate) return ensureUnitUniqueness(buildFallbackUnit(input), input);

    const parsed = JSON.parse(candidate) as Partial<ForexCourseUnitOutput>;
    return ensureUnitUniqueness(normalizeOutput(parsed, input), input);
  } catch {
    return ensureUnitUniqueness(buildFallbackUnit(input), input);
  }
}
