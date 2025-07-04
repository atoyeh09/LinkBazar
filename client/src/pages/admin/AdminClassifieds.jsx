import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClassifiedService, AdminService } from '../../services';
import { Card, Button, Toast, Modal } from '../../components/ui';
import { LoadingSpinner, EmptyState } from '../../components/common';

const AdminClassifieds = () => {
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classifiedToDelete, setClassifiedToDelete] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });

  useEffect(() => {
    fetchClassifieds();
  }, []);

  const fetchClassifieds = async () => {
    try {
      setLoading(true);
      const response = await ClassifiedService.getClassifieds();
      
      if (response.success) {
        setClassifieds(response.data || []);
      } else {
        setError('Failed to fetch classifieds.');
      }
    } catch (error) {
      console.error('Error fetching classifieds:', error);
      setError('An error occurred while fetching classifieds.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus ? false : true;
      
      const response = await ClassifiedService.updateClassified(id, {
        isActive: newStatus
      });
      
      if (response.success) {
        // Update the classified status in the state
        setClassifieds(classifieds.map(classified =>
          classified._id === id ? { ...classified, isActive: newStatus } : classified
        ));
        
        setToast({
          show: true,
          message: `Classified ${newStatus ? 'activated' : 'deactivated'} successfully!`,
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to update classified status.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating classified status:', error);
      setToast({
        show: true,
        message: 'An error occurred. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteClassified = (classified) => {
    setClassifiedToDelete(classified);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await AdminService.deleteClassified(classifiedToDelete._id);
      
      if (response.success) {
        // Remove the classified from the state
        setClassifieds(classifieds.filter(classified => classified._id !== classifiedToDelete._id));
        
        setToast({
          show: true,
          message: 'Classified deleted successfully!',
          type: 'success'
        });
        
        setShowDeleteModal(false);
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to delete classified.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting classified:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'An error occurred. Please try again.',
        type: 'error'
      });
    }
  };

  // Filter classifieds based on search term and filters
  const filteredClassifieds = classifieds.filter(classified => {
    const matchesSearch = 
      classified.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classified.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classified.sellerId?.name && classified.sellerId.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filters.category ? classified.category === filters.category : true;
    
    const matchesStatus = filters.status === 'active' 
      ? classified.isActive 
      : filters.status === 'inactive' 
        ? !classified.isActive 
        : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(classifieds.map(classified => classified.category))];

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
        title="Error Loading Classifieds"
        description={error}
        actionText="Try Again"
        action={fetchClassifieds}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Classifieds</h1>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search classifieds..."
              value={searchTerm}
              onChange={handleSearch}
              className="input w-full"
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

          {/* Filters */}
          <div className="flex space-x-4 sm:ml-4">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {filteredClassifieds.length === 0 ? (
        <EmptyState
          title="No Classifieds Found"
          description={
            searchTerm || filters.category || filters.status
              ? "No classifieds match your search criteria."
              : "No classifieds found in the system."
          }
          actionText="Clear Filters"
          action={() => {
            setSearchTerm('');
            setFilters({ category: '', status: '' });
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Listing
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Seller
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Price
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
              {filteredClassifieds.map((classified) => (
                <tr key={classified._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={classified.images[0] || 'https://via.placeholder.com/40?text=No+Image'}
                          alt={classified.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          <Link to={`/classifieds/${classified._id}`} className="hover:text-primary-600">
                            {classified.title}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {classified.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {classified.sellerId?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {classified.sellerId?.email || 'Unknown'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Rs. {classified.price.toLocaleString()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      classified.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {classified.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(classified.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/classifieds/${classified._id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                        View
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(classified._id, classified.isActive)}
                        className={`${
                          classified.isActive
                            ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                        }`}
                      >
                        {classified.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteClassified(classified)}
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

      {/* Delete Classified Modal */}
      {showDeleteModal && (
        <Modal
          title="Delete Classified"
          onClose={() => setShowDeleteModal(false)}
        >
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the classified <strong>{classifiedToDelete.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </div>
        </Modal>
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

export default AdminClassifieds;
