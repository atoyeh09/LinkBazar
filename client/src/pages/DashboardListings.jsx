import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClassifiedService } from '../services';
import { LoadingSpinner, EmptyState } from '../components/common';
import { Button, Card, Toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const DashboardListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchListings();
  }, [user, activeTab]);

  const fetchListings = async () => {
    try {
      setLoading(true);

      // Prepare filter params
      const filterParams = {
        seller: user._id // Use seller parameter to filter by seller ID
      };

      // Add status filter if not 'all'
      if (activeTab === 'active') {
        filterParams.status = 'active';
      } else if (activeTab === 'inactive') {
        filterParams.status = 'inactive';
      }

      const response = await ClassifiedService.getClassifieds(filterParams);

      if (response.success) {
        // Map isActive to status for consistency in the frontend
        const mappedListings = response.data.map(listing => ({
          ...listing,
          status: listing.isActive ? 'active' : 'inactive'
        }));
        setListings(mappedListings || []);
      } else {
        setError('Failed to fetch listings.');
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('An error occurred while fetching listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const response = await ClassifiedService.deleteClassified(id);

        if (response.success) {
          // Remove the deleted listing from the state
          setListings(listings.filter(listing => listing._id !== id));

          setToast({
            show: true,
            message: 'Listing deleted successfully!',
            type: 'success'
          });
        } else {
          setToast({
            show: true,
            message: response.message || 'Failed to delete listing.',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting listing:', error);
        setToast({
          show: true,
          message: 'An error occurred. Please try again.',
          type: 'error'
        });
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const response = await ClassifiedService.updateClassified(id, {
        status: newStatus
      });

      if (response.success) {
        // Update the listing status in the state
        setListings(listings.map(listing =>
          listing._id === id ? { ...listing, status: newStatus } : listing
        ));

        setToast({
          show: true,
          message: `Listing ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`,
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to update listing status.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating listing status:', error);

      // More detailed error message
      let errorMessage = 'An error occurred. Please try again.';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'You are not authorized to update this listing.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Listings"
        description={error}
        actionText="Try Again"
        action={fetchListings}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>

        <Link to="/classifieds/create">
          <Button variant="primary">
            Post New Ad
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* Tabs */}
          <div className="flex space-x-4">
            <button
              className={`px-3 py-2 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Listings
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium ${
                activeTab === 'active'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium ${
                activeTab === 'inactive'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('inactive')}
            >
              Inactive
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={handleSearch}
              className="input w-full sm:w-64"
            />
            <svg
              className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </Card>

      {filteredListings.length === 0 ? (
        <EmptyState
          title="No Listings Found"
          description={
            searchTerm
              ? `No listings match your search for "${searchTerm}".`
              : "You haven't created any listings yet."
          }
          actionText={searchTerm ? "Clear Search" : "Create Your First Listing"}
          action={searchTerm ? () => setSearchTerm('') : () => window.location.href = '/classifieds/create'}
        />
      ) : (
        <div className="overflow-hidden rounded-apple bg-white shadow-apple dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Listing
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Views
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {filteredListings.map((listing) => (
                <tr key={listing._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={listing.images[0] || 'https://via.placeholder.com/40?text=No+Image'}
                          alt={listing.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-800">
                          <Link to={`/classifieds/${listing._id}`} className="hover:text-primary-600">
                            {listing.title}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {listing.region}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-800">{listing.category}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">
                      Rs. {listing.price.toLocaleString()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-800">{listing.views}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      listing.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {listing.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(listing.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/classifieds/${listing._id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                        View
                      </Link>
                      <Link to={`/classifieds/edit/${listing._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(listing._id, listing.status)}
                        className={`${
                          listing.status === 'active'
                            ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                        }`}
                      >
                        {listing.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteListing(listing._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

export default DashboardListings;
