import { NextResponse } from 'next/server';
import { usageDb } from '@/lib/usage/store';
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

    // Update limits in the store
    for (const limit of limits) {
      usageDb.updateLimit(limit.planName, limit.featureName, limit.hourlyLimit, limit.dailyLimit);
    }

    return NextResponse.json({ success: true, limits: usageDb.getLimits() });
  } catch (error) {
    console.error('Update limits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
