import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import logger from '../middlewares/logger.js';
import sharp from 'sharp';

const uploadToCloudinary = async (buffer, folder, resourceType = 'image') => {
  // If it's an image, optimize it to WebP before uploading
  let finalBuffer = buffer;
  if (resourceType === 'image') {
    try {
      finalBuffer = await sharp(buffer)
        .webp({ quality: 80, effort: 4 }) // High-end webp compression
        .toBuffer();
    } catch (err) {
      logger.error('Sharp Image Optimization Error: ' + err.message);
      // Fallback to original buffer if sharp fails
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, format: resourceType === 'image' ? 'webp' : undefined },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(finalBuffer).pipe(uploadStream);
  });
};

const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const filename = parts.pop(); // e.g. "image1.png"
  const folder = parts.pop(); // e.g. "posts"
  const publicIdWithExtension = `${folder}/${filename}`;
  return publicIdWithExtension.split('.')[0];
};

export const deleteImage = async (req, res) => {
  try {
    const { url } = req.body;
    const publicId = extractPublicId(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid URL' });
    }
  } catch (error) {
    logger.error(`Delete Image Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }
    const result = await uploadToCloudinary(req.file.buffer, 'payments');
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    logger.error(`Upload Payment Proof Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Data loss prevention: Do not destroy oldImage. Let it become orphaned.

    const result = await uploadToCloudinary(req.file.buffer, 'posts');
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    logger.error(`Upload Image Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message || 'Image upload failed' });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Data loss prevention: Do not destroy oldImage. Let it become orphaned.

    const result = await uploadToCloudinary(req.file.buffer, 'logos');
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    logger.error(`Upload Logo Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message || 'Logo upload failed' });
  }
};

export const uploadProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    if (req.user && req.user.restrictions?.disableUploads) {
      return res.status(403).json({ success: false, message: 'Your upload privileges have been disabled.' });
    }

    // Data loss prevention: Do not destroy oldImage. Let it become orphaned.

    const result = await uploadToCloudinary(req.file.buffer, 'profiles');
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    logger.error(`Upload Profile Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message || 'Profile upload failed' });
  }
};

export const uploadVideoFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video provided' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'movies', 'video');
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    logger.error(`Upload Video Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message || 'Video upload failed' });
  }
};
