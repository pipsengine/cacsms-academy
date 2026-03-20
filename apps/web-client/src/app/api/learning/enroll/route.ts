import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';

// POST /api/learning/enroll — enroll a user in the course, starting from lesson 1
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const enrollment = await prisma.courseEnrollment.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    return NextResponse.json({ success: true, enrolledAt: enrollment.enrolledAt });
  } catch (error) {
    console.error('POST /api/learning/enroll failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
