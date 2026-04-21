import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import chatsRoutes from './chats.routes.js';
import adminRoutes from './admin.routes.js';
import moderatorRoutes from './moderator.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/chats', chatsRoutes);
router.use('/admin', adminRoutes);
router.use('/moderator', moderatorRoutes);

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'memberdate-api' });
});

export default router;
