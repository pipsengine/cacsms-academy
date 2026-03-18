import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';

const PLAN_OPTIONS = ['Scout', 'Analyst', 'Trader', 'ProTrader', 'Institutional'] as const;
const ROLE_OPTIONS = ['User', 'Administrator', 'Super Admin'] as const;
const STATUS_OPTIONS = ['Active', 'Expired', 'Cancelled', 'Pending'] as const;
const COUNTRY_OPTIONS = ['Nigeria', 'International'] as const;

function isAdminRole(role: string | undefined) {
  return role === 'Super Admin' || role === 'Administrator';
}

function mapPlan(planType: string | null | undefined) {
  if (!planType) return 'Scout';
  if (planType === 'Free') return 'Scout';
  if (planType === 'Professional') return 'Trader';
  if (planType === 'Premium') return 'ProTrader';
  return planType;
}

function normalizeCurrency(input: unknown) {
  const value = String(input || '').trim();
  return value || '$';
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    if (!isAdminRole(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: role ? 403 : 401 });
    }

    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const activeSubscription = user.subscriptions.find((entry) => entry.status === 'Active') ?? user.subscriptions[0] ?? null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name || '',
        email: user.email,
        country: user.country,
        role: user.role,
        emailVerified: user.emailVerified?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        managedSubscription: activeSubscription
          ? {
              id: activeSubscription.id,
              planType: mapPlan(activeSubscription.planType),
              billingCycle: (activeSubscription as any).billingCycle || 'monthly',
              price: activeSubscription.price,
              currency: activeSubscription.currency,
              paymentProvider: activeSubscription.paymentProvider,
              status: activeSubscription.status,
              startDate: activeSubscription.startDate.toISOString().slice(0, 10),
              expiryDate: activeSubscription.expiryDate.toISOString().slice(0, 10),
            }
          : null,
        subscriptions: user.subscriptions.map((entry) => ({
          id: entry.id,
          planType: mapPlan(entry.planType),
          billingCycle: (entry as any).billingCycle || 'monthly',
          price: entry.price,
          currency: entry.currency,
          paymentProvider: entry.paymentProvider,
          status: entry.status,
          startDate: entry.startDate.toISOString(),
          expiryDate: entry.expiryDate.toISOString(),
          createdAt: entry.createdAt.toISOString(),
        })),
      },
      options: {
        plans: PLAN_OPTIONS,
        roles: ROLE_OPTIONS,
        statuses: STATUS_OPTIONS,
        countries: COUNTRY_OPTIONS,
      },
    });
  } catch (error) {
    console.error('Admin user fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const sessionRole = (session?.user as any)?.role as string | undefined;
    const sessionUserId = (session?.user as any)?.id as string | undefined;

    if (!isAdminRole(sessionRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: sessionRole ? 403 : 401 });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const country = COUNTRY_OPTIONS.includes(body.country) ? body.country : 'International';
    const nextRole = ROLE_OPTIONS.includes(body.role) ? body.role : 'User';
    const managedSubscription = body.managedSubscription && typeof body.managedSubscription === 'object'
      ? body.managedSubscription
      : null;

    if (sessionRole !== 'Super Admin' && nextRole === 'Super Admin') {
      return NextResponse.json({ error: 'Only Super Admin can assign Super Admin role' }, { status: 403 });
    }

    if (sessionUserId === id && sessionRole !== 'Super Admin' && nextRole !== sessionRole) {
      return NextResponse.json({ error: 'Administrators cannot change their own role' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: name || null,
          country,
          role: nextRole,
        },
      });

      if (!managedSubscription) return;

      const planType = PLAN_OPTIONS.includes(managedSubscription.planType)
        ? managedSubscription.planType
        : 'Scout';
      const billingCycle = managedSubscription.billingCycle === 'annual' ? 'annual' : 'monthly';
      const price = Number(managedSubscription.price ?? 0);
      const currency = normalizeCurrency(managedSubscription.currency);
      const paymentProvider = String(managedSubscription.paymentProvider || 'Admin').trim() || 'Admin';
      const status = STATUS_OPTIONS.includes(managedSubscription.status)
        ? managedSubscription.status
        : 'Active';
      const startDate = new Date(managedSubscription.startDate || new Date().toISOString());
      const expiryDate = new Date(managedSubscription.expiryDate || new Date().toISOString());
      const existingSubscriptionId = typeof managedSubscription.id === 'string' && managedSubscription.id ? managedSubscription.id : null;

      if (status === 'Active') {
        await tx.subscription.updateMany({
          where: {
            userId: id,
            status: 'Active',
            ...(existingSubscriptionId ? { NOT: { id: existingSubscriptionId } } : {}),
          },
          data: { status: 'Expired' },
        });
      }

      const subscriptionData = {
        userId: id,
        planType,
        billingCycle,
        price: Number.isFinite(price) ? price : 0,
        currency,
        startDate,
        expiryDate,
        paymentProvider,
        status,
      } as any;

      if (existingSubscriptionId && user.subscriptions.some((entry) => entry.id === existingSubscriptionId)) {
        await tx.subscription.update({
          where: { id: existingSubscriptionId },
          data: subscriptionData,
        });
      } else {
        await tx.subscription.create({
          data: subscriptionData,
        });
      }
    });

    const refreshed = await prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: refreshed,
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
