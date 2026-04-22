import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const memory = multer.memoryStorage();

export const uploadImageMw = multer({
  storage: memory,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

export const uploadVideoMw = multer({
  storage: memory,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  },
});

function ensureCloudinaryConfigured() {
  if (!process.env.CLOUDINARY_URL?.trim()) {
    const err = new Error('CLOUDINARY_URL is not configured');
    err.status = 503;
    throw err;
  }
  cloudinary.config();
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

export async function uploadImage(req, res) {
  try {
    ensureCloudinaryConfigured();
  } catch (e) {
    return res.status(e.status || 503).json({ error: e.message });
  }
  if (!req.file?.buffer) {
    return res.status(400).json({ error: 'No file uploaded (use field name "file")' });
  }
  try {
    const result = await uploadBuffer(req.file.buffer, {
      folder: 'memberdate/profiles',
      resource_type: 'image',
    });
    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (e) {
    console.error('[uploads/image]', e);
    return res.status(500).json({ error: e.message || 'Image upload failed' });
  }
}

export async function uploadVideo(req, res) {
  try {
    ensureCloudinaryConfigured();
  } catch (e) {
    return res.status(e.status || 503).json({ error: e.message });
  }
  if (!req.file?.buffer) {
    return res.status(400).json({ error: 'No file uploaded (use field name "file")' });
  }
  try {
    const result = await uploadBuffer(req.file.buffer, {
      folder: 'memberdate/profiles',
      resource_type: 'video',
      eager: [{ width: 640, height: 360, crop: 'fill', format: 'jpg' }],
      eager_async: false,
    });
    const eagerUrl = result.eager?.[0]?.secure_url;
    const thumb =
      eagerUrl ||
      cloudinary.url(result.public_id, {
        secure: true,
        resource_type: 'video',
        format: 'jpg',
        transformation: [{ width: 640, height: 360, crop: 'fill', start_offset: 0 }],
      });
    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
      thumbnail: thumb,
      duration: result.duration,
    });
  } catch (e) {
    console.error('[uploads/video]', e);
    return res.status(500).json({ error: e.message || 'Video upload failed' });
  }
}
