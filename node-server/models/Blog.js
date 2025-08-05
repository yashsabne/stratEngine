const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
  },
  businessType: {
    type: String,
    enum: {
      values: ['startup', 'saas', 'ecommerce', 'finance', 'marketing', 'technology'],
      message: 'Invalid business type'
    },
    default: 'startup'
  },
  excerpt: {
    type: String,
    maxlength: [160, 'Excerpt cannot exceed 160 characters']
  },
  featuredImage: {
    type: String,
  },
  pinned: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type:String,
    ref:'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug before saving
blogSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
