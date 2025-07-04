import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductService } from '../services';
import { ProductForm } from '../components/forms';
import { Card, Toast } from '../components/ui';
import { LoadingSpinner, EmptyState } from '../components/common';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProductById(id);
        
        if (response.success) {
          // Format keywords as a comma-separated string for the form
          const formattedProduct = {
            ...response.data,
            keywords: response.data.keywords ? response.data.keywords.join(', ') : ''
          };
          
          setProduct(formattedProduct);
        } else {
          setError('Failed to load product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      
      const response = await ProductService.updateProduct(id, formData);
      
      if (response.success) {
        setToast({
          show: true,
          message: 'Product updated successfully!',
          type: 'success'
        });
        
        // Redirect to the seller dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard/listings');
        }, 1500);
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to update product.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'An error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <EmptyState
        title="Product Not Found"
        description={error || "We couldn't find the product you're looking for."}
        actionText="Go Back"
        action={() => navigate(-1)}
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-black">Edit Product</h1>

      <Card>
        <ProductForm 
          initialData={product} 
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

export default EditProduct;
