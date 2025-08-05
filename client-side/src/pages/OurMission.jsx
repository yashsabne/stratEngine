// OurMission.js
import React from 'react';

const OurMission = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 border-b border-gray-700 pb-2">Our Mission</h1>
        <p className="text-lg text-gray-300 mb-4">
          At Grow Faster, our mission is to empower modern businesses with intelligent automation and data-driven insights that accelerate growth.
        </p>
        <p className="text-lg text-gray-400">
          We believe in transforming business operations through AI-powered forecasting, dynamic pricing, and real-time analytics. Whether you're a startup scaling up or an enterprise optimizing operations, our tools help you make smarter decisions faster.
        </p>
        
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-400">Smart Sales Forecasting</h3>
            <p className="text-gray-300">Our AI-driven models predict next month's sales with unprecedented accuracy, helping you prepare for what's coming.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-400">Inventory Optimization</h3>
            <p className="text-gray-300">Know exactly what to stock, when to order, and how much to keep - eliminating waste and maximizing efficiency.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-400">Visual Insights Dashboard</h3>
            <p className="text-gray-300">At-a-glance understanding of your business health through beautifully designed, easy-to-read graphs and KPIs.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-400">Dynamic Pricing Engine</h3>
            <p className="text-gray-300">Maximize profits with our intelligent pricing suggestions based on real-time market trends and demand patterns.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurMission;