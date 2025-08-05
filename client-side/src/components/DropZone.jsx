import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { backendUrl } from '../constants';


const Dropzone = ({ onDrop }) => {

  const [uploadingLoad, setUploadingLoad] = useState(false);

  const handleDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingLoad(true)
      const res = await axios.post('http://localhost:3001/api/blogs/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onDrop(res.data.url);
      setUploadingLoad(false)
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`p-2 border-2 border-dashed rounded cursor-pointer ${
        isDragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-center"> </p>
      ) : (
        <p className="text-center"> {uploadingLoad? "Uploading Your Image" : "Click here to upload" }</p>
      )}
    </div>
  );
};

export default Dropzone;