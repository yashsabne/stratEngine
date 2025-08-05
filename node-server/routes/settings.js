const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');
 
const authMiddleware = async (req, res, next) => {
 
      const user = await User.findById(req.session.user.id)
  if (!req.session.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authenticated' 
        });
      }
 
 
  if (!user) return res.status(404).json({ message: 'User not found' });
  req.user = user;
  next();
};

// Save preferences
router.patch('/preferences', authMiddleware, async (req, res) => {
  req.user.settings = req.body;

 
  await req.user.save();
  res.json({ message: 'Preferences updated successfully' });
});

// Generate new API token
router.post('/user/tokens', authMiddleware, async (req, res) => {
  const { name, expiresInDays } = req.body;
  if (!name) return res.status(400).json({ message: 'Token name is required' });

  const token = {
    _id: crypto.randomBytes(12).toString('hex'),
    name,
    value: crypto.randomBytes(32).toString('hex'),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + (expiresInDays || 30) * 86400000)
  };

  req.user.apiTokens.push(token);
  await req.user.save();

  res.json({ token });
});

// Revoke API token
router.delete('/user/tokens/:tokenId', authMiddleware, async (req, res) => {
  req.user.apiTokens = req.user.apiTokens.filter(t => t._id !== req.params.tokenId);
  await req.user.save();
  res.json({ message: 'Token revoked successfully' });
});

// Revoke session
router.delete('/user/sessions/:sessionId', authMiddleware, async (req, res) => {
  
    const sessionId = req.params.sessionId
  req.user.sessions = req.user.sessions.filter(s => s._id.toString() !== sessionId.toString());

  await req.user.save();
  res.json({ message: 'Session revoked successfully' });
});

// Change password
router.patch('/user/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
 

  const isMatch = await bcrypt.compare(currentPassword, req.user.password);
  if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

  req.user.password = await bcrypt.hash(newPassword, 12);
  await req.user.save();

  res.json({ message: 'Password changed successfully' });
});
 
module.exports = router;
