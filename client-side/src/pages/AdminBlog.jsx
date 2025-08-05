import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RichTextEditor } from '../components/TextEditor';
import { toast } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Link} from 'react-router-dom';

import { backendUrl } from '../constants';



const AdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [premitedToWriteBlog, setPremitedToWriteBlog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingImgUpload, setLoadingImgUpload] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    businessType: 'startup',
    excerpt: '',
    featuredImage: ''
  });

  useEffect(() => {
    fetchBlogs();
  }, []);
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${backendUrl}/api/blogs/user`, {
        withCredentials: true,
      });

      const blogsData = Array.isArray(res.data.userBlogs) ? res.data : [];
 
      setBlogs(blogsData.userBlogs);
      setPremitedToWriteBlog(blogsData.premitedToWriteBlog);


    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blogs. Please try again.');
      toast.error('Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  const handleImageUpload = async (file) => {
    try {
      setLoadingImgUpload(true)
      const formData = new FormData();
      formData.append('image', file);

      console.log(formData)

      const res = await axios.post(
        `${backendUrl}/api/blogs/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      setFormData(prev => ({ ...prev, featuredImage: res.data.url }));
      toast.success('Image uploaded successfully');
      setLoadingImgUpload(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('businessType', formData.businessType);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('image', formData.featuredImage);

      if (isEditing) {
        await axios.put(`${backendUrl}/api/blogs/${currentBlog._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true,
        });
        toast.success('Blog updated successfully');
      } else {
        await axios.post(`${backendUrl}/api/blogs/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true,
        });
        toast.success('Blog created successfully');
      }

      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    }
  };
  const handleEdit = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      businessType: blog.businessType,
      excerpt: blog.excerpt,
      featuredImage: blog.featuredImage || ''
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(`${backendUrl}/api/blogs/${id}`);
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      businessType: 'startup',
      excerpt: '',
      featuredImage: ''
    });
    setIsEditing(false);
    setCurrentBlog(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="text-center p-6 bg-gray-800 rounded-lg max-w-md">
        <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Blogs</h2>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={fetchBlogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
            {isEditing && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Blog Form Section */}

            {premitedToWriteBlog?
            <>
                 <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-100 mb-6">
                {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                      required
                      placeholder="Enter blog title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Business Type</label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className="w-full px-4 mt-1 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                        required
                      >
                        <option value="startup">Startup</option>
                        <option value="saas">SaaS</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="finance">Finance</option>
                        <option value="marketing">Marketing</option>
                        <option value="technology">Technology</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Featured Image</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          name="featuredImage"
                          value={formData.featuredImage}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                          placeholder={loadingImgUpload ? "Forming URL..Please Wait" : "Image URL"}
                        />
                        <label className="cursor-pointer bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">
                          <span className="text-gray-200"> {loadingImgUpload ? "Uploading..." : "Upload"}  </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.featuredImage && (
                        <div className="mt-2">
                          <img
                            src={formData.featuredImage}
                            alt="Preview"
                            className="max-h-40 rounded-md object-cover border border-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Excerpt <span className="text-gray-400 text-xs">(Max 160 characters)</span>
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      maxLength="160"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                      rows="3"
                      placeholder="Brief description of the blog post"
                    />
                    <div className="text-xs text-gray-400 text-right">
                      {formData.excerpt.length}/160
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                    <div className="border border-gray-600 rounded-md overflow-hidden">
                      <RichTextEditor
                        content={formData.content}
                        onChange={handleContentChange}
                        darkMode={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {isEditing ? 'Update Post' : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
             <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Your Blog Posts</h2>
                <span className="bg-blue-900 text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded">
                  {blogs.length} {blogs.length === 1 ? 'post' : 'posts'}
                </span>
              </div>

              {blogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-200 mb-1">No blog posts yet</h3>
                  <p className="text-gray-400 mb-4">Create your first blog post to get started</p>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create New Post
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                  {blogs.map((blog) => (
                    <div key={blog._id} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                      <div className="flex items-start space-x-3">
                        {blog.featuredImage && (
                          <div className="flex-shrink-0">
                            <img
                              src={blog.featuredImage}
                              alt="Thumbnail"
                              className="h-12 w-12 rounded-md object-cover border border-gray-600"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-100 truncate">{blog.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                              {blog.businessType}
                            </span>
                            <span className="text-xs text-gray-400">
                              {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'No date'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-3">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="text-sm px-3 py-1 bg-yellow-800 text-yellow-100 rounded-md hover:bg-yellow-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="text-sm px-3 py-1 bg-red-800 text-red-100 rounded-md hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div></>
:
<div className="flex justify-center w-full">
<div class="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md flex items-start space-x-4">
 
 <Link to='/blogs-page'>
  <button   class="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  </Link>
 
  <div>
    <h2 class="text-lg font-semibold text-red-600 dark:text-red-400">Access Denied</h2>
    <p class="mt-1 text-gray-700 dark:text-gray-300 text-sm">
      You are not permitted to write blogs. Your current role is <span class="font-medium">User</span>, and only users with the <span class="font-medium">Admin</span> role can access the blog writing page.
    </p>
  </div>
</div>
</div>
            }

       
            {/* Blog List Section */}

           
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;