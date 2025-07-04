import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../services';
import { ProductForm } from '../components/forms';
import { Card, Toast } from '../components/ui';

const CreateProduct = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      // Ensure the status is set to active for new products
      const dataWithStatus = {
        ...formData,
        isActive: true
      };

      const response = await ProductService.createProduct(dataWithStatus);

      if (response.success) {
        setToast({
          show: true,
          message: 'Product created successfully!',
          type: 'success'
        });

        // Redirect to the seller dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard/listings');
        }, 1500);
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to create product.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
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
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-black">Create a New Product</h1>

      <Card>
        <ProductForm onSubmit={handleSubmit} isLoading={loading} />
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

export default CreateProduct;
