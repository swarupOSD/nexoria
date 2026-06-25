import logger from '../middlewares/logger.js';

export const validateEnv = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGO_URI',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    logger.error(`FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  // Strict JWT Security Validation
  const weakSecrets = ['secret', 'password', '123456', 'test', 'jwtsecret', 'mysecret'];
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefresh = process.env.JWT_REFRESH_SECRET;

  if (jwtSecret.length < 32 || jwtRefresh.length < 32) {
    logger.error('FATAL ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be at least 32 characters long to ensure cryptographic security.');
    process.exit(1);
  }

  const isWeak = weakSecrets.some(weak => 
    jwtSecret.toLowerCase().includes(weak) || 
    jwtRefresh.toLowerCase().includes(weak)
  );

  if (isWeak) {
    logger.error('FATAL ERROR: JWT secrets contain common insecure dictionary words. Please use a strong, randomly generated string.');
    process.exit(1);
  }
};
