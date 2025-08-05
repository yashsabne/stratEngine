import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { saveAs } from 'file-saver';

const InvoiceView = ({onClose}) => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const invoiceRef = React.useRef();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/invoice`,
        {withCredentials:true}
      );
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `,
  });
const handleDownloadPDF = async (invoiceId) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/invoice/${invoiceId}/pdf`,
      {
        responseType: 'blob',
        withCredentials: true,
      }
    );
    saveAs(response.data, `invoice-${invoiceId}.pdf`);
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};


  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between align-center">
      <h1 className="text-2xl font-bold text-gray-300 mb-6">Your Invoices</h1>
      
<span onClick={onClose} className='cursor-pointer' >&#10006;</span>
      </div>
      
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">No invoices found</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 font-semibold text-gray-400 border-b border-gray-700 pb-2">
              <div className="col-span-3">Invoice #</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Plan</div>
              <div className="col-span-2">Actions</div>
            </div>
            
            {invoices.map((invoice) => (
              <div key={invoice._id} className="grid grid-cols-12 gap-4 items-center border-b border-gray-700 py-3">
                <div className="col-span-3 text-gray-300">{invoice.invoice_number}</div>
                <div className="col-span-3 text-gray-400">
                  {new Date(invoice.payment_date).toLocaleDateString()}
                </div>
                <div className="col-span-2 text-gray-300">
                  {invoice.currency} {invoice.amount.toFixed(2)}
                </div>
                <div className="col-span-2 text-gray-400">
                  {invoice.plan?.name || 'N/A'}
                </div>
                <div className="col-span-2 flex space-x-2">
                  <button
                    onClick={() => setSelectedInvoice(invoice)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(invoice._id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6" ref={invoiceRef}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-300">INVOICE</h2>
                  <p className="text-gray-400">{selectedInvoice.invoice_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Date: {new Date(selectedInvoice.payment_date).toLocaleDateString()}</p>
                  <p className="text-gray-400">Status: <span className="text-green-500 font-semibold">Paid</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Billed To</h3>
                  <p className="text-gray-400">User ID: {selectedInvoice.user}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Payment Method</h3>
                  <p className="text-gray-400 capitalize">{selectedInvoice.payment_method}</p>
                  <p className="text-gray-400">Payment ID: {selectedInvoice.razorpay_payment_id}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Plan Details</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 font-semibold text-gray-400 border-b border-gray-600 pb-2 mb-2">
                    <div>Description</div>
                    <div className="text-right">Amount</div>
                  </div>
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 text-gray-300 py-2">
                      <div>{item.description}</div>
                      <div className="text-right">{selectedInvoice.currency} {item.amount.toFixed(2)}</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-4 font-semibold text-gray-300 pt-4 mt-2 border-t border-gray-600">
                    <div className="col-span-2 text-right">Total</div>
                    <div className="text-right">{selectedInvoice.currency} {selectedInvoice.amount.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="text-gray-400 text-sm">
                <p>Plan valid until: {new Date(selectedInvoice.expiry_date).toLocaleDateString()}</p>
                <p className="mt-2">Thank you for your business!</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end space-x-3 no-print">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Print Invoice
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedInvoice._id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Download PDF
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceView;