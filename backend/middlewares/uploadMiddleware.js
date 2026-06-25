import multer from 'multer';
import path from 'path';

// Configure multer memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Allowed extensions: jpg, jpeg, png, webp'), false);
  }
};

// Reusable upload middleware (5MB limit)
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Video file filter
const videoFileFilter = (req, file, cb) => {
  const filetypes = /mp4|webm|mkv|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Videos only! Allowed extensions: mp4, webm, mkv, avi'), false);
  }
};

// Video upload middleware (500MB limit for movies)
export const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: videoFileFilter,
});
