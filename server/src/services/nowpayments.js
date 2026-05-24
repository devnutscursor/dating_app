import crypto from 'node:crypto';

const NOWPAYMENTS_LIVE_API = 'https://api.nowpayments.io/v1';
const NOWPAYMENTS_SANDBOX_API = 'https://api-sandbox.nowpayments.io/v1';

/** Live or sandbox API base URL (no trailing slash). */
export function getNowPaymentsApiBaseUrl() {
  const custom = (process.env.NOWPAYMENTS_API_URL || '').trim().replace(/\/$/, '');
  if (custom) return custom;
  const useSandbox =
    process.env.NOWPAYMENTS_SANDBOX === 'true' ||
    process.env.NOWPAYMENTS_SANDBOX === '1';
  return useSandbox ? NOWPAYMENTS_SANDBOX_API : NOWPAYMENTS_LIVE_API;
}

export function isNowPaymentsSandbox() {
  return getNowPaymentsApiBaseUrl() === NOWPAYMENTS_SANDBOX_API;
}

export function getNowPaymentsApiKey() {
  return (
    process.env.NOWPAYMENTS_API_KEY ||
    process.env.API_KEY ||
    ''
  ).trim();
}

export function getNowPaymentsIpnSecret() {
  return (
    process.env.NOWPAYMENTS_IPN_SECRET ||
    process.env.IPN_KEY ||
    ''
  ).trim();
}

function publicApiBaseUrl() {
  const explicit = (process.env.API_PUBLIC_URL || process.env.SERVER_PUBLIC_URL || '').trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const port = process.env.PORT || 5001;
  return `http://localhost:${port}`;
}

export function getPaymentUrls() {
  const client = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
  return {
    successUrl:
      process.env.NOWPAYMENTS_SUCCESS_URL ||
      `${client}/man/wallet?payment=success`,
    cancelUrl:
      process.env.NOWPAYMENTS_CANCEL_URL ||
      `${client}/man/wallet?payment=cancelled`,
    ipnCallbackUrl:
      process.env.NOWPAYMENTS_IPN_CALLBACK_URL ||
      `${publicApiBaseUrl()}/api/payments/webhook`,
  };
}

/**
 * @param {object} payload
 * @returns {Promise<{ invoice_url: string, id: string, order_id?: string }>}
 */
export async function createInvoice(payload) {
  const apiKey = getNowPaymentsApiKey();
  if (!apiKey) {
    const err = new Error('NOWPayments API key is not configured');
    err.status = 503;
    throw err;
  }

  const res = await fetch(`${getNowPaymentsApiBaseUrl()}/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String(data.message)
        : `NOWPayments error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status >= 400 && res.status < 600 ? res.status : 502;
    throw err;
  }
  return data;
}

/** Recursively sort object keys (NOWPayments IPN signature requirement). */
function sortObject(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObject(obj[key]);
      return acc;
    }, {});
}

/**
 * Verify x-nowpayments-sig header against raw JSON body.
 * @param {Buffer|string} rawBody
 * @param {string|undefined} signature
 */
export function verifyIpnSignature(rawBody, signature) {
  const secret = getNowPaymentsIpnSecret();
  if (!secret || !signature) return false;

  let parsed;
  try {
    parsed = JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'));
  } catch {
    return false;
  }

  const sorted = JSON.stringify(sortObject(parsed));
  const expected = crypto.createHmac('sha512', secret).update(sorted).digest('hex');
  const sig = String(signature).toLowerCase();
  const exp = expected.toLowerCase();
  if (sig.length !== exp.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(exp, 'utf8'));
  } catch {
    return false;
  }
}

/** Statuses that mean payment is complete enough to credit coins (idempotent). */
export function isPaymentComplete(status) {
  const s = String(status || '').toLowerCase();
  return s === 'finished' || s === 'confirmed';
}
