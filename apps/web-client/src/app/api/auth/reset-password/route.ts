import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function isStrongEnough(password: string) {
  return password.length >= 8;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = (url.searchParams.get('token') || '').trim();
    if (!token) {
      return NextResponse.json({ valid: false });
    }

    const tokenRecord = await prisma.verificationToken.findUnique({ where: { token: hashToken(token) } });
    if (!tokenRecord) {
      return NextResponse.json({ valid: false });
    }

    if (tokenRecord.expires < new Date()) {
      return NextResponse.json({ valid: false, expired: true });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Reset token validation failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `auth:reset-password:${ip}`, limit: 15, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } },
      );
    }

    const { token, password } = await request.json();
    const rawToken = String(token || '').trim();
    const nextPassword = String(password || '');

    if (!rawToken || !nextPassword) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (!isStrongEnough(nextPassword)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const hashedToken = hashToken(rawToken);
    const tokenRecord = await prisma.verificationToken.findUnique({ where: { token: hashedToken } });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (tokenRecord.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token: hashedToken } });
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: tokenRecord.identifier } });
    if (!user) {
      await prisma.verificationToken.delete({ where: { token: hashedToken } });
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const newPasswordHash = await bcrypt.hash(nextPassword, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash: newPasswordHash } }),
      prisma.verificationToken.deleteMany({ where: { identifier: user.email } }),
      prisma.usageLog.create({
        data: {
          userId: user.id,
          featureName: 'password_reset',
          usageType: 'auth',
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
