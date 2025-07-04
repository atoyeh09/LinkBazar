import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Toast } from '../components/ui';
import { LoadingSpinner } from '../components/common';

const ResetPassword = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: OTP verification, 2: Set new password
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef([]);
  const { verifyResetOTP, resetPassword, forgotPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get userId and email from location state
    if (location.state && location.state.userId && location.state.email) {
      setUserId(location.state.userId);
      setEmail(location.state.email);
    } else {
      // Redirect to forgot password if no state
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.split('').slice(0, 6);
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 6) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle key press for OTP fields
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const validateOtp = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setToast({
        type: 'error',
        message: 'Please enter a valid 6-digit code',
      });
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!validateOtp()) {
      return;
    }

    try {
      const otpValue = otp.join('');
      const response = await verifyResetOTP(userId, otpValue);

      if (response.success) {
        setStep(2);
        setToast({
          type: 'success',
          message: 'Code verified! Now set your new password',
        });
      } else {
        setToast({
          type: 'error',
          message: response.message || 'Invalid or expired code',
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'Verification failed',
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      const otpValue = otp.join('');
      const response = await resetPassword(userId, otpValue, newPassword);

      if (response.success) {
        setToast({
          type: 'success',
          message: 'Password reset successfully! You are now logged in.',
        });

        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setToast({
          type: 'error',
          message: response.message || 'Failed to reset password',
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'Failed to reset password',
      });
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await forgotPassword(email);
      
      if (response.success) {
        setToast({
          type: 'success',
          message: 'New reset code sent to your email',
        });
        
        setOtp(['', '', '', '', '', '']);
        setCountdown(60);
      } else {
        setToast({
          type: 'error',
          message: response.message || 'Failed to resend code',
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'Failed to resend code',
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
          {step === 1 ? (
            // Step 1: OTP Verification
            <>
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  Enter Reset Code
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="h-12 w-12 rounded-md border border-gray-300 text-center text-xl font-bold shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      disabled={loading}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || otp.join('').length !== 6}
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Verify Code'}
                </Button>

                <div className="text-center">
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Didn't receive the code?
                  </p>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={loading || countdown > 0}
                    className="text-sm"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            // Step 2: Set New Password
            <>
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  Set New Password
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        setErrors({ ...errors, newPassword: '' });
                      }
                    }}
                    error={errors.newPassword}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: '' });
                      }
                    }}
                    error={errors.confirmPassword}
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
                </Button>
              </form>
            </>
          )}
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

export default ResetPassword;
