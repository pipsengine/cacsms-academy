import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';

const ALLOWED_EVENTS = new Set([
  'lesson_opened',
  'lesson_completed',
  'topic_opened',
  'keyboard_navigation_used',
  'resume_clicked',
]);

function getLearningEventDelegate() {
  const candidate = prisma as typeof prisma & {
    learningEvent?: {
      create: (...args: any[]) => Promise<unknown>;
    };
  };

  return candidate.learningEvent;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      eventType?: string;
      route?: string;
      lessonSlug?: string;
      week?: number;
      day?: string;
      metadata?: Record<string, unknown>;
    } | null;

    if (!body?.eventType || !body.route || !ALLOWED_EVENTS.has(body.eventType)) {
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    const user = email
      ? await prisma.user.findUnique({ where: { email }, select: { id: true } })
      : null;

    const learningEvent = getLearningEventDelegate();
    if (!learningEvent) {
      return NextResponse.json({ success: true, skipped: true });
    }

    await learningEvent.create({
      data: {
        userId: user?.id ?? null,
        eventType: body.eventType,
        route: body.route,
        lessonSlug: body.lessonSlug,
        week: typeof body.week === 'number' ? body.week : null,
        day: body.day ?? null,
        metadata: body.metadata ?? undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/learning/events failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
