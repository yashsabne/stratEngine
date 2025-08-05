import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import BusinessTypeFilter from '../components/BusinessTypeFilter';
import { TiPin } from "react-icons/ti";
import { useNavigate } from 'react-router-dom';

import { backendUrl } from '../constants'; 

const Blog = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');


  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const params = {};
        if (selectedType) {
          params.businessType = selectedType;
          navigate(`?businessType=${selectedType}`);
        }

        const res = await axios.get(`${backendUrl}/api/blogs`, { params });
        setBlogs(res.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-300 text-sm tracking-wide">Loading Blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 px-4 sm:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-100 flex items-center space-x-2">
            <Link to="/dashboard">
              <button className="text-gray-300 hover:text-blue-500 transition mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg> 
              </button>
            </Link>
            <span>Latest Business Insights</span>
          </h1>

        
          <BusinessTypeFilter selectedType={selectedType} onChange={setSelectedType} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">


          {blogs.length === 0 ? <span>No Available</span> : (
            <>
              {blogs.map((blog, index) => (
                <div
                  key={blog._id}
                  className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                >
                  <div className='relative'>
                    {blog.pinned && (
                      <span className='absolute top-2 right-3 text-3xl text-yellow-400 drop-shadow-md'>
                        <TiPin className="animate-bounce" />
                      </span>
                    )}

                    {blog.featuredImage && (
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <span className="inline-block bg-gray-800 text-blue-400 text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide">
                      {blog.businessType}
                    </span>

                    <h2 className="text-2xl font-semibold text-gray-100 leading-snug">
                      <Link
                        to={`/blogs/${blog.slug}`}
                        className="hover:text-blue-400 transition-colors duration-200"
                      >
                        {blog.title}
                      </Link>
                    </h2>

                    <p className="text-gray-400 text-sm line-clamp-3">{blog.excerpt}</p>

                    <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                      <span>By {blog.ownerName || 'Admin'}</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
