import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { getPricingDetail, planOrder, PlanType, resolveRegion } from '@/lib/pricing/catalog';

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
    const regionInput = body?.region;
    if (!plan || !planOrder.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const resolvedRegion = resolveRegion(regionInput, user.country);
    const pricing = getPricingDetail(plan, resolvedRegion);
    const currency = pricing.currencyCode;
    const displayCurrency = pricing.currencySymbol;

    if (plan === 'Free') {
      await prisma.subscription.updateMany({
        where: { userId: user.id, status: 'Active' },
        data: { status: 'Expired' },
      });

      await prisma.subscription.create({
        data: {
          userId: user.id,
          planType: 'Free',
          price: pricing.priceValue,
          currency: displayCurrency,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          paymentProvider: 'System',
          status: 'Active',
        },
      });
      return NextResponse.json({ url: '/' });
    }

    const unitAmount = pricing.unitAmountCents;

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        url: `/payment-success?plan=${encodeURIComponent(plan)}&region=${encodeURIComponent(resolvedRegion)}`
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
      },
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Intel Trader ${plan} Plan`,
              description: `Subscription to Intel Trader ${plan} tier.`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan)}&region=${encodeURIComponent(resolvedRegion)}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
