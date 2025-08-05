import React from 'react';

const AboutUsPage = () => {
  const features = [
    {
      title: "Smart Sales Forecasting",
      description: "Predict next month’s sales with AI-driven models.",
      image: "images/about_0.jpeg"
    },
    {
      title: "Inventory Optimization",
      description: "Know what to stock, when, and how much.",
      image: "images/about_1.jpeg"
    },
    {
      title: "Visual Insights Dashboard",
      description: "Easy-to-read graphs for profit, loss, and KPIs.",
      image: "images/about_2.jpeg"
    },
    {
      title: "Dynamic Pricing Engine",
      description: "Suggest optimal prices based on trends, seasonality, and demand.",
      image: "images/about_3.jpeg"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 min-h-screen py-10 px-6"  >
      <section className="max-w-6xl mx-auto mb-20 text-center"> 
        <h2 className="text-5xl font-extrabold text-white mb-6">
          The Engine Behind Smarter Business Decisions
        </h2>
        <p className="text-lg text-gray-300 mb-10">
          Leverage real-time data insights, predictive analytics, and AI-powered recommendations to make smarter, faster business decisions.
        </p>
        <img
          src="images/about_head.jpeg"
          alt="Business Analysis"
          className="w-full max-w-3xl mx-auto rounded-lg shadow-lg"
        />
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          A Smarter Workflow for Modern Businesses
        </h2>
        <p className="text-lg text-gray-300 mb-12 text-center">
          Harness automation, data-driven insights, and streamlined tools to accelerate your decision-making and scale your operations effortlessly.
        </p>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <div key={index} className="bg-transparent rounded-lg img-text-about ">
              <img src={item.image} alt={item.title} className="w-full h-64 object-cover rounded-t-lg" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-indigo-500 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-300">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
