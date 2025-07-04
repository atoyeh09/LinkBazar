const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const fs = require('fs');
const path = require('path');
const emailService = require('../services/email.service');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Generate OTP for email verification
    const otp = emailService.generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: otpExpiry
    });

    // Send verification email
    await emailService.sendVerificationEmail(user, otp);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      userId: user._id,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      message: 'Registration successful. Please check your email for verification OTP.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Check if email is verified for local auth users
    if (user.authProvider === 'local' && !user.isEmailVerified) {
      // Generate new OTP for verification
      const otp = emailService.generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

      // Update user with new OTP
      user.emailVerificationOTP = otp;
      user.emailVerificationOTPExpires = otpExpiry;
      await user.save();

      // Send verification email
      await emailService.sendVerificationEmail(user, otp);

      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new verification code has been sent to your email.',
        requiresVerification: true,
        userId: user._id
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.city = req.body.city || user.city;
    user.region = req.body.region || user.region;

    // Update password if provided (only for local auth users)
    if (req.body.password && user.authProvider === 'local') {
      user.password = req.body.password;
    }

    // Save updated user
    const updatedUser = await user.save();

    // Generate token
    const token = generateToken(updatedUser._id);

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        region: updatedUser.region,
        profilePicture: updatedUser.profilePicture,
        authProvider: updatedUser.authProvider,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile/picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile picture if it's not the default and exists on the server
    if (
      user.profilePicture &&
      !user.profilePicture.includes('default-avatar') &&
      !user.profilePicture.startsWith('http')
    ) {
      const oldPicturePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Set the new profile picture path
    const relativePath = `/uploads/${req.file.filename}`;
    user.profilePicture = relativePath;

    // Save user
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/users/google/callback
// @access  Public
exports.googleCallback = async (req, res) => {
  try {
    // Check if the user is new and set role to seller if they are
    if (req.user.createdAt &&
        ((new Date() - new Date(req.user.createdAt)) / 1000 < 10) &&
        req.user.role === 'user') {
      // This is a new user (created less than 10 seconds ago), update role to seller
      req.user.role = 'seller';
      await req.user.save();
    }

    // Generate token for the authenticated user
    const token = generateToken(req.user._id);

    // Get the frontend URL from environment variables or use a default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to the frontend with the token
    return res.redirect(`${frontendUrl}/auth/google/callback?token=${token}`);
  } catch (error) {
    // If there's an error, redirect to the login page with an error message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
};

// @desc    Verify email with OTP
// @route   POST /api/users/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is valid and not expired
    if (
      !user.emailVerificationOTP ||
      user.emailVerificationOTP !== otp ||
      !user.emailVerificationOTPExpires ||
      new Date() > user.emailVerificationOTPExpires
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Mark email as verified and clear OTP fields
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(user);

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = emailService.generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Update user with new OTP
    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpiry;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user, otp);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      userId: user._id
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
exports.logoutUser = async (req, res) => {
  try {
    // In a stateless JWT authentication system, the client is responsible for removing the token
    // The server doesn't need to do anything special for logout
    // However, we can implement a token blacklist if needed in the future

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Test email configuration
// @route   POST /api/users/test-email
// @access  Public (for testing only)
exports.testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for testing'
      });
    }

    console.log('Testing email configuration...');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    // Test OTP generation
    const otp = emailService.generateOTP();
    console.log('Generated OTP:', otp);

    // Create a test user object
    const testUser = {
      name: 'Test User',
      email: email
    };

    // Try to send verification email
    console.log('Attempting to send email to:', email);
    await emailService.sendVerificationEmail(testUser, otp);
    console.log('Email sent successfully!');

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      otp: otp, // Only for testing - remove in production
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER
      }
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.toString(),
      stack: error.stack
    });
  }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate OTP for password reset
    const otp = emailService.generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Save reset OTP to user
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = otpExpiry;
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, otp);

    res.status(200).json({
      success: true,
      message: 'Password reset code has been sent to your email',
      userId: user._id
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify password reset OTP
// @route   POST /api/users/verify-reset-otp
// @access  Public
exports.verifyResetOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is valid and not expired
    if (
      !user.passwordResetOTP ||
      user.passwordResetOTP !== otp ||
      !user.passwordResetOTPExpires ||
      new Date() > user.passwordResetOTPExpires
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reset code verified successfully',
      userId: user._id
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID, OTP, and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP one more time
    if (
      !user.passwordResetOTP ||
      user.passwordResetOTP !== otp ||
      !user.passwordResetOTPExpires ||
      new Date() > user.passwordResetOTPExpires
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    // Generate token for automatic login
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        token
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};