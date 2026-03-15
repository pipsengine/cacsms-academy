import { NextResponse } from 'next/server';
import { usageDb } from '@/lib/usage/store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (role !== 'Super Admin' && role !== 'Administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const logs = usageDb.logs;
    
    // Calculate analytics
    const totalUsage = logs.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeUsersToday = new Set(
      logs.filter(log => new Date(log.timestamp) >= today).map(log => log.userId)
    ).size;

    const featureUsage = logs.reduce((acc: any, log) => {
      acc[log.featureName] = (acc[log.featureName] || 0) + 1;
      return acc;
    }, {});

    // For upgrades today, we'd need to track subscription changes.
    // For now, we'll just mock it or leave it as 0.
    const upgradesToday = 0;

    return NextResponse.json({
      totalUsage,
      activeUsersToday,
      upgradesToday,
      featureUsage
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
