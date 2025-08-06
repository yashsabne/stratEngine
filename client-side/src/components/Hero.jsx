'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import "../styles/hero.css"
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'
import { backendUrl } from '../constants';



const navigation = [
  { name: 'Blog', href: '/blogs-page', target:true },
  { name: 'Help', href: '/get-help' },
  { name: 'Our Mission', href: '/our-mission' },
  { name: 'Dashboard', href: '/dashboard' },
]

const HeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedInT, setisLoggedInT] = useState(false);

  const navigate = useNavigate();
  
  const isLoggedIn = async () => {

      try {
        const response = await axios.get(`${backendUrl}`, {
          withCredentials: true,  
          headers: {
            'Content-Type': 'application/json'
          }
        });
 
  
        if (response.data.success) {
          setisLoggedInT(true)
          
        } else {
          setisLoggedInT(false)
        }
      } catch (err) {
         console.log(err)
         setisLoggedInT(false)
      }  
}

useEffect(() => {
  isLoggedIn();
   
}, []);
  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout`, { withCredentials: true });
       setisLoggedInT(false);
      navigate("/login");
    } catch (err) {
      setError("Failed to logout. Please try again.");
    }
  };


  return (
    <>
      <section className="relative w-full h-screen overflow-hidden bg-gray-950">

        <video
          autoPlay
          muted
          loop
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="https://res.cloudinary.com/dez41esfq/video/upload/v1754454691/hero_bjmjwl.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="bg-white main-bg-hero">
          <header className="absolute inset-x-0 top-0 z-50">
            <nav aria-label="Global" className="  h-5 flex items-center justify-between p-8 lg:px-8 text-white bg-white/2 backdrop-blur-md ">

              <div className="flex lg:flex-1">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="text-2xl">Strat-Engine</span>
                    {/* <img
                  alt=""
                  src="logo.png"
                  className="h-8 w-auto"
                /> */}
                </a>
              </div>
              <div className="flex lg:hidden">  
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-data-700"
                >
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon aria-hidden="true" className="size-6" />
                </button>
              </div>
              <div className="hidden lg:flex lg:gap-x-12">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.target ? '_blank' : '_self'}

                    className="relative text-base font-semibold text-white transition-all duration-300 before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-300 before:ease-in-out before:origin-center hover:before:w-full before:-translate-x-1/2 "
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="hidden lg:flex lg:flex-1 lg:justify-end relative group">
                <a href="#" className="text-md font-semibold text-white">
                  Adminstration <span aria-hidden="true">&rarr;</span>
                </a>

                <div className="drop-down-login absolute top-6 right-0 hidden group-hover:flex flex-col bg-white shadow-lg rounded-lg py-2 w-40 z-50">
                  <ul className="text-sm text-gray-700">
                    {isLoggedInT ? 
              
                <Link onClick={handleLogout} > <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li></Link>
                :
                <>
                <Link to='/login' > <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Login</li></Link>
             </>
                     }
                    <Link to='/register'>   <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Signup</li></Link>
                  </ul>
                </div>
              </div>

            </nav>
            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
              <div className="fixed inset-0 z-50" />
              <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-950 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div className="flex items-center justify-between">

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-m-2.5 rounded-md p-2.5 text-white"
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-100">
                    <div className="space-y-2 py-6">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base/8 font-bold text-white"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                    <div className="py-6">

                      <div className="drop-down-login rounded-lg py-2 w-40 z-50">
                        <ul 
                          className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white">
                          <li className="px-4 py-2 cursor-pointer">Login</li>
                          <li className="px-4 py-2 cursor-pointer">Signup</li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </div>
              </DialogPanel>
            </Dialog>
          </header>

          <div className="relative isolate px-6 pt-14 lg:px-8">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
              {/* <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          /> */}
            </div>
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative rounded-full px-3 text-sm/6 text-white  ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  The engine behind smarter business decisions.

                </div>
              </div>
              <div className="text-center">
                <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
                  Strategies to enrich your business
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-gray-950 sm:text-xl/8 bg-blue-200">
                  Leverage real-time data insights, predictive analytics, and AI-powered recommendations to make smarter, faster business decisions.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="#features"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Get started
                  </a>
                  <a href="#about" className="text-sm/6 font-semibold text-white">
                    About us <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            >
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroSection;
