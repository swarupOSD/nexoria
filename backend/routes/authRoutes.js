import express from 'express';
import { register, login, logout, refresh, getMe, forgotPassword, resetPassword, updatePassword, updateProfile, generateCaptcha } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { registerValidation, loginValidation } from '../middlewares/validation.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.get('/captcha', generateCaptcha);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/update-password', protect, updatePassword);
router.put('/update-profile', protect, updateProfile);

export default router;
