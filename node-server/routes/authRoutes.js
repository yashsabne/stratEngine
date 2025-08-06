const express = require('express');
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');
const User = require('../models/User');   
const router = express.Router(); 
const rateLimit = require('express-rate-limit'); 
 
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
 
const storage = multer.memoryStorage(); 
const upload = multer({ storage });
const nodemailer = require('nodemailer'); 
const { uploadToCloudinary } = require('../utils/cloudinary');
 
router.get('/check', async (req, res) => {
  const { username, email, phone } = req.query;

  console.log(req.query)

  if (!username && !email && !phone) {
    return res.status(400).json({ available: false, message: 'No input provided' });
  }

  try {
    let query = {};
    if (username) query.username = username.trim();
    if (email) query.email = email.trim();
    if (phone) query.phone = phone.trim();

    const existingUser = await User.findOne(query);

    console.log(existingUser)

    return res.json({ available: !existingUser });
  } catch (error) {
    console.error('Availability check error:', error);
    return res.status(500).json({ available: false, message: 'Server error' });
  }
});

 
router.post('/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      address,
      city,
      state,
      pinCode,
      country,
      notifications,
    } = req.body;

    const parsedNotifications = notifications ? JSON.parse(notifications) : {};

    // Validate email or required fields
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    const existingUserName = await User.findOne({username});
    const existingPhn = await User.findOne({phone});

    if(existingUserName) { 
      return res.status(400).json({ message: 'username already in use.' });
    }
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }
      if (existingPhn) {
      return res.status(400).json({ message: 'Number already in use.' });
    }
        let avatarUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'user_avatars');
      avatarUrl = result.secure_url;
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'user',
      avatar: avatarUrl,
      address: {
        street: address,
        city,
        state,
        zip: pinCode,
        country,
      },
      settings: {
        notifications: {
          email: parsedNotifications.comments ?? true,
          sms: parsedNotifications.candidates ?? false,
          push: parsedNotifications.push === 'email',
        },
      },
      sessions: [{
        sessionId: uuidv4(),
        deviceInfo: req.headers['user-agent'] || 'Unknown Device',
        ip: req.ip,
      }],
      loginHistory: [{
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        success: true,
      }],
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.', userId: newUser._id });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
// ===================== LOGIN ===================== //
 
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later'
});
 

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password, remember } = req.body;

  try { 
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }
 
    const user = await User.findOne({ email }).select('+password +isEmailVerified +loginAttempts +lockUntil');
     
    if (!user || !(await user.comparePassword(password, user.password))) {
      
      if (user) {
        user.loginAttempts += 1;
         
        if (user.loginAttempts >= 5) {
          user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
          await user.save();
          return res.status(403).json({
            success: false,
            message: 'Account locked due to too many failed attempts. Try again in 30 minutes.'
          });
        }
        
        await user.save();
      }
      
      return res.status(401).json({ 
        success: false,
        message: 'Incorrect email or password' 
      });
    }
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ 
        success: false,
        message: `Account temporarily locked. Try again in ${Math.ceil((user.lockUntil - Date.now()) / (60 * 1000))} minutes.`
      });
    }
    
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

  
 
    user.loginHistory.push({
      timestamp: Date.now(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      success: true,
    });

    // Create session
    const sessionId = crypto.randomBytes(16).toString('hex');
    user.sessions.push({
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      loginAt: new Date(),
      sessionId,
    });

    await user.save();

    // Store user in session
    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      plan:user.plan,
      planExpiry:user.planExpiry
    };

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };

    if (remember) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;  
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred during login',
      error: err.message
    });
  }
});
  
router.get('/me', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    console.log(req.session.user)

    const user = await User.findById(req.session.user.id).select('-password');
    const loginHistory = user.loginHistory;
 
 
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        phone:user.phone,
        email: user.email,
        username: user.username,
        role: user.role,    
        avatar:user.avatar,     
        firstName:user.firstName,
        lastName:user.lastName,  
        address: {
        country: user.address.country,
        state: user.address.state,
        city: user.address.city,
        zip: user.address.zip,
        street: user.address.street,
        },
      },
      session : {
      last_login:loginHistory[loginHistory.length-1],
      ip_address:loginHistory.ip,
      device:loginHistory.userAgent
      }
 
    });

  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
});


