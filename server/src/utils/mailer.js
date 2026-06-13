import nodemailer from 'nodemailer';
import { Resend } from 'resend';

function envTrim(name) {
  const v = process.env[name];
  return typeof v === 'string' ? v.trim() : v ?? '';
}

export function isResendConfigured() {
  const key = envTrim('RESEND_API_KEY');
  return Boolean(key && key !== 're_xxxxxxxxx');
}

export function isMailConfigured() {
  return Boolean(envTrim('SMTP_HOST') && envTrim('SMTP_USER') && envTrim('SMTP_PASS'));
}

export function isEmailConfigured() {
  return isResendConfigured() || isMailConfigured();
}

/** Reused Ethereal test account for one server process (free dev inbox). */
let etherealAccountPromise = null;
let resendClient = null;

function getResendClient() {
  if (!isResendConfigured()) return null;
  if (!resendClient) {
    resendClient = new Resend(envTrim('RESEND_API_KEY'));
  }
  return resendClient;
}

function getEtherealAccount() {
  if (!etherealAccountPromise) {
    etherealAccountPromise = nodemailer.createTestAccount();
  }
  return etherealAccountPromise;
}

function createSmtpTransporter() {
  const host = envTrim('SMTP_HOST');
  const port = Number(envTrim('SMTP_PORT')) || 587;
  const secure = envTrim('SMTP_SECURE') === 'true' || port === 465;
  const isMailtrap = host.toLowerCase().includes('mailtrap');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: envTrim('SMTP_USER'),
      pass: envTrim('SMTP_PASS'),
    },
    ...(isMailtrap && !secure ? { requireTLS: true } : {}),
    connectionTimeout: 25_000,
    greetingTimeout: 25_000,
    socketTimeout: 25_000,
  });
}

function defaultFrom() {
  if (isResendConfigured()) {
    return envTrim('RESEND_FROM') || 'MemberDate <onboarding@resend.dev>';
  }
  return envTrim('SMTP_FROM') || envTrim('SMTP_USER') || 'MemberDate <noreply@localhost>';
}

/**
 * Send via Resend HTTP API (works on Render free tier — no SMTP ports).
 */
async function sendResendMail({ to, subject, text, html, logLabel = 'mail' }) {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, reason: 'resend_not_configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: defaultFrom(),
      to,
      subject,
      text,
      html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
    });

    if (error) {
      const message = error.message || JSON.stringify(error);
      console.error(`[${logLabel}] Resend send failed to ${to}:`, message);
      return { sent: false, reason: 'resend_send_failed', error: message };
    }

    console.log(`[${logLabel}] Sent via Resend to ${to} (id: ${data?.id || 'ok'})`);
    return { sent: true, transport: 'resend', messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[${logLabel}] Resend send failed to ${to}:`, message);
    return { sent: false, reason: 'resend_send_failed', error: message };
  }
}

/**
 * Send email via configured SMTP.
 */
export async function sendSmtpMail({ to, subject, text, html, logLabel = 'mail' }) {
  if (!isMailConfigured()) {
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const transporter = createSmtpTransporter();
  try {
    const info = await transporter.sendMail({
      from: defaultFrom(),
      to,
      subject,
      text,
      html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
    });
    console.log(`[${logLabel}] Sent via SMTP to ${to} (messageId: ${info.messageId || 'ok'})`);
    return { sent: true, transport: 'smtp', messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[${logLabel}] SMTP send failed to ${to}:`, message);
    return { sent: false, reason: 'smtp_send_failed', error: message };
  }
}

/** Resend first (production), then SMTP fallback. */
async function sendOutboundMail(opts) {
  if (isResendConfigured()) {
    const resendResult = await sendResendMail(opts);
    if (resendResult.sent) return resendResult;
    if (isMailConfigured()) {
      console.warn(`[${opts.logLabel || 'mail'}] Resend failed; trying SMTP fallback…`);
      return sendSmtpMail(opts);
    }
    return resendResult;
  }
  if (isMailConfigured()) {
    return sendSmtpMail(opts);
  }
  return { sent: false, reason: 'email_not_configured' };
}

/**
 * Sends a 6-digit verification email when admin requires email verification.
 */
export async function sendVerificationEmail({ to, code, name }) {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const subject = 'Your MemberDate verification code';
  const text = `${greeting}\n\nYour verification code is: ${code}\n\nIt expires in 15 minutes.\n`;
  const html = `<p>${greeting}</p><p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in 15 minutes.</p>`;

  if (isEmailConfigured()) {
    return sendOutboundMail({ to, subject, text, html, logLabel: 'mail:verify' });
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[mail] No email transport configured. Set RESEND_API_KEY (recommended) or SMTP_* in production.'
    );
    return { sent: false, reason: 'email_not_configured' };
  }

  if (envTrim('DISABLE_ETHEREAL_FALLBACK') === 'true') {
    console.warn(`[mail] Email not configured. Verification code for ${to}: ${code}`);
    return { sent: false, reason: 'email_not_configured' };
  }

  try {
    const account = await getEtherealAccount();
    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    });
    const info = await transporter.sendMail({
      from: `"MemberDate Dev" <${account.user}>`,
      to,
      subject,
      text,
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.warn('[mail] Ethereal — open this URL in your browser to read the verification email:', previewUrl);
    }
    return { sent: true, transport: 'ethereal', previewUrl: previewUrl || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[mail] Ethereal send failed:', message);
  }

  console.warn(`[mail] Email not configured. Verification code for ${to}: ${code}`);
  return { sent: false, reason: 'email_not_configured' };
}

/**
 * Admin alert email — Resend or SMTP (no Ethereal fallback).
 */
export async function sendAdminAlertEmail({ to, subject, text, html }) {
  if (!to || !subject) {
    return { sent: false, reason: 'missing_recipient_or_subject' };
  }

  const safeText = text || subject;
  const safeHtml = html || `<p>${safeText.replace(/\n/g, '<br>')}</p>`;

  if (isEmailConfigured()) {
    return sendOutboundMail({
      to,
      subject,
      text: safeText,
      html: safeHtml,
      logLabel: 'mail:admin',
    });
  }

  console.error(
    '[mail:admin] Email not configured (set RESEND_API_KEY or SMTP_HOST/USER/PASS). Alert not emailed to',
    to + ':',
    subject
  );
  return { sent: false, reason: 'email_not_configured' };
}
