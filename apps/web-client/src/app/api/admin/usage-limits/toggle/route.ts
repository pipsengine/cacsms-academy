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

    const { enabled } = await request.json();
    await usageDb.setLimitsEnabled(Boolean(enabled));
    const newState = await usageDb.getLimitsEnabled();
    return NextResponse.json({ success: true, enabled: newState });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle limits' }, { status: 500 });
  }
}
