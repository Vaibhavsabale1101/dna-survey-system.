import multer from 'multer';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = join(__dirname, '..', 'uploads');

// Ensure directory exists
try {
  mkdirSync(UPLOADS_DIR, { recursive: true });
} catch {}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const village = (req.body?.villageCode || req.query?.villageCode || 'VG').replace(/[^a-zA-Z0-9]/g, '');
    const stop = (req.body?.stopId || req.query?.stopId || '').replace(/[^a-zA-Z0-9]/g, '');
    const prefix = stop ? `${village}_${stop}` : village;
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `${prefix}_${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
  if (allowed.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WEBP, and GIF are allowed.`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 Megabytes maximum
    files: 5,
  },
  fileFilter,
});
