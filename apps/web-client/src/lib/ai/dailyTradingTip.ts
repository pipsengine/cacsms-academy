import { GoogleGenAI } from '@google/genai';
import type { MarketSnapshot } from '@/lib/market/types';

export type DailyTradingTipInput = {
  marketSnapshot?: Partial<MarketSnapshot>;
  selectedPairs?: string[];
};

export type DailyTradingTipOutput = {
  title: string;
  tip: string;
  pairs: string[];
  market_state: string;
  actionable_insight: string;
  image_prompt: string;
};

const DEFAULT_IMAGE_PROMPT = 'A clean, high-quality forex trading visual showing candlestick charts, trendlines or support/resistance, dark theme, minimal text, professional fintech style';

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

  return dedupePairs([...fromBreakouts, ...fromChannels]).slice(0, 2);
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
  const pairText = pairs.length > 0 ? ` on ${pairs.join(' and ')}` : '';

  const tip = `In ${marketState} conditions${pairText}, wait for a candle close beyond a key support or resistance zone before entering. Set your stop-loss beyond the rejected level and size risk to 1% per trade so one false breakout does not damage your week.`;

  return {
    title: 'Trade Structure, Not Noise',
    tip,
    pairs,
    market_state: marketState,
    actionable_insight: 'Use close-confirmed breakout entries with a stop beyond invalidation and fixed 1% risk per trade.',
    image_prompt: DEFAULT_IMAGE_PROMPT,
  };
}

function normalizeOutput(raw: Partial<DailyTradingTipOutput>, input: DailyTradingTipInput): DailyTradingTipOutput {
  const fallback = buildFallbackTip(input);

  const pairs = raw.pairs && Array.isArray(raw.pairs)
    ? dedupePairs(raw.pairs).slice(0, 2)
    : fallback.pairs;

  let title = typeof raw.title === 'string' ? raw.title.trim() : fallback.title;
  if (!title) title = fallback.title;
  title = clampTitleWords(title);

  let marketState = typeof raw.market_state === 'string' ? raw.market_state.trim() : '';
  if (!marketState) marketState = fallback.market_state;

  let tip = typeof raw.tip === 'string' ? raw.tip.trim() : fallback.tip;
  if (!tip) tip = fallback.tip;

  if (!hasMarketCondition(tip)) {
    tip = `${tip} Current structure is ${marketState}.`;
  }

  if (!hasActionableLanguage(tip)) {
    tip = `${tip} Enter only after a confirmed close and keep risk fixed at 1%.`;
  }

  const sentences = tip
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length < 2) {
    tip = `${tip} Set your stop beyond the invalidation level before entry.`;
  } else if (sentences.length > 3) {
    tip = sentences.slice(0, 3).join(' ');
  }

  let actionable = typeof raw.actionable_insight === 'string' ? raw.actionable_insight.trim() : '';
  if (!actionable) {
    actionable = 'Wait for confirmation at key levels, place your stop beyond invalidation, and cap risk to 1% per trade.';
  }

  if (!hasActionableLanguage(actionable)) {
    actionable = `${actionable} Enter only on confirmation and pre-define stop-loss before execution.`;
  }

  const imagePrompt = typeof raw.image_prompt === 'string' && raw.image_prompt.trim().length > 0
    ? raw.image_prompt.trim()
    : DEFAULT_IMAGE_PROMPT;

  if (countSentences(tip) < 2 || countSentences(tip) > 3) {
    return fallback;
  }

  return {
    title,
    tip,
    pairs,
    market_state: marketState,
    actionable_insight: actionable,
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

  return `SYSTEM ROLE:
You are an institutional-grade Forex trading assistant for Intel Trader. You provide concise, actionable daily trading insights based on current or recent market conditions.

OBJECTIVE:
Generate a high-quality daily trading tip that combines:
1. Practical trading advice
2. Current or recent market behavior (trend, consolidation, breakout, volatility)
3. Reference to 1-2 relevant currency pairs when applicable

INPUT DATA:
- market_state_hint: ${marketState}
- selected_pairs: ${JSON.stringify(pairs)}
- market_snapshot: ${JSON.stringify(snapshotSummary)}

STRICT RULES:
1. Title must be <= 8 words
2. Tip must be 2-3 sentences only
3. Must include at least ONE actionable idea
4. Must reference market condition (trend, range, breakout, rejection, etc.)
5. Avoid generic advice (e.g., "be patient" alone is not allowed)
6. Use professional tone (no hype, no promises)
7. If market data is unavailable -> fallback to educational but still actionable tip

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "title": "string",
  "tip": "string",
  "pairs": ["EUR/USD", "GBP/USD"],
  "market_state": "short description",
  "actionable_insight": "specific trading advice derived from the tip",
  "image_prompt": "A clean, high-quality forex trading visual showing candlestick charts, trendlines or support/resistance, dark theme, minimal text, professional fintech style"
}

QUALITY CHECKS BEFORE FINAL OUTPUT:
- Ensure tip reflects a real trading scenario
- Ensure at least one pair is mentioned if market context exists
- Ensure clarity for beginner-to-intermediate traders

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
