import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { getAllLessons } from '@/lib/learning/curriculum';

// GET /api/learning/progress — returns enrollment + progress for the authenticated user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId: user.id },
      include: { progress: true },
    });

    if (!enrollment) {
      return NextResponse.json({ enrolled: false, progress: [], currentLessonIndex: 0 });
    }

    const all = getAllLessons();
    const progressMap = new Map(enrollment.progress.map((p) => [p.lessonSlug, p]));
    const completedSlugs = new Set(
      enrollment.progress.filter((p) => p.status === 'completed').map((p) => p.lessonSlug)
    );

    // Find the first lesson that is not yet completed — that's where the user continues
    const firstIncomplete = all.find((l) => !completedSlugs.has(l.slug));
    const currentLessonIndex = firstIncomplete?.lessonIndex ?? all.length;

    return NextResponse.json({
      enrolled: true,
      enrolledAt: enrollment.enrolledAt,
      lastAccessAt: enrollment.lastAccessAt,
      completedAt: enrollment.completedAt,
      currentLessonIndex,
      currentLesson: firstIncomplete ?? null,
      completedCount: completedSlugs.size,
      totalLessons: all.length,
      progress: enrollment.progress.map((p) => ({
        lessonSlug: p.lessonSlug,
        status: p.status,
        startedAt: p.startedAt,
        completedAt: p.completedAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/learning/progress failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/learning/progress/enroll  (handled via enroll route)
// PATCH /api/learning/progress — update a lesson's status
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { lessonSlug?: string; status?: string };
    const { lessonSlug, status } = body;

    if (!lessonSlug || !['started', 'completed'].includes(status ?? '')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Ensure enrollment exists
    await prisma.courseEnrollment.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    const now = new Date();
    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonSlug: { userId: user.id, lessonSlug } },
      create: {
        userId: user.id,
        lessonSlug,
        status: status as string,
        startedAt: status === 'started' ? now : undefined,
        completedAt: status === 'completed' ? now : undefined,
      },
      update: {
        status: status as string,
        startedAt: status === 'started' ? now : undefined,
        completedAt: status === 'completed' ? now : undefined,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('PATCH /api/learning/progress failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
