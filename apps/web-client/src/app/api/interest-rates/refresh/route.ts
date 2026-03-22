import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { computeCurrencyAnalytics, getInterestRateSnapshot, getLatestByCurrency } from '@/lib/interest-rates/store';

function isAdmin(role: string | undefined) {
  return role === 'Super Admin' || role === 'Administrator';
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!isAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: role ? 403 : 401 });
  }

  try {
    const snapshot = await getInterestRateSnapshot({ forceRefresh: true });
    const records = getLatestByCurrency(snapshot);
    const analytics = computeCurrencyAnalytics(snapshot);

    return NextResponse.json({
      success: true,
      records,
      analytics,
      fetchedAt: snapshot.fetchedAt,
      source: snapshot.source,
      stale: snapshot.stale,
    });
  } catch (error) {
    console.error('Interest-rate refresh POST failed', error);
    return NextResponse.json({ error: 'Failed to refresh interest-rate dataset' }, { status: 500 });
  }
}
