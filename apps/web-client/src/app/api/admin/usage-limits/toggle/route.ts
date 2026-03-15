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
    usageDb.limitsEnabled = enabled;
    return NextResponse.json({ success: true, enabled: usageDb.limitsEnabled });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle limits' }, { status: 500 });
  }
}
