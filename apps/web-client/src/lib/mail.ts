import nodemailer from 'nodemailer';

type MailPayload = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function getMailConfig() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const fromAddress = process.env.SMTP_FROM || smtpUser;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromAddress) {
    return null;
  }

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpSecure,
    fromAddress,
  };
}

export function isMailConfigured() {
  return Boolean(getMailConfig());
}

export async function sendEmail(payload: MailPayload) {
  const config = getMailConfig();
  if (!config) {
    throw new Error('Notification service not configured');
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  return transporter.sendMail({
    from: config.fromAddress,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html || `<pre>${payload.text}</pre>`,
    replyTo: payload.replyTo,
  });
}
