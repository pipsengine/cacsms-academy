import { NextResponse } from 'next/server';
import { usageDb } from '@/lib/usage/store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { featureName, action = 'check' } = await request.json();

    if (!usageDb.limitsEnabled) {
      if (action === 'consume') {
        usageDb.logUsage(userId, featureName);
      }
      return NextResponse.json({ allowed: true });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'Super Admin' || user.role === 'Administrator') {
      if (action === 'consume') {
        usageDb.logUsage(userId, featureName);
      }
      return NextResponse.json({ allowed: true });
    }

    const sub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'Active' },
      orderBy: { startDate: 'desc' },
    });
    const plan = (sub?.planType === 'Professional' || sub?.planType === 'Premium') ? sub.planType : 'Free';

    const limit = usageDb.limits.find(l => l.planName === plan && l.featureName === featureName);
    
    if (!limit) {
      // If no limit defined, assume unlimited or locked? Let's say unlimited for safety, or locked?
      // Based on prompt, some features might not have limits. 
      if (action === 'consume') {
        usageDb.logUsage(userId, featureName);
      }
      return NextResponse.json({ allowed: true });
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyUsage = usageDb.getUsageCount(userId, featureName, oneHourAgo);
    const dailyUsage = usageDb.getUsageCount(userId, featureName, oneDayAgo);

    let allowed = true;
    let message = '';
    let resetTime = '';

    if (limit.hourlyLimit === 0 && limit.dailyLimit === 0) {
      allowed = false;
      message = `The ${featureName} module is locked on your current plan.`;
    } else if (limit.hourlyLimit !== 'Unlimited' && hourlyUsage >= (limit.hourlyLimit as number)) {
      allowed = false;
      message = `You have reached your hourly usage limit for ${featureName}.`;
      
      // Calculate reset time (time until the oldest request in the last hour expires)
      const hourlyLogs = usageDb.logs.filter(log => log.userId === userId && log.featureName === featureName && new Date(log.timestamp) >= oneHourAgo);
      if (hourlyLogs.length > 0) {
        const oldestLog = new Date(hourlyLogs[0].timestamp);
        const resetAt = new Date(oldestLog.getTime() + 60 * 60 * 1000);
        const minutesLeft = Math.ceil((resetAt.getTime() - now.getTime()) / 60000);
        resetTime = `Limit resets in ${minutesLeft} minutes.`;
      }
    } else if (limit.dailyLimit !== 'Unlimited' && dailyUsage >= (limit.dailyLimit as number)) {
      allowed = false;
      message = `You have reached your daily usage limit for ${featureName}.`;
      
      const dailyLogs = usageDb.logs.filter(log => log.userId === userId && log.featureName === featureName && new Date(log.timestamp) >= oneDayAgo);
      if (dailyLogs.length > 0) {
        const oldestLog = new Date(dailyLogs[0].timestamp);
        const resetAt = new Date(oldestLog.getTime() + 24 * 60 * 60 * 1000);
        const hoursLeft = Math.ceil((resetAt.getTime() - now.getTime()) / (60 * 60 * 1000));
        resetTime = `Limit resets in ${hoursLeft} hours.`;
      }
    }

    if (allowed && action === 'consume') {
      usageDb.logUsage(userId, featureName);
    }

    return NextResponse.json({ 
      allowed, 
      message: allowed ? undefined : message,
      resetTime: allowed ? undefined : resetTime,
      upgradeSuggestion: allowed ? undefined : (plan === 'Free' ? 'Upgrade to Professional' : 'Upgrade to Premium')
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
