import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClassifiedService, ChatService } from '../services';
import { LoadingSpinner, EmptyState } from '../components/common';
import { Button, Card, Toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const ClassifiedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createConversation } = useChat();
  const [classified, setClassified] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchClassified = async () => {
      try {
        setLoading(true);
        const response = await ClassifiedService.getClassifiedById(id);
        setClassified(response.data);
      } catch (error) {
        console.error('Error fetching classified:', error);
        setError('Classified ad not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassified();
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
    if (classified.sellerId._id === user._id) {
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
        classified.sellerId._id,
        'Classified',
        classified._id
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this classified ad?')) {
      try {
        await ClassifiedService.deleteClassified(id);
        navigate('/classifieds');
      } catch (error) {
        console.error('Error deleting classified:', error);
        alert('Failed to delete the classified ad. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        title="Classified Ad Not Found"
        description={error || "We couldn't find the classified ad you're looking for."}
        actionText="Back to Classifieds"
        actionLink="/classifieds"
      />
    );
  }

  const isOwner = isAuthenticated() && user && classified.sellerId && user._id === classified.sellerId._id;

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
            <Link to="/classifieds" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Classifieds
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">{classified.title}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Classified Images */}
        <div className="md:col-span-2">
          <div className="mb-4 overflow-hidden rounded-apple">
            <img
              src={classified.images[activeImage] || 'https://via.placeholder.com/800x600?text=No+Image'}
              alt={classified.title}
              className="h-full w-full object-cover"
            />
          </div>

          {classified.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {classified.images.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer overflow-hidden rounded-md border-2 ${
                    activeImage === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={image}
                    alt={`${classified.title} - Image ${index + 1}`}
                    className="h-20 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-black">Description</h2>
            <div className="rounded-apple bg-white p-6 shadow-apple dark:bg-gray-800">
              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{classified.description}</p>
            </div>
          </div>
        </div>

        {/* Classified Details */}
        <div>
          <Card className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              {classified.isPromoted && (
                <span className="rounded-full bg-secondary-500 px-3 py-1 text-xs font-medium text-white">
                  Featured
                </span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Posted on {formatDate(classified.createdAt)}
              </span>
            </div>

            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{classified.title}</h1>

            <div className="mb-4">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                Rs. {classified.price.toLocaleString()}
              </span>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-center">
                <span className="mr-2 w-24 font-semibold text-gray-700 dark:text-gray-300">Category:</span>
                <span className="text-gray-600 dark:text-gray-400">{classified.category}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 w-24 font-semibold text-gray-700 dark:text-gray-300">Location:</span>
                <span className="text-gray-600 dark:text-gray-400">{classified.region}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 w-24 font-semibold text-gray-700 dark:text-gray-300">Condition:</span>
                <span className="text-gray-600 dark:text-gray-400">{classified.condition}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 w-24 font-semibold text-gray-700 dark:text-gray-300">Views:</span>
                <span className="text-gray-600 dark:text-gray-400">{classified.views}</span>
              </div>
            </div>
          </Card>

          {/* Seller Information */}
          <Card className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Seller Information</h2>

            {classified.sellerId && (
              <div className="mb-4 flex items-center">
                <div className="mr-3 h-12 w-12 overflow-hidden rounded-full">
                  <img
                    src={classified.sellerId.profilePicture || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740'}
                    alt={classified.sellerId.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{classified.sellerId.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member since {formatDate(classified.sellerId.createdAt)}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {classified.contactPhone && (
                <div className="flex items-center">
                  <svg className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">{classified.contactPhone}</span>
                </div>
              )}

              {classified.contactEmail && (
                <div className="flex items-center">
                  <svg className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">{classified.contactEmail}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Chat with Seller Button */}
          {classified.sellerId && classified.sellerId._id !== user?._id && (
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

          {/* Actions */}
          <div className="space-y-3">
            {isOwner && (
              <>
                <Link to={`/classifieds/edit/${classified._id}`} className="block w-full">
                  <Button variant="primary" className="w-full">
                    Edit Ad
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={handleDelete}>
                  Delete Ad
                </Button>
              </>
            )}
            <Button variant="outline" className="w-full bg-gray-200 dark:bg-gray-700" onClick={() => navigate(-1)}>
              Back to Classifieds
            </Button>
          </div>
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

export default ClassifiedDetail;
