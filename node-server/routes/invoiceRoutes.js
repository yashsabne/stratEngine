// routes/invoice.js
const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');
const htmlPdf = require('html-pdf');
const fs = require('fs');
const path = require('path');

// Get all invoices for user
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.session.user.id })
      .populate('plan')
      .sort({ payment_date: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

// Generate PDF invoice
router.get('/:id/pdf', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('plan')
      .populate('user');
    
    if (!invoice || invoice.user._id.toString() !== req.session.user.id) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Generate HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-title { font-size: 24px; font-weight: bold; }
          .invoice-info { text-align: right; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .billing-info { display: flex; justify-content: space-between; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th { text-align: left; padding: 8px; background: #f5f5f5; border-bottom: 1px solid #ddd; }
          .items-table td { padding: 8px; border-bottom: 1px solid #ddd; }
          .total-row { font-weight: bold; }
          .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div>#${invoice.invoice_number}</div>
          </div>
          <div class="invoice-info">
            <div>Date: ${new Date(invoice.payment_date).toLocaleDateString()}</div>
            <div>Status: <span style="color: green;">Paid</span></div>
          </div>
        </div>

        <div class="section billing-info">
          <div>
            <div class="section-title">Billed To</div>
            <div>${invoice.user.name || `User ID: ${invoice.user._id}`}</div>
          </div>
          <div>
            <div class="section-title">Payment Method</div>
            <div>${invoice.payment_method}</div>
            <div>Payment ID: ${invoice.razorpay_payment_id}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Plan Details</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${invoice.currency} ${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>Total</td>
                <td>${invoice.currency} ${invoice.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div>Plan valid until: ${new Date(invoice.expiry_date).toLocaleDateString()}</div>
          <div style="margin-top: 10px;">Thank you for your business!</div>
        </div>
      </body>
      </html>
    `;

    // PDF options
    const options = {
      format: 'A4',
      border: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    };

    // Generate PDF
    htmlPdf.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        console.error('Error generating PDF:', err);
        return res.status(500).json({ message: 'Error generating PDF' });
      }
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${invoice.invoice_number}.pdf`,
        'Content-Length': buffer.length
      });
      res.send(buffer);
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ message: 'Error generating invoice PDF' });
  }
});

module.exports = router;