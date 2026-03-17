import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (role !== 'Super Admin' && role !== 'Administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const totalUsage = await prisma.usageLog.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsersGroup = await prisma.usageLog.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: today,
        },
      },
      _count: { userId: true },
    });

    const featureUsageGroup = await prisma.usageLog.groupBy({
      by: ['featureName'],
      _count: { _all: true },
    });

    const featureUsage = featureUsageGroup.reduce<Record<string, number>>((acc, record) => {
      acc[record.featureName] = record._count._all;
      return acc;
    }, {});

    const upgradesToday = 0;

    return NextResponse.json({
      totalUsage,
      activeUsersToday: activeUsersGroup.length,
      upgradesToday,
      featureUsage,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
