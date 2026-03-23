import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getLessonBySlug } from '@/lib/learning/curriculum';
import { GoogleGenAI } from '@google/genai';

type ChatRequest = {
  lessonSlug: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

function buildSystemContext(lessonSlug: string): string {
  const lesson = getLessonBySlug(lessonSlug);
  if (!lesson) return 'You are an expert forex trading instructor helping a student with their lesson.';

  return [
    `You are an expert forex trading instructor and AI learning assistant on the Cacsms Academy education platform.`,
    ``,
    `The student is currently studying this lesson:`,
    `Title: "${lesson.title}"`,
    `Module: ${lesson.module} (Week ${lesson.week}, ${lesson.day})`,
    `Level: ${lesson.level}`,
    `Summary: ${lesson.summary}`,
    ``,
    `Your role:`,
    `- Answer questions about the current lesson topic clearly and educationally`,
    `- Use concrete forex trading examples with real pair names (EUR/USD, GBP/USD, etc.)`,
    `- Explain concepts at the appropriate ${lesson.level.toLowerCase()} level`,
    `- If the student seems confused, break down the concept step by step`,
    `- Relate answers back to the lesson topic when possible`,
    `- Keep responses focused and practical — no more than 4-6 sentences unless a detailed explanation is genuinely needed`,
    `- Do not generate trade signals, specific entry/exit advice, or personalized financial recommendations`,
    `- You may reference other lessons in the curriculum if contextually relevant`,
  ].join('\n');
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit({ key: `learning-chat:${ip}`, limit: 30, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Partial<ChatRequest>;
    const { lessonSlug, message, history = [] } = body;

    if (!lessonSlug || typeof lessonSlug !== 'string' || lessonSlug.length > 200) {
      return NextResponse.json({ error: 'Invalid lessonSlug' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const ai = getAiClient();
    if (!ai) {
      return NextResponse.json({
        reply: buildFallbackReply(message, lessonSlug),
      });
    }

    const systemPrompt = buildSystemContext(lessonSlug);
    const safeHistory = (Array.isArray(history) ? history : []).slice(-6);

    const contents = [
      // Include chat history
      ...safeHistory.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(h.content).slice(0, 1000) }],
      })),
      // Current user message
      { role: 'user' as const, parts: [{ text: message.trim() }] },
    ];

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    });

    const reply = result.text?.trim() ?? buildFallbackReply(message, lessonSlug);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('POST /api/learning/chat failed', error);
    return NextResponse.json({
      reply: 'The AI assistant is temporarily unavailable. Please review the lesson content or try again shortly.',
    });
  }
}

function buildFallbackReply(message: string, lessonSlug: string): string {
  const lesson = getLessonBySlug(lessonSlug);
  const topic = lesson?.title ?? 'this topic';

  const normalizedMsg = message.toLowerCase();
  if (normalizedMsg.includes('example')) {
    return `To illustrate ${topic}: on EUR/USD, look at how price responds at a key structure level — that moment of reaction is what this lesson is about in a live context. Review the practical application section in the lesson for specific steps.`;
  }
  if (normalizedMsg.includes('why') || normalizedMsg.includes('important')) {
    return `${topic} matters because it changes not just what you observe on a chart, but how you respond to it. Traders who understand this concept make decisions based on structure rather than emotion. Work through the key concepts section to build that foundation.`;
  }
  if (normalizedMsg.includes('how')) {
    return `The process for ${topic} starts with identifying your context — trend, range, or transition — before applying any setup. The step-by-step breakdown is in the detailed explanation section of this lesson.`;
  }

  return `Great question about ${topic}. This concept is central to how professional traders filter decisions. I recommend re-reading the "Detailed Explanation" section in the lesson, then come back with any specific question about the concept and I will help clarify it.`;
}
