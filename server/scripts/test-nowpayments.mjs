import 'dotenv/config';
import {
  getNowPaymentsApiBaseUrl,
  isNowPaymentsSandbox,
  getNowPaymentsApiKey,
  getPaymentUrls,
} from '../src/services/nowpayments.js';

const key = getNowPaymentsApiKey();
const base = getNowPaymentsApiBaseUrl();
const urls = getPaymentUrls();

console.log('=== CONFIG ===');
console.log('SANDBOX flag:', process.env.NOWPAYMENTS_SANDBOX);
console.log('Mode:', isNowPaymentsSandbox() ? 'SANDBOX' : 'LIVE/PRODUCTION');
console.log('API base:', base);
console.log('API key set:', Boolean(key));
console.log('IPN secret set:', Boolean(process.env.IPN_KEY || process.env.NOWPAYMENTS_IPN_SECRET));
console.log('Webhook URL:', urls.ipnCallbackUrl);
console.log('Success URL:', urls.successUrl);
console.log('');

async function testEndpoint(label, url) {
  try {
    const res = await fetch(url, { headers: { 'x-api-key': key } });
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text.slice(0, 200);
    }
    console.log(`--- ${label} ---`);
    console.log('HTTP:', res.status, res.statusText);
    console.log('Body:', typeof body === 'object' ? JSON.stringify(body).slice(0, 300) : body);
    return res.ok;
  } catch (e) {
    console.log(`--- ${label} ---`);
    console.log('ERROR:', e.message);
    return false;
  }
}

await testEndpoint('LIVE /status', 'https://api.nowpayments.io/v1/status');
await testEndpoint('LIVE /currencies (auth)', 'https://api.nowpayments.io/v1/currencies');
await testEndpoint('SANDBOX /status', 'https://api-sandbox.nowpayments.io/v1/status');

console.log('');
console.log('=== INVOICE TEST (configured base:', base, ') ===');
try {
  const res = await fetch(`${base}/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key },
    body: JSON.stringify({
      price_amount: 1,
      price_currency: 'usd',
      order_id: `test_probe_${Date.now()}`,
      order_description: 'API connectivity test - ignore',
      ipn_callback_url: urls.ipnCallbackUrl,
      success_url: urls.successUrl,
      cancel_url: urls.cancelUrl,
    }),
  });
  const data = await res.json().catch(() => ({}));
  console.log('HTTP:', res.status);
  if (res.ok) {
    console.log('Invoice OK — id:', data.id, '| invoice_url:', data.invoice_url ? 'yes' : 'no');
  } else {
    console.log('Error:', JSON.stringify(data).slice(0, 500));
  }
} catch (e) {
  console.log('Invoice test ERROR:', e.message);
}
