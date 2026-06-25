import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      maxLength: [30, 'Username cannot exceed 30 characters']
    },
    bio: {
      type: String,
      default: '',
      maxLength: [160, 'Bio cannot exceed 160 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'premium_user', 'admin', 'superadmin'],
      default: 'user',
      index: true,
    },
    profileImage: {
      type: String,
      default: 'default.jpg',
    },
    coverBanner: {
      type: String,
      default: '',
    },
    socialLinks: {
      telegram: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      youtube: { type: String, default: '' },
      discord: { type: String, default: '' },
      website: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' }
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'deleted'],
      default: 'active',
      index: true,
    },
    banReason: String,
    suspendedReason: String,
    suspensionEndDate: Date,
    banEndDate: Date, // For temporary bans
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actionDate: Date,
    warnings: {
      type: Number,
      default: 0
    },
    restrictions: {
      avatarReset: { type: Boolean, default: false },
      disableUploads: { type: Boolean, default: false },
      disableCommenting: { type: Boolean, default: false },
      disableRatings: { type: Boolean, default: false },
    },
    lastLogin: {
      type: Date,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    pushSubscriptions: [{
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String
      }
    }],
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumType: {
      type: String,
      default: 'None',
    },
    premiumStartDate: Date,
    premiumEndDate: Date,
    premiumGrantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    premiumStatus: {
      type: String,
      enum: ['Active', 'Expired', 'Revoked', 'None'],
      default: 'None',
    },
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
        deviceInfo: String,
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],
    purchasedMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
      }
    ],
    // Loyalty & Monetization (Phase 2)
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 0,
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log('matchPassword inputs:', { enteredPassword, typeOfEntered: typeof enteredPassword, thisPassword: this.password });
  return await bcrypt.compare(String(enteredPassword), this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire (10 minutes)
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
