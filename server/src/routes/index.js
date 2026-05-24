import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import chatsRoutes from './chats.routes.js';
import adminRoutes from './admin.routes.js';
import moderatorRoutes from './moderator.routes.js';
import uploadsRoutes from './uploads.routes.js';
import activitiesRoutes from './activities.routes.js';
import paymentsRoutes from './payments.routes.js';
import payoutsRoutes from './payouts.routes.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPlatformSettings } from '../services/siteSettings.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/users', usersRoutes);
router.use('/chats', chatsRoutes);
router.use('/activities', activitiesRoutes);
router.use('/payments', paymentsRoutes);
router.use('/payouts', payoutsRoutes);
router.use('/admin', adminRoutes);
router.use('/moderator', moderatorRoutes);

/** Public read-only settings (coin prices etc.) used by the frontend UI. */
router.get('/settings/public', asyncHandler(async (req, res) => {
  const s = await getPlatformSettings();
  res.json({
    coinPricing: {
      audioCallPerMinute: s.coinPricing?.audioCallPerMinute ?? 5,
      videoCallPerMinute: s.coinPricing?.videoCallPerMinute ?? 10,
      photoUnlock: s.coinPricing?.photoUnlock,
      videoUnlock: s.coinPricing?.videoUnlock,
    },
    videoCall: { quality: s.videoCall.quality },
    security: { requireVerification: Boolean(s.security?.requireVerification) },
  });
}));

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'memberdate-api' });
});

export default router;
