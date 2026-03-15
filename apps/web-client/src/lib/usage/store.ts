export type LimitValue = number | 'Unlimited';

export interface UsageLimit {
  planName: string;
  featureName: string;
  hourlyLimit: LimitValue;
  dailyLimit: LimitValue;
}

export interface UsageLog {
  id: string;
  userId: string;
  featureName: string;
  timestamp: string;
  usageType: string;
}

class UsageStore {
  limits: UsageLimit[] = [
    // Free Plan
    { planName: 'Free', featureName: 'Channel Scanner', hourlyLimit: 5, dailyLimit: 20 },
    { planName: 'Free', featureName: 'Breakout Engine', hourlyLimit: 5, dailyLimit: 20 },
    { planName: 'Free', featureName: 'Alert System', hourlyLimit: 'Unlimited', dailyLimit: 10 },
    { planName: 'Free', featureName: 'AI Probability Engine', hourlyLimit: 0, dailyLimit: 0 },
    { planName: 'Free', featureName: 'Liquidity Intelligence', hourlyLimit: 0, dailyLimit: 0 },
    
    // Professional Plan
    { planName: 'Professional', featureName: 'Channel Scanner', hourlyLimit: 50, dailyLimit: 200 },
    { planName: 'Professional', featureName: 'Breakout Engine', hourlyLimit: 50, dailyLimit: 200 },
    { planName: 'Professional', featureName: 'Alert System', hourlyLimit: 'Unlimited', dailyLimit: 100 },
    { planName: 'Professional', featureName: 'AI Probability Engine', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Professional', featureName: 'Liquidity Intelligence', hourlyLimit: 0, dailyLimit: 0 },
    
    // Premium Plan
    { planName: 'Premium', featureName: 'Channel Scanner', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Premium', featureName: 'Breakout Engine', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Premium', featureName: 'Alert System', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Premium', featureName: 'AI Probability Engine', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
    { planName: 'Premium', featureName: 'Liquidity Intelligence', hourlyLimit: 'Unlimited', dailyLimit: 'Unlimited' },
  ];

  logs: UsageLog[] = [];
  limitsEnabled: boolean = true;

  getUsageCount(userId: string, featureName: string, since: Date): number {
    return this.logs.filter(
      log => log.userId === userId && 
             log.featureName === featureName && 
             new Date(log.timestamp) >= since
    ).length;
  }

  getLimits(): UsageLimit[] {
    return this.limits;
  }

  updateLimit(planName: string, featureName: string, hourlyLimit: LimitValue, dailyLimit: LimitValue) {
    const limitIndex = this.limits.findIndex(l => l.planName === planName && l.featureName === featureName);
    if (limitIndex !== -1) {
      this.limits[limitIndex] = {
        ...this.limits[limitIndex],
        hourlyLimit,
        dailyLimit
      };
    } else {
      this.limits.push({
        planName,
        featureName,
        hourlyLimit,
        dailyLimit
      });
    }
  }

  logUsage(userId: string, featureName: string, usageType: string = 'request') {
    this.logs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      featureName,
      timestamp: new Date().toISOString(),
      usageType
    });
  }
}

export const usageDb = new UsageStore();
