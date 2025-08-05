import { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../constants';

const EditProfilePage = ({ user, onClose }) => {

    console.log(user)

  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar || '',
    address: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zip: user.address?.zip || '',
      country: user.address?.country || ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${backendUrl}/api/auth/profile/update`, formData ,{
        withCredentials:true
      } );
      onClose(true); // Pass true to indicate success
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 rounded-xl shadow-2xl border border-gray-800 w-full max-w-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <button 
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                <img 
                  className="h-20 w-20 rounded-full object-cover border-2 border-indigo-500"
                  src={previewAvatar || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=1e1b4b&color=fff`}
                  alt="Profile"
                />
              </div>
              <div>
                <label className="block">
                  <span className="sr-only">Choose profile photo</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-600 file:text-white
                      hover:file:bg-indigo-500
                      cursor-pointer"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-400">
                  JPG, GIF or PNG. Max size 2MB
                </p>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email} 
                  readOnly
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-300 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.address.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-300 mb-1">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.address.zip}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.address.country}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="px-6 py-2 text-gray-300 hover:text-white rounded-md border border-gray-700 hover:bg-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;