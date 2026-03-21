import { getUsdNgnExchangeRate } from '../../../lib/pricing/store.ts';
import { auth } from '../../../lib/auth.ts';
import { prisma } from '../../../lib/prisma.ts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== 'super_admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rate = await getUsdNgnExchangeRate();

    return Response.json({
      success: true,
      rate: {
        usdToNgn: rate.usdToNgn,
        fetchedAt: rate.fetchedAt,
        source: rate.source,
        stale: rate.stale,
      },
      examples: {
        analyst: {
          usd: 19,
          ngn: Math.round(19 * rate.usdToNgn),
        },
        trader: {
          usd: 49,
          ngn: Math.round(49 * rate.usdToNgn),
        },
        proTrader: {
          usd: 99,
          ngn: Math.round(99 * rate.usdToNgn),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ExchangeRateAPI] GET failed:', error);
    return Response.json(
      {
        error: 'Failed to fetch exchange rate',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== 'super_admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, usdToNgn } = body;

    if (action === 'refresh') {
      // Force refresh from API
      const rate = await getUsdNgnExchangeRate({ forceRefresh: true });

      return Response.json({
        success: true,
        message: 'Exchange rate refreshed successfully',
        rate: {
          usdToNgn: rate.usdToNgn,
          fetchedAt: rate.fetchedAt,
          source: rate.source,
          stale: rate.stale,
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'set' && typeof usdToNgn === 'number' && usdToNgn > 0) {
      // Manually set exchange rate for testing/overrides
      const snapshot = {
        usdToNgn,
        fetchedAt: new Date().toISOString(),
        source: 'manual',
        stale: false,
      };

      await prisma.platformSetting.upsert({
        where: { key: 'usdNgnExchangeRate' },
        update: { value: JSON.stringify(snapshot) },
        create: { key: 'usdNgnExchangeRate', value: JSON.stringify(snapshot) },
      });

      return Response.json({
        success: true,
        message: `Exchange rate manually set to ${usdToNgn}`,
        rate: snapshot,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'history') {
      // Get rate update history from logs
      const record = await prisma.platformSetting.findUnique({
        where: { key: 'usdNgnExchangeRate' },
      });

      if (!record) {
        return Response.json(
          { error: 'No rate history found' },
          { status: 404 }
        );
      }

      const parsed = JSON.parse(record.value);
      return Response.json({
        success: true,
        current: parsed,
        lastUpdated: record.updatedAt,
      });
    }

    return Response.json(
      {
        error: 'Invalid action',
        validActions: ['refresh', 'set', 'history'],
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[ExchangeRateAPI] POST failed:', error);
    return Response.json(
      {
        error: 'Failed to update exchange rate',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
