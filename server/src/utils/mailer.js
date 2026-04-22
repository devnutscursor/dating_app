import nodemailer from 'nodemailer';

function envTrim(name) {
  const v = process.env[name];
  return typeof v === 'string' ? v.trim() : v ?? '';
}

export function isMailConfigured() {
  return Boolean(envTrim('SMTP_HOST') && envTrim('SMTP_USER') && envTrim('SMTP_PASS'));
}

/** Reused Ethereal test account for one server process (free dev inbox). */
let etherealAccountPromise = null;

function getEtherealAccount() {
  if (!etherealAccountPromise) {
    etherealAccountPromise = nodemailer.createTestAccount();
  }
  return etherealAccountPromise;
}

/**
 * Sends a 6-digit verification email.
 * - If SMTP_* is set: uses your provider.
 * - Else in development: tries Ethereal (free fake SMTP + browser preview link in server logs).
 * - Else: logs the code to the server console.
 */
export async function sendVerificationEmail({ to, code, name }) {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const subject = 'Your MemberDate verification code';
  const text = `${greeting}\n\nYour verification code is: ${code}\n\nIt expires in 15 minutes.\n`;
  const html = `<p>${greeting}</p><p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in 15 minutes.</p>`;

  if (isMailConfigured()) {
    const from = envTrim('SMTP_FROM') || envTrim('SMTP_USER') || 'MemberDate <noreply@localhost>';
    const host = envTrim('SMTP_HOST');
    const port = Number(envTrim('SMTP_PORT')) || 587;
    const secure = envTrim('SMTP_SECURE') === 'true' || port === 465;
    const isMailtrap = host.toLowerCase().includes('mailtrap');

    /** Mailtrap sandbox expects STARTTLS on 2525/587; port 25 is often blocked by ISPs. */
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: envTrim('SMTP_USER'),
        pass: envTrim('SMTP_PASS'),
      },
      ...(isMailtrap && !secure
        ? { requireTLS: true }
        : {}),
      connectionTimeout: 25_000,
      greetingTimeout: 25_000,
      socketTimeout: 25_000,
    });

    try {
      await transporter.sendMail({ from, to, subject, text, html });
      return { sent: true, transport: 'smtp' };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[mail] SMTP send failed:', message);
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[mail] Verification code for ${to} (email delivery failed): ${code}`);
      }
      return { sent: false, reason: 'smtp_send_failed', error: message };
    }
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('[mail] SMTP not configured; cannot send verification email in production.');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  if (envTrim('DISABLE_ETHEREAL_FALLBACK') === 'true') {
    console.warn(`[mail] SMTP not configured. Verification code for ${to}: ${code}`);
    return { sent: false, reason: 'smtp_not_configured' };
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

  console.warn(`[mail] SMTP not configured. Verification code for ${to}: ${code}`);
  return { sent: false, reason: 'smtp_not_configured' };
}
