import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { runIngestion } from '@/lib/cot/ingestor';

function isAdmin(role: string | undefined) {
  return role === 'Super Admin' || role === 'Administrator';
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | null)?.role;
    if (!isAdmin(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: role ? 403 : 401 });
    }

    const result = await runIngestion();

    return NextResponse.json(result, {
      status: result.success ? 200 : 207,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('COT ingest POST failed', error);
    return NextResponse.json({ error: 'Ingestion pipeline failed' }, { status: 500 });
  }
}
