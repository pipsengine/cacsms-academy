import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getLiveRankedOpportunities } from '@/lib/intelligence/live';
import { getLiquidityOverview } from '@/lib/market/liquidity';
import { getMarketDataService } from '@/lib/market/service';

function getBucketKey() {
  const now = new Date();
  now.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0);
  return now.toISOString();
}

function buildFingerprint(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join('|');
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function buildDerivedAlerts() {
  const [snapshot, liquidity, opportunities] = await Promise.all([
    getMarketDataService().getSnapshot(),
    getLiquidityOverview(),
    getLiveRankedOpportunities(),
  ]);

  const bucketKey = getBucketKey();
  return [
    ...snapshot.breakouts.slice(0, 3).map((entry) => ({
      fingerprint: buildFingerprint(['breakout', bucketKey, entry.pair, entry.tf, entry.dir, entry.status]),
      alertType: 'BREAKOUT',
      severity: entry.conf >= 85 ? 'success' : 'warning',
      pair: entry.pair,
      timeframe: entry.tf,
      title: `${entry.pair} breakout ${entry.dir}`,
      message: `${entry.tf} breakout is ${entry.status.toLowerCase()} with ${entry.conf}% confidence.`,
      source: 'market-breakout-engine',
      metadata: entry,
    })),
    ...liquidity.signals.slice(0, 2).map((entry) => ({
      fingerprint: buildFingerprint(['liquidity', bucketKey, entry.pair, entry.sweepState]),
      alertType: 'LIQUIDITY',
      severity: entry.sweepState === 'INSIDE-RANGE' ? 'info' : 'warning',
      pair: entry.pair,
      timeframe: entry.timeframe,
      title: `${entry.pair} liquidity ${entry.sweepState.toLowerCase()}`,
      message: `${entry.actionLabel}. Nearest pool: ${entry.nearestPool}.`,
      source: 'liquidity-intelligence',
      metadata: entry,
    })),
    ...opportunities.opportunities.slice(0, 2).map((entry) => ({
      fingerprint: buildFingerprint(['opportunity', bucketKey, entry.pair, String(entry.rank)]),
      alertType: 'OPPORTUNITY',
      severity: entry.compositeScore >= 90 ? 'success' : 'info',
      pair: entry.pair,
      timeframe: 'M15/H1/H4',
      title: `${entry.pair} ranked #${entry.rank}`,
      message: `${entry.direction} setup scored ${entry.compositeScore}% with ${entry.confidenceClass.toLowerCase()}.`,
      source: 'opportunity-ranking',
      metadata: entry,
    })),
  ];
}

function getAlertEventDelegate() {
  const candidate = prisma as typeof prisma & {
    alertEvent?: {
      upsert: (...args: any[]) => Promise<unknown>;
      findMany: (...args: any[]) => Promise<unknown>;
    };
  };

  return candidate.alertEvent;
}

export async function syncDerivedAlerts() {
  const alertInputs = await buildDerivedAlerts();
  const alertEvent = getAlertEventDelegate();

  if (!alertEvent) {
    return alertInputs;
  }

  await Promise.all(
    alertInputs.map((alert) =>
      alertEvent.upsert({
        where: { fingerprint: alert.fingerprint },
        update: {
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          metadata: toJsonValue(alert.metadata),
          status: 'active',
          source: alert.source,
        },
        create: {
          ...alert,
          metadata: toJsonValue(alert.metadata),
          status: 'active',
        },
      })
    )
  );

  return alertInputs;
}

export async function listRecentAlerts(limit = 25) {
  const derivedAlerts = await syncDerivedAlerts();
  const alertEvent = getAlertEventDelegate();

  if (!alertEvent) {
    return derivedAlerts
      .slice(0, limit)
      .map((alert, index) => ({
        id: `${alert.fingerprint}-${index}`,
        alertType: alert.alertType,
        severity: alert.severity,
        pair: alert.pair ?? null,
        timeframe: alert.timeframe ?? null,
        title: alert.title,
        message: alert.message,
        status: 'active',
        source: alert.source,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
  }

  return alertEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
