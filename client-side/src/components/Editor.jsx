import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiUpload, FiX, FiSave, FiEdit, FiTrash2 } from 'react-icons/fi';

const Editor = ({ initialContent = '', onSave, isEditing = false, onDelete }) => {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['code-block']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'font',
    'align',
    'code-block'
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    setFeaturedImage(file);
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setPreviewImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('excerpt', excerpt);
    formData.append('tags', tags);
    formData.append('published', isPublished);
    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }
    
    try {
      await onSave(formData);
      router.push('/dashboard/posts');
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Featured Image
          </label>
          <div className="flex items-center space-x-4">
            {previewImage ? (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="h-32 w-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-750">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                  </div>
                  <input 
                    id="featuredImage" 
                    type="file" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    accept="image/*"
                    ref={fileInputRef}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows="3"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content
          </label>
          <div className="bg-gray-800 rounded-md overflow-hidden">
            <ReactQuill
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              theme="snow"
              className="h-96 text-gray-200"
            />
          </div>
        </div>

        <div className="flex items-center mb-6">
          <input
            id="published"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500"
          />
          <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-300">
            Publish
          </label>
        </div>

        <div className="flex justify-between">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <FiTrash2 className="mr-2" /> Delete
              </button>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/posts')}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <FiSave className="mr-2" /> {isEditing ? 'Update' : 'Save'} Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Editor;