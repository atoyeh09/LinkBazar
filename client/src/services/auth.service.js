import api from './api';

const AuthService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    // Only store token and user if email verification is not required
    if (response.data.success && !response.data.requiresVerification && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      // If it's a 403 error with requiresVerification, return the error data
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        return error.response.data;
      }
      // For other errors, re-throw them
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Check if user is admin
  isAdmin: () => {
    const user = AuthService.getCurrentUser();
    return user && user.role === 'admin';
  },

  // Check if user is seller
  isSeller: () => {
    const user = AuthService.getCurrentUser();
    return user && user.role === 'seller';
  },

  // Google Sign-In
  googleSignIn: () => {
    window.location.href = `${api.defaults.baseURL}/users/google`;
  },

  // Handle Google callback
  handleGoogleCallback: async (token) => {
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('token', token);

      try {
        // Fetch user profile with the token
        const response = await api.get('/users/profile');

        if (response.data.success) {
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(response.data.data));

          // If the user is not a seller, update their role to seller
          if (response.data.data.role === 'user') {
            try {
              // Update user role to seller
              const updateResponse = await api.put('/users/profile', {
                role: 'seller'
              });

              if (updateResponse.data.success) {
                // Update the stored user data with the new role
                localStorage.setItem('user', JSON.stringify(updateResponse.data.data));
                return updateResponse.data;
              }
            } catch (error) {
              console.error('Error updating user role:', error);
            }
          }

          return response.data;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    }
    return { success: false, message: 'No token provided' };
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    const response = await api.post('/users/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.success) {
      const user = AuthService.getCurrentUser();
      user.profilePicture = response.data.data.profilePicture;
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Verify email with OTP
  verifyEmail: async (userId, otp) => {
    const response = await api.post('/users/verify-email', { userId, otp });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await api.post('/users/resend-verification', { email });
    return response.data;
  },

  // Forgot password - request reset
  forgotPassword: async (email) => {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },

  // Verify password reset OTP
  verifyResetOTP: async (userId, otp) => {
    const response = await api.post('/users/verify-reset-otp', { userId, otp });
    return response.data;
  },

  // Reset password
  resetPassword: async (userId, otp, newPassword) => {
    const response = await api.post('/users/reset-password', { userId, otp, newPassword });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
};

export default AuthService;
