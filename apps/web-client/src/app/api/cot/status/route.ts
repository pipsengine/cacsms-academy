import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { COT_LAST_SYNC_KEY, LAGOS_TIMEZONE } from '@/lib/cot/scheduler';

function nextSundayMidnightLagosIso(now = new Date()): string {
  const lagosNow = new Date(now.toLocaleString('en-US', { timeZone: LAGOS_TIMEZONE }));
  const day = lagosNow.getDay();
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const next = new Date(lagosNow);
  next.setDate(lagosNow.getDate() + daysUntilSunday);
  next.setHours(0, 0, 0, 0);
  return next.toISOString();
}

export async function GET() {
  try {
    const record = await prisma.platformSetting.findUnique({ where: { key: COT_LAST_SYNC_KEY } });
    const count = await prisma.cotData.count();

    return NextResponse.json({
      timezone: LAGOS_TIMEZONE,
      schedule: 'Sunday 00:00',
      lastScheduledSyncDate: record?.value ?? null,
      nextScheduledSyncIso: nextSundayMidnightLagosIso(),
      cotRecords: count,
      autoSyncEnabled: process.env.COT_AUTO_SYNC_ENABLED !== 'false',
    });
  } catch (error) {
    console.error('COT status GET failed', error);
    return NextResponse.json({ error: 'Failed to load COT scheduler status' }, { status: 500 });
  }
}
