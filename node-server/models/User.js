const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const loginHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  success: Boolean,
});

const sessionSchema = new mongoose.Schema({
  sessionId: String,
  deviceInfo: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  // Core Identity
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },

  avatar: { type: String, default: '' },
  address: {
    country: String,
    state: String,
    city: String,
    zip: String,
    street: String,
  },

  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,

  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },

  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  planExpiry: {
    type: Date,
    default: null
  },
  subscriptionId: {
    type: String,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', null],
    default: null
  },
  invoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }],

  // Device & Sessions
  sessions: [sessionSchema],

  // History Logs
  loginHistory: [loginHistorySchema],

  // API Tokens for dev users
  apiTokens: [{
    name: String, // Added name for API tokens
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    lastUsed: Date,
  }],

  // Enhanced Preferences
  settings: {
    // Display Settings
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark'
    },
    density: {
      type: String,
      enum: ['compact', 'normal', 'comfortable'],
      default: 'normal'
    },

    // Language & Region
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ru'],
      default: 'en'
    },
    region: {
      type: String,
      default: 'Asia/India'
    },

 
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      types: {
        system: { type: Boolean, default: true },
        promotional: { type: Boolean, default: false },
        security: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: false }
      },
      sound: {
        type: String,
        enum: ['default', 'chime', 'ding', 'bell', 'none'],
        default: 'default'
      }
    },

    // Privacy & Security
    privacy: {
      showActivity: { type: Boolean, default: true },
      personalizedAds: { type: Boolean, default: false },
      dataSharing: { type: Boolean, default: false }
    }
  },

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: Date,
}, {
  timestamps: true,
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Middleware to update updatedAt timestamp
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);