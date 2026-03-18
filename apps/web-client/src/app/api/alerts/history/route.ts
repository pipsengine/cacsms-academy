import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { listRecentAlerts } from '@/lib/alerts/service';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? 25);
  const alerts = await listRecentAlerts(Number.isFinite(limit) ? limit : 25);

  return NextResponse.json({ alerts }, { headers: { 'Cache-Control': 'no-store' } });
}
