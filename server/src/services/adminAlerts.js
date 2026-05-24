import { User } from '../models/User.model.js';
import { getPlatformSettings } from './siteSettings.js';
import { createInAppNotification } from './inAppNotifications.js';
import { sendAdminAlertEmail } from '../utils/mailer.js';

const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');

async function listActiveAdmins() {
  return User.find({ role: 'admin', isBlocked: { $ne: true } }).select('_id email name').lean();
}

async function emailAdmins(admins, { subject, text, html }) {
  for (const admin of admins) {
    const result = await sendAdminAlertEmail({
      to: admin.email,
      subject,
      text,
      html,
    });
    if (!result.sent) {
      console.error(`[adminAlerts] Email to ${admin.email} failed:`, result.reason, result.error || '');
    }
  }
}

/**
 * Notify all admins of a new member signup (in-app + optional email).
 * @param {import('socket.io').Server | undefined} io
 */
export async function notifyAdminsNewSignup(io, { userId, name, email, gender }) {
  const settings = await getPlatformSettings();
  if (!settings?.notifications?.newUserAlerts) return;

  const admins = await listActiveAdmins();
  if (admins.length === 0) return;

  const displayName = name?.trim() || 'New member';
  const displayEmail = email?.trim() || '';
  const roleLabel = gender === 'female' ? 'Woman' : gender === 'male' ? 'Man' : String(gender || 'member');
  const title = 'New member signup';
  const body = `${displayName} (${displayEmail}) registered as ${roleLabel}.`;
  const usersUrl = `${CLIENT_ORIGIN}/admin/users`;

  await Promise.all(
    admins.map((admin) =>
      createInAppNotification(io, {
        userId: admin._id,
        kind: 'admin_new_user',
        title,
        body,
        relatedUserId: userId,
      })
    )
  );

  if (settings.notifications?.emailAdmins) {
    const subject = `[MemberDate] ${title}`;
    const text = `${body}\n\nReview in admin panel: ${usersUrl}`;
    const html = `<p>${body}</p><p><a href="${usersUrl}">Open Users in admin panel</a></p>`;
    await emailAdmins(admins, { subject, text, html });
  }
}

/**
 * Notify all admins of a new user report (in-app + optional email).
 * @param {import('socket.io').Server | undefined} io
 */
export async function notifyAdminsNewReport(
  io,
  { reportId, reporterName, reportedName, type, topic, commentPreview }
) {
  const settings = await getPlatformSettings();
  if (!settings?.notifications?.reportAlerts) return;

  const admins = await listActiveAdmins();
  if (admins.length === 0) return;

  const title = 'New member report';
  const body = `${reporterName} reported ${reportedName} (${type}: ${topic}).`;
  const subtitle =
    commentPreview && commentPreview.length > 0
      ? commentPreview.slice(0, 280)
      : undefined;
  const reportsUrl = `${CLIENT_ORIGIN}/admin/reports`;

  await Promise.all(
    admins.map((admin) =>
      createInAppNotification(io, {
        userId: admin._id,
        kind: 'admin_new_report',
        title,
        body,
        subtitle,
        reportId,
      })
    )
  );

  if (settings.notifications?.emailAdmins) {
    const subject = `[MemberDate] ${title}`;
    const text = `${body}${subtitle ? `\n\nDetails: ${subtitle}` : ''}\n\nReview: ${reportsUrl}`;
    const html = `<p>${body}</p>${subtitle ? `<p><em>${subtitle}</em></p>` : ''}<p><a href="${reportsUrl}">Open Reports</a></p>`;
    await emailAdmins(admins, { subject, text, html });
  }
}

/** Notify admins when a woman requests a payout. */
export async function notifyAdminsPayoutRequested(
  io,
  { userName, amountCoins, walletAddress }
) {
  const admins = await listActiveAdmins();
  if (admins.length === 0) return;

  const displayName = userName?.trim() || 'Member';
  const title = 'New payout request';
  const body = `${displayName} requested withdrawal of ${amountCoins} coins.`;
  const payoutsUrl = `${CLIENT_ORIGIN}/admin/payouts`;

  await Promise.all(
    admins.map((admin) =>
      createInAppNotification(io, {
        userId: admin._id,
        kind: 'admin_payout_request',
        title,
        body,
        subtitle: walletAddress ? `Wallet: ${String(walletAddress).slice(0, 32)}` : undefined,
      })
    )
  );

  const settings = await getPlatformSettings();
  if (settings.notifications?.emailAdmins) {
    const subject = `[MemberDate] ${title}`;
    const text = `${body}\n\nReview: ${payoutsUrl}`;
    const html = `<p>${body}</p><p><a href="${payoutsUrl}">Open Payouts</a></p>`;
    await emailAdmins(admins, { subject, text, html });
  }
}
