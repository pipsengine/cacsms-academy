import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';

type CacheEntry = {
  response: string;
  timestamp: number;
  plan: string;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const chatResponseCache = new Map<string, CacheEntry>();

function buildCacheKey(userId: string | undefined, plan: string, message: string) {
  return `${userId ?? 'anon'}:${plan}:${message.trim().toLowerCase()}`;
}

function chunkText(text: string): string[] {
  if (!text) return [];
  const chunkSize = 120;
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return text.match(regex) || [];
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const plan = ((session?.user as any)?.plan as string) || 'Free';
    const payload = await req.json();
    const message = payload?.message;

    const cacheKey = buildCacheKey(userId, plan, message || '');
    const cached = chatResponseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        response: cached.response,
        chunks: chunkText(cached.response),
      });
    }

    const ip = getClientIp(req);
    const limitResult = rateLimit({ key: `chat:${ip}`, limit: 30, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = 'Cacsms Academy AI is temporarily unavailable. Please check back shortly.';
      return NextResponse.json({ response: fallback, chunks: chunkText(fallback) });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are the Cacsms Academy AI, an advanced institutional-grade financial intelligence assistant. 
    The user is on the ${plan} plan (userId: ${userId ?? 'guest'}).
    You help forex traders analyze market structures, probabilities, and navigate the Cacsms Academy platform.
    Keep your responses concise, professional, and focused on trading concepts like channels, breakouts, and liquidity.
    
    User: ${message}
    AI:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const answer = response.text || 'I am unable to generate a response right now.';
    chatResponseCache.set(cacheKey, { response: answer, timestamp: Date.now(), plan });
    return NextResponse.json({ response: answer, chunks: chunkText(answer) });
  } catch (error) {
    console.error('Gemini API Error:', error);
    const fallback = 'I am experiencing connectivity issues. Please try again in a few seconds.';
    return NextResponse.json({ response: fallback, chunks: chunkText(fallback) });
  }
}
