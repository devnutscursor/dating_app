import { Router } from 'express';
import * as users from '../controllers/users.controller.js';
import * as notifications from '../controllers/notifications.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(authenticate));
router.get('/discover', asyncHandler(users.discover));
router.get('/online', asyncHandler(users.listOnline));
router.get('/likes', asyncHandler(users.listLikes));
router.post('/likes', asyncHandler(users.createLike));
router.patch('/me', asyncHandler(users.updateMe));
router.get('/me/notifications/unread-count', asyncHandler(notifications.unreadCount));
router.get('/me/notifications', asyncHandler(notifications.listMine));
router.patch('/me/notifications/:notificationId/read', asyncHandler(notifications.markNotificationRead));
router.post('/me/notifications/read-all', asyncHandler(notifications.markAllNotificationsRead));
router.post('/:id/unlock-media', asyncHandler(users.unlockMedia));
router.get('/:id', asyncHandler(users.getUserById));

export default router;
