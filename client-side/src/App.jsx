import { useState } from 'react'
import './App.css'
import HeroSection from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import AboutUsPage from './components/AboutUs';
import AbooutOwner from './components/Aboout_owner';
import Register from './components/sections/Register';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import CtaSection from './components/CtaSection';
import Cta_video from './components/Cta_video';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/sections/Login';
import ContactUs from './components/sections/ContactUs';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/Setting';
import Footer from './components/sections/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetails';
import AdminDashboard from './pages/AdminBlog';
import VerifyEmail from './components/VerifyEmail';
import Help from './pages/Help';
import OurMission from './pages/OurMission';
import ScrollToTop from './components/ScrollToTop';
import DeletionSuccess from './pages/DeletionSuccess';


function HomePage() {
  return (
    <>
       <div className="go-to-top">
        <a
          href="#"
          type="button"
          className="!fixed bottom-5 end-5 rounded-full bg-blue-600 p-3 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
          id="btn-back-to-top"
        >
          <span className="[&>svg]:w-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="3"
              stroke="currentColor"
            >
              <path d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
          </span>
        </a>
      </div>

      <HeroSection />
      <Features />
      <CtaSection />
      <HowItWorks />
      <Cta_video />
      <AboutUsPage />
      <AbooutOwner />
      <ContactUs/>
      {/* <Footer/> */}
    </>
  );
}

function App() {
  return (
<>
       <ToastContainer position="top-right" autoClose={3000} />
    <Router>

           <ScrollToTop />
   


      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='/register' element={<Register/>} /> 
        <Route path='/login' element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/settings' element={<SettingsPage/>} />
        <Route path="/blogs-page" element={<Blog />} /> 
        <Route path="/blogs/:slug" element={<BlogDetail />} />

        <Route 
          path="/admin-blog" 
          element={ 
              <AdminDashboard />
          } 
        />
        <Route path='/verify-email' element={ <VerifyEmail/>}  />
        <Route path='/get-help' element={<Help/>} />
        <Route path='/our-mission' element={<OurMission/>} />
        <Route path="/deletion-success" element={<DeletionSuccess />} />

      </Routes>



    </Router>
         <Footer/>
    </>
  );
}

export default App;
