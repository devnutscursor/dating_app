import 'dotenv/config';
import http from 'node:http';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { User } from './models/User.model.js';
import { initSocketIO } from './realtime/socket.js';
import { getNowPaymentsApiBaseUrl, getNowPaymentsApiKey, getPaymentUrls, isNowPaymentsSandbox } from './services/nowpayments.js';
import { ensureDefaultSettings } from './services/siteSettings.js';

/** Default 5001: macOS often binds 5000 to AirPlay (Control Center). Override with PORT=. */
const PORT = Number(process.env.PORT) || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dating_app';

async function main() {
  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set. Using insecure dev default (set JWT_SECRET in .env).');
    process.env.JWT_SECRET = 'dev-only-insecure-jwt-secret-change-me';
  }
  await connectDb(MONGODB_URI);
  console.log('MongoDB connected:', MONGODB_URI);
  await ensureDefaultSettings();

  const cleared = await User.updateMany({ isOnline: true }, { $set: { isOnline: false } });
  if (cleared.modifiedCount > 0) {
    console.log(`Cleared ${cleared.modifiedCount} stale online flag(s) from previous session`);
  }

  const app = createApp();
  const server = http.createServer(app);
  const io = initSocketIO(server);
  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`API + Socket.IO listening on http://localhost:${PORT}`);
    if (getNowPaymentsApiKey()) {
      const mode = isNowPaymentsSandbox() ? 'SANDBOX (test — no real money)' : 'LIVE (production — real payments)';
      const urls = getPaymentUrls();
      console.log(`NOWPayments: ${mode}`);
      console.log(`NOWPayments API: ${getNowPaymentsApiBaseUrl()}`);
      console.log(`NOWPayments IPN webhook (give this to client): ${urls.ipnCallbackUrl}`);
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
