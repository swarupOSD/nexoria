import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Startup Validation
if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
  console.error('\n❌ CRITICAL STARTUP ERROR: Missing valid CLOUDINARY_CLOUD_NAME');
  console.error('Please configure your Cloudinary credentials in backend/.env to enable file uploads.\n');
  process.exit(1);
}
if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
  console.error('\n❌ CRITICAL STARTUP ERROR: Missing valid CLOUDINARY_API_KEY');
  console.error('Please configure your Cloudinary credentials in backend/.env to enable file uploads.\n');
  process.exit(1);
}
if (!process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET === 'your_api_secret') {
  console.error('\n❌ CRITICAL STARTUP ERROR: Missing valid CLOUDINARY_API_SECRET');
  console.error('Please configure your Cloudinary credentials in backend/.env to enable file uploads.\n');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
