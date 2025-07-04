import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Toast } from '../components/ui';
import { LoadingSpinner } from '../components/common';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const { forgotPassword, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await forgotPassword(email);

      if (response.success) {
        setToast({
          type: 'success',
          message: 'Password reset code has been sent to your email',
        });

        // Redirect to reset password page with userId
        setTimeout(() => {
          navigate('/reset-password', {
            state: {
              userId: response.userId,
              email: email
            }
          });
        }, 2000);
      } else {
        setToast({
          type: 'error',
          message: response.message || 'Failed to send reset code',
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'Failed to send reset code',
      });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Forgot Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a reset code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                error={errors.email}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Code'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
