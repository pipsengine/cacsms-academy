import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { getClientIp, rateLimit } from '@/lib/security/rateLimit';
import { isMailConfigured, sendEmail } from '@/lib/mail';

const INQUIRY_TYPES = [
  'General Product Enquiry',
  'Support Request',
  'Billing and Subscription',
  'Partnership and Institutional',
  'Technical and Integration',
] as const;

function normalizeText(value: unknown) {
  return String(value ?? '').trim();
}

function buildAdminRecipients(emails: string[]) {
  const configured = process.env.CONTACT_ADMIN_EMAIL
    ? process.env.CONTACT_ADMIN_EMAIL.split(',').map((entry) => entry.trim()).filter(Boolean)
    : [];

  return [...new Set([...emails, ...configured, 'admin@cacsms.com'])];
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
    }

    const ip = getClientIp(request);
    const limitResult = rateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.retryAfterSeconds) } }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    const body = await request.json().catch(() => null);

    const name = normalizeText(body?.name);
    const email = normalizeText(body?.email).toLowerCase();
    const phone = normalizeText(body?.phone) || null;
    const company = normalizeText(body?.company) || null;
    const country = normalizeText(body?.country) || null;
    const inquiryType = normalizeText(body?.inquiryType);
    const subject = normalizeText(body?.subject);
    const message = normalizeText(body?.message);

    if (!name || !email || !subject || !message || !inquiryType) {
      return NextResponse.json({ success: false, error: 'Please complete all required fields.' }, { status: 400 });
    }

    if (!INQUIRY_TYPES.includes(inquiryType as typeof INQUIRY_TYPES[number])) {
      return NextResponse.json({ success: false, error: 'Invalid inquiry type.' }, { status: 400 });
    }

    if (message.length < 30) {
      return NextResponse.json({ success: false, error: 'Please provide a more detailed message.' }, { status: 400 });
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        userId,
        name,
        email,
        phone,
        company,
        country,
        inquiryType,
        subject,
        message,
        status: 'Received',
      },
    });

    const adminUsers = await prisma.user.findMany({
      where: { role: { in: ['Super Admin', 'Administrator'] } },
      select: { email: true },
    });
    const adminRecipients = buildAdminRecipients(adminUsers.map((entry) => entry.email).filter(Boolean));

    let thankYouSentAt: Date | null = null;
    let adminNotifiedAt: Date | null = null;

    if (isMailConfigured()) {
      const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
      const thankYouPromise = sendEmail({
        to: email,
        subject: 'Thank you for contacting Intel Trader',
        text:
          `Hello ${name},\n\nThank you for contacting Intel Trader. We have received your enquiry about "${subject}" and our team will review it carefully.\n\n` +
          `Your enquiry reference is ${inquiry.id}.\n\n` +
          `Summary:\nType: ${inquiryType}\nSubject: ${subject}\n\n` +
          `We appreciate the detail you provided. If we need any clarification, we will respond to this email address.\n\n` +
          `Intel Trader\n${appUrl}`,
        html:
          `<p>Hello <strong>${name}</strong>,</p>` +
          `<p>Thank you for contacting <strong>Intel Trader</strong>. We have received your enquiry and our team will review it carefully.</p>` +
          `<p><strong>Reference:</strong> ${inquiry.id}<br /><strong>Type:</strong> ${inquiryType}<br /><strong>Subject:</strong> ${subject}</p>` +
          `<p>We appreciate the detail you provided. If we need clarification, we will respond to this same email address.</p>` +
          `<p>Intel Trader<br /><a href="${appUrl}">${appUrl}</a></p>`,
      });

      const adminPromise = adminRecipients.length > 0
        ? sendEmail({
            to: adminRecipients,
            replyTo: email,
            subject: `New Contact Enquiry: ${subject}`,
            text:
              `A new contact enquiry has been submitted.\n\n` +
              `Reference: ${inquiry.id}\n` +
              `Name: ${name}\n` +
              `Email: ${email}\n` +
              `Phone: ${phone || 'Not provided'}\n` +
              `Company: ${company || 'Not provided'}\n` +
              `Country: ${country || 'Not provided'}\n` +
              `Type: ${inquiryType}\n` +
              `Subject: ${subject}\n\n` +
              `Message:\n${message}\n`,
            html:
              `<p>A new contact enquiry has been submitted.</p>` +
              `<p><strong>Reference:</strong> ${inquiry.id}<br />` +
              `<strong>Name:</strong> ${name}<br />` +
              `<strong>Email:</strong> ${email}<br />` +
              `<strong>Phone:</strong> ${phone || 'Not provided'}<br />` +
              `<strong>Company:</strong> ${company || 'Not provided'}<br />` +
              `<strong>Country:</strong> ${country || 'Not provided'}<br />` +
              `<strong>Type:</strong> ${inquiryType}<br />` +
              `<strong>Subject:</strong> ${subject}</p>` +
              `<p><strong>Message</strong></p><p>${message.replace(/\n/g, '<br />')}</p>`,
          })
        : Promise.resolve(null);

      const [thankYouResult, adminResult] = await Promise.allSettled([thankYouPromise, adminPromise]);

      if (thankYouResult.status === 'fulfilled') {
        thankYouSentAt = new Date();
      } else {
        console.error('Failed to send thank-you email for contact inquiry', thankYouResult.reason);
      }

      if (adminResult.status === 'fulfilled' && adminRecipients.length > 0) {
          adminNotifiedAt = new Date();
      } else if (adminResult.status === 'rejected') {
        console.error('Failed to notify admin about contact inquiry', adminResult.reason);
      }
    }

    const finalStatus = adminNotifiedAt && thankYouSentAt
      ? 'Acknowledged'
      : thankYouSentAt || adminNotifiedAt
        ? 'Partially Notified'
        : 'Received';

    await prisma.contactInquiry.update({
      where: { id: inquiry.id },
      data: {
        thankYouSentAt,
        adminNotifiedAt,
        status: finalStatus,
      },
    });

    return NextResponse.json({
      success: true,
      inquiryId: inquiry.id,
      message: 'Your enquiry has been received successfully.',
    });
  } catch (error) {
    console.error('Failed to submit contact inquiry', error);
    return NextResponse.json({ success: false, error: 'Failed to submit enquiry.' }, { status: 500 });
  }
}
