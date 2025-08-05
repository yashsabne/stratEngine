import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import { backendUrl } from '../../constants';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    role: 'user',
    aboutBusiness: '',
    profilePhoto: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    confirmPassword: '',
    country: 'India',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    notifications: {
      comments: true,
      candidates: false,
      offers: false,
      push: 'email',
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [isAvailable, setIsAvailable] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [isPhoneAvailable, setIsPhoneAvailable] = useState(false);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === 'username' && value.trim().length !== 0) {
      setCheckingUsername(true);
      try {
        const res = await axios.get(`${backendUrl}/api/auth/check?username=${value}`);

        setIsAvailable(res.data.available);
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingUsername(false);
      }
    }
    if (name === 'email' && value.trim().length !== 0) {
      setCheckingEmail(true);
      try {
        const res = await axios.get(`${backendUrl}/api/auth/check?email=${value}`);
        setIsEmailAvailable(res.data.available);
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingEmail(false);
      }
    }

    if (name === 'phone' && value.trim().length !== 0) {
      setCheckingPhone(true);
      try {
        const res = await axios.get(`${backendUrl}/api/auth/check?phone=${value}`);
        setIsPhoneAvailable(res.data.available);
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingPhone(false);
      }
    }

    if (name.startsWith('notifications.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: type === 'checkbox' ? checked : value,
        },
      }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'radio' && name === 'push-notifications') {
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          push: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.role === 'admin' && !formData.aboutBusiness.trim()) {
      newErrors.aboutBusiness = 'Business description is required for admin';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'notifications') {
          if (key === 'profilePhoto' && formData[key]) {
            data.append(key, formData[key]);
          } else if (formData[key] !== null) {
            data.append(key, formData[key]);
          }
        }
      });
      data.append('notifications', JSON.stringify(formData.notifications));

      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      console.log(result)

      if (response.ok) {
        console.log('✅ Registration successful:', result.message);
        setSubmitSuccess(true);


        setFormData({
          username: '',
          role: 'user',
          aboutBusiness: '',
          profilePhoto: null,
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          country: 'India',
          address: '',
          city: '',
          state: '',
          pinCode: '',
          notifications: {
            comments: true,
            candidates: false,
            offers: false,
            push: 'email',
          },
        });
      } else {
        console.error('❌ Registration failed:', result.message);
        alert(result.message);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.firstName })
      });

      const data = await response.json();
      if (data.success) {
        alert('Verification email sent!');
      } else {
        alert('Failed to send email: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        {submitSuccess ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900/30">
              <svg
                className="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-gray-100">Registration Successful!</h2>
            <p className="mt-2 text-gray-300">
              Thank you for registering. We've sent a verification email to your address.
            </p>
            <div className="mt-6 space-y-4">
              <button
                onClick={handleVerifyEmail}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Verify Email
              </button>
              <Link to='/login' >
                <button

                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  I'll Verify Later
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="divide-y divide-gray-700">
            <div className="px-6 py-5 sm:px-8 sm:py-8">
              <h2 className="text-3xl font-bold text-gray-100">Register Yourself</h2>
              <p className="mt-2 text-sm text-gray-300">
                Join our community by filling out the form below. All information will be kept secure.
              </p>
            </div>

            {/* Account Information */}
            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <h3 className="text-lg font-medium text-gray-100">Account Information</h3>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Username */}
                <div className="sm:col-span-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                    Username*
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 ${errors.username ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                    )}
                    {formData.username.trim().length !== 0 && (
                      <>
                        {checkingUsername && (
                          <p className="text-yellow-400 text-sm mt-1">Checking username availability...</p>
                        )}
                        {!checkingUsername && isAvailable === false && (
                          <p className="text-red-500 text-sm mt-1">Username is already taken</p>
                        )}
                        {!checkingUsername && isAvailable === true && (
                          <p className="text-green-500 text-sm mt-1">Username is available</p>
                        )}
                      </>
                    )}


                  </div>
                </div>

                {/* Role */}
                <div className="sm:col-span-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                    Role*
                  </label>
                  <div className="mt-1 relative">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="user" className="bg-gray-800">User</option>
                      <option value="admin" className="bg-gray-800">Business Admin</option>
                      <option value="na" className="bg-gray-800">N/A</option>
                    </select>
                  </div>
                </div>

                {/* About Business (Conditional) */}
                {formData.role === 'admin' && (
                  <div className="col-span-full">
                    <label htmlFor="aboutBusiness" className="block text-sm font-medium text-gray-300">
                      About Business*
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="aboutBusiness"
                        name="aboutBusiness"
                        rows={3}
                        value={formData.aboutBusiness}
                        onChange={handleChange}
                        className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 ${errors.aboutBusiness ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                      />
                      {errors.aboutBusiness && (
                        <p className="mt-1 text-sm text-red-400">{errors.aboutBusiness}</p>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-400">Briefly describe your business.</p>
                  </div>
                )}

                {/* Profile Photo */}
                <div className="col-span-full">
                  <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-300">
                    Profile Photo
                  </label>
                  <div className="mt-1 flex items-center">
                    {formData.profilePhoto ? (
                      <img
                        src={URL.createObjectURL(formData.profilePhoto)}
                        alt="Profile preview"
                        className="h-16 w-16 rounded-full object-cover border border-gray-600"
                      />
                    ) : (
                      <UserCircleIcon className="h-16 w-16 text-gray-500" aria-hidden="true" />
                    )}
                    <div className="ml-4 flex items-center">
                      <label
                        htmlFor="profilePhoto"
                        className="cursor-pointer rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-sm font-medium leading-4 text-gray-200 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <span>Change</span>
                        <input
                          id="profilePhoto"
                          name="profilePhoto"
                          type="file"
                          onChange={handleChange}
                          accept="image/*"
                          className="sr-only"
                        />
                      </label>
                      {formData.profilePhoto && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, profilePhoto: null }))}
                          className="ml-2 rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-sm font-medium leading-4 text-gray-200 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <h3 className="text-lg font-medium text-gray-100">Personal Information</h3>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* First Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                    First Name*
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                    )}
                  </div>
                </div>

                {/* Last Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                    Last Name*
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address*
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}

                    {formData.email.trim().length !== 0 && (
                      <>
                        {checkingEmail && <p className="text-yellow-400 text-sm mt-1">Checking email...</p>}
                        {!checkingEmail && isEmailAvailable === false && (
                          <p className="text-red-500 text-sm mt-1">Email is already registered</p>
                        )}
                        {!checkingEmail && isEmailAvailable === true && (
                          <p className="text-green-500 text-sm mt-1">Email is available</p>
                        )}
                      </>
                    )}

                  </div>
                </div>

                {/* Phone */}
                <div className="sm:col-span-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Phone Number*
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                    )}
                    {formData.phone.trim().length !== 0 && (
                      <>
                        {checkingPhone && <p className="text-yellow-400 text-sm mt-1">Checking phone...</p>}
                        {!checkingPhone && isPhoneAvailable === false && (
                          <p className="text-red-500 text-sm mt-1">Phone is already registered</p>
                        )}
                        {!checkingPhone && isPhoneAvailable === true && (
                          <p className="text-green-500 text-sm mt-1">Phone is available</p>
                        )}
                      </>
                    )}

                  </div>
                </div>

                {/* Password Field - Add this in your Account Information section */}
                <div className="sm:col-span-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password*
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 ${errors.password
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                        } sm:text-sm`}
                      autoComplete="new-password"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Password must be at least 8 characters with at least one uppercase, one lowercase, one number, and one special character.
                  </p>
                </div>

                {/* Confirm Password Field - Add this right after the Password field */}
                <div className="sm:col-span-4 mt-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                    Confirm Password*
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 ${errors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                        } sm:text-sm`}
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div className="sm:col-span-3">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-300">
                    Country
                  </label>
                  <div className="mt-1">
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option className="bg-gray-800">India</option>
                      <option className="bg-gray-800">United States</option>
                      <option className="bg-gray-800">Canada</option>
                      <option className="bg-gray-800">United Kingdom</option>
                      <option className="bg-gray-800">Australia</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="col-span-full">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-300">
                    Street Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="sm:col-span-2 sm:col-start-1">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-300">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* State */}
                <div className="sm:col-span-2">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-300">
                    State
                  </label>
                  <div className="mt-1">
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleChange}
                      className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Pin Code */}
                <div className="sm:col-span-2">
                  <label htmlFor="pinCode" className="block text-sm font-medium text-gray-300">
                    Pin Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="pinCode"
                      name="pinCode"
                      type="text"
                      value={formData.pinCode}
                      onChange={handleChange}
                      className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <h3 className="text-lg font-medium text-gray-100">Notifications</h3>
              <p className="mt-1 text-sm text-gray-300">
                Choose how you'd like to receive notifications from us.
              </p>

              <div className="mt-6 space-y-6">
                <fieldset>
                  <legend className="text-sm font-semibold text-gray-100">By Email</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="comments"
                          name="notifications.comments"
                          type="checkbox"
                          checked={formData.notifications.comments}
                          onChange={handleChange}
                          className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="comments" className="font-medium text-gray-300">
                          Comments
                        </label>
                        <p className="text-gray-400">Get notified when someone posts a comment.</p>
                      </div>
                    </div>
               
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="offers"
                          name="notifications.offers"
                          type="checkbox"
                          checked={formData.notifications.offers}
                          onChange={handleChange}
                          className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="offers" className="font-medium text-gray-300">
                          Offers
                        </label>
                        <p className="text-gray-400">Get notified about offer responses.</p>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-gray-100">Push Notifications</legend>
                  <p className="mt-1 text-sm text-gray-400">These are delivered via SMS to your mobile phone.</p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="push-everything"
                        name="push-notifications"
                        type="radio"
                        value="everything"
                        checked={formData.notifications.push === 'everything'}
                        onChange={handleChange}
                        className="h-4 w-4 bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="push-everything" className="ml-3 block text-sm font-medium text-gray-300">
                        Everything
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="push-email"
                        name="push-notifications"
                        type="radio"
                        value="email"
                        checked={formData.notifications.push === 'email'}
                        onChange={handleChange}
                        className="h-4 w-4 bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="push-email" className="ml-3 block text-sm font-medium text-gray-300">
                        Same as email
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="push-nothing"
                        name="push-notifications"
                        type="radio"
                        value="nothing"
                        checked={formData.notifications.push === 'nothing'}
                        onChange={handleChange}
                        className="h-4 w-4 bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="push-nothing" className="ml-3 block text-sm font-medium text-gray-300">
                        No push notifications
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 sm:px-8 bg-gray-800/50 flex justify-end space-x-3">
              <button
                type="button"
                className="rounded-md border border-gray-600 bg-gray-700 py-2 px-4 text-sm font-medium text-gray-200 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Register'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;