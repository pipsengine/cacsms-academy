import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';

function mapPlan(planType: string | null | undefined) {
  if (!planType) return 'Scout';
  if (planType === 'Free') return 'Scout';
  if (planType === 'Professional') return 'Trader';
  if (planType === 'Premium') return 'ProTrader';
  return planType;
}

function getMonthlyEquivalent(price: number, billingCycle: string | null | undefined) {
  if (!price) return 0;
  return billingCycle === 'annual' ? price / 12 : price;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (role !== 'Super Admin' && role !== 'Administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalUsers, activeSubscriptions, totalSuperAdmins, activeRevenueSubscriptionsRaw, users] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'Active' } }),
      prisma.user.count({ where: { role: 'Super Admin' } }),
      prisma.subscription.findMany({
        where: { status: 'Active' },
      } as any),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
    ]);

    const activeRevenueSubscriptions = activeRevenueSubscriptionsRaw as Array<{ price: number; billingCycle?: string }>;

    const monthlyRevenue = activeRevenueSubscriptions
      .reduce((sum, subscription) => {
        return sum + getMonthlyEquivalent(subscription.price, subscription.billingCycle);
      }, 0);

    const recentUsers = users.map((entry) => {
      const activeSubscription = entry.subscriptions.find((subscription) => subscription.status === 'Active');

      return {
        id: entry.id,
        name: entry.name || 'Unnamed User',
        email: entry.email,
        country: entry.country,
        role: entry.role,
        createdAt: entry.createdAt.toISOString(),
        plan: mapPlan(activeSubscription?.planType),
        subscriptionStatus: activeSubscription?.status ?? 'Inactive',
      };
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        activeSubscriptions,
        monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
        superAdmins: totalSuperAdmins,
      },
      recentUsers,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
