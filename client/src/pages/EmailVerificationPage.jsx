import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EmailVerification } from '../components/auth';
import { LoadingSpinner } from '../components/common';
import { useAuth } from '../context/AuthContext';

const EmailVerificationPage = () => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if we have verification data from location state
    if (location.state && location.state.userId && location.state.email) {
      setUserId(location.state.userId);
      setEmail(location.state.email);
      setLoading(false);
    } 
    // Check if we have a logged-in user that needs verification
    else if (user && !user.isEmailVerified) {
      setUserId(user._id);
      setEmail(user.email);
      setLoading(false);
    } 
    // If no verification data and user is already verified, redirect to home
    else if (user && user.isEmailVerified) {
      navigate('/');
    } 
    // If no user and no verification data, redirect to login
    else if (!user) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [location, user, navigate]);

  const handleVerificationSuccess = (userData) => {
    // Redirect to home page after successful verification
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center p-4">
      <EmailVerification 
        userId={userId} 
        email={email} 
        onSuccess={handleVerificationSuccess} 
      />
    </div>
  );
};

export default EmailVerificationPage;
