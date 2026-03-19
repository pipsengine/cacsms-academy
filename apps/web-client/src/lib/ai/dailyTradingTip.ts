import { GoogleGenAI } from '@google/genai';
import type { MarketSnapshot } from '@/lib/market/types';

export type DailyTradingTipInput = {
  marketSnapshot?: Partial<MarketSnapshot>;
  selectedPairs?: string[];
};

export type DailyTradingTipOutput = {
  title: string;
  content: string;
  pairs: string[];
  market_state: string;
  action: string;
  image_prompt: string;
};

const DEFAULT_IMAGE_PROMPT = 'High-quality forex chart showing breakout or consolidation with clean candlesticks, dark theme, professional trading interface';
const DEFAULT_FALLBACK_PAIRS = ['EUR/USD', 'GBP/USD'];

function normalizePair(pair: string): string {
  const cleaned = pair.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (cleaned.length === 6) return `${cleaned.slice(0, 3)}/${cleaned.slice(3)}`;
  return pair.toUpperCase();
}

function dedupePairs(pairs: string[]): string[] {
  const normalized = pairs.map(normalizePair).filter((p) => p.length > 0);
  return Array.from(new Set(normalized));
}

function countSentences(text: string): number {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length;
}

function clampTitleWords(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 8) return title.trim();
  return words.slice(0, 8).join(' ');
}

function isValidTitleWordCount(title: string): boolean {
  const words = title.trim().split(/\s+/).filter(Boolean);
  return words.length >= 6 && words.length <= 8;
}

function hasActionableLanguage(text: string): boolean {
  return /\b(wait for|enter|set|place|risk|stop|target|buy|sell|confirm|break|retest|size|reduce|increase)\b/i.test(text);
}

function hasMarketCondition(text: string): boolean {
  return /\b(trend|ranging|range|consolidation|breakout|rejection|volatility|pullback|momentum)\b/i.test(text);
}

function deriveMarketState(snapshot?: Partial<MarketSnapshot>): string {
  if (!snapshot) return 'mixed conditions with moderate volatility';

  const breakouts = Array.isArray(snapshot.breakouts) ? snapshot.breakouts : [];
  const channels = Array.isArray(snapshot.channels) ? snapshot.channels : [];

  if (breakouts.length === 0 && channels.length === 0) {
    return 'mixed conditions with moderate volatility';
  }

  const longBreakouts = breakouts.filter((item) => item.dir === 'LONG').length;
  const shortBreakouts = breakouts.filter((item) => item.dir === 'SHORT').length;
  const triggered = breakouts.filter((item) => item.status === 'TRIGGERED').length;
  const active = breakouts.filter((item) => item.status === 'ACTIVE').length;
  const channelWidthAvg = channels.length
    ? channels.reduce((sum, item) => sum + item.widthPct, 0) / channels.length
    : 1.5;

  const direction = longBreakouts > shortBreakouts
    ? 'bullish bias'
    : shortBreakouts > longBreakouts
      ? 'bearish bias'
      : 'balanced flow';

  const volatility = channelWidthAvg >= 1.8
    ? 'high volatility'
    : channelWidthAvg <= 0.8
      ? 'tight consolidation'
      : 'moderate volatility';

  if (triggered > 0) return `${direction}, breakout conditions, ${volatility}`;
  if (active > 0) return `${direction}, pre-breakout monitoring, ${volatility}`;
  return `${direction}, ranging structure, ${volatility}`;
}

function derivePairs(inputPairs: string[] | undefined, snapshot?: Partial<MarketSnapshot>): string[] {
  if (inputPairs && inputPairs.length > 0) {
    return dedupePairs(inputPairs).slice(0, 2);
  }

  const fromBreakouts = (snapshot?.breakouts ?? [])
    .slice(0, 4)
    .map((item) => normalizePair(item.pair));
  const fromChannels = (snapshot?.channels ?? [])
    .slice(0, 4)
    .map((item) => normalizePair(item.pair));

  const derived = dedupePairs([...fromBreakouts, ...fromChannels]).slice(0, 2);
  return derived.length > 0 ? derived : DEFAULT_FALLBACK_PAIRS;
}

function buildPairReference(pairs: string[]): string {
  if (pairs.length >= 2) return `${pairs[0]} and ${pairs[1]}`;
  if (pairs.length === 1) return pairs[0];
  return DEFAULT_FALLBACK_PAIRS.join(' and ');
}

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return null;
}

function buildFallbackTip(input: DailyTradingTipInput): DailyTradingTipOutput {
  const marketState = deriveMarketState(input.marketSnapshot);
  const pairs = derivePairs(input.selectedPairs, input.marketSnapshot);
  const pairText = buildPairReference(pairs);
  const content = `Market conditions show ${marketState}, with ${pairText} offering the cleanest structure into the current session. Focus on the pair holding above support or rejecting resistance with a decisive candle close. Execute only after confirmation, then place your stop beyond invalidation and keep risk fixed at 1% per trade.`;

  return {
    title: 'Wait For Confirmed Breakout Before Entry',
    content,
    pairs,
    market_state: marketState,
    action: 'Enter only after candle-close confirmation on structure, place the stop beyond invalidation, and cap risk at 1% per trade.',
    image_prompt: DEFAULT_IMAGE_PROMPT,
  };
}

