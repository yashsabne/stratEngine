 import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from '../../constants';


const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    if (loginError) setLoginError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) newErrors.password = "Password is required";
  

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoginError("");

    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, formData, {
        withCredentials: true,  
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        navigate("/dashboard");
      } else {
        setLoginError(response.data.message || "Login failed");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         "Login failed. Please try again.";
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div className="p-8">
          <div className="flex justify-start">
            <Link to="/" className="inline-flex items-center text-indigo-400 hover:text-indigo-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="ml-1 font-medium">Back</span>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-100">Login to your account</h1>
            <p className="mt-2 text-sm text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
                Sign up
              </Link>
            </p>
          </div>

          {loginError && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-300 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address*
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 border ${
                    errors.email ? "border-red-500" : "border-gray-600"
                  } focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password*
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm bg-gray-700 text-gray-100 border ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  } focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;