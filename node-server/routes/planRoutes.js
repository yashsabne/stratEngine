const express = require('express');
const User =require('../models/User.js');
const Plan = require('../models/Plans.js');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Invoice = require('../models/Invoice.js');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get all plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans' });
  }
});

// Get current user's plan
router.get('/my-plan', async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).select('plan planExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      plan: user.plan,
      expiry: user.planExpiry,
      isActive: user.planExpiry > new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user plan' });
  }
});

// Create Razorpay order for plan upgrade
router.post('/create-order', async (req, res) => {
  try {
    const { planId } = req.body;
 
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Plan not found or inactive' });
    }
    
    // Check if user already has this plan
    const user = await User.findById(req.session.user.id);
    if (user.plan === plan.name.toLowerCase()) {
      return res.status(400).json({ message: 'You already have this plan' });
    }
    
    // Create Razorpay order
    const options = {
      amount: plan.price * 100, // amount in smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: `order_${req.session.user.username}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        userId: req.session.user.id.toString(),
        planId: plan._id.toString()
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    
    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    
    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Plan not found or inactive' });
    }
    
    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    // Create invoice
    const invoice = new Invoice({
      user: req.session.user.id,
      plan: planId,
      amount: plan.price,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: 'paid',
      expiry_date: expiryDate,
      items: [{
        description: `${plan.name} Subscription`,
        amount: plan.price
      }]
    });
    
    await invoice.save();
    
    // Update user with new plan and invoice reference
    await User.findByIdAndUpdate(req.session.user.id, {
      plan: plan.name.toLowerCase(),
      planExpiry: expiryDate,
      paymentMethod: 'razorpay',
      subscriptionId: razorpay_payment_id,
      $push: { invoices: invoice._id } // Add this field to your User model
    });
    
    res.json({
      success: true,
      message: 'Plan upgraded successfully',
      plan: plan.name,
      expiry: expiryDate,
      invoice: {
        number: invoice.invoice_number,
        amount: invoice.amount,
        date: invoice.payment_date
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

router.post('/cancel-subscription', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.id;
    const user = await User.findById(userId);

    if (!user || !user.subscriptionId) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
  
     user.plan = 'free';
    user.planExpiry = null;
    user.subscriptionId = null;
    user.paymentMethod = null;
    await user.save();

    return res.status(200).json({ message: 'Subscription cancelled successfully.' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({ message: 'Failed to cancel subscription.' });
  }
});


module.exports =  router;