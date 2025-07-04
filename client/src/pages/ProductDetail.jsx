import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductService, ChatService } from '../services';
import { LoadingSpinner, EmptyState } from '../components/common';
import { Button, Card, Toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createConversation } = useChat();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProductById(id);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Product not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleImageClick = (index) => {
    setActiveImage(index);
  };

  const handleChatWithSeller = async () => {
    if (!isAuthenticated()) {
      setToast({
        show: true,
        message: 'Please log in to chat with the seller',
        type: 'error'
      });
      return;
    }

    // Don't allow chatting with yourself
    if (product.seller._id === user._id) {
      setToast({
        show: true,
        message: 'You cannot chat with yourself',
        type: 'error'
      });
      return;
    }

    try {
      setChatLoading(true);
      const conversation = await createConversation(
        product.seller._id,
        'Product',
        product._id
      );

      if (conversation) {
        navigate(`/chat/${conversation._id}`);
      } else {
        setToast({
          show: true,
          message: 'Failed to start conversation',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setToast({
        show: true,
        message: 'Failed to start conversation',
        type: 'error'
      });
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <EmptyState
        title="Product Not Found"
        description={error || "We couldn't find the product you're looking for."}
        actionText="Back to Products"
        actionLink="/products"
      />
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Home
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            <Link to="/products" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Products
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-black">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div>
          <div className="mb-4 overflow-hidden rounded-apple">
            <img
              src={product.images[activeImage] || 'https://via.placeholder.com/600x600?text=No+Image'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer overflow-hidden rounded-md border-2 ${
                    activeImage === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="h-20 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-black">{product.name}</h1>

          <div className="mb-4 flex items-center">
            {product.brand && (
              <span className="mr-4 text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Brand:</span> {product.brand}
              </span>
            )}
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Condition:</span> {product.condition}
            </span>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              Rs. {product.price.toLocaleString()}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-black">Description</h2>
            <p className="text-gray-700 dark:text-gray-700">{product.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-black">Details</h2>
            <div className="grid text-gray-700 grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Category:</span> {product.category}
              </div>
              {product.seller && (
                <div>
                  <span className="font-semibold">Seller:</span> {product.seller.name}
                </div>
              )}
            </div>
          </div>

          {product.url && (
            <div className="mb-6">
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="primary" size="lg">
                  Visit Product Website
                </Button>
              </a>
            </div>
          )}

          {/* Chat with Seller Button */}
          {product.seller && product.seller._id !== user?._id && (
            <div className="mb-6">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleChatWithSeller}
                disabled={chatLoading}
                className="w-full"
              >
                {chatLoading ? 'Starting Chat...' : 'Chat with Seller'}
              </Button>
            </div>
          )}

          {/* Keywords/Tags */}
          {product.keywords && product.keywords.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-black">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {product.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back button */}
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4 bg-gray-200 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          >
            Back to Products
          </Button>
        </div>
      </div>

      {/* Toast notification */}
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

export default ProductDetail;
