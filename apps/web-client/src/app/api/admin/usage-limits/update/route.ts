import { NextResponse } from 'next/server';
import { usageDb, LimitValue } from '@/lib/usage/store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (role !== 'Super Admin' && role !== 'Administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { limits } = await request.json();

    if (!Array.isArray(limits)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    for (const limit of limits) {
      const toValue = (value: unknown): LimitValue => {
        if (value === 'Unlimited') return 'Unlimited';
        if (typeof value === 'string' && value.trim().toLowerCase() === 'unlimited') return 'Unlimited';
        const num = Number(value);
        return Number.isNaN(num) ? 0 : num;
      };

      await usageDb.updateLimit(limit.planName, limit.featureName, toValue(limit.hourlyLimit), toValue(limit.dailyLimit));
    }

    const refreshedLimits = await usageDb.getLimits();
    return NextResponse.json({ success: true, limits: refreshedLimits });
  } catch (error) {
    console.error('Update limits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
