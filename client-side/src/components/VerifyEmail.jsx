import { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { backendUrl } from '../constants';



const VerifyEmail = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();
  const didVerify = useRef(false); // prevent double fetch

  useEffect(() => {
    if (didVerify.current) return;
    didVerify.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token missing.');
      return;
    }

    fetch(`${backendUrl}/api/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage('🎉 Your email has been verified!');
          setTimeout(() => navigate('/login'), 6000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again later.');
      });
  }, [navigate]);

  const renderIcon = () => {
    if (status === 'loading') return <Loader2 className="animate-spin h-10 w-10 text-blue-400" />;
    if (status === 'success') return <CheckCircle className="h-10 w-10 text-green-500" />;
    if (status === 'error') return <XCircle className="h-10 w-10 text-red-500" />;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      {renderIcon()}
      <h1 className="text-2xl font-semibold mt-4 text-center">{message}</h1>
      {status === 'success' && (
        <p className="mt-2 text-sm text-gray-400">Redirecting to login...</p>
      )}
    </div>
  );
};

export default VerifyEmail;
