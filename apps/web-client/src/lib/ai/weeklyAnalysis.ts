import { GoogleGenAI } from '@google/genai';
import type { ForexCandle } from '@/lib/market/types';
import type { RankedOpportunity } from '@/lib/intelligence/types';

export type WeeklyAnalysisOutput = {
  pair: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  score: number;
  probability: 'Low' | 'Moderate' | 'High';
  market_type: 'Trending' | 'Range Bound';
  summary: string;
  analysis: string;
  key_levels: {
    support: string[];
    resistance: string[];
  };
  trade_focus: string;
  image_requirement: 'REAL_CHART_REQUIRED';
};

export type WeeklyAnalysisInput = {
  pair: string;
  provider: string;
  h4Candles: ForexCandle[];
  h1Candles: ForexCandle[];
  opportunity?: RankedOpportunity | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatLevel(pair: string, value: number) {
  return value.toFixed(pair.includes('JPY') ? 2 : 4);
}

function deriveDirection(candles: ForexCandle[], opportunity?: RankedOpportunity | null): 'LONG' | 'SHORT' | 'NEUTRAL' {
  if (opportunity && opportunity.compositeScore < 58) return 'NEUTRAL';
  if (candles.length < 2) return opportunity?.direction ?? 'NEUTRAL';

  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const movePct = ((last - first) / first) * 100;

  if (movePct >= 0.35) return 'LONG';
  if (movePct <= -0.35) return 'SHORT';
  return opportunity?.compositeScore && opportunity.compositeScore >= 70 ? opportunity.direction : 'NEUTRAL';
}

function deriveMarketType(opportunity?: RankedOpportunity | null): 'Trending' | 'Range Bound' {
  if (!opportunity) return 'Range Bound';
  return opportunity.regime === 'Trending' || opportunity.regime === 'Volatility Expansion' ? 'Trending' : 'Range Bound';
}

function deriveProbability(score: number): 'Low' | 'Moderate' | 'High' {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Moderate';
  return 'Low';
}

function uniqueLevels(values: number[], pair: string) {
  return Array.from(new Set(values.map((value) => formatLevel(pair, value))));
}

function deriveLevels(pair: string, h4Candles: ForexCandle[]) {
  const recent = h4Candles.slice(-24);
  const recentShort = h4Candles.slice(-8);
  const allHighs = recent.map((candle) => candle.high);
  const allLows = recent.map((candle) => candle.low);
  const shortHighs = recentShort.map((candle) => candle.high);
  const shortLows = recentShort.map((candle) => candle.low);

  const supportValues = [
    Math.min(...shortLows),
    Math.min(...allLows),
  ].filter(Number.isFinite);

  const resistanceValues = [
    Math.max(...shortHighs),
    Math.max(...allHighs),
  ].filter(Number.isFinite);

  return {
    support: uniqueLevels(supportValues, pair).slice(0, 2),
    resistance: uniqueLevels(resistanceValues, pair).slice(0, 2),
  };
}

function buildFallbackAnalysis(input: WeeklyAnalysisInput): WeeklyAnalysisOutput {
  const score = clamp(Math.round(input.opportunity?.compositeScore ?? 62), 0, 100);
  const direction = deriveDirection(input.h4Candles, input.opportunity);
  const marketType = deriveMarketType(input.opportunity);
  const probability = deriveProbability(score);
  const keyLevels = deriveLevels(input.pair, input.h4Candles);
  const lastH4 = input.h4Candles[input.h4Candles.length - 1];
  const firstH4 = input.h4Candles[0];
  const h4MovePct = firstH4 && lastH4 ? (((lastH4.close - firstH4.close) / firstH4.close) * 100) : 0;
  const avgRange = average(input.h4Candles.map((candle) => candle.high - candle.low));
  const directionLabel = direction === 'NEUTRAL' ? 'neutral' : direction.toLowerCase();
  const summary = `${input.pair} holds a ${directionLabel} weekly bias with ${probability.toLowerCase()} conviction as ${marketType.toLowerCase()} conditions stay in play.`;
  const analysis = `${input.pair} has moved ${Math.abs(h4MovePct).toFixed(2)}% across the recent H4 sample, with current structure reading as ${marketType.toLowerCase()}. Composite scoring is ${score}/100, supported by ${input.opportunity?.confidenceClass?.toLowerCase() ?? 'measured market context'} and real price data from ${input.provider}. Support is layered near ${keyLevels.support.join(' and ')}, while resistance sits near ${keyLevels.resistance.join(' and ')}. ${direction === 'LONG' ? 'Buyers need continuation above support and acceptance through resistance to keep momentum valid.' : direction === 'SHORT' ? 'Sellers need price to stay capped below resistance and extend through support to keep downside control.' : 'A clean directional break away from the current range is required before committing to size.'}`;
  const tradeFocus = direction === 'LONG'
    ? `Watch for bullish continuation above ${keyLevels.support[0] ?? 'support'} and only execute after price confirms strength toward ${keyLevels.resistance[0] ?? 'resistance'}.`
    : direction === 'SHORT'
      ? `Watch for rejection below ${keyLevels.resistance[0] ?? 'resistance'} and only execute if price breaks or closes through ${keyLevels.support[0] ?? 'support'}.`
      : `Watch for a decisive break beyond ${keyLevels.resistance[0] ?? 'resistance'} or below ${keyLevels.support[0] ?? 'support'} before taking directional exposure.`;

  return {
    pair: input.pair,
    direction,
    score,
    probability,
    market_type: marketType,
    summary,
    analysis,
    key_levels: keyLevels,
    trade_focus: tradeFocus,
    image_requirement: 'REAL_CHART_REQUIRED',
  };
}

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return null;
}

