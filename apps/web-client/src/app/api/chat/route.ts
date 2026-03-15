import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitResult = rateLimit({ key: `chat:${ip}`, limit: 30, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are the Intel Trader AI, an advanced institutional-grade financial intelligence assistant. 
    You help forex traders analyze market structures, probabilities, and navigate the Intel Trader platform.
    Keep your responses concise, professional, and focused on trading concepts like channels, breakouts, and liquidity.
    
    User: ${message}
    AI:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return NextResponse.json({ response: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
