import { prisma } from '@/lib/prisma';

export type LimitValue = number | 'Unlimited';

export interface UsageLimit {
  planName: string;
  featureName: string;
  hourlyLimit: LimitValue;
  dailyLimit: LimitValue;
}

export class UsageStore {
  limits: UsageLimit[] = [
    { planName: 'Free', featureName: 'Channel Scanner', hourlyLimit: 5, dailyLimit: 20 },
    { planName: 'Free', featureName: 'Breakout Engine', hourlyLimit: 5, dailyLimit: 20 },
    { planName: 'Free', featureName: 'Alert System', hourlyLimit: 'Unlimited', dailyLimit: 10 },
    { planName: 'Free', featureName: 'AI Probability Engine', hourlyLimit: 0, dailyLimit: 0 },
    { planName: 'Free', featureName: 'Liquidity Intelligence', hourlyLimit: 0, dailyLimit: 0 },
    { planName: 'Professional', featureName: 'Channel Scanner', hourlyLimit: 50, dailyLimit: 200 },
    { planName: 'Professional', featureName: 'Breakout Engine', hourlyLimit: 50, dailyLimit: 200 },
    { planName: 'Professional', featureName: 'Alert System', hourlyLimit: 'Unlimited', dailyLimit: 100 },
    { planName: 'Professional', featureName: 'AI Probability Engine', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Professional', featureName: 'Liquidity Intelligence', hourlyLimit: 0, dailyLimit: 0 },
    { planName: 'Premium', featureName: 'Channel Scanner', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Premium', featureName: 'Breakout Engine', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Premium', featureName: 'Alert System', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Premium', featureName: 'AI Probability Engine', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Premium', featureName: 'Liquidity Intelligence', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
  ];

  limitsEnabled: boolean = true; // kept for backward compatibility with sync reads

  private limitsInitialized = false;
  private pruneCounter = 0;

  getLimits(): UsageLimit[] {
    return this.limits;
  }

  async getLimitsEnabled(): Promise<boolean> {
    if (!this.limitsInitialized) {
      const record = await prisma.platformSetting.findUnique({ where: { key: 'usageLimitsEnabled' } });
      if (record) {
        this.limitsEnabled = record.value === 'true';
      }
      this.limitsInitialized = true;
    }
    return this.limitsEnabled;
  }

  async setLimitsEnabled(enabled: boolean): Promise<void> {
    this.limitsEnabled = enabled;
    this.limitsInitialized = true;
    await prisma.platformSetting.upsert({
      where: { key: 'usageLimitsEnabled' },
      update: { value: enabled ? 'true' : 'false' },
      create: { key: 'usageLimitsEnabled', value: enabled ? 'true' : 'false' },
    });
  }

  async logUsage(userId: string, featureName: string, usageType: string = 'request'): Promise<void> {
    await prisma.usageLog.create({
      data: {
        userId,
        featureName,
        usageType,
      },
    });

    this.pruneCounter += 1;
    if (this.pruneCounter >= 50) {
      this.pruneCounter = 0;
      await this.pruneOldLogs();
    }
  }

  async getUsageCount(userId: string, featureName: string, since: Date): Promise<number> {
    return prisma.usageLog.count({
      where: {
        userId,
        featureName,
        timestamp: {
          gte: since,
        },
      },
    });
  }

  async getFirstLogAfter(userId: string, featureName: string, since: Date): Promise<Date | null> {
    const log = await prisma.usageLog.findFirst({
      where: {
        userId,
        featureName,
        timestamp: {
          gte: since,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
    return log?.timestamp ?? null;
  }

  private async pruneOldLogs(): Promise<void> {
    const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // keep 60 days of history
    await prisma.usageLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoff,
        },
      },
    });
  }
}

export const usageDb = new UsageStore();
