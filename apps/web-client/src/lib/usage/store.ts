import { prisma } from '@/lib/prisma';

export type LimitValue = number | 'Unlimited';

export interface UsageLimit {
  planName: string;
  featureName: string;
  hourlyLimit: LimitValue;
  dailyLimit: LimitValue;
}

const DEFAULT_LIMITS: UsageLimit[] = [
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

type UsageLogEntry = {
  id: string;
  userId: string;
  featureName: string;
  usageType: string;
  timestamp: Date;
};

const hasPrisma =
  Boolean(process.env.DATABASE_URL) ||
  Boolean(process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_DB);

export class UsageStore {
  private limits: UsageLimit[] = [];
  private limitsLoaded = false;
  private pruneCounter = 0;
  private limitsEnabled = true;
  private fallbackLogs: UsageLogEntry[] = [];
  private dbEnabled = hasPrisma;

  async ensureLimitsLoaded() {
    if (this.limitsLoaded) return;

    if (!this.dbEnabled) {
      this.limits = DEFAULT_LIMITS;
      this.limitsLoaded = true;
      return;
    }

    const dbLimits = await prisma.usageLimit.findMany();
    if (dbLimits.length === 0) {
      await prisma.usageLimit.createMany({
        data: DEFAULT_LIMITS.map((limit) => ({
          planName: limit.planName,
          featureName: limit.featureName,
          hourlyLimit: this.serializeLimit(limit.hourlyLimit),
          dailyLimit: this.serializeLimit(limit.dailyLimit),
        })),
      });
      this.limits = DEFAULT_LIMITS;
    } else {
      this.limits = dbLimits.map((row) => ({
        planName: row.planName,
        featureName: row.featureName,
        hourlyLimit: this.parseLimit(row.hourlyLimit),
        dailyLimit: this.parseLimit(row.dailyLimit),
      }));
    }
    this.limitsLoaded = true;
  }

  private serializeLimit(value: LimitValue): string {
    return value === 'Unlimited' ? 'Unlimited' : String(value);
  }

  private parseLimit(value: string): LimitValue {
    if (value === 'Unlimited') return 'Unlimited';
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return 0;
    return parsed;
  }

  async getLimits(): Promise<UsageLimit[]> {
    await this.ensureLimitsLoaded();
    return this.limits;
  }

  async findLimit(planName: string, featureName: string): Promise<UsageLimit | undefined> {
    await this.ensureLimitsLoaded();
    return this.limits.find((limit) => limit.planName === planName && limit.featureName === featureName);
  }

  async updateLimit(planName: string, featureName: string, hourlyLimit: LimitValue, dailyLimit: LimitValue) {
    await this.ensureLimitsLoaded();
    const updated: UsageLimit = { planName, featureName, hourlyLimit, dailyLimit };
    if (this.dbEnabled) {
      await prisma.usageLimit.upsert({
        where: { planName_featureName: { planName, featureName } },
        create: {
          planName,
          featureName,
          hourlyLimit: this.serializeLimit(hourlyLimit),
          dailyLimit: this.serializeLimit(dailyLimit),
        },
        update: {
          hourlyLimit: this.serializeLimit(hourlyLimit),
          dailyLimit: this.serializeLimit(dailyLimit),
        },
      });
    }
    const index = this.limits.findIndex((limit) => limit.planName === planName && limit.featureName === featureName);
    if (index !== -1) {
      this.limits[index] = updated;
    } else {
      this.limits.push(updated);
    }
  }

  async getLimitsEnabled(): Promise<boolean> {
    if (!this.dbEnabled) return this.limitsEnabled;
    const record = await prisma.platformSetting.findUnique({ where: { key: 'usageLimitsEnabled' } });
    if (record) {
      this.limitsEnabled = record.value === 'true';
    }
    return this.limitsEnabled;
  }

  async setLimitsEnabled(enabled: boolean): Promise<void> {
    this.limitsEnabled = enabled;
    if (!this.dbEnabled) return;
    await prisma.platformSetting.upsert({
      where: { key: 'usageLimitsEnabled' },
      update: { value: enabled ? 'true' : 'false' },
      create: { key: 'usageLimitsEnabled', value: enabled ? 'true' : 'false' },
    });
  }

  async logUsage(userId: string, featureName: string, usageType: string = 'request'): Promise<void> {
    if (this.dbEnabled) {
      await prisma.usageLog.create({
        data: {
          userId,
          featureName,
          usageType,
        },
      });
    } else {
      this.fallbackLogs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        featureName,
        usageType,
        timestamp: new Date(),
      });
    }

    this.pruneCounter += 1;
    if (this.pruneCounter >= 50) {
      this.pruneCounter = 0;
      await this.pruneOldLogs();
    }
  }

  async getUsageCount(userId: string, featureName: string, since: Date): Promise<number> {
    if (this.dbEnabled) {
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
    return this.fallbackLogs.filter(
      (log) => log.userId === userId && log.featureName === featureName && log.timestamp >= since
    ).length;
  }

  async getFirstLogAfter(userId: string, featureName: string, since: Date): Promise<Date | null> {
    if (this.dbEnabled) {
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
    const log = this.fallbackLogs
      .filter((entry) => entry.userId === userId && entry.featureName === featureName && entry.timestamp >= since)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
    return log?.timestamp ?? null;
  }

  private async pruneOldLogs(): Promise<void> {
    const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // keep 60 days of history
    if (this.dbEnabled) {
      await prisma.usageLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoff,
          },
        },
      });
    } else {
      this.fallbackLogs = this.fallbackLogs.filter((log) => log.timestamp >= cutoff);
    }
  }
}

export const usageDb = new UsageStore();