router.post('/profile/update', async (req, res) => {

  console.log("PROFILE UPDATE HIT");
  try {
    const userId = req.session.user.id; 
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/settings', async (req, res) => {
 

  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = await User.findById(req.session.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const lastLogin = user.loginHistory[user.loginHistory.length - 1];

  res.status(200).json({
    userSettings: {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name:user.firstName,
        phone:user.phone,
        role: user.role,
        plan:user.plan,
        planExpiry:user.planExpiry,
        subscriptionId:user.subscriptionId,
        paymentMethod:user.paymentMethod,
        isEmailVerified:user.isEmailVerified,
        isPhoneVerified:user.isPhoneVerified, 
        avatar:user.avatar

      },
      settings: {
        language: user.settings.language,
        darkMode: user.settings.darkMode,
        notifications: user.settings.notifications,
        privacy:user.settings.privacy,
        region:user.settings.region
      },
      security: {
        twoFactorEnabled: user.twoFactorEnabled,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        lastLogin: user.lastLogin,
      },
      session: {
        last_login: lastLogin?.timestamp || null,
        ip_address: lastLogin?.ip || null,
        device: lastLogin?.userAgent || null,
      },
      sessions: user.sessions,
      loginHistory: user.loginHistory.slice(-5),
      apiTokens: user.apiTokens,
    }
  });
});
 
router.post('/send-verification', async (req, res) => {
  const { email, firstName } = req.body;

  console.log('[POST /send-verification] Request body:', req.body);

  if (!email) {
    console.log('❌ Email is missing');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = Date.now() + 60 * 60 * 1000;

    console.log('🔐 Generated Token:', token);
    console.log('⏳ Token Expires At:', new Date(tokenExpires).toISOString());

    const user = await User.findOneAndUpdate(
      { email },
      {
        emailVerificationToken: token,
        emailVerificationExpires: tokenExpires,
        isEmailVerified: false,
      },
      { new: true }
    );

    if (!user) {
      console.log('❌ No user found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Token saved to user:', user._id);

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;
    console.log('📩 Sending verification link:', verificationUrl);

    const mailOptions = {
      from: `no-reply-registration${process.env.OWNER_EMAIL}`,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h3>Hello ${firstName || ''},</h3>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link expires in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email);

    res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    console.error('🔥 Error in /send-verification:', err);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  console.log('[GET /verify-email] Token received:', token);

  if (!token) {
    console.log('❌ No token provided');
    return res.status(400).json({ message: 'Token is missing' });
  }

  try {
    const now = Date.now();
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: now },
    });

    if (!user) {
      console.log('❌ No user found OR to ken expired');
      const expiredUser = await User.findOne({ emailVerificationToken: token });
      if (expiredUser) {
        console.log('ℹ️ Token expired at:', expiredUser.emailVerificationExpires);
        console.log('⏰ Current time:', new Date(now).toISOString());
      } else {
        console.log('❌ No user with such token found at all.');
      }

      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    console.log('✅ User found for token:', user._id);

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log('🎉 Email successfully verified for user:', user.email);
    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('🔥 Error in /verify-email:', error);
    return res.status(500).json({ message: 'Server error during verification' });
  }
});


router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to logout' 
      });
    }
    
    res.clearCookie('connect.sid'); // Or your session cookie name
    res.status(200).json({ 
      success: true,
      message: 'Logout successful' 
    });
  });
});

router.post('/request-deletion', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No session found' });
    }

    const userId = req.session.user.id;
    console.log('Deleting user:', userId);

    const isPremiumActive = await User.findById(userId);


 

    if (isPremiumActive.plan === 'pro') {
      return res.status(403).json({ message: 'Active premium plan. Delete your account after your plan expires.' });
    }

    if (isPremiumActive.plan === 'free') {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ message: 'User deleted but failed to end session' });
        }

        return res.status(200).json({ message: 'Account successfully deleted and session ended.' });
      });
    } else {
      // In case plan is neither 'free' nor 'pro'
      return res.status(400).json({ message: 'Invalid plan status' });
    }

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
});

  
const ContactMessage = require('../models/ContactMessage');

router.post('/contact', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      company,
      email,
      country,
      phoneNumber,
      message,
      agreed
    } = req.body;

    if (!firstName || !lastName || !email || !message || !agreed) {
      return res.status(400).json({ message: 'Required fields are missing.' });
    }

    console.log(req.body)

    const contact = new ContactMessage({
      firstName,
      lastName,
      company,
      email,
      country,
      phoneNumber,
      message,
      agreed
    });

    await contact.save();

    return res.status(200).json({ message: 'Message received successfully!' });
  } catch (error) {
    console.error('Error saving contact form:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

 

module.exports = router;
