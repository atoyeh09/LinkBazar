import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductService, AdminService } from '../../services';
import { Card, Button, Toast, Modal } from '../../components/ui';
import { LoadingSpinner, EmptyState } from '../../components/common';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Add admin=true parameter to get all products including inactive ones
      const response = await ProductService.getProducts({ admin: 'true' });

      if (response.success) {
        setProducts(response.data || []);
      } else {
        setError('Failed to fetch products.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('An error occurred while fetching products.');
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

      const response = await ProductService.updateProduct(id, {
        isActive: newStatus
      });

      if (response.success) {
        // Update the product status in the state
        setProducts(products.map(product =>
          product._id === id ? { ...product, isActive: newStatus } : product
        ));

        setToast({
          show: true,
          message: `Product ${newStatus ? 'activated' : 'deactivated'} successfully!`,
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to update product status.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating product status:', error);

      // More detailed error message
      let errorMessage = 'An error occurred. Please try again.';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Product not found.';
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to update this product.';
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

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Use AdminService for admin operations
      const response = await AdminService.deleteProduct(productToDelete._id);

      if (response.success) {
        // Remove the product from the state
        setProducts(products.filter(product => product._id !== productToDelete._id));

        setToast({
          show: true,
          message: 'Product deleted successfully!',
          type: 'success'
        });

        setShowDeleteModal(false);
      } else {
        setToast({
          show: true,
          message: response.message || 'Failed to delete product.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);

      // More detailed error message
      let errorMessage = 'An error occurred. Please try again.';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Product not found.';
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

  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.seller?.name && product.seller.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filters.category ? product.category === filters.category : true;

    const matchesStatus = filters.status === 'active'
      ? product.isActive
      : filters.status === 'inactive'
        ? !product.isActive
        : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category))];

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
        title="Error Loading Products"
        description={error}
        actionText="Try Again"
        action={fetchProducts}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Products</h1>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
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

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description={
            searchTerm || filters.category || filters.status
              ? "No products match your search criteria."
              : "No products found in the system."
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
                  Product
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
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={product.images[0] || 'https://via.placeholder.com/40?text=No+Image'}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          <Link to={`/products/${product._id}`} className="hover:text-primary-600">
                            {product.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category} {product.brand && `- ${product.brand}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.seller?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {product.seller?.email || 'Unknown'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Rs. {product.price.toLocaleString()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      product.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/products/${product._id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                        View
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(product._id, product.isActive)}
                        className={`${
                          product.isActive
                            ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                        }`}
                      >
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
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

      {/* Delete Product Modal */}
      {showDeleteModal && (
        <Modal
          title="Delete Product"
          onClose={() => setShowDeleteModal(false)}
        >
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the product <strong>{productToDelete.name}</strong>? This action cannot be undone.
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

export default AdminProducts;
