import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { getPricingDetailFromMatrix, PlanType, resolveRegion } from '@/lib/pricing/catalog';
import { getBillingPrice, getPricingMatrix } from '@/lib/pricing/store';
import { calculateUpgradeCharge, getSubscriptionExpiryDate } from '@/lib/pricing/upgrade';

type PaidPlan = Exclude<PlanType, 'Scout'>;

function getPaidPlan(input: unknown): PaidPlan | null {
  // Support new plan names
  if (input === 'Analyst' || input === 'Trader' || input === 'ProTrader' || input === 'Institutional') {
    return input as PaidPlan;
  }
  // Legacy migration: map old plan names to new ones
  if (input === 'Professional') return 'Trader' as PaidPlan;
  if (input === 'Premium') return 'ProTrader' as PaidPlan;
  return null;
}

export async function POST(req: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    const userId = (authSession?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : null;
    const plan = getPaidPlan(body?.plan);
    const resolvedRegion = resolveRegion(body?.region, user.country);
    const currentSubscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'Active' },
      orderBy: { createdAt: 'desc' },
    }) as any;

    if (!process.env.STRIPE_SECRET_KEY) {
      if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      const { pricingMatrix } = await getPricingMatrix();
      const billingCycle: 'monthly' | 'annual' = body?.billingCycle === 'annual' ? 'annual' : 'monthly';
      let charge;
      try {
        charge = calculateUpgradeCharge({
          pricingMatrix,
          region: resolvedRegion,
          targetPlan: plan,
          billingCycle,
          currentSubscription,
        });
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Unable to process subscription change' },
          { status: 400 }
        );
      }

      const pricing = getPricingDetailFromMatrix(pricingMatrix, plan, resolvedRegion);

      await prisma.subscription.updateMany({
        where: { userId: user.id, status: 'Active' },
        data: { status: 'Expired' },
      });

      await prisma.subscription.create({
        data: {
          userId: user.id,
          planType: plan,
          billingCycle,
          price: charge.chargeAmount,
          currency: pricing.currencySymbol,
          expiryDate: getSubscriptionExpiryDate(billingCycle, currentSubscription),
          paymentProvider: 'System',
          status: 'Active',
        } as any,
      });

      return NextResponse.json({ success: true, plan });
    }

    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.payment_status !== 'paid') return NextResponse.json({ error: 'Payment not verified' }, { status: 400 });
    if (session.metadata?.userId && session.metadata.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const metaPlan = getPaidPlan(session.metadata?.plan);
    const metaRegion = resolveRegion(session.metadata?.region, user.country);
    const finalPlan = metaPlan || plan;
    const finalRegion = metaRegion || resolvedRegion;

    if (!finalPlan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const { pricingMatrix } = await getPricingMatrix();
    const pricing = getPricingDetailFromMatrix(pricingMatrix, finalPlan, finalRegion);
    const billingCycle = session.metadata?.billingCycle === 'annual' ? 'annual' : 'monthly';
    let charge;
    try {
      charge = calculateUpgradeCharge({
        pricingMatrix,
        region: finalRegion,
        targetPlan: finalPlan,
        billingCycle,
        currentSubscription,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unable to process subscription change' },
        { status: 400 }
      );
    }

    await prisma.subscription.updateMany({
      where: { userId: user.id, status: 'Active' },
      data: { status: 'Expired' },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        planType: finalPlan,
        billingCycle,
        price: charge.chargeAmount,
        currency: pricing.currencySymbol,
        expiryDate: getSubscriptionExpiryDate(billingCycle, currentSubscription),
        paymentProvider: 'Stripe',
        status: 'Active',
      } as any,
    });

    return NextResponse.json({ success: true, plan: finalPlan });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
