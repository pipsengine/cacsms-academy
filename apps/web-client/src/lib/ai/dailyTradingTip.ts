import { GoogleGenAI } from '@google/genai';
import type { BreakoutSignal, ChannelSignal, MarketSnapshot } from '@/lib/market/types';

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

type TradingDayContext = {
  isoDate: string;
  weekday: string;
  focus: string;
};

type PairBrief = {
  pair: string;
  marketCondition: string;
  teachingPoint: string;
  executionFocus: string;
};

const DEFAULT_IMAGE_PROMPT = 'High-quality forex chart showing breakout or consolidation with clean candlesticks, dark theme, professional trading interface';
const DEFAULT_FALLBACK_PAIRS = ['EUR/USD', 'GBP/USD'];

const DAILY_FOCUS_BY_WEEKDAY: Record<string, string> = {
  Monday: 'establish directional bias and avoid forcing early-week entries before structure is clear',
  Tuesday: 'look for continuation only after the market confirms Monday range resolution',
  Wednesday: 'treat mid-week momentum carefully and prioritize confirmation over speed',
  Thursday: 'focus on clean retests and protect against exhaustion after established moves',
  Friday: 'tighten execution quality and reduce exposure unless the setup is exceptionally clean',
  Saturday: 'review execution quality and extract one practical lesson from recent price behavior',
  Sunday: 'prepare scenarios, key levels, and invalidation points before active sessions resume',
};

function normalizePair(pair: string): string {
  const cleaned = pair.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (cleaned.length === 6) return `${cleaned.slice(0, 3)}/${cleaned.slice(3)}`;
  return pair.toUpperCase();
}

