import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { getPricingMatrix, saveManualUsdNgnExchangeRate, saveUsdBasePricingMatrix } from '@/lib/pricing/store';

function isAdmin(role: string | undefined) {
  return role === 'Super Admin' || role === 'Administrator';
}

function isSuperAdmin(role: string | undefined) {
  return role === 'Super Admin';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: role ? 403 : 401 });

  const { pricingMatrix, exchangeRate, usdBasePricing } = await getPricingMatrix({
    // Always attempt a live refresh for admin pricing views so stale fallback values
    // do not linger in the dashboard when providers are available.
    forceRefreshRate: true,
  });
  return NextResponse.json({ pricingMatrix, exchangeRate, usdBasePricing });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: role ? 403 : 401 });
  if (!isSuperAdmin(role)) return NextResponse.json({ error: 'Only Super Admin can update pricing' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const hasPricing = !!body?.usdBasePricing;
  const hasManualRate = body?.manualExchangeRate !== undefined && body?.manualExchangeRate !== null && body?.manualExchangeRate !== '';

  if (!hasPricing && !hasManualRate) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (hasPricing) {
    await saveUsdBasePricingMatrix(body.usdBasePricing);
  }

  if (hasManualRate) {
    await saveManualUsdNgnExchangeRate(Number(body.manualExchangeRate));
  }

  const { pricingMatrix, exchangeRate, usdBasePricing } = await getPricingMatrix({
    forceRefreshRate: !hasManualRate,
  });
  return NextResponse.json({ success: true, pricingMatrix, exchangeRate, usdBasePricing });
}
