import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, isMailConfigured } from '@/lib/mail';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
}

function genericResponse() {
  return NextResponse.json({
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
  });
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `auth:forgot-password:${ip}`, limit: 10, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } },
      );
    }

    const { email } = await request.json();
    const normalizedEmail = String(email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !isMailConfigured()) {
      return genericResponse();
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: hashedToken,
        expires,
      },
    });

    const resetLink = `${getBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await sendEmail({
      to: normalizedEmail,
      subject: 'Reset your Cacsms Academy password',
      text: [
        'We received a request to reset your password.',
        `Reset link: ${resetLink}`,
        'This link expires in 1 hour.',
        'If you did not request this, you can ignore this email.',
      ].join('\n\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your Cacsms Academy password.</p>
          <p>
            <a href="${resetLink}" style="display:inline-block;padding:10px 14px;background:#059669;color:#fff;text-decoration:none;border-radius:6px;">
              Reset Password
            </a>
          </p>
          <p>If the button does not work, copy and paste this link:</p>
          <p>${resetLink}</p>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    await prisma.usageLog.create({
      data: {
        userId: user.id,
        featureName: 'forgot_password_request',
        usageType: 'auth',
      },
    });

    return genericResponse();
  } catch (error) {
    console.error('Forgot password request failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
