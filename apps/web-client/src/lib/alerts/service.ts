import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.ts';
import { getAIDecisionSignals } from '../intelligence/decisions.ts';
import { getLiveRankedOpportunities } from '../intelligence/live.ts';
import { getLiquidityOverview } from '../market/liquidity.ts';
import { getMarketDataService } from '../market/service.ts';
import { isMailConfigured, sendEmail } from '../mail.ts';
import { usageDb } from '../usage/store.ts';

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
  const [snapshot, liquidity, opportunities, decisions] = await Promise.all([
    getMarketDataService().getSnapshot(),
    getLiquidityOverview(),
    getLiveRankedOpportunities(),
    getAIDecisionSignals(95),
  ]);

  const bucketKey = getBucketKey();
  return [
    ...snapshot.channels.slice(0, 3).map((entry) => ({
      fingerprint: buildFingerprint(['channel', bucketKey, entry.pair, entry.tf, entry.type, entry.bias]),
      alertType: 'CHANNEL',
      severity: entry.score >= 80 ? 'success' : 'info',
      pair: entry.pair,
      timeframe: entry.tf,
      title: `${entry.pair} channel ${entry.type.toLowerCase()}`,
      message: `${entry.tf} ${entry.type} channel with ${entry.score}% structural score and ${entry.bias.toLowerCase()} bias.`,
      source: 'active-channel-scanner',
      metadata: entry,
    })),
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
    ...decisions.horizons.flatMap((horizon) =>
      horizon.picks.map((pick) => ({
        fingerprint: buildFingerprint(['ai-decision', bucketKey, horizon.horizon, pick.pair, pick.direction]),
        alertType: 'AI_DECISION',
        severity: pick.confidence >= 97 ? 'success' : 'warning',
        pair: pick.pair,
        timeframe: horizon.timeframe,
        title: `${pick.pair} ${horizon.horizon} AI trade decision`,
        message: `${pick.direction} bias with ${pick.confidence}% confidence on ${horizon.timeframe}.`,
        source: 'ai-trade-decision',
        metadata: {
          horizon: horizon.horizon,
          ...pick,
        },
      }))
    ),
  ];
}

function getAllowedEmailAlertTypes(planType: string) {
  switch (planType) {
    case 'Scout':
      return ['CHANNEL'] as const;
    case 'Analyst':
      return ['CHANNEL', 'BREAKOUT'] as const;
    case 'Trader':
    case 'ProTrader':
    case 'Institutional':
      return ['CHANNEL', 'BREAKOUT', 'AI_DECISION'] as const;
    default:
      return ['CHANNEL'] as const;
  }
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

function getUserPreferenceDelegate() {
  const candidate = prisma as typeof prisma & {
    userPreference?: {
      findMany: (...args: any[]) => Promise<Array<{ userId: string; emailAlerts: boolean }>>;
    };
  };

  return candidate.userPreference;
}

type AlertInput = Awaited<ReturnType<typeof buildDerivedAlerts>>[number];

async function listAlertSubscribers() {
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'Active' },
    include: { user: true },
    orderBy: { updatedAt: 'desc' },
  });

  const latestByUser = new Map<string, { userId: string; email: string; name: string | null; planType: string }>();
  for (const sub of subscriptions) {
    if (!sub.user?.email) continue;
    if (!latestByUser.has(sub.userId)) {
      latestByUser.set(sub.userId, {
        userId: sub.userId,
        email: sub.user.email,
        name: sub.user.name,
        planType: sub.planType,
      });
    }
  }

  const subscribers = [...latestByUser.values()];
  const userPreference = getUserPreferenceDelegate();
  if (!userPreference || subscribers.length === 0) return subscribers;

  const prefs = await userPreference.findMany({
    where: { userId: { in: subscribers.map((entry) => entry.userId) } },
    select: { userId: true, emailAlerts: true },
  });
  const prefByUser = new Map(prefs.map((entry) => [entry.userId, entry.emailAlerts] as const));
  return subscribers.filter((entry) => prefByUser.get(entry.userId) !== false);
}

async function canSendAlertForUser(userId: string, planType: string) {
  const limit = await usageDb.findLimit(planType, 'Alert System');
  if (!limit) return true;
  if (limit.dailyLimit === 'Unlimited') return true;

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const sentToday = await usageDb.getUsageCount(userId, 'Alert System', dayStart);
  return sentToday < limit.dailyLimit;
}

async function wasAlertAlreadySentToday(userId: string, fingerprint: string) {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dedupeFeature = `Alert Dispatch ${fingerprint}`;
  const count = await usageDb.getUsageCount(userId, dedupeFeature, dayStart);
  return count > 0;
}

async function recordAlertDispatch(userId: string, fingerprint: string) {
  await usageDb.logUsage(userId, 'Alert System', 'notification-email');
  await usageDb.logUsage(userId, `Alert Dispatch ${fingerprint}`, 'notification-email-dedupe');
}

