import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as admin from '../controllers/admin.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(authenticate), authorize('admin'));
router.get('/users', asyncHandler(admin.listUsers));
router.post('/users', asyncHandler(admin.createUser));
router.patch('/users/:id', asyncHandler(admin.patchUser));
router.delete('/users/:id', asyncHandler(admin.deleteUser));
router.get('/transactions', asyncHandler(admin.listTransactions));
router.get('/settings', asyncHandler(admin.getSettings));
router.patch('/settings', asyncHandler(admin.patchSettings));

export default router;
