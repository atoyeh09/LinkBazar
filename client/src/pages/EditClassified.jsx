import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClassifiedService } from '../services';
import { ClassifiedForm } from '../components/forms';
import { Card, Toast } from '../components/ui';
import { LoadingSpinner, EmptyState } from '../components/common';
import { useAuth } from '../context/AuthContext';

const EditClassified = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [classified, setClassified] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Redirect if not authenticated
  if (!isAuthenticated()) {
    navigate('/login', { state: { from: `/classifieds/edit/${id}` } });
    return null;
  }

  useEffect(() => {
    const fetchClassified = async () => {
      try {
        setLoading(true);
        const response = await ClassifiedService.getClassifiedById(id);

        if (response.success) {
          // Check if the user is the owner of the classified
          if (user._id !== response.data.sellerId._id) {
            setError('You are not authorized to edit this classified ad.');
          } else {
            setClassified(response.data);
          }
        } else {
          setError('Failed to fetch classified ad details.');
        }
      } catch (error) {
        console.error('Error fetching classified:', error);
        setError('Classified ad not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassified();
  }, [id, user]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const response = await ClassifiedService.updateClassified(id, formData);

      if (response.success) {
        setToast({
          show: true,
          message: 'Classified ad updated successfully!',
          type: 'success'
        });

        // Redirect to the dashboard listings after a short delay
        setTimeout(() => {
          navigate('/dashboard/listings');
        }, 1500);
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to update classified ad.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating classified ad:', error);

      // More detailed error message
      let errorMessage = 'An error occurred. Please try again.';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'You are not authorized to update this classified ad.';
          // Redirect to dashboard after showing error
          setTimeout(() => {
            navigate('/dashboard/listings');
          }, 3000);
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !classified) {
    return (
      <EmptyState
        title="Cannot Edit Classified Ad"
        description={error || "We couldn't find the classified ad you're looking for."}
        actionText="Back to Classifieds"
        actionLink="/classifieds"
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-black">Edit Classified Ad</h1>

      <Card>
        <ClassifiedForm
          initialData={classified}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
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

export default EditClassified;
