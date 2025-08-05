const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  size: { type: Number, },
  format: { type: String,  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysisStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  analysisResults: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);