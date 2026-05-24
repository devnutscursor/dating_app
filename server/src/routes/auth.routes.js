import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, asyncHandler(auth.register));
router.post('/login', authLimiter, asyncHandler(auth.login));
router.post('/verify-email', asyncHandler(authenticate), asyncHandler(auth.verifyEmail));
router.post('/resend-verification', asyncHandler(authenticate), asyncHandler(auth.resendVerification));
router.get('/me', asyncHandler(authenticate), asyncHandler(auth.me));
router.post('/change-password', authLimiter, asyncHandler(authenticate), asyncHandler(auth.changePassword));
router.post('/logout', asyncHandler(authenticate), asyncHandler(auth.logout));

export default router;
