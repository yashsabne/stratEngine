require('dotenv').config()
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const File = require('../models/Files');
const { spawn } = require('child_process');
 
const axios = require('axios');
  
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const pythonServer = process.env.PYTHONSERVER;

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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

// Upload file
const moment = require('moment'); // For easier date manipulation

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const user = req.session.user;

    console.log(user)
 
    let startDate;
    if (user.plan === 'pro') {
      if (!user.planExpiry) {
        return res.status(400).json({ message: 'Pro plan is not active.' });
      }
      startDate = new Date(user.planExpiry);
      startDate.setMonth(startDate.getMonth() - 1);  
    } else { 
      startDate = moment().startOf('month').toDate();
    }
 
    const uploadedFileCount = await File.countDocuments({
      owner: user.id,
      createdAt: { $gte: startDate }
    });
 
    const limit = user.plan === 'pro' ? 10 : 3;
    
    if (uploadedFileCount >= limit) {
      return res.status(403).json({
        message: `Upload limit exceeded. ${user.plan === 'pro' ? '10 files/month' : '3 files total'} allowed.`
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: `sales_data/${uuidv4()}`,
          format: 'csv'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Save file info to database
    const newFile = new File({
      originalName: req.file.originalname,
      cloudinaryUrl: result.secure_url,
      cloudinaryId: result.public_id,
      size: result.bytes,
      format: result.format,
      owner: user.id
    });

    await newFile.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});


// Get user's files
router.get('/', authMiddleware, async (req, res) => {
  try { 
    const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});
 
// Add this route to get file content
router.get('/content/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
 
 
    const fileUrl = file.cloudinaryUrl;
 
    const response = await axios.get(fileUrl);
 

    res.json({ content: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching file content' });
  }
});
 
router.post('/analyze/:fileId', authMiddleware, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    file.analysisStatus = 'processing';
    await file.save();
 
    const forecastResponse = await axios.get(`${pythonServer}/forecast`, {
      params: { csv_url: file.cloudinaryUrl }
    });
 
    const pricingResponse = await axios.get(`${pythonServer}/pricing`, {
      params: {
        csv_url: file.cloudinaryUrl,
        units: 120,
        month: 6
      }
    });

    file.analysisStatus = 'completed';
    file.analysisResults = {
      forecast: forecastResponse.data,
      pricing: pricingResponse.data
    };
    await file.save();

 
    res.json({
      forecast: file.analysisResults.forecast,
      pricing: {
        legacy: file.analysisResults.pricing.legacy,
        modern: file.analysisResults.pricing.modern
      }
    });

  } catch (error) {
    console.error('Analysis error:', error.message);
    await File.findByIdAndUpdate(req.params.fileId, {
      analysisStatus: 'failed'
    });
    res.status(500).json({ message: 'Analysis failed' });
  }
});

// Delete file
router.delete('/:fileId', authMiddleware, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({
      _id: req.params.fileId,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: 'raw' });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

module.exports = router;
