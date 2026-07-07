import User from '../models/User.js';
import SiteSettings from '../models/SiteSettings.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import logger from '../middlewares/logger.js';
import sendEmail from '../utils/sendEmail.js';
import { getWelcomeTemplate, getPasswordResetTemplate } from '../utils/emailTemplates.js';
import { logSecurityEvent } from '../utils/securityLogger.js';
import { logActivity, sendNotification } from '../utils/tracker.js';
import { checkAndAwardBadges } from '../utils/badges.js';

// @desc    Generate a Math CAPTCHA
// @route   GET /api/auth/captcha
// @access  Public
export const generateCaptcha = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne() || {};
    const difficulty = settings.authSettings?.captchaDifficulty || 'easy';
    
    let num1, num2, operator, answer;
    
    if (difficulty === 'easy') {
      // Addition only (1-20)
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      operator = '+';
      answer = num1 + num2;
    } else if (difficulty === 'medium') {
      // Add/Sub (1-50)
      operator = Math.random() > 0.5 ? '+' : '-';
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      if (operator === '-' && num1 < num2) {
        // Ensure positive answers for simplicity
        [num1, num2] = [num2, num1];
      }
      answer = operator === '+' ? num1 + num2 : num1 - num2;
    } else {
      // Hard: Add, Sub, Mult, Div
      const ops = ['+', '-', 'x', '/'];
      operator = ops[Math.floor(Math.random() * ops.length)];
      
      if (operator === '+') {
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
        answer = num1 + num2;
      } else if (operator === '-') {
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
        if (num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
      } else if (operator === 'x') {
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = num1 * num2;
      } else if (operator === '/') {
        // Ensure clean integer division
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 12) + 2;
        num1 = num2 * answer;
      }
    }

    const equation = `${num1} ${operator} ${num2} = ?`;
    
    // Sign the answer into a short-lived JWT (5 minutes)
    const captchaToken = jwt.sign({ answer: answer.toString() }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '5m' });
    
    res.json({
      success: true,
      captcha: {
        equation,
        token: captchaToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate CAPTCHA' });
  }
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate unique referral code for the new user
    let uniqueReferralCode = '';
    let isUnique = false;
    while (!isUnique) {
      uniqueReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await User.findOne({ referralCode: uniqueReferralCode });
      if (!existing) isUnique = true;
    }

    // Handle incoming referral code
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
        // Award points and increment count to referrer
        referrer.referralCount += 1;
        referrer.rewardPoints += 50; // Give 50 points per referral
        await referrer.save();
        
        // Log activity for referrer
        await logActivity(referrer._id, 'USER_REFERRAL', `Successfully referred a new user. Awarded 50 points.`);
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      referralCode: uniqueReferralCode,
      referredBy,
      rewardPoints: referredBy ? 10 : 0 // Give 10 points to the new user if they used a referral
    });

    if (user) {
      const accessToken = generateAccessToken(user._id, user.role, user.email);
      const refreshToken = generateRefreshToken(user._id, user.role, user.email);

      // Save refresh token to user
      user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
      await user.save();

      // Set refresh token in http-only cookie
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });

      await logActivity(user._id, 'User Registration', 'Account created successfully', req);
      await sendNotification(user._id, 'Welcome!', 'Thank you for registering on Premium Apps.', 'SYSTEM', 'User');

      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to Premium Apps!',
          html: getWelcomeTemplate(user.name, `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`)
        });
      } catch(e) {}

      res.status(201).json({
        success: true,
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          bio: user.bio,
          status: user.status,
          restrictions: user.restrictions,
          isPremium: user.role === 'superadmin' ? true : user.isPremium,
          premiumType: user.role === 'superadmin' ? 'Lifetime' : user.premiumType,
          rewardPoints: user.rewardPoints,
          badges: user.badges || [],
          currentStreak: user.currentStreak || 0,
          longestStreak: user.longestStreak || 0,
          profileTheme: user.profileTheme || 'default',
          auraRank: user.auraRank || 'Rookie'
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error(`Register Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    let { email, password, captchaAnswer, captchaToken, twoFactorCode } = req.body;
    email = email ? email.trim() : email;

    const settings = await SiteSettings.findOne() || {};
    const captchaEnabled = settings.authSettings?.captchaEnabled ?? true;

    if (captchaEnabled) {
      if (!captchaAnswer || !captchaToken) {
         return res.status(400).json({ success: false, message: 'CAPTCHA is required', requireCaptcha: true });
      }
      try {
        const decoded = jwt.verify(captchaToken, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.answer !== String(captchaAnswer).trim()) {
           return res.status(400).json({ success: false, message: 'Incorrect CAPTCHA answer', requireCaptcha: true, invalidCaptcha: true });
        }
      } catch (err) {
        return res.status(400).json({ success: false, message: 'CAPTCHA expired. Please try again.', requireCaptcha: true, invalidCaptcha: true });
      }
    }

    console.log('Login query for email:', email);
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    console.log('Found user:', user ? user.email : 'null');

    if (user) {
      console.log('About to call matchPassword');
    }

    if (user && (await user.matchPassword(password))) {
      // Check account status
      if (user.status === 'banned' || user.status === 'deleted') {
         return res.status(403).json({ success: false, message: `Account is ${user.status}` });
      }

      // Check 2FA
      if (user.twoFactorEnabled) {
         if (!twoFactorCode) {
            return res.status(200).json({ success: false, require2FA: true, message: '2FA code required' });
         }
         const speakeasy = (await import('speakeasy')).default;
         const verified = speakeasy.totp.verify({
           secret: user.twoFactorSecret,
           encoding: 'base32',
           token: twoFactorCode
         });
         if (!verified) {
           return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
         }
      }

      // Daily Login Reward (10 Coins) & Streaks
      const now = new Date();
      if (!user.lastLogin || user.lastLogin.toDateString() !== now.toDateString()) {
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        
        if (!lastLogin) {
          user.currentStreak = 1;
          user.longestStreak = 1;
          user.rewardPoints += 10;
        } else {
          // Calculate difference in days (ignoring time)
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastLogin.toDateString() === yesterday.toDateString()) {
            user.currentStreak += 1;
            user.rewardPoints += 10;
            if (user.currentStreak > (user.longestStreak || 0)) {
               user.longestStreak = user.currentStreak;
            }
            if (user.currentStreak === 7 && (!user.badges || !user.badges.includes('streak_master'))) {
               if(!user.badges) user.badges = [];
               user.badges.push('streak_master');
               user.rewardPoints += 100; // Bonus
               await logActivity(user._id, 'Achievement Unlocked', 'Unlocked Streak Master Badge! Earned 100 bonus coins.', req);
            }
          } else {
            // Missed a day
            user.currentStreak = 1;
            user.rewardPoints += 10;
          }
        }
        await logActivity(user._id, 'Daily Login Reward', `Earned 10 coins. Current streak: ${user.currentStreak} days`, req);
      }

      user.lastLogin = now;
      user.lastLoginDate = now;
      
      const accessToken = generateAccessToken(user._id, user.role, user.email);
      const refreshToken = generateRefreshToken(user._id, user.role, user.email);

      // Manage refresh tokens (keep only the last 5 devices)
      user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > Date.now());
      user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
      if (user.refreshTokens.length > 5) user.refreshTokens.shift();
      
      await user.save();

      await checkAndAwardBadges(user._id);

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });

      await logActivity(user._id, 'User Login', 'Logged in successfully', req);

      res.json({
        success: true,
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          bio: user.bio,
          status: user.status,
          restrictions: user.restrictions,
          isPremium: user.role === 'superadmin' ? true : user.isPremium,
          premiumType: user.role === 'superadmin' ? 'Lifetime' : user.premiumType,
          rewardPoints: user.rewardPoints,
          badges: user.badges || [],
          currentStreak: user.currentStreak || 0,
          longestStreak: user.longestStreak || 0,
          profileTheme: user.profileTheme || 'default',
          auraRank: user.auraRank || 'Rookie'
        },
      });
    } else {
      await logSecurityEvent({ eventType: 'FAILED_LOGIN', req, details: { email } });
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    logger.error(`Login Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;
    
    if (refreshToken) {
      // Remove refresh token from db
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
        await user.save();
      }
    }

    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(0),
    });

    if (req.user) {
      await logActivity(req.user._id, 'User Logout', 'Logged out successfully', req);
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get new access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Not authorized, no refresh token' });
    }

    const user = await User.findOne({ 'refreshTokens.token': refreshToken });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err || user._id.toString() !== decoded._id) {
         return res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
      }

      const accessToken = generateAccessToken(user._id, user.role, user.email);
      res.json({ success: true, accessToken });
    });
  } catch (error) {
    logger.error(`Refresh Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    let user = req.user;
    if (!user.referralCode) {
      // Generate referral code for existing user
      let uniqueReferralCode = '';
      let isUnique = false;
      while (!isUnique) {
        uniqueReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        const existing = await User.findOne({ referralCode: uniqueReferralCode });
        if (!existing) isUnique = true;
      }
      user.referralCode = uniqueReferralCode;
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error(`Get Me Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        html: getPasswordResetTemplate(user.name, resetUrl),
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    logger.error(`Forgot Password Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    await logActivity(user._id, 'Password Reset', 'Password reset using email token', req);
    await sendNotification(user._id, 'Password Reset', 'Your password has been successfully reset.', 'SECURITY', 'ShieldAlert');

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    logger.error(`Reset Password Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role, user.email);

    await logActivity(user._id, 'Password Changed', 'Password updated successfully', req);
    await sendNotification(user._id, 'Security Alert', 'Your password was changed successfully.', 'SECURITY', 'Lock');

    res.status(200).json({
      success: true,
      accessToken,
      message: 'Password updated successfully',
    });
  } catch (error) {
    logger.error(`Update Password Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    
    if (req.body.username !== undefined) {
      // Check if username is already taken
      if (req.body.username !== user.username) {
         const existingUser = await User.findOne({ username: req.body.username });
         if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username is already taken' });
         }
      }
      user.username = req.body.username;
    }

    if (req.body.email !== undefined) {
       // Check if email is already taken
       if (req.body.email !== user.email) {
          const existingEmail = await User.findOne({ email: req.body.email });
          if (existingEmail) {
             return res.status(400).json({ success: false, message: 'Email is already in use' });
          }
       }
       user.email = req.body.email;
    }

    if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    }
    if (req.body.coverBanner !== undefined) {
      user.coverBanner = req.body.coverBanner;
    }
    if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
    }
    if (req.body.profileTheme !== undefined) {
      user.profileTheme = req.body.profileTheme;
    }
    if (req.body.genderIdentity !== undefined) {
      user.genderIdentity = req.body.genderIdentity;
    }
    if (req.body.socialLinks !== undefined) {
      user.socialLinks = { ...user.socialLinks, ...req.body.socialLinks };
    }
    
    await user.save();

    await logActivity(user._id, 'Profile Updated', 'Profile details updated', req);

    await checkAndAwardBadges(user._id);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        coverBanner: user.coverBanner,
        bio: user.bio,
        socialLinks: user.socialLinks,
        status: user.status,
        restrictions: user.restrictions,
        isPremium: user.isPremium,
        premiumType: user.premiumType,
        premiumEndDate: user.premiumEndDate,
        badges: user.badges || [],
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        profileTheme: user.profileTheme || 'default',
        auraRank: user.auraRank || 'Rookie',
        genderIdentity: user.genderIdentity || 'Not specified',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error(`Update Profile Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const speakeasy = (await import('speakeasy')).default;
    const qrcode = (await import('qrcode')).default;
    
    const secret = speakeasy.generateSecret({ name: `Nexoria (${user.email})` });
    user.twoFactorSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      res.json({ success: true, secret: secret.base32, qrcode: data_url });
    });
  } catch (error) {
    logger.error(`Generate 2FA Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to generate 2FA' });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    const speakeasy = (await import('speakeasy')).default;
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      user.twoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: '2FA Enabled successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid 2FA code' });
    }
  } catch (error) {
    logger.error(`Verify 2FA Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to verify 2FA' });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();
    res.json({ success: true, message: '2FA Disabled successfully' });
  } catch (error) {
    logger.error(`Disable 2FA Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
  }
};
