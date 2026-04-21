import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';

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

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
