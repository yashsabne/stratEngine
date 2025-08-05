'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { Field, Label, Switch } from '@headlessui/react';
import { backendUrl } from '../../constants';

const ContactUs = () => {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    country: 'IN',
    phoneNumber: '',
    message: '',
  });

  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('yasiub')
    if (!agreed) {
      setStatus('Please agree to our privacy policy.');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/auth/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, agreed }),
      });

      const data = await response.json();

      console.log('hit')

      if (response.ok) {
        setStatus('Thank you for contacting us! We will get back to you soon.');
        setFormData({
          firstName: '',
          lastName: '',
          company: '',
          email: '',
          country: 'IN',
          phoneNumber: '',
          message: '',
        });
        setAgreed(false);
      } else {
        setStatus(data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Server error. Please try again later.');
    }
  };

  return (
    <div className="isolate bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-6 py-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-gray-200 sm:text-5xl">Contact Us</h2>
        <p className="mt-2 text-lg text-gray-400">For any kind of query kindly fill this form, our team will reach out to you.</p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-xl sm:mt-10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-300">
              First name
            </label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
              className="mt-2.5 block w-full rounded-md bg-gray-900 px-3.5 py-2 text-base text-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-300">
              Last name
            </label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
              className="mt-2.5 block w-full rounded-md bg-gray-900 px-3.5 py-2 text-base text-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="company" className="block text-sm font-semibold text-gray-300">
              Company
            </label>
            <input
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company Name"
              className="mt-2.5 block w-full rounded-md bg-gray-900 px-3.5 py-2 text-base text-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="mt-2.5 block w-full rounded-md bg-gray-900 px-3.5 py-2 text-base text-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-300">
              Phone number
            </label>
            <div className="mt-2.5 flex rounded-md bg-gray-900">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="rounded-l-md px-3 py-2 bg-gray-800 text-gray-300"
              >
                <option value="IN">IN</option>
                <option value="US">US</option>
              </select>
              <input
                name="phoneNumber"
                type="text"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="123-456-7890"
                className="flex-1 rounded-r-md px-3 py-2 bg-gray-900 text-gray-300 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-sm font-semibold text-gray-300">
              Message
            </label>
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message..."
              required
              className="mt-2.5 block w-full rounded-md bg-gray-900 px-3.5 py-2 text-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
          </div>

          <Field className="flex gap-x-4 sm:col-span-2">
            <Switch
              checked={agreed}
              onChange={setAgreed}
              className="group flex w-8 cursor-pointer rounded-full bg-gray-200 p-px ring-1 ring-inset ring-gray-900/5 transition-colors data-checked:bg-indigo-600"
            >
              <span className="sr-only">Agree to policies</span>
              <span
                aria-hidden="true"
                className="size-4 transform rounded-full bg-black ring-1 ring-gray-900/5 transition group-data-checked:translate-x-3.5"
              />
            </Switch>
            <Label className="text-sm text-gray-300">
              By selecting this, you agree to our{' '}
              <a href="#" className="font-semibold text-indigo-600">
                privacy&nbsp;policy
              </a>
              .
            </Label>
          </Field>
        </div>

        {status && <p className="mt-4 text-sm text-green-400">{status}</p>}

        <div className="mt-10">
          <button
            type="submit"
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow hover:bg-indigo-500"
          >
            Let's talk
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactUs;
