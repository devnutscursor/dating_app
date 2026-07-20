import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as mod from '../controllers/moderator.controller.js';
import * as mem from '../controllers/moderationMembers.controller.js';
import * as verification from '../controllers/verification.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(authenticate), authorize('moderator'));
router.get('/content', asyncHandler(mod.listContent));
router.post('/content/review', asyncHandler(mod.reviewFemaleMedia));
router.post('/members/:userId/suspend', asyncHandler(mem.suspendPlatformMember));
router.post('/members/:userId/unsuspend', asyncHandler(mem.unsuspendPlatformMember));
router.get('/reports', asyncHandler(mod.listReports));
router.get('/reports/:reportId/transcript', asyncHandler(mod.getReportTranscript));
router.post('/reports/:reportId/support-thread', asyncHandler(mod.openReportSupportThread));
router.patch('/reports/:reportId', asyncHandler(mod.updateReport));
router.get('/support-chats', asyncHandler(mod.listSupportChats));
router.get('/verifications', asyncHandler(mod.listVerifications));
router.patch('/verifications/:id', asyncHandler(verification.reviewVerification));
router.get('/stats', asyncHandler(mod.moderatorStats));

export default router;