function formatPairPrice(pair: string, price: number): string {
  return pair.includes('JPY') ? price.toFixed(2) : price.toFixed(4);
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

function getSnapshotBreakout(pair: string, snapshot?: Partial<MarketSnapshot>): BreakoutSignal | null {
  const normalizedPair = normalizePair(pair);
  return (snapshot?.breakouts ?? []).find((item) => normalizePair(item.pair) === normalizedPair) ?? null;
}

function getSnapshotChannel(pair: string, snapshot?: Partial<MarketSnapshot>): ChannelSignal | null {
  const normalizedPair = normalizePair(pair);
  return (snapshot?.channels ?? []).find((item) => normalizePair(item.pair) === normalizedPair) ?? null;
}

function buildPairBrief(pair: string, snapshot?: Partial<MarketSnapshot>): PairBrief {
  const normalizedPair = normalizePair(pair);
  const breakout = getSnapshotBreakout(normalizedPair, snapshot);
  const channel = getSnapshotChannel(normalizedPair, snapshot);

  if (breakout) {
    const direction = breakout.dir === 'LONG' ? 'bullish' : 'bearish';
    const boundary = breakout.boundary === 'RESISTANCE' ? 'resistance' : 'support';
    const triggerPrice = formatPairPrice(normalizedPair, breakout.triggerPrice);
    const currentPrice = formatPairPrice(normalizedPair, breakout.currentPrice);

    if (breakout.status === 'TRIGGERED') {
      return {
        pair: normalizedPair,
        marketCondition: `${normalizedPair} has already triggered a ${direction} ${breakout.breakoutType.toLowerCase()} move through ${boundary}, with price trading around ${currentPrice}`,
        teachingPoint: `once a breakout is triggered, the next job is not to chase it blindly but to judge whether follow-through holds above the broken level or slips back into the prior structure`,
        executionFocus: `wait for continuation or a disciplined retest around ${triggerPrice} before committing full size, and invalidate the trade quickly if price falls back through the breakout zone`,
      };
    }

    if (breakout.status === 'ACTIVE') {
      return {
        pair: normalizedPair,
        marketCondition: `${normalizedPair} is pressing toward a ${direction} breakout trigger near ${triggerPrice}, with current price around ${currentPrice}`,
        teachingPoint: `an active breakout setup is useful because it gives a trader a defined decision point instead of forcing an emotional entry in the middle of the range`,
        executionFocus: `stay patient until price either closes through ${triggerPrice} with commitment or rejects cleanly from that zone, then trade only the confirmed side`,
      };
    }

    return {
      pair: normalizedPair,
      marketCondition: `${normalizedPair} is still in monitoring mode around a potential ${direction} breakout level near ${triggerPrice}`,
      teachingPoint: `monitoring conditions matter because they tell you the setup is not ready yet, which is often where disciplined traders preserve capital by waiting`,
      executionFocus: `treat this pair as a watchlist candidate only until price confirms through ${triggerPrice} or clearly rejects from the boundary`,
    };
  }

  if (channel) {
    const bias = channel.bias === 'NEUTRAL' ? 'neutral' : channel.bias === 'LONG' ? 'bullish' : 'bearish';
    const support = formatPairPrice(normalizedPair, channel.support);
    const resistance = formatPairPrice(normalizedPair, channel.resistance);
    const currentPrice = formatPairPrice(normalizedPair, channel.currentPrice);

    return {
      pair: normalizedPair,
      marketCondition: `${normalizedPair} is trading inside a ${channel.stage.toLowerCase()} ${channel.type.toLowerCase()} structure with ${bias} bias, holding near ${currentPrice}`,
      teachingPoint: `when price is still contained between support at ${support} and resistance at ${resistance}, the quality of the setup depends on whether the market respects the edges of that structure or breaks them with intent`,
      executionFocus: `use ${support} and ${resistance} as decision zones, and only engage once price confirms either a rejection at the edge or a clean break beyond the range`,
    };
  }

  return {
    pair: normalizedPair,
    marketCondition: `${normalizedPair} remains on the watchlist under ${deriveMarketState(snapshot)}`,
    teachingPoint: `when pair-specific structure is limited, the priority shifts to waiting for cleaner chart definition rather than forcing a read from weak information`,
    executionFocus: `keep this pair on secondary watch until price action produces a clearer breakout or a more reliable support-resistance reaction`,
  };
}

function buildPairBriefs(pairs: string[], snapshot?: Partial<MarketSnapshot>): PairBrief[] {
  return pairs.map((pair) => buildPairBrief(pair, snapshot));
}

function buildEducationalTipContent(input: DailyTradingTipInput, marketState: string): string {
  const dayContext = getTradingDayContext();
  const pairs = derivePairs(input.selectedPairs, input.marketSnapshot);
  const pairBriefs = buildPairBriefs(pairs, input.marketSnapshot);
  const primary = pairBriefs[0];
  const secondary = pairBriefs[1];

  const sentences = [
    `${dayContext.weekday} conditions currently reflect ${marketState}, and ${primary.marketCondition}.`,
    `This matters because ${primary.teachingPoint}.`,
    secondary
      ? `${secondary.marketCondition}, so it can be used as a comparison chart to confirm whether momentum is broad-based or isolated.`
      : `Use ${primary.pair} as the primary chart until another pair shows cleaner structure and better confirmation.` ,
    `Execution focus for today: ${primary.executionFocus}; the broader objective is to ${dayContext.focus}.`,
  ];

  return sentences.join(' ');
}

function getTradingDayContext(date = new Date()): TradingDayContext {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Monday';

  return {
    isoDate: `${year}-${month}-${day}`,
    weekday,
    focus: DAILY_FOCUS_BY_WEEKDAY[weekday] ?? DAILY_FOCUS_BY_WEEKDAY.Monday,
  };
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
  const dayContext = getTradingDayContext();
  const content = buildEducationalTipContent(input, marketState);
  const pairBriefs = buildPairBriefs(pairs, input.marketSnapshot);
  const primaryExecution = pairBriefs[0]?.executionFocus ?? 'wait for confirmation at key levels before committing risk';

  return {
    title: `${dayContext.weekday} Confirmation Before Entry`,
    content,
    pairs,
    market_state: marketState,
    action: `For ${dayContext.weekday}, ${primaryExecution}; keep risk contained and align execution with ${dayContext.focus}.`,
    image_prompt: DEFAULT_IMAGE_PROMPT,
  };
}

function normalizeOutput(
  raw: Partial<DailyTradingTipOutput> & { tip?: string; actionable_insight?: string },
  input: DailyTradingTipInput
): DailyTradingTipOutput {
  const fallback = buildFallbackTip(input);
  const allowedPairs = derivePairs(input.selectedPairs, input.marketSnapshot);

  const rawPairs = raw.pairs && Array.isArray(raw.pairs)
    ? dedupePairs(raw.pairs).filter((pair) => allowedPairs.includes(pair)).slice(0, 2)
    : [];
  const pairs = rawPairs.length > 0 ? rawPairs : fallback.pairs;

  let title = typeof raw.title === 'string' ? raw.title.trim() : fallback.title;
  if (!title) title = fallback.title;
  title = clampTitleWords(title);
  if (!isValidTitleWordCount(title)) {
    title = fallback.title;
  }

  let marketState = typeof raw.market_state === 'string' ? raw.market_state.trim() : '';
  if (!marketState) marketState = fallback.market_state;

  let content = buildEducationalTipContent(
    { ...input, selectedPairs: pairs },
    marketState
  );

  if (!hasMarketCondition(content)) {
    content = `${content} Current structure is ${marketState}.`;
  }

  if (!hasActionableLanguage(content)) {
    content = `${content} Enter only after a confirmed close and keep risk fixed at 1%.`;
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
    actionable = fallback.action;
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
  const dayContext = getTradingDayContext();
  const pairBriefs = buildPairBriefs(pairs, input.marketSnapshot).map((brief) => ({
    pair: brief.pair,
    marketCondition: brief.marketCondition,
    teachingPoint: brief.teachingPoint,
    executionFocus: brief.executionFocus,
  }));

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
You are a professional Forex trading assistant for Cacsms Academy.

OBJECTIVE:
Generate a daily market context tip that combines:
1. Current market condition
2. Specific currency pairs
3. One clear execution rule

INPUT DATA:
- trading_date: ${dayContext.isoDate}
- trading_weekday: ${dayContext.weekday}
- daily_focus: ${dayContext.focus}
- market_state_hint: ${marketState}
- selected_pairs: ${JSON.stringify(pairs)}
- pair_briefs: ${JSON.stringify(pairBriefs)}
- market_snapshot: ${JSON.stringify(snapshotSummary)}

STRICT RULES:
1. Title: max 6-8 words
2. Body: max 3-4 sentences
3. Must include market state and execution action
4. Must reference 1-2 currency pairs
5. Must be practical, realistic, and immediately usable
6. Must not feel generic
7. Use professional tone with no hype or promises
8. The tip must clearly reflect ${dayContext.weekday}'s trading context and must not read like a reused prior-day summary
9. The execution advice must align with this daily focus: ${dayContext.focus}
10. If a pair is mentioned, its condition must match the supplied pair_briefs and market_snapshot exactly
11. Write in an educative trader style: explain why the setup matters, what the trader should watch, and what invalidates the idea

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
- Must feel specific to ${dayContext.weekday}, ${dayContext.isoDate}
- Must teach the user something concrete about the pair condition or setup logic

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
