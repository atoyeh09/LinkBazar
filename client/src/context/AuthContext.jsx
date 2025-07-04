import { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await AuthService.register(userData);

      // Check if email verification is required
      if (response.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          userId: response.userId,
          data: response.data,
          message: response.message || 'Registration successful. Please verify your email.',
        };
      }

      // If no verification required, set user (for Google OAuth, etc.)
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await AuthService.login(credentials);

      // Check if email verification is required
      if (response.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          userId: response.userId,
          message: response.message || 'Email verification required',
        };
      }

      setUser(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      // Check if the error response contains verification requirement
      if (error.response?.data?.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          userId: error.response.data.userId,
          message: error.response.data.message || 'Email verification required',
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const googleSignIn = () => {
    AuthService.googleSignIn();
  };

  // Handle Google callback
  const handleGoogleCallback = async (token) => {
    try {
      setLoading(true);
      const response = await AuthService.handleGoogleCallback(token);
      if (response && response.success) {
        // Set the user in state
        setUser(response.data);

        // Log the successful authentication
        console.log('Google authentication successful:', response.data);

        return { success: true, data: response.data };
      }
      return { success: false, message: 'Google authentication failed' };
    } catch (error) {
      console.error('Google authentication error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Google authentication failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await AuthService.updateProfile(userData);
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (formData) => {
    try {
      setLoading(true);
      const response = await AuthService.uploadProfilePicture(formData);
      const updatedUser = { ...user, profilePicture: response.data.profilePicture };
      setUser(updatedUser);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile picture upload failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Check if user is seller
  const isSeller = () => {
    return user && user.role === 'seller';
  };

  // Verify email with OTP
  const verifyEmail = async (userId, otp) => {
    try {
      setLoading(true);
      const response = await AuthService.verifyEmail(userId, otp);
      if (response.success) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerification = async (email) => {
    try {
      setLoading(true);
      const response = await AuthService.resendVerification(email);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend verification email',
      };
    } finally {
      setLoading(false);
    }
  };

  // Forgot password - request reset
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await AuthService.forgotPassword(email);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send password reset email',
      };
    } finally {
      setLoading(false);
    }
  };

  // Verify password reset OTP
  const verifyResetOTP = async (userId, otp) => {
    try {
      setLoading(true);
      const response = await AuthService.verifyResetOTP(userId, otp);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid or expired reset code',
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (userId, otp, newPassword) => {
    try {
      setLoading(true);
      const response = await AuthService.resetPassword(userId, otp, newPassword);
      if (response.success) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        googleSignIn,
        handleGoogleCallback,
        updateProfile,
        uploadProfilePicture,
        verifyEmail,
        resendVerification,
        forgotPassword,
        verifyResetOTP,
        resetPassword,
        isAuthenticated,
        isAdmin,
        isSeller,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
