const express = require('express');
const Blog = require('../models/Blog.js');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.js');
const multer = require('multer');
const { v4 } = require('uuid');
const mongoose = require('mongoose');
const User = require('../models/User.js');

const router = express.Router();

 
// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'));
    }
  }
});

// Add this to your backend routes
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const result = await uploadToCloudinary(req.file.buffer);

  
    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});
 
router.get('/', async (req, res) => {
 
  try {

    if(req.query.businessType && req.query.businessType != "All_Types"  ) {
      const blogs = await Blog.find({businessType:req.query.businessType});
    res.json(blogs);
    }

    else {
    const blogs = await Blog.find().sort({ pinned: -1, createdAt: -1 });
    res.json(blogs);
    }

  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message 
    });
  }
});

router.get('/user', async (req,res) => { 
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  const user = req.session.user;
 

  let premitedToWriteBlog = false;

  if(user.role === 'admin') {
premitedToWriteBlog = true;
  }
const userBlogs = await Blog.find({ owner: req.session.user.id });

res.json({userBlogs,premitedToWriteBlog});
} )
 
router.get('/:slug', async (req, res) => {
  try {
    
    if (!req.params.slug || req.params.slug === 'undefined') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid '
      });
    }
  
    const blog = await Blog.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch blog',
      error: error.message 
    });
  }
});
// Create new blog
router.post('/', upload.single('image'), async (req, res) => {
  try {
 
    const { title, content, businessType, excerpt,image } = req.body;
     const userId = req.session.user.id;
 
    const newBlog = new Blog({
      title,
      content,
      businessType,
      excerpt,
      featuredImage: image,
      owner: userId, 
      ownerName:req.session.user.username
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({
      success: true,
      blog: savedBlog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error creating blog',
      error: error.message 
    });
  }
});

// Update blog
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, businessType, excerpt } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog not found' 
      });
    }

    let imageData = { ...blog.featuredImage };
    
    // If new image uploaded
    if (req.file) {
      // Delete old image if exists
      if (blog.featuredImage.public_id) {
        await deleteFromCloudinary(blog.featuredImage.public_id);
      }
      
      const result = await uploadToCloudinary(req.file.buffer);
      imageData = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { 
        title, 
        content, 
        businessType, 
        excerpt, 
        featuredImage: imageData,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error updating blog',
      error: error.message 
    });
  }
});

// Delete blog
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog not found' 
      });
    }

    // Delete image from Cloudinary if exists
    if (blog.featuredImage.public_id) {
      await deleteFromCloudinary(blog.featuredImage.public_id);
    }

    await Blog.findByIdAndDelete(id);
    
    res.json({ 
      success: true,
      message: 'Blog deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting blog',
      error: error.message 
    });
  }
});

module.exports = router;