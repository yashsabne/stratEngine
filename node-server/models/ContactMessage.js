const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String },
  email: { type: String, required: true },
  country: { type: String },
  phoneNumber: { type: String },
  message: { type: String, required: true },
  agreed: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
