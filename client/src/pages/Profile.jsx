import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Toast } from '../components/ui';
import { LoadingSpinner, Avatar } from '../components/common';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, uploadProfilePicture } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/profile' } });
    } else if (user) {
      // Populate form with user data
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        region: user.region || ''
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await updateProfile(formData);

      if (response.success) {
        setToast({
          show: true,
          message: 'Profile updated successfully!',
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to update profile.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({
        show: true,
        message: 'An error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    try {
      setImageLoading(true);

      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const response = await uploadProfilePicture(formData);

      if (response.success) {
        setToast({
          show: true,
          message: 'Profile picture updated successfully!',
          type: 'success'
        });

        // Clear selected file and preview
        setSelectedFile(null);
        setPreviewUrl('');
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to update profile picture.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setToast({
        show: true,
        message: 'An error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setImageLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-black">My Profile</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Picture */}
        <Card className="md:col-span-1">
          <div className="flex flex-col items-center">
            <div className="mb-4 h-32 w-32 overflow-hidden rounded-full">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Avatar
                  src={user.profilePicture}
                  name={user.name}
                  size="2xl"
                  alt={user.name}
                  className="h-full w-full"
                />
              )}
            </div>

            <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{user.role}</p>

            <div className="mb-4 w-full">
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="profilePicture"
                className="btn btn-outline mb-2 flex w-full cursor-pointer items-center justify-center"
              >
                Choose Image
              </label>

              {selectedFile && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleImageUpload}
                  disabled={imageLoading}
                >
                  {imageLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Uploading...
                    </div>
                  ) : (
                    'Upload Image'
                  )}
                </Button>
              )}
            </div>

            <div className="w-full border-t border-gray-200 pt-4 dark:border-gray-700">
              <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Account Info</p>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Auth Provider:</span> {user.authProvider}
              </p>
            </div>
          </div>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Edit Profile</h2>

          <form onSubmit={handleProfileUpdate}>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled={true}
                  className="bg-gray-100 dark:bg-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., +92 300 1234567"
                />
              </div>

              <div>
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
              </div>

              <div>
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <Input
                  label="Region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="Enter your region/province"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Card>
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

export default Profile;
