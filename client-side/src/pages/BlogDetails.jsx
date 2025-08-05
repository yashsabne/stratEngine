import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { backendUrl } from '../constants';



const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingTime, setReadingTime] = useState(0);


  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!slug || slug === 'undefined') {
          throw new Error('No blog present');
        }

        setLoading(true);
        setError(null);
        const res = await axios.get(`${backendUrl}/api/blogs/${slug}`);

        if (!res.data.success) {
          throw new Error(res.data.message || 'Failed to load blog');
        }

        setBlog(res.data.blog);
        calculateReadingTime(res.data.blog.content);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError(err.message);
        toast.error(err.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const calculateReadingTime = (content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.trim().split(/\s+/).length;
    const time = Math.ceil(wordCount / 200); // 200 wpm
    setReadingTime(time);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Blog Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The blog you requested does not exist.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition flex items-center gap-2 mx-auto"
          >
            <FiArrowLeft /> Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-10 transition"
        >
          <FiArrowLeft /> Back to Blogs
        </button>

        <article className="space-y-10">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="bg-gray-800 text-blue-400 px-3 py-1 rounded-full font-medium tracking-wide">
                {blog.businessType}
              </span>
              <span className="flex items-center text-gray-400">
                <FiCalendar className="mr-1.5" />
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {readingTime > 0 && (
                <span className="flex items-center text-gray-400">
                  <FiClock className="mr-1.5" />
                  {readingTime} min read
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {blog.title}
            </h1>

            <div className="flex items-center gap-2 text-gray-400">
              <FiUser />
              <span>By {blog.author?.username || 'Admin'}</span>
            </div>

            {blog.featuredImage?.url && (
              <div className="mt-6 rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
                <img
                  src={blog.featuredImage.url}
                  alt={blog.title}
                  className="w-full h-auto object-cover transition-transform hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            )}
          </header>

          {blog.excerpt && (
            <blockquote className="bg-gray-800/50 border-l-4 border-blue-500 px-6 py-4 rounded-r-md italic text-gray-300">
              {blog.excerpt}
            </blockquote>
          )}

          <section
            className="prose prose-invert prose-lg max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-8">
              {blog.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-blue-700/30 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
