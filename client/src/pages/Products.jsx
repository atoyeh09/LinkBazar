import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductService } from '../services';
import { ProductCard, LoadingSpinner, SkeletonLoader, EmptyState } from '../components/common';
import { Button, Card } from '../components/ui';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12')
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Categories for filter
  const categories = [
    'All Categories',
    'Electronics',
    'Clothing',
    'Furniture',
    'Books',
    'Vehicles',
    'Real Estate',
    'Services',
    'Jobs',
    'Others'
  ];

  // Conditions for filter
  const conditions = [
    'All Conditions',
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor'
  ];

  // Sort options
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'name', label: 'Name: A to Z' },
    { value: '-name', label: 'Name: Z to A' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters.page, filters.sort]);

  useEffect(() => {
    // Update URL with current filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'page' && key !== 'limit') {
        params.append(key, value);
      }
    });
    if (filters.page > 1) {
      params.append('page', filters.page);
    }
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Prepare filter params
      const filterParams = { ...filters };
      
      // Remove 'All Categories' filter
      if (filterParams.category === 'All Categories') {
        delete filterParams.category;
      }
      
      // Remove 'All Conditions' filter
      if (filterParams.condition === 'All Conditions') {
        delete filterParams.condition;
      }
      
      const response = await ProductService.getProducts(filterParams);
      setProducts(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalProducts(response.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleApplyFilters = () => {
    fetchProducts();
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      sort: '-createdAt',
      page: 1,
      limit: 12
    });
    fetchProducts();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-black">Products</h1>
      
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Filters */}
        <Card className="md:col-span-1">
          <h2 className="mb-4 text-xl font-semibold">Filters</h2>
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input w-full"
            >
              <option value="">All Categories</option>
              {categories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="input w-1/2"
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="input w-1/2"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Condition
            </label>
            <select
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
              className="input w-full"
            >
              <option value="">All Conditions</option>
              {conditions.slice(1).map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort By
            </label>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="input w-full"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </div>
        </Card>
        
        {/* Products Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                  {Math.min(filters.page * filters.limit, totalProducts)} of {totalProducts} products
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={filters.page === i + 1 ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages}
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or check back later for new products."
              actionText="Reset Filters"
              action={handleResetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
