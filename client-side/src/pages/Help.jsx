// Help.js
import React from 'react';

const Help = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 border-b border-gray-700 pb-2">Help & Support</h1>
        <p className="text-lg mb-4">
          Welcome to the Grow Faster Help Center. We're here to help you optimize your business operations and accelerate growth.
        </p>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">Getting Started</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Connect your data sources to begin receiving AI-powered insights</li>
            <li>Configure your dashboard to track the metrics that matter most to your business</li>
            <li>Set up automated alerts for critical inventory levels or sales trends</li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">Troubleshooting</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Data not syncing? Check your API connections and refresh permissions</li>
            <li>Forecasts seem off? Verify your historical data quality and completeness</li>
            <li>Dashboard not loading? Clear your cache or try a different browser</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">Contact Us</h2>
          <p className="text-gray-300 mb-2">24/7 Support: <span className="text-blue-400">support@stratEngine.com</span></p>
          <p className="text-gray-300">Priority Support for Enterprise: <span className="text-blue-400">enterprise@stratEngine.com</span></p>
          <p className="text-gray-300 mt-4">Visit our <a className="underline text-blue-400" href="#">Knowledge Base</a> for detailed guides and tutorials.</p>
        </div>
      </div>
    </div>
  );
};

export default Help;