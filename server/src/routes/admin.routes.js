import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as admin from '../controllers/admin.controller.js';
import * as mod from '../controllers/moderator.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import * as mem from '../controllers/moderationMembers.controller.js';

const router = Router();

router.use(asyncHandler(authenticate), authorize('admin'));
router.get('/dashboard-stats', asyncHandler(admin.dashboardStats));
router.get('/content', asyncHandler(mod.listContent));
router.post('/content/review', asyncHandler(mod.reviewFemaleMedia));
router.get('/users', asyncHandler(admin.listUsers));
router.post('/users', asyncHandler(admin.createUser));
router.patch('/users/:id', asyncHandler(admin.patchUser));
router.delete('/users/:id', asyncHandler(admin.deleteUser));
router.get('/transactions', asyncHandler(admin.listTransactions));
router.post('/members/:userId/suspend', asyncHandler(mem.suspendPlatformMember));
router.post('/members/:userId/unsuspend', asyncHandler(mem.unsuspendPlatformMember));
router.get('/reports', asyncHandler(mod.listReports));
router.get('/reports/:reportId/transcript', asyncHandler(mod.getReportTranscript));
router.patch('/reports/:reportId', asyncHandler(mod.updateReport));
router.get('/settings', asyncHandler(admin.getSettings));
router.patch('/settings', asyncHandler(admin.patchSettings));

export default router;
