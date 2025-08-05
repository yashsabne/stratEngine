import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useDropzone } from 'react-dropzone';
import { FiCopy, FiEye, FiEyeOff, FiUpload, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { BsShieldLock, BsQrCode } from 'react-icons/bs';
import { FaGoogle } from 'react-icons/fa'; // this works
import PricingCard from '../components/PricingCard';
import InvoiceView from './InvoiceView';
import { backendUrl } from '../constants';



const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'preferences';
  });
  useEffect(() => { 
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [showToken, setShowToken] = useState({});
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenExpiry, setNewTokenExpiry] = useState(30);
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    step: 0,
    secret: '',
    qrCode: '',
    verificationCode: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [sessionToRevoke, setSessionToRevoke] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showInvoices, setShowInvoices] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const navigate = useNavigate();

 

   const fetchData = async () => {
    try {
      const [userRes, plansRes] = await Promise.all([
        axios.get(`${backendUrl}/api/auth/settings`, { withCredentials: true }),
        axios.get(`${backendUrl}/api/plans/plans`, { withCredentials: true }),
      ]);
      setUser(userRes.data.userSettings);
      setPlans(plansRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);


  const handleUpgrade = (newPlan) => {
    setUser(prev => ({ ...prev, plan: newPlan }));
  };


  const startEditing = (section, initialData = {}) => {
    setEditing(section);
    setFormData(initialData);
  };

  const cancelEditing = () => {
    setEditing(null);
    setFormData({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split('.');

    if (keys.length > 1) {
      setFormData(prev => {
        const updated = { ...prev };
        let nested = updated;

        // Traverse to the second last key
        for (let i = 0; i < keys.length - 1; i++) {
          if (!nested[keys[i]]) nested[keys[i]] = {};
          nested = nested[keys[i]];
        }

        nested[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };


  // Save preferences
  const savePreferences = async () => {
    try {
      await axios.patch(`${backendUrl}/api/settings/preferences`, formData, {
        withCredentials: true
      });
      setUser(prev => ({
        ...prev,
        settings: { ...prev.settings, ...formData }
      }));
      toast.success('Preferences updated successfully');
      setEditing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update preferences");
    }
  };
 
  const generateToken = async () => {
    if (!newTokenName.trim()) {
      toast.error('Please enter a token name');
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/settings/user/tokens`, {
        name: newTokenName,
        expiresInDays: newTokenExpiry
      }, {
        withCredentials: true
      });

      setUser(prev => ({
        ...prev,
        apiTokens: [...prev.apiTokens, response.data.token]
      }));

      setNewTokenName('');
      setNewTokenExpiry(30);
      toast.success('API token generated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate token");
    }
  };

  // Revoke API token
  const revokeToken = async (tokenId) => {
    try {
      await axios.delete(`${backendUrl}/api/settings/user/tokens/${tokenId}`, {
        withCredentials: true
      });

      setUser(prev => ({
        ...prev,
        apiTokens: prev.apiTokens.filter(t => t._id !== tokenId)
      }));

      toast.success('Token revoked successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke token");
    }
  };

  // Revoke session
  const revokeSession = async (sessionId) => {
    try {
      await axios.delete(`${backendUrl}/api/settings/user/sessions/${sessionId}`, {
        withCredentials: true
      });

      setUser(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s._id !== sessionId)
      }));

      setSessionToRevoke(null);
      toast.success('Session revoked successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke session");
    }
  };

  // Change password
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await axios.patch(`${backendUrl}/api/settings/user/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };


  const handleVerifyEmail = async () => {
    try {
      setVerifyLoading(true);
      const response = await fetch(`${backendUrl}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.user.email, name: user.user.username })
      });

      const data = await response.json();
      if (data.success) {
        alert('Verification email sent!');
      } else {
        alert('Failed to send email: ' + data.error);
      }
      setVerifyLoading(false)
    } catch (err) {
      console.error(err);
      setVerifyLoading(false)
      alert('Something went wrong');
      
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const requestDeleteAcc = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/request-deletion`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) { 
        navigate('/deletion-success');
      } else {
        setError(data.message);
      }

    } catch (error) {
      console.error('Error requesting account deletion:', error);
      alert('Something went wrong!');
    }
  };

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    setCancelLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/plans/cancel-subscription`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setCancelMessage(data.message);
      fetchData();
    } catch (err) {
      console.error(err);
      setCancelMessage("Something went wrong.");
    } finally {
      setCancelLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer">

                <img
                  src={user.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user.name || user.user.email)}&background=4f46e5&color=fff`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-600  transition-all"
                />

              </div>
              <h2 className="text-xl font-semibold text-gray-100 mt-4">{user.name || user.email}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>

            <nav className="space-y-1  ">
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'preferences' ? 'bg-indigo-900 text-indigo-100' : 'text-gray-300 hover:bg-gray-700'} cursor-pointer`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-indigo-900 text-indigo-100' : 'text-gray-300 hover:bg-gray-700'} cursor-pointer`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'sessions' ? 'bg-indigo-900 text-indigo-100' : 'text-gray-300 hover:bg-gray-700'} cursor-pointer`}
              >
                Active Sessions
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-indigo-900 text-indigo-100' : 'text-gray-300 hover:bg-gray-700'} cursor-pointer`}
              >
                Login History
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'api' ? 'bg-indigo-900 text-indigo-100' : 'text-gray-300 hover:bg-gray-700'} cursor-not-allowed opacity-50 pointer-events-none cursor:pointer`}
              >
                API Tokens
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'billing' ? 'bg-indigo-900 text-indigo-100' : 'text-gray-300 hover:bg-gray-700'} cursor-pointer`}
              >
                Billing & Plans
              </button>
            </nav>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Account Actions</h3>

            <div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Request Account Deletion
              </button>

              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                  <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Confirm Account Deletion</h2>
                    <p className="mb-6">
                      Are you sure you want to delete your account? This action is permanent and we keep no data.
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={requestDeleteAcc}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        Confirm Delete
                      </button>
                    </div>
                    {error && (
                      <span className="text-sm text-red-500 mt-1 block animate-pulse">
                        {error}
                      </span>
                    )}

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6 ">
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6 bg-[url('/images/pref_back.jpg')] bg-cover bg-center w-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">Account Preferences</h2>
                  <p className="text-sm text-gray-400 mt-1">Customize your experience and notification settings</p>
                </div>
                {editing !== 'preferences' && (
                  <button
                    onClick={() => startEditing('preferences', user.settings)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Preferences
                  </button>
                )}
              </div>

              {editing === 'preferences' ? (
                <div className="space-y-6">
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Display Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value="dark"
                              checked={formData.darkMode === true}
                              onChange={() => handleInputChange({ target: { name: 'darkMode', value: true } })}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-700"
                            />
                            <span className="text-gray-300">Dark</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value="light"
                              checked={formData.darkMode === false}
                              onChange={() => handleInputChange({ target: { name: 'darkMode', value: false } })}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-700"
                            />
                            <span className="text-gray-300">Light</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value="system"
                              checked={formData.darkMode === 'system'}
                              onChange={() => handleInputChange({ target: { name: 'darkMode', value: 'system' } })}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-700"
                            />
                            <span className="text-gray-300">System</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Density</label>
                        <select
                          name="density"
                          value={formData.density || 'normal'}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="compact">Compact</option>
                          <option value="normal">Normal</option>
                          <option value="comfortable">Comfortable</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                      Language & Region
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                        <select
                          name="language"
                          value={formData.language || 'en'}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="en">English</option>

                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
                        <select
                          name="region"
                          value={formData.region || 'UTC'}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >

                          <option value="Asia/Kolkata">Asia - Kolkata (India)</option>
                          <option value="Asia/Bangkok">Asia - Bangkok</option>
                          <option value="Asia/Dubai">Asia - Dubai</option>
                          <option value="Asia/Ho_Chi_Minh">Asia - Ho Chi Minh</option>
                          <option value="Asia/Hong_Kong">Asia - Hong Kong</option>
                          <option value="Asia/Kuala_Lumpur">Asia - Kuala Lumpur</option>
                          <option value="Asia/Seoul">Asia - Seoul</option>
                          <option value="Asia/Shanghai">Asia - Shanghai</option>
                          <option value="Asia/Singapore">Asia - Singapore</option>
                          <option value="Asia/Tokyo">Asia - Tokyo</option>

                          <option value="Africa/Cairo">Africa - Cairo</option>
                          <option value="Africa/Johannesburg">Africa - Johannesburg</option>
                          <option value="Africa/Lagos">Africa - Lagos</option>
                          <option value="Africa/Nairobi">Africa - Nairobi</option>

                          <option value="America/Argentina/Buenos_Aires">America - Buenos Aires</option>
                          <option value="America/Bogota">America - Bogota</option>
                          <option value="America/Chicago">America - Chicago</option>
                          <option value="America/Denver">America - Denver</option>
                          <option value="America/Los_Angeles">America - Los Angeles</option>
                          <option value="America/Mexico_City">America - Mexico City</option>
                          <option value="America/New_York">America - New York</option>
                          <option value="America/Sao_Paulo">America - Sao Paulo</option>
                          <option value="America/Toronto">America - Toronto</option>
                          <option value="America/Vancouver">America - Vancouver</option>

                          <option value="Australia/Adelaide">Australia - Adelaide</option>
                          <option value="Australia/Brisbane">Australia - Brisbane</option>
                          <option value="Australia/Melbourne">Australia - Melbourne</option>
                          <option value="Australia/Perth">Australia - Perth</option>
                          <option value="Australia/Sydney">Australia - Sydney</option>

                          <option value="Europe/Amsterdam">Europe - Amsterdam</option>
                          <option value="Europe/Athens">Europe - Athens</option>
                          <option value="Europe/Berlin">Europe - Berlin</option>
                          <option value="Europe/Istanbul">Europe - Istanbul</option>
                          <option value="Europe/Lisbon">Europe - Lisbon</option>
                          <option value="Europe/London">Europe - London</option>
                          <option value="Europe/Madrid">Europe - Madrid</option>
                          <option value="Europe/Moscow">Europe - Moscow</option>
                          <option value="Europe/Paris">Europe - Paris</option>
                          <option value="Europe/Rome">Europe - Rome</option>

                          <option value="Pacific/Auckland">Pacific - Auckland</option>
                          <option value="Pacific/Fiji">Pacific - Fiji</option>
                          <option value="Pacific/Honolulu">Pacific - Honolulu</option>
                          <option value="Pacific/Port_Moresby">Pacific - Port Moresby</option>

                          <option value="Antarctica/Palmer">Antarctica - Palmer</option>


                        </select>
                      </div>

                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      Notification Preferences
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Notification Methods</h4>
                        <div className="space-y-3 pl-2">
                          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                            <div className="flex items-center space-x-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              <span className="text-gray-300">Email Notifications</span>
                            </div>
                            <input
                              type="checkbox"
                              name="notifications.email"
                              checked={formData.notifications?.email || false}
                              onChange={handleInputChange}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                            />
                          </label>

                          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                            <div className="flex items-center space-x-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              <span className="text-gray-300">SMS Notifications</span>
                            </div>
                            <input
                              type="checkbox"
                              name="notifications.sms"
                              checked={formData.notifications?.sms || false}
                              onChange={handleInputChange}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                            />
                          </label>

                          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                            <div className="flex items-center space-x-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-300">Push Notifications</span>
                            </div>
                            <input
                              type="checkbox"
                              name="notifications.push"
                              checked={formData.notifications?.push || false}
                              onChange={handleInputChange}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Notification Types</h4>
                        <div className="space-y-3 pl-2">
                          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                            <span className="text-gray-300">System Messages</span>
                            <input
                              type="checkbox"
                              name="notifications.types.system"
                              checked={formData.notifications?.types?.system || false}
                              onChange={handleInputChange}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                            />
                          </label>
                          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                            <span className="text-gray-300">Promotional Offers</span>
                            <input
                              type="checkbox"
                              name="notifications.types.promotional"
                              checked={formData.notifications?.types?.promotional || false}
                              onChange={handleInputChange}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                            />
                          </label>
                          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                            <span className="text-gray-300">Security Alerts</span>
                            <input
                              type="checkbox"
                              name="notifications.types.security"
                              checked={formData.notifications?.types?.security || true}
                              onChange={handleInputChange}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                            />
                          </label>
                          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                            <span className="text-gray-300">Newsletter</span>
                            <input
                              type="checkbox"
                              name="notifications.types.newsletter"
                              checked={formData.notifications?.types?.newsletter || false}
                              onChange={handleInputChange}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Notification Sound</label>
                        <select
                          name="notificationSound"
                          value={formData.notificationSound || 'default'}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="default">Default (No Sound) </option>

                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Privacy & Security
                    </h3>

                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                        <span className="text-gray-300">Show activity status to others</span>
                        <input
                          type="checkbox"
                          name="privacy.showActivity"
                          checked={formData.privacy?.showActivity || false}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                        <span className="text-gray-300">Allow personalized ads</span>
                        <input
                          type="checkbox"
                          name="privacy.personalizedAds"
                          checked={formData.privacy?.personalizedAds || false}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800 rounded">
                        <span className="text-gray-300">Data sharing for analytics</span>
                        <input
                          type="checkbox"
                          name="privacy.dataSharing"
                          checked={formData.privacy?.dataSharing || false}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                        />
                      </label>
                    </div>
                  </div>


                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={savePreferences}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Display Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Theme</p>
                        <p className="text-gray-200 capitalize">
                          {user.settings.darkMode === true ? 'Dark' :
                            user.settings.darkMode === false ? 'Light' : 'System'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Density</p>
                        <p className="text-gray-200 capitalize">{user.settings.density || 'Normal'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Language & Region</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Language</p>
                        <p className="text-gray-200">
                          {user.settings.language === 'en' ? 'English' : ""}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">Region</p>
                        <p className="text-gray-200 capitalize">
                          {user.settings.region}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Notification Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Notification Methods</p>
                        <div className="mt-1 space-y-1">
                          <p className="text-gray-200">Email: {user.settings.notifications.email ? "Enabled" : "Disabled"}</p>
                          <p className="text-gray-200">SMS: {user.settings.notifications.sms ? "Enabled" : "Disabled"}</p>
                          <p className="text-gray-200">Push: {user.settings.notifications.push ? "Enabled" : "Disabled"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Notification Types</p>
                        <div className="mt-1 space-y-1">
                          <p className="text-gray-200">System: {user.settings.notifications.types?.system ? "On" : "Off"}</p>
                          <p className="text-gray-200">Promotions: {user.settings.notifications.types?.promotional ? "On" : "Off"}</p>
                          <p className="text-gray-200">Security: {user.settings.notifications.types?.security ? "On" : "Off"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Notification Sound</p>
                        <p className="text-gray-200 capitalize">{user.settings.notificationSound || 'Default'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Privacy & Security</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Activity Status</p>
                        <p className="text-gray-200">{user.settings.privacy?.showActivity ? "Visible" : "Hidden"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Personalized Ads</p>
                        <p className="text-gray-200">{user.settings.privacy?.personalizedAds ? "Enabled" : "Disabled"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Data Sharing</p>
                        <p className="text-gray-200">{user.settings.privacy?.dataSharing ? "Enabled" : "Disabled"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6 bg-[url('/images/pref_back.jpg')] bg-cover bg-center w-full">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Password</h2>
                <button
                  onClick={() => startEditing('password')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Change Password
                </button>

                {editing === 'password' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={changePassword}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Security Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Email Verified</p>
                    <p className="text-gray-200 flex items-center">
                      {user.user.isEmailVerified ? (
                        <>
                          <FiCheck className="text-green-500 mr-1" />
                          <span>Yes</span>
                        </>
                      ) : (
                        <>
                          <FiX className="text-red-500 mr-1" />
                          <span>No</span>
                          <button onClick={handleVerifyEmail} disabled={verifyLoading} className="ml-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer">
                         {verifyLoading? "Working...":" Verify Now" }  
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone Verified</p>
                    <p className="text-gray-200 flex items-center">
                      {user.isPhoneVerified ? (
                        <>
                          <FiCheck className="text-green-500 mr-1" />
                          <span>Yes</span>
                        </>
                      ) : (
                        <>
                          <FiX className="text-red-500 mr-1" />
                          <span>No</span>
                          <button disabled className="ml-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-not-allowed">
                            Verify Phone <small>(temporary out of service)</small>
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Login</p>
                    <p className="text-gray-200">
                      {user.loginHistory && user.loginHistory.length > 0
                        ? new Date(user.loginHistory[user.loginHistory.length - 1].timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                        : "N/A"}

                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Account Created</p>
                    <p className="text-gray-200">
                      {user.loginHistory && user.loginHistory.length > 0
                        ? new Date(user.loginHistory[0].timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Active Sessions</h2>

              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-600">
                      <th className="py-3 px-4 text-gray-300 font-medium">Device</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">Location</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">IP Address</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">Last Active</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.sessions.map((session) => (
                      <tr key={session._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-4 text-gray-200">
                          <div className="flex items-center space-x-2">
                            {session.isCurrent ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-900 text-indigo-100">
                                This Device
                              </span>
                            ) : (
                              <>
                                {session.deviceInfo?.includes('Mobile') ? (
                                  <span className="text-gray-400">📱</span>
                                ) : (
                                  <span className="text-gray-400">💻</span>
                                )}
                                <span>{session.deviceInfo || 'Unknown Device'}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {session.location || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {session.ip || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {new Date(session.lastActiveAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {!session.isCurrent && (
                            <button
                              onClick={() => setSessionToRevoke(session._id)}
                              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Revoke Session Confirmation Modal */}
              {sessionToRevoke && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Revoke Session</h3>
                    <p className="text-gray-300 mb-6">
                      Are you sure you want to revoke this session? The device will be logged out immediately.
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setSessionToRevoke(null)}
                        className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => revokeSession(sessionToRevoke)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Revoke Session
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login History Tab */}
          {activeTab === 'history' && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-6">Login History</h2>

              <div className="mb-4 flex justify-between items-center">
                <div className="relative">
                  <select className="bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last year</option>
                    <option>All time</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search logins..."
                    className="bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-600">
                      <th className="py-3 px-4 text-gray-300 font-medium">Timestamp</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">IP Address</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">Location</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">Device</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.loginHistory.map((log, i) => (
                      <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-4 text-gray-300">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {log.ip || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {log.location || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          <div className="flex items-center space-x-2">
                            {log.deviceInfo?.includes('Mobile') ? (
                              <span className="text-gray-400">📱</span>
                            ) : (
                              <span className="text-gray-400">💻</span>
                            )}
                            <span className="truncate max-w-xs">{log.deviceInfo || 'Unknown Device'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.success ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
                <div>
                  Showing 1 to {Math.min(10, user.loginHistory.length)} of {user.loginHistory.length} entries
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50" disabled={user.loginHistory.length <= 10}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Tokens Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Generate New API Token</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Token Name</label>
                    <input
                      type="text"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Production Server"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Expires In (days)</label>
                    <select
                      value={newTokenExpiry}
                      onChange={(e) => setNewTokenExpiry(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                      <option value="-1">Never</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={generateToken}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors w-full"
                    >
                      Generate Token
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Your API Tokens</h2>

                {user.apiTokens.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-gray-600">
                          <th className="py-3 px-4 text-gray-300 font-medium">Name</th>
                          <th className="py-3 px-4 text-gray-300 font-medium">Token</th>
                          <th className="py-3 px-4 text-gray-300 font-medium">Created</th>
                          <th className="py-3 px-4 text-gray-300 font-medium">Expires</th>
                          <th className="py-3 px-4 text-gray-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.apiTokens.map((token) => (
                          <tr key={token._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="py-3 px-4 text-gray-200">
                              {token.name}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              <div className="flex items-center">
                                {showToken[token._id] ? (
                                  <code className="bg-gray-700 px-2 py-1 rounded">
                                    {token.token}
                                  </code>
                                ) : (
                                  <code className="bg-gray-700 px-2 py-1 rounded">
                                    ••••••••••••••••••••••••••••••••
                                  </code>
                                )}
                                <button
                                  onClick={() => setShowToken(prev => ({
                                    ...prev,
                                    [token._id]: !prev[token._id]
                                  }))}
                                  className="ml-2 text-gray-400 hover:text-indigo-400 transition-colors"
                                >
                                  {showToken[token._id] ? <FiEyeOff /> : <FiEye />}
                                </button>
                                <CopyToClipboard
                                  text={token.token}
                                  onCopy={() => toast.success('Token copied to clipboard')}
                                >
                                  <button className="ml-2 text-gray-400 hover:text-indigo-400 transition-colors">
                                    <FiCopy />
                                  </button>
                                </CopyToClipboard>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {new Date(token.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to revoke this token?')) {
                                    revokeToken(token._id);
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">You haven't generated any API tokens yet.</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">API Documentation</h2>
                <p className="text-gray-300 mb-4">
                  Use your API tokens to authenticate requests to our API. Include the token in the
                  <code className="bg-gray-700 px-1.5 py-0.5 rounded mx-1">Authorization</code>
                  header as a Bearer token.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300">
                    <code>
                      {`// Example API request with curl
curl -X GET \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  https://api.yourservice.com/v1/endpoint

// Example with fetch
fetch('https://api.yourservice.com/v1/endpoint', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
})`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-6">Billing & Plans</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {plans.map((plan) => (
                  <div key={plan._id}>
                    <PricingCard
                      key={plan._id}
                      plan={plan}
                      user={user}
                      onUpgrade={handleUpgrade}
                      fetchData={fetchData}
                    />
                  </div>
                ))}
              </div>

              {user.user.plan !== 'free' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
                  <h3 className="text-lg font-medium text-gray-200 mb-4">Billing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Current Plan</p>
                      <p className="text-gray-200 capitalize">{user.user.plan || 'Free user'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Billing Cycle</p>
                      <p className="text-gray-200">Monthly</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Next Billing Date</p>
                      <p className="text-gray-200">
                        {new Date(user.user.planExpiry).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Payment Method</p>
                      <p className="text-gray-200">
                        <span className="mr-2 text-xs bg-gray-700 px-2 py-0.5 rounded"> {user.user.paymentMethod} </span> <br />

                        <span className='text-xs ' ><span className='bg-gray-700 px-2 py-0.5 rounded mr-2' >SubscriptionId: </span>{user.user.subscriptionId} </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">


                    <div>
                      <button
                        onClick={() => setShowInvoices(true)}
                        className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        View Invoices
                      </button>

                      {showInvoices && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
                            <InvoiceView onClose={() => setShowInvoices(false)} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancelLoading}
                        className="px-4 py-2 border border-red-600 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancelLoading ? "Cancelling..." : "Cancel Subscription"}
                      </button>

                      {cancelMessage && (
                        <p className="text-sm text-red-400 mt-2">{cancelMessage}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;