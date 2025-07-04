import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common';
import { Button, Toast } from '../ui';

const EmailVerification = ({ userId, email, onSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const inputRefs = useRef([]);
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  // Set up countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle input change for OTP fields
  const handleChange = (index, value) => {
    if (value.length > 1) {
      // If pasting multiple digits, distribute them across fields
      const digits = value.split('').slice(0, 6);
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus on the next empty field or the last field
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 6) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      // Handle single digit input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input if current input is filled
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle key press for OTP fields
  const handleKeyDown = (index, e) => {
    // Move to previous field on backspace if current field is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle OTP verification
  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setToast({
        show: true,
        message: 'Please enter a valid 6-digit OTP',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await verifyEmail(userId, otpValue);
      
      if (response.success) {
        setToast({
          show: true,
          message: 'Email verified successfully!',
          type: 'success'
        });
        
        if (onSuccess) {
          onSuccess(response.data);
        } else {
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } else {
        setToast({
          show: true,
          message: response.message || 'Verification failed',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Verification failed',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    setResendLoading(true);
    
    try {
      const response = await resendVerification(email);
      
      if (response.success) {
        setToast({
          show: true,
          message: 'Verification code resent successfully',
          type: 'success'
        });
        
        // Reset OTP fields
        setOtp(['', '', '', '', '', '']);
        
        // Start countdown for resend button (60 seconds)
        setCountdown(60);
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to resend verification code',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to resend verification code',
        type: 'error'
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-apple bg-white p-6 shadow-apple dark:bg-gray-800">
      <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Verify Your Email
      </h2>
      
      <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
        We've sent a verification code to <strong>{email}</strong>. 
        Please enter the code below to verify your email address.
      </p>
      
      <div className="mb-6 flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="h-12 w-12 rounded-md border border-gray-300 text-center text-xl font-bold shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        ))}
      </div>
      
      <div className="mb-4">
        <Button
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
          className="w-full"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Verify Email'}
        </Button>
      </div>
      
      <div className="text-center">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          Didn't receive the code?
        </p>
        
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resendLoading || countdown > 0}
          className="text-sm"
        >
          {resendLoading ? (
            <LoadingSpinner size="sm" />
          ) : countdown > 0 ? (
            `Resend in ${countdown}s`
          ) : (
            'Resend Code'
          )}
        </Button>
      </div>
      
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default EmailVerification;