function renderAlertEmail(alert: AlertInput) {
  const pair = alert.pair ?? 'N/A';
  const timeframe = alert.timeframe ?? 'N/A';

  if (alert.alertType === 'CHANNEL') {
    const title = `[Cacsms Academy] Channel Alert: ${pair} ${timeframe}`;
    const text = [
      'Channel Formation Alert',
      `Pair: ${pair}`,
      `Timeframe: ${timeframe}`,
      `Severity: ${alert.severity}`,
      '',
      alert.message,
      '',
      'This is an early structure alert for channel formation or confirmation.',
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
        <h2 style="margin:0 0 12px 0">Channel Formation Alert</h2>
        <p style="margin:0 0 8px 0"><strong>Pair:</strong> ${pair}</p>
        <p style="margin:0 0 8px 0"><strong>Timeframe:</strong> ${timeframe}</p>
        <p style="margin:0 0 8px 0"><strong>Severity:</strong> ${alert.severity}</p>
        <p style="margin:12px 0 0 0">${alert.message}</p>
        <p style="margin:12px 0 0 0;color:#555">This is an early structure alert for channel formation or confirmation.</p>
      </div>
    `;

    return { title, text, html };
  }

  if (alert.alertType === 'BREAKOUT') {
    const title = `[Cacsms Academy] Breakout Alert: ${pair} ${timeframe}`;
    const text = [
      'Breakout Alert',
      `Pair: ${pair}`,
      `Timeframe: ${timeframe}`,
      `Severity: ${alert.severity}`,
      '',
      alert.message,
      '',
      'This alert indicates a likely or active breakout from the monitored channel structure.',
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
        <h2 style="margin:0 0 12px 0">Breakout Alert</h2>
        <p style="margin:0 0 8px 0"><strong>Pair:</strong> ${pair}</p>
        <p style="margin:0 0 8px 0"><strong>Timeframe:</strong> ${timeframe}</p>
        <p style="margin:0 0 8px 0"><strong>Severity:</strong> ${alert.severity}</p>
        <p style="margin:12px 0 0 0">${alert.message}</p>
        <p style="margin:12px 0 0 0;color:#555">This alert indicates a likely or active breakout from the monitored channel structure.</p>
      </div>
    `;

    return { title, text, html };
  }

  if (alert.alertType === 'AI_DECISION') {
    const title = `[Cacsms Academy] AI Trade Decision: ${pair} ${timeframe}`;
    const text = [
      'AI Trade Decision Alert',
      `Pair: ${pair}`,
      `Decision Horizon: ${timeframe}`,
      `Severity: ${alert.severity}`,
      '',
      alert.message,
      '',
      'This alert passed the final AI decision layer and is intended as a high-conviction trade candidate.',
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
        <h2 style="margin:0 0 12px 0">AI Trade Decision Alert</h2>
        <p style="margin:0 0 8px 0"><strong>Pair:</strong> ${pair}</p>
        <p style="margin:0 0 8px 0"><strong>Decision Horizon:</strong> ${timeframe}</p>
        <p style="margin:0 0 8px 0"><strong>Severity:</strong> ${alert.severity}</p>
        <p style="margin:12px 0 0 0">${alert.message}</p>
        <p style="margin:12px 0 0 0;color:#555">This alert passed the final AI decision layer and is intended as a high-conviction trade candidate.</p>
      </div>
    `;

    return { title, text, html };
  }

  const title = `[Cacsms Academy] ${alert.title}`;
  const text = [
    `Alert Type: ${alert.alertType}`,
    `Pair: ${pair}`,
    `Timeframe: ${timeframe}`,
    `Severity: ${alert.severity}`,
    '',
    alert.message,
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
      <h2 style="margin:0 0 12px 0">${alert.title}</h2>
      <p style="margin:0 0 8px 0"><strong>Type:</strong> ${alert.alertType}</p>
      <p style="margin:0 0 8px 0"><strong>Pair:</strong> ${pair}</p>
      <p style="margin:0 0 8px 0"><strong>Timeframe:</strong> ${timeframe}</p>
      <p style="margin:0 0 8px 0"><strong>Severity:</strong> ${alert.severity}</p>
      <p style="margin:12px 0 0 0">${alert.message}</p>
    </div>
  `;

  return { title, text, html };
}

async function dispatchEmailAlerts(alertInputs: AlertInput[]) {
  if (!isMailConfigured()) return;
  if (alertInputs.length === 0) return;

  const subscribers = await listAlertSubscribers();
  if (subscribers.length === 0) return;

  const highPriorityAlerts = alertInputs
    .filter((alert) => alert.alertType === 'AI_DECISION')
    .slice(0, 3);

  for (const subscriber of subscribers) {
    const allowed = await canSendAlertForUser(subscriber.userId, subscriber.planType);
    if (!allowed) continue;

    const allowedAlertTypes = new Set(getAllowedEmailAlertTypes(subscriber.planType));
    const deliverableAlerts = alertInputs
      .filter((alert) => allowedAlertTypes.has(alert.alertType as 'CHANNEL' | 'BREAKOUT' | 'AI_DECISION'))
      .sort((left, right) => {
        const priority: Record<string, number> = {
          AI_DECISION: 3,
          BREAKOUT: 2,
          CHANNEL: 1,
        };
        return (priority[right.alertType] ?? 0) - (priority[left.alertType] ?? 0);
      })
      .slice(0, 3);

    if (deliverableAlerts.length === 0) continue;

    for (const alert of deliverableAlerts) {
      const alreadySent = await wasAlertAlreadySentToday(subscriber.userId, alert.fingerprint);
      if (alreadySent) continue;

      const mail = renderAlertEmail(alert);
      try {
        await sendEmail({
          to: subscriber.email,
          subject: mail.title,
          text: mail.text,
          html: mail.html,
        });
        await recordAlertDispatch(subscriber.userId, alert.fingerprint);
      } catch {
        // Continue dispatching for other users/alerts if one send fails
      }
    }
  }
}

export async function syncDerivedAlerts() {
  const alertInputs = await buildDerivedAlerts();
  const alertEvent = getAlertEventDelegate();

  await dispatchEmailAlerts(alertInputs);

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
