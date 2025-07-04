import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common';
import { Toast } from '../components/ui';

const GoogleCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await handleGoogleCallback(token);

        if (response.success) {
          // Show success toast
          setToast({
            show: true,
            message: 'Successfully signed in with Google!',
            type: 'success'
          });

          // Redirect based on user role
          if (response.data.role === 'seller') {
            // Redirect to seller dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          } else if (response.data.role === 'admin') {
            // Redirect to admin dashboard
            setTimeout(() => {
              navigate('/admin');
            }, 1500);
          } else {
            // Redirect to home page for regular users
            setTimeout(() => {
              navigate('/');
            }, 1500);
          }
        } else {
          setError(response.message || 'Authentication failed');
        }
      } catch (error) {
        setError(error.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [location, handleGoogleCallback, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Completing authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto mb-4 h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-black">Authentication Failed</h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            Back to Login
          </button>
        </div>
        <Toast
          type="error"
          message={error}
          onClose={() => setToast({ ...toast, show: false })}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center">
      <div className="text-center">
        <svg className="mx-auto mb-4 h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-black">Authentication Successful!</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">You have successfully signed in with Google.</p>
        <LoadingSpinner size="md" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default GoogleCallback;
