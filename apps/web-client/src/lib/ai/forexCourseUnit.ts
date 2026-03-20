import { GoogleGenAI } from '@google/genai';
import { getDayLessons, type LessonRecord } from '@/lib/learning/curriculum';

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

function sentenceCount(text: string): number {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
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

function buildExecutionChecklist(context: LessonContext): string[] {
  if (!context.lesson) {
    return [
      'Confirm market state before choosing any setup model.',
      'Define entry trigger, invalidation, and target before execution.',
      'Size position from fixed percentage risk, not emotion.',
      'Record outcome and one improvement note in your journal.',
    ];
  }

  return [
    `Confirm bias for Week ${context.lesson.week} ${context.lesson.day} theme: ${context.lesson.dayTheme}.`,
    `Wait for trigger aligned with lesson objective: ${context.lesson.title}.`,
    'Set stop at invalidation level beyond structure, not arbitrary distance.',
    'Document execution quality, rule adherence, and emotional state after close.',
  ];
}

function buildLessonMarkdown(
  input: ForexCourseUnitInput,
  difficulty: 'Beginner' | 'Intermediate',
  context: LessonContext
): string {
  const header = `# ${context.lesson?.title ?? input.topic_title}`;
  const module = context.lesson?.module ?? `Week ${input.week_number} Curriculum`;
  const dayTheme = context.lesson?.dayTheme ?? input.topic_title;
  const scenario = SCENARIO_BY_DAY[input.day_of_week];
  const checklist = buildExecutionChecklist(context);
  const relatedTopicText = buildRelatedTopicText(context);

  return [
    header,
    '',
    '## Introduction',
    `${context.lesson?.title ?? input.topic_title} is a core part of ${module}. The objective is to translate this concept into repeatable execution behavior so decisions remain structured under live-market pressure.`,
    `${relatedTopicText}`,
    '',
    '## Key Concepts',
    `- Day Theme Context: ${dayTheme}.`,
    '- Market state first: classify trend, range, or transition before planning a setup.',
    '- Trigger discipline: use close confirmation, rejection quality, or retest behavior.',
    '- Risk architecture: define invalidation, sizing, and target logic before entry.',
    '',
    '## Detailed Explanation',
    `In week ${input.week_number}, this lesson should be applied through a three-step workflow: context, trigger, and risk framing. First, map structure and identify where institutional order flow is likely to react. Second, wait for confirmation behavior that matches your setup model. Third, commit to invalidation-based risk so trade quality is judged by process, not by single-trade outcome.`,
    '',
    `At ${difficulty.toLowerCase()} level, consistency beats complexity. One clear model executed with discipline will outperform frequent model-switching over time.`,
    '',
    '### Common Mistakes to Avoid',
    '- Entering before confirmation because of fear of missing the move.',
    '- Placing stops at arbitrary distances instead of structural invalidation.',
    '- Ignoring session timing and executing low-probability setups during thin liquidity.',
    '- Skipping post-trade review, which prevents process improvement.',
    '',
    '## Example',
    `Scenario: ${scenario}. EUR/USD approaches a key structure level after controlled pullback. The trader waits for candle-close confirmation at the level, enters only after a valid retest, places stop beyond invalidation, and targets the next logical liquidity zone. The trade is scored on rule adherence before P/L is considered.`,
    '',
    '## Practical Application',
    ...checklist.map((step, index) => `${index + 1}. ${step}`),
    '',
    '## Key Takeaways',
    '- Process quality is the main edge in discretionary forex execution.',
    '- Confirmation and invalidation create objective decision boundaries.',
    '- Daily review compounds faster than adding more indicators.',
  ].join('\n');
}

function buildAssignmentMarkdown(input: ForexCourseUnitInput, context: LessonContext): { content: string; assignment: string } {
  const module = context.lesson?.module ?? `Week ${input.week_number} Curriculum`;
  const scenario = SCENARIO_BY_DAY[input.day_of_week];
  const dayTheme = context.lesson?.dayTheme ?? input.topic_title;
  const relatedTopicText = buildRelatedTopicText(context);

  const content = [
    `# ${input.topic_title} Assignment`,
    '',
    '## Objective of Exercise',
    `Apply ${input.topic_title.toLowerCase()} in a full process simulation: context mapping, trigger selection, risk planning, and post-trade review.`,
    `${relatedTopicText}`,
    '',
    '## Step-by-Step Instructions',
    '1. Choose three pairs: two majors and one cross pair.',
    '2. Map higher-timeframe structure and current session context before setup selection.',
    '3. Classify each pair as trend, range, or transition and justify in one sentence.',
    '4. Build one setup per pair with entry trigger, invalidation stop, and primary target.',
    '5. Define position size from fixed risk and note estimated R:R before entry.',
    '6. Add a pre-trade checklist score (0-10) for setup quality and discipline confidence.',
    '7. Capture post-trade notes: rule adherence, emotional control, and execution timing quality.',
    '8. Write one improvement action that will be tested next week.',
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
    'GBP/USD rejects resistance near 1.2750, prints bearish engulfing on H1, and confirms downside continuation below 1.2728. A high-quality submission documents context, trigger quality, stop rationale, target logic, and whether execution matched the written checklist.',
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
    '1. Analyze three forex pairs and classify each as trend/range/transition.',
    '2. Build one setup per pair with entry, stop-loss, take-profit, and invalidation notes.',
    '3. Keep risk fixed at 1% per setup and calculate projected R:R before execution.',
    '4. Score each setup (0-10) for structure quality, timing, and trigger confirmation.',
    '5. Write a weekly review with one concrete behavioral improvement for next week.',
  ].join('\n');

  return { content, assignment };
}

function buildFallbackUnit(input: ForexCourseUnitInput): ForexCourseUnitOutput {
  const isAssignment = input.day_of_week === 'Saturday' || input.topic_type === 'assignment';
  const difficulty: 'Beginner' | 'Intermediate' = input.week_number <= 3 ? 'Beginner' : 'Intermediate';
  const context = resolveLessonContext(input);
  const title = context.lesson?.title ?? input.topic_title;
  const summary = context.lesson?.summary;

  if (isAssignment) {
    const assignmentPayload = buildAssignmentMarkdown(input, context);
    return {
      title: `${title} Practice Assignment`,
      summary: summary
        ? summary
        : `This unit turns ${title.toLowerCase()} into a structured Saturday execution exercise. You will apply context mapping, trigger discipline, and risk control in a measurable workflow.`,
      content: assignmentPayload.content,
      sections: REQUIRED_SECTIONS,
      example: `USD/JPY shows ${SCENARIO_BY_DAY[input.day_of_week]}. The learner validates setup quality, executes only after confirmation, and records process adherence before reviewing outcome.`,
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
    content: buildLessonMarkdown(input, difficulty, context),
    sections: REQUIRED_SECTIONS,
    example: `EUR/USD approaches a key structural zone during ${SCENARIO_BY_DAY[input.day_of_week]}. A disciplined trader waits for confirmation, executes with predefined invalidation, and reviews the trade using a checklist.`,
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
- Detailed Explanation -> Deep dive
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

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return buildFallbackUnit(input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: buildPrompt(input),
    });

    const candidate = extractJson(response.text ?? '');
    if (!candidate) return buildFallbackUnit(input);

    const parsed = JSON.parse(candidate) as Partial<ForexCourseUnitOutput>;
    return normalizeOutput(parsed, input);
  } catch {
    return buildFallbackUnit(input);
  }
}
