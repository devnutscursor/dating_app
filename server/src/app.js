import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index.js';

export function createApp() {
  const app = express();

  // Render (and most PaaS providers) terminate TLS at a reverse proxy and
  // forward the real client IP via X-Forwarded-For. Trust the first hop so
  // express-rate-limit and req.ip work correctly.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.use('/api', apiRoutes);

  app.use((err, req, res, next) => {
    // eslint-disable-line no-unused-vars
    if (res.headersSent) {
      return next(err);
    }
    console.error(err);
    const status = err.status || 500;
    const payload = { error: err.message || 'Internal Server Error' };
    res.status(status).type('application/json').send(JSON.stringify(payload));
  });

  return app;
}
