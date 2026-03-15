import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `auth:register:${ip}`, limit: 10, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const { name, email, password, country } = await request.json();

    const normalizedEmail = String(email || '').toLowerCase().trim();
    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        name: name ? String(name) : null,
        email: normalizedEmail,
        passwordHash,
        country: country === 'Nigeria' ? 'Nigeria' : 'International',
        role: 'User',
      },
    });

    await prisma.subscription.create({
      data: {
        userId: created.id,
        planType: 'Free',
        price: 0,
        currency: created.country === 'Nigeria' ? '₦' : '$',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paymentProvider: 'System',
        status: 'Active',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        country: created.country,
        plan: 'Free'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
