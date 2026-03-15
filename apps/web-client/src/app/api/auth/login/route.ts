import { NextResponse } from 'next/server';
import { db } from '@/lib/auth/store';
import bcrypt from 'bcryptjs';
import { signAuthToken } from '@/lib/auth/jwt';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `auth:login:${ip}`, limit: 15, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const { email, password } = await request.json();

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get active subscription
    const sub = db.subscriptions.find(s => s.userId === user.id && s.status === 'Active');
    let plan = sub ? sub.planType : 'Free';

    if (user.role === 'Super Admin' || user.role === 'Administrator') {
      plan = 'Premium';
    }

    const token = await signAuthToken({ userId: user.id, role: user.role, plan }, '24h');

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        plan
      }
    });

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
