import { GoogleGenAI } from '@google/genai';

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

function buildLessonMarkdown(input: ForexCourseUnitInput, difficulty: 'Beginner' | 'Intermediate'): string {
  const header = `# ${input.topic_title}`;

  return [
    header,
    '',
    '## Introduction',
    `${input.topic_title} is a core forex concept that helps traders make structured decisions instead of reacting to random price movement. This lesson explains why it matters and how to apply it in daily execution.`,
    '',
    '## Key Concepts',
    '- Market structure: identify trend, range, or transition before planning an entry.',
    '- Confirmation: use a candle close or retest to reduce false signals.',
    '- Risk control: define invalidation and position size before entering.',
    '',
    '## Detailed Explanation',
    `In week ${input.week_number}, focus on understanding ${input.topic_title.toLowerCase()} through both chart reading and execution planning. Instead of taking immediate entries, define the setup condition first, then trigger only when price behavior confirms your idea.`,
    '',
    `At ${difficulty.toLowerCase()} level, the goal is consistency: one clear setup model, one risk model, and one review process after each trade.`,
    '',
    '## Example',
    `EUR/USD is ranging between 1.0820 support and 1.0880 resistance during the London session. A trader waits for a confirmed close above 1.0880, then enters on a retest with stop-loss below 1.0868 and target near 1.0920 where prior selling pressure appeared.`,
    '',
    '## Practical Application',
    '1. Mark one support and one resistance zone on a liquid pair.',
    '2. Define entry trigger as close-confirmation or retest-confirmation.',
    '3. Place stop-loss beyond invalidation, not at a random pip distance.',
    '4. Keep risk fixed at 1% and document result in your journal.',
    '',
    '## Key Takeaways',
    '- Trade conditions, not emotions.',
    '- Confirmation reduces low-quality entries.',
    '- Risk consistency matters more than prediction accuracy.',
  ].join('\n');
}

function buildAssignmentMarkdown(input: ForexCourseUnitInput): { content: string; assignment: string } {
  const content = [
    `# ${input.topic_title} Assignment`,
    '',
    '## Objective of Exercise',
    `Apply ${input.topic_title.toLowerCase()} in a live chart review and convert analysis into a rule-based trade plan.`,
    '',
    '## Step-by-Step Instructions',
    '1. Choose two pairs: one major and one cross pair.',
    '2. Mark current market state as trend, range, or transition.',
    '3. Identify one valid setup per pair with entry, stop, and target.',
    '4. Explain why the setup is valid in 3-5 lines.',
    '5. Record risk-to-reward and whether execution rule was respected.',
    '',
    '## Expected Learning Outcome',
    'You should be able to connect concept knowledge to actual execution decisions with clear risk control and post-trade review discipline.',
    '',
    '## Introduction',
    'This Saturday task converts this week\'s concept into repeatable trading behavior.',
    '',
    '## Key Concepts',
    '- Setup quality over setup quantity',
    '- Confirmation before execution',
    '- Fixed risk for consistency',
    '',
    '## Detailed Explanation',
    `Week ${input.week_number} should end with evidence of process quality, not just P/L. Evaluate whether your decisions matched your written rules.`,
    '',
    '## Example',
    'GBP/USD rejects resistance near 1.2750, prints bearish engulfing on H1, and confirms downside continuation below 1.2728. A valid assignment response explains the rejection, trigger, risk point, and invalidation.',
    '',
    '## Practical Application',
    'Submit chart screenshots and notes for each pair with entry trigger, invalidation, and post-trade commentary.',
    '',
    '## Key Takeaways',
    '- Strong process compounds over time.',
    '- Assignment quality is measured by clarity and discipline.',
  ].join('\n');

  const assignment = [
    `Complete a Saturday exercise for ${input.topic_title}:`,
    '1. Analyze two forex pairs and classify each as trend/range/transition.',
    '2. Build one setup per pair with entry, stop-loss, and take-profit.',
    '3. Keep risk fixed at 1% per setup and state your R:R clearly.',
    '4. Write a short review explaining whether your trigger rules were respected.',
  ].join('\n');

  return { content, assignment };
}

function buildFallbackUnit(input: ForexCourseUnitInput): ForexCourseUnitOutput {
  const isAssignment = input.day_of_week === 'Saturday' || input.topic_type === 'assignment';
  const difficulty: 'Beginner' | 'Intermediate' = input.week_number <= 3 ? 'Beginner' : 'Intermediate';

  if (isAssignment) {
    const assignmentPayload = buildAssignmentMarkdown(input);
    return {
      title: `${input.topic_title} Practice Assignment`,
      summary: `This unit turns ${input.topic_title.toLowerCase()} into a structured Saturday exercise. You will apply chart reading, setup validation, and risk control in a step-by-step workflow designed for real trading decisions.`,
      content: assignmentPayload.content,
      sections: REQUIRED_SECTIONS,
      example: 'USD/JPY breaks above consolidation during New York open, retests the breakout level, and continues with momentum. The learner documents trigger quality, risk location, and post-trade discipline.',
      is_assignment: true,
      assignment: assignmentPayload.assignment,
      difficulty_level: difficulty,
      image_prompt: DEFAULT_IMAGE_PROMPT,
    };
  }

  return {
    title: input.topic_title,
    summary: `${input.topic_title} helps traders move from random entries to rule-based execution. This unit explains the concept clearly and shows how to apply it with confirmation and risk discipline in real market conditions.`,
    content: buildLessonMarkdown(input, difficulty),
    sections: REQUIRED_SECTIONS,
    example: 'EUR/USD consolidates near resistance, then confirms breakout with a close and retest. A disciplined trader enters only after confirmation and places stop below invalidation to control downside.',
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