function normalizeOutput(
  raw: Partial<DailyTradingTipOutput> & { tip?: string; actionable_insight?: string },
  input: DailyTradingTipInput
): DailyTradingTipOutput {
  const fallback = buildFallbackTip(input);

  const pairs = raw.pairs && Array.isArray(raw.pairs)
    ? dedupePairs(raw.pairs).slice(0, 2)
    : fallback.pairs;

  let title = typeof raw.title === 'string' ? raw.title.trim() : fallback.title;
  if (!title) title = fallback.title;
  title = clampTitleWords(title);
  if (!isValidTitleWordCount(title)) {
    title = fallback.title;
  }

  let marketState = typeof raw.market_state === 'string' ? raw.market_state.trim() : '';
  if (!marketState) marketState = fallback.market_state;

  let content = typeof raw.content === 'string'
    ? raw.content.trim()
    : typeof raw.tip === 'string'
      ? raw.tip.trim()
      : fallback.content;
  if (!content) content = fallback.content;

  if (!hasMarketCondition(content)) {
    content = `${content} Current structure is ${marketState}.`;
  }

  if (!hasActionableLanguage(content)) {
    content = `${content} Enter only after a confirmed close and keep risk fixed at 1%.`;
  }

  const pairText = buildPairReference(pairs);
  if (!pairs.some((pair) => content.includes(pair))) {
    content = `${content} Prioritize ${pairText} while this structure remains intact.`;
  }

  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length < 3) {
    content = `${content} Set your stop beyond the invalidation level before entry.`;
  } else if (sentences.length > 4) {
    content = sentences.slice(0, 4).join(' ');
  }

  let actionable = typeof raw.action === 'string'
    ? raw.action.trim()
    : typeof raw.actionable_insight === 'string'
      ? raw.actionable_insight.trim()
      : '';
  if (!actionable) {
    actionable = 'Wait for confirmation at key levels, place your stop beyond invalidation, and cap risk to 1% per trade.';
  }

  if (!hasActionableLanguage(actionable)) {
    actionable = `${actionable} Enter only on confirmation and pre-define stop-loss before execution.`;
  }

  const imagePrompt = typeof raw.image_prompt === 'string' && raw.image_prompt.trim().length > 0
    ? raw.image_prompt.trim()
    : DEFAULT_IMAGE_PROMPT;

  if (countSentences(content) < 3 || countSentences(content) > 4) {
    return fallback;
  }

  return {
    title,
    content,
    pairs,
    market_state: marketState,
    action: actionable,
    image_prompt: imagePrompt,
  };
}

function buildPrompt(input: DailyTradingTipInput): string {
  const marketState = deriveMarketState(input.marketSnapshot);
  const pairs = derivePairs(input.selectedPairs, input.marketSnapshot);

  const snapshotSummary = input.marketSnapshot
    ? {
        generatedAt: input.marketSnapshot.generatedAt ?? null,
        provider: input.marketSnapshot.provider ?? null,
        topBreakouts: (input.marketSnapshot.breakouts ?? []).slice(0, 3).map((item) => ({
          pair: normalizePair(item.pair),
          dir: item.dir,
          status: item.status,
          conf: item.conf,
          breakoutType: item.breakoutType,
        })),
        topChannels: (input.marketSnapshot.channels ?? []).slice(0, 3).map((item) => ({
          pair: normalizePair(item.pair),
          tf: item.tf,
          type: item.type,
          stage: item.stage,
          bias: item.bias,
          widthPct: item.widthPct,
        })),
      }
    : null;

  return `FINAL COURSE PROMPT (UI-OPTIMIZED)
SYSTEM ROLE:
You are a professional Forex trading assistant for Intel Trader.

OBJECTIVE:
Generate a daily market context tip that combines:
1. Current market condition
2. Specific currency pairs
3. One clear execution rule

INPUT DATA:
- market_state_hint: ${marketState}
- selected_pairs: ${JSON.stringify(pairs)}
- market_snapshot: ${JSON.stringify(snapshotSummary)}

STRICT RULES:
1. Title: max 6-8 words
2. Body: max 3-4 sentences
3. Must include market state and execution action
4. Must reference 1-2 currency pairs
5. Must be practical, realistic, and immediately usable
6. Must not feel generic
7. Use professional tone with no hype or promises

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "title": "string",
  "content": "short paragraph with market context and advice",
  "market_state": "e.g. bullish bias, range-bound, breakout conditions",
  "action": "clear execution rule",
  "pairs": ["AUD/NZD", "AUD/JPY"],
  "image_prompt": "High-quality forex chart showing breakout or consolidation with clean candlesticks, dark theme, professional trading interface"
}

QUALITY CHECK:
- Must feel like real market insight
- Must not be generic
- Must be usable immediately by a trader

Return only valid JSON.`;
}

export async function generateDailyTradingTip(input: DailyTradingTipInput): Promise<DailyTradingTipOutput> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return buildFallbackTip(input);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: buildPrompt(input),
    });

    const rawText = response.text ?? '';
    const jsonCandidate = extractJsonObject(rawText);

    if (!jsonCandidate) {
      return buildFallbackTip(input);
    }

    const parsed = JSON.parse(jsonCandidate) as Partial<DailyTradingTipOutput>;
    return normalizeOutput(parsed, input);
  } catch {
    return buildFallbackTip(input);
  }
}
