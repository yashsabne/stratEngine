
import { features } from '../constants';

const Features = () => {
  return (
    <div className="overflow-hidden bg-gray-950 sm:py-26" id='features'>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-600">Grow faster</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
               A Smarter Workflow for Modern Businesses
              </p>
              <p className="mt-6 text-lg/8 text-gray-600">
               Harness automation, data-driven insights, and streamlined tools to accelerate your decision-making and scale your operations effortlessly.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-white lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <feature.icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-indigo-600" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
                   <a
                href="#howitworks"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 "
              >
                How it works
              </a>
              </dl>
            </div>
            
          </div>
          
          <img
            alt="Product screenshot"
            src="logo.png"
            width={2432}
            height={1442}
            // className="w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-228 md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  )
}

export default Features;