function normalizeDirection(value: string | undefined, fallback: WeeklyAnalysisOutput['direction']) {
  return value === 'LONG' || value === 'SHORT' || value === 'NEUTRAL' ? value : fallback;
}

function normalizeMarketType(value: string | undefined, fallback: WeeklyAnalysisOutput['market_type']) {
  return value === 'Trending' || value === 'Range Bound' ? value : fallback;
}

function normalizeProbability(value: string | undefined, fallback: WeeklyAnalysisOutput['probability']) {
  return value === 'Low' || value === 'Moderate' || value === 'High' ? value : fallback;
}

function normalizeOutput(raw: Partial<WeeklyAnalysisOutput>, fallback: WeeklyAnalysisOutput): WeeklyAnalysisOutput {
  const support = Array.isArray(raw.key_levels?.support) ? raw.key_levels.support.filter(Boolean).slice(0, 2) : fallback.key_levels.support;
  const resistance = Array.isArray(raw.key_levels?.resistance) ? raw.key_levels.resistance.filter(Boolean).slice(0, 2) : fallback.key_levels.resistance;

  return {
    pair: typeof raw.pair === 'string' && raw.pair.trim() ? raw.pair.trim() : fallback.pair,
    direction: normalizeDirection(raw.direction, fallback.direction),
    score: clamp(Math.round(Number(raw.score ?? fallback.score)), 0, 100),
    probability: normalizeProbability(raw.probability, fallback.probability),
    market_type: normalizeMarketType(raw.market_type, fallback.market_type),
    summary: typeof raw.summary === 'string' && raw.summary.trim() ? raw.summary.trim() : fallback.summary,
    analysis: typeof raw.analysis === 'string' && raw.analysis.trim() ? raw.analysis.trim() : fallback.analysis,
    key_levels: {
      support: support.length ? support : fallback.key_levels.support,
      resistance: resistance.length ? resistance : fallback.key_levels.resistance,
    },
    trade_focus: typeof raw.trade_focus === 'string' && raw.trade_focus.trim() ? raw.trade_focus.trim() : fallback.trade_focus,
    image_requirement: 'REAL_CHART_REQUIRED',
  };
}

function buildPrompt(input: WeeklyAnalysisInput, fallback: WeeklyAnalysisOutput) {
  return `🟣 FINAL WEEKLY ANALYSIS PROMPT (UPGRADED)
SYSTEM ROLE:
You are an institutional Forex analyst for Intel Trader.

OBJECTIVE:
Generate a weekly analysis for a currency pair with directional bias and reasoning.

STRICT RULES:
* Must include direction (LONG/SHORT/NEUTRAL)
* Must include reasoning
* Must include levels
* Must be concise but insightful

INPUT DATA:
- pair: ${input.pair}
- provider: ${input.provider}
- opportunity_snapshot: ${JSON.stringify(input.opportunity ?? null)}
- h4_recent_candles: ${JSON.stringify(input.h4Candles.slice(-20))}
- h1_recent_candles: ${JSON.stringify(input.h1Candles.slice(-20))}
- fallback_analysis: ${JSON.stringify(fallback)}

OUTPUT FORMAT:
{
"pair": "EUR/USD",
"direction": "LONG | SHORT | NEUTRAL",
"score": 0,
"probability": "Low | Moderate | High",
"market_type": "Trending | Range Bound",
"summary": "short explanation",
"analysis": "detailed reasoning",
"key_levels": {
"support": ["..."],
"resistance": ["..."]
},
"trade_focus": "what trader should watch",
"image_requirement": "REAL_CHART_REQUIRED"
}

CRITICAL:
* Chart must come from real data (TradingView or API)
* No fake/generated charts

Return only valid JSON.`;
}

export async function generateWeeklyAnalysis(input: WeeklyAnalysisInput): Promise<WeeklyAnalysisOutput> {
  const fallback = buildFallbackAnalysis(input);
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return fallback;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: buildPrompt(input, fallback),
    });

    const rawText = response.text ?? '';
    const jsonCandidate = extractJsonObject(rawText);
    if (!jsonCandidate) return fallback;

    const parsed = JSON.parse(jsonCandidate) as Partial<WeeklyAnalysisOutput>;
    return normalizeOutput(parsed, fallback);
  } catch {
    return fallback;
  }
}