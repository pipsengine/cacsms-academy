import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getPricingDetailFromMatrix, PlanType, resolveRegion } from '@/lib/pricing/catalog';
import { getPricingMatrix } from '@/lib/pricing/store';
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
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const payload = await req.text();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Invalid Stripe webhook signature', err);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const plan = getPaidPlan(metadata.plan);
      const userId = metadata.userId;
      if (!plan || !userId) {
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const currentSubscription = await prisma.subscription.findFirst({
        where: { userId: user.id, status: 'Active' },
        orderBy: { createdAt: 'desc' },
      }) as any;
      const resolvedRegion = resolveRegion(metadata.region, user.country);
      const { pricingMatrix } = await getPricingMatrix();
      const pricing = getPricingDetailFromMatrix(pricingMatrix, plan, resolvedRegion);
      const billingCycle = metadata.billingCycle === 'annual' ? 'annual' : 'monthly';
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
          paymentProvider: 'Stripe',
          status: 'Active',
        } as any,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook failure', error);
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }
}
