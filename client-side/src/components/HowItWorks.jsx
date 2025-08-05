import React from "react";

import { steps } from "../constants";

const HowItWorks = () => {


  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-950 p-10" id="howitworks" >
      <div className="w-full">
        <div className="container mx-auto my-32 flex flex-col items-center gap-16">
     
          <div className="flex flex-col gap-2 text-center">
            <h2 className="mb-2 text-3xl font-extrabold leading-tight text-gray-400 lg:text-4xl">
              How Strat-Engine works?
            </h2>
            <p className="text-base font-medium leading-7 text-gray-600">
               StratEngine simplifies data-driven decision-making by collecting your sales data, analyzing key metrics, and offering actionable insights — Let take a look how it works. 
            </p>
          </div> 
        
        <div className="flex flex-col gap-30"> 
  <div className="flex flex-col gap-y-10 lg:flex-row lg:gap-x-8 xl:gap-x-20">
    {steps.slice(0, 3).map((step, index) => (
      <React.Fragment key={index}> 
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full 
             bg-blue-500 text-white
            transition duration-300 hover:bg-blue-600 focus:bg-blue-700`}
          >
            <span className="text-base font-bold leading-7">{step.number}</span>
          </div>
          <div className="flex flex-col">
            <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
            <p className="text-base font-medium text-gray-300">{step.description}</p>
          </div>
        </div>
 
        
      </React.Fragment>
    ))}
  </div>
 
  <div className="flex flex-col gap-y-10 lg:flex-row-reverse lg:gap-x-8 xl:gap-x-20">
    {steps.slice(3, 6).map((step, index) => (
      <React.Fragment key={index + 3}>
 
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white
              transition duration-300 hover:bg-blue-600 focus:bg-blue-700`}
          >
            <span className="text-base font-bold leading-7">{step.number}</span>
          </div>
          <div className="flex flex-col">
            <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
            <p className="text-base font-medium text-gray-300">{step.description}</p>
          </div>
        </div>
 
      </React.Fragment>
    ))}
  </div>
</div>




        </div>
      </div>
    </div>
  );
};

export default HowItWorks;




