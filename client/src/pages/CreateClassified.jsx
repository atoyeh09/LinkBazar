import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClassifiedService } from '../services';
import { ClassifiedForm } from '../components/forms';
import { Card, Toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const CreateClassified = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Redirect if not authenticated
  if (!isAuthenticated()) {
    navigate('/login', { state: { from: '/classifieds/create' } });
    return null;
  }

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      // Ensure the status is set to active for new listings
      const dataWithStatus = {
        ...formData,
        isActive: true
      };

      const response = await ClassifiedService.createClassified(dataWithStatus);

      if (response.success) {
        setToast({
          show: true,
          message: 'Classified ad created successfully!',
          type: 'success'
        });

        // Redirect to the seller dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard/listings');
        }, 1500);
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to create classified ad.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating classified ad:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'An error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-black">Post a Classified Ad</h1>

      <Card>
        <ClassifiedForm onSubmit={handleSubmit} isLoading={loading} />
      </Card>

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

export default CreateClassified;
