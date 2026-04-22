import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  uploadImage,
  uploadVideo,
  uploadImageMw,
  uploadVideoMw,
} from '../controllers/uploads.controller.js';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/image', uploadImageMw.single('file'), asyncHandler(uploadImage));
router.post('/video', uploadVideoMw.single('file'), asyncHandler(uploadVideo));

export default router;
