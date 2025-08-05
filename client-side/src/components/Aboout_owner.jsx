import React from 'react';
import TeamSection from './sections/TeamSection';

const AbooutOwner = () => {
  return (
    <div className='bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'>
      {/* About Section 1 */}
      <section className="py-14 lg:py-24 relative">
        <div className="mx-auto max-w-6xl px-14 sm:px-16 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-9">
    
            <div className="img-box">
              <img
                src="https://lh5.googleusercontent.com/proxy/x2L4Wcwld6PCyHjNia6Cb8Qx2DVujOgpY9Oumf0j8VmAD-ytLeC3QJduDIVASi1ol-ecScHEUPwUoJdK7A9oZsj5nhCIPQs6zxJIaWT9"
                alt="About Us"
                className="max-lg:mx-auto object-cover rounded-lg"
              />
            </div>
            
            {/* Text Section */}
            <div className="lg:pl-24 flex items-center">
              <div className="data w-full">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-300 mb-9 text-center lg:text-left">
                  About Us
                </h2>
                <p className="text-xl leading-8 text-gray-500 max-lg:text-center max-w-2xl mx-auto">
            Driven by a passion for intelligent business growth, StratEngine is crafted to empower entrepreneurs, analysts, and 
            decision-makers alike. Our mission is to provide a unified platform where data meets strategy — helping you build smart, 
            intuitive solutions that drive performance, profitability, and impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section 2 */}
      <section className="py-14 lg:py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-9">
            {/* Text Section */}
            <div className="lg:pr-24 flex items-center">
              <div className="data w-full">
                <img
                  src="https://pagedone.io/asset/uploads/1702034785.png"
                  alt="About Us"
                  className="block lg:hidden mb-9 mx-auto object-cover rounded-lg"
                />
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-300 mb-9 text-center lg:text-left">
                 Launching Creativity in 2025
                </h2>
                <p className="text-xl leading-8 text-gray-500 max-lg:text-center max-w-2xl mx-auto">
                 At Strat-Engine, we go beyond aesthetics — we prioritize accessibility, scalability, and usability 
                 from day one. Every element, from the finest detail to the broadest layout, is thoughtfully engineered 
                 to enhance functionality and maximize user satisfaction.
                </p>
              </div>
            </div>
 
            <div className="img-box hidden lg:block">
              <img
                src="https://pagedone.io/asset/uploads/1702034785.png"
                alt="About Us"
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Numbers Section */}
      {/* <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center text-gray-900 font-bold mb-14">
            Our Results in Numbers
          </h2>
          <div className="flex flex-col gap-5 xl:gap-8 lg:flex-row lg:justify-between">
            {[
              {
                number: "240%",
                title: "Company Growth",
                description: "Company's remarkable growth journey as we continually innovate and drive towards new heights of success."
              },
              {
                number: "175+",
                title: "Team Members",
                description: "Our talented team members are the powerhouse of our company and pillars of our success."
              },
              {
                number: "625+",
                title: "Projects Completed",
                description: "We have accomplished more than 625 projects worldwide and we are still counting many more."
              }
            ].map((item, index) => (
              <div
                key={index}
                className="w-full max-lg:max-w-2xl mx-auto lg:mx-0 lg:w-1/3 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 transition duration-300 hover:shadow-lg"
              >
                <div className="flex gap-5">
                  <div className="text-2xl font-bold text-indigo-600">
                    {item.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl text-gray-900 font-semibold mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 leading-5">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <TeamSection/>
    </div>
  );
};

export default AbooutOwner;
