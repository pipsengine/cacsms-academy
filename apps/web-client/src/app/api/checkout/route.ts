import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getPricingDetailFromMatrix, planOrder, PlanType, resolveRegion } from '@/lib/pricing/catalog';
import { getBillingPrice, getPricingMatrix } from '@/lib/pricing/store';
import { calculateUpgradeCharge, getSubscriptionExpiryDate } from '@/lib/pricing/upgrade';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitResult = rateLimit({ key: `checkout:${ip}`, limit: 10, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const authSession = await getServerSession(authOptions);
    const userId = (authSession?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const plan = body?.plan as PlanType | undefined;
    const billingCycle: 'monthly' | 'annual' = body?.billingCycle === 'annual' ? 'annual' : 'monthly';
    const regionInput = body?.region;
    if (!plan || !planOrder.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const resolvedRegion = resolveRegion(regionInput, user.country);
    const currentSubscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'Active' },
      orderBy: { createdAt: 'desc' },
    }) as any;
    const { pricingMatrix } = await getPricingMatrix();
    const pricing = getPricingDetailFromMatrix(pricingMatrix, plan, resolvedRegion);
    const currency = pricing.currencyCode;
    const displayCurrency = pricing.currencySymbol;
    const billingPrice = getBillingPrice(pricing, billingCycle);

    if (plan === 'Scout') {
      await prisma.subscription.updateMany({
        where: { userId: user.id, status: 'Active' },
        data: { status: 'Expired' },
      });

      await prisma.subscription.create({
        data: {
          userId: user.id,
          planType: 'Scout',
          billingCycle: 'monthly',
          price: billingPrice.priceValue,
          currency: displayCurrency,
          expiryDate: getSubscriptionExpiryDate('monthly', currentSubscription),
          paymentProvider: 'System',
          status: 'Active',
        } as any,
      });
      return NextResponse.json({ url: '/' });
    }

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

    const unitAmount = charge.chargeAmountCents;
    if (unitAmount <= 0) {
      return NextResponse.json({ error: 'No additional payment is required for this change.' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        url: `/payment-success?plan=${encodeURIComponent(plan)}&region=${encodeURIComponent(resolvedRegion)}&billingCycle=${encodeURIComponent(billingCycle)}`
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan,
        region: resolvedRegion,
        billingCycle,
        chargeAmount: String(charge.chargeAmount),
        chargeAmountCents: String(charge.chargeAmountCents),
        upgradeFromPlan: charge.currentPlan ?? '',
      },
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: charge.isUpgrade ? `Intel Trader ${charge.currentPlan} to ${plan} Upgrade` : `Intel Trader ${plan} Plan`,
              description: charge.isUpgrade
                ? `Upgrade charge from ${charge.currentPlan} to ${plan} (${billingCycle}).`
                : `Subscription to Intel Trader ${plan} tier.`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan)}&region=${encodeURIComponent(resolvedRegion)}&billingCycle=${encodeURIComponent(billingCycle)}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
