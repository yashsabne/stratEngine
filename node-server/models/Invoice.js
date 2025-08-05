 
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  razorpay_order_id: {
    type: String,
    required: true
  },
  razorpay_payment_id: {
    type: String,
    required: true
  },
  razorpay_signature: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'paid', 'failed'],
    default: 'created'
  },
  invoice_number: {
    type: String,
    unique: true
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  expiry_date: {
    type: Date,
    required: true
  },
  payment_method: {
    type: String,
    default: 'razorpay'
  },
  items: [{
    description: String,
    amount: Number
  }]
}, { timestamps: true });

// Generate invoice number before saving
InvoiceSchema.pre('save', async function(next) {
  if (!this.invoice_number) {
    const count = await this.constructor.countDocuments();
    this.invoice_number = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);