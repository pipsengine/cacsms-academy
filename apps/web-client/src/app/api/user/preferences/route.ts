import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';

function serialize(preferences: any) {
  return {
    alerts: {
      email: preferences.emailAlerts,
      push: preferences.pushAlerts,
      telegram: preferences.telegramAlerts,
      sound: preferences.soundAlerts,
    },
    trading: {
      riskPerTrade: String(preferences.riskPerTrade),
      defaultTimeframe: preferences.defaultTimeframe,
      minProbability: String(preferences.minProbability),
      autoScan: preferences.autoScan,
    },
    pairs: {
      majors: preferences.pairMajors,
      crosses: preferences.pairCrosses,
      exotics: preferences.pairExotics,
      crypto: preferences.pairCrypto,
    },
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const preferences = await prisma.userPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return NextResponse.json({ preferences: serialize(preferences) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const preferences = await prisma.userPreference.upsert({
    where: { userId },
    update: {
      emailAlerts: Boolean(body?.alerts?.email),
      pushAlerts: Boolean(body?.alerts?.push),
      telegramAlerts: Boolean(body?.alerts?.telegram),
      soundAlerts: Boolean(body?.alerts?.sound),
      riskPerTrade: Number(body?.trading?.riskPerTrade ?? 1),
      defaultTimeframe: body?.trading?.defaultTimeframe ?? 'H1',
      minProbability: Number(body?.trading?.minProbability ?? 75),
      autoScan: Boolean(body?.trading?.autoScan),
      pairMajors: Boolean(body?.pairs?.majors),
      pairCrosses: Boolean(body?.pairs?.crosses),
      pairExotics: Boolean(body?.pairs?.exotics),
      pairCrypto: Boolean(body?.pairs?.crypto),
    },
    create: {
      userId,
      emailAlerts: Boolean(body?.alerts?.email),
      pushAlerts: Boolean(body?.alerts?.push),
      telegramAlerts: Boolean(body?.alerts?.telegram),
      soundAlerts: Boolean(body?.alerts?.sound),
      riskPerTrade: Number(body?.trading?.riskPerTrade ?? 1),
      defaultTimeframe: body?.trading?.defaultTimeframe ?? 'H1',
      minProbability: Number(body?.trading?.minProbability ?? 75),
      autoScan: Boolean(body?.trading?.autoScan),
      pairMajors: Boolean(body?.pairs?.majors),
      pairCrosses: Boolean(body?.pairs?.crosses),
      pairExotics: Boolean(body?.pairs?.exotics),
      pairCrypto: Boolean(body?.pairs?.crypto),
    },
  });

  return NextResponse.json({ success: true, preferences: serialize(preferences) });
}
