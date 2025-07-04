import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClassifiedService } from '../services';
import { ClassifiedCard, LoadingSpinner, SkeletonLoader, EmptyState } from '../components/common';
import { Button, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const Classifieds = () => {
  const { isAuthenticated } = useAuth();
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    region: searchParams.get('region') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12')
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalClassifieds, setTotalClassifieds] = useState(0);

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

  // Regions for filter
  const regions = [
    'All Regions',
    'Islamabad',
    'Karachi',
    'Lahore',
    'Peshawar',
    'Quetta',
    'Multan',
    'Faisalabad',
    'Rawalpindi',
    'Hyderabad',
    'Sialkot',
    'Other'
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
    { value: '-views', label: 'Most Viewed' }
  ];

  useEffect(() => {
    fetchClassifieds();
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

  const fetchClassifieds = async () => {
    try {
      setLoading(true);
      
      // Prepare filter params
      const filterParams = { ...filters };
      
      // Remove 'All Categories' filter
      if (filterParams.category === 'All Categories') {
        delete filterParams.category;
      }
      
      // Remove 'All Regions' filter
      if (filterParams.region === 'All Regions') {
        delete filterParams.region;
      }
      
      // Remove 'All Conditions' filter
      if (filterParams.condition === 'All Conditions') {
        delete filterParams.condition;
      }
      
      const response = await ClassifiedService.getClassifieds(filterParams);
      setClassifieds(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalClassifieds(response.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Error fetching classifieds:', error);
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
    fetchClassifieds();
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      region: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      sort: '-createdAt',
      page: 1,
      limit: 12
    });
    fetchClassifieds();
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-black">Classified Ads</h1>
        
        {isAuthenticated() && (
          <Link to="/classifieds/create">
            <Button variant="primary">
              Post New Ad
            </Button>
          </Link>
        )}
      </div>
      
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
              Region
            </label>
            <select
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              className="input w-full"
            >
              <option value="">All Regions</option>
              {regions.slice(1).map((region) => (
                <option key={region} value={region}>
                  {region}
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
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-800">
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
        
        {/* Classifieds Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
          ) : classifieds.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                  {Math.min(filters.page * filters.limit, totalClassifieds)} of {totalClassifieds} ads
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {classifieds.map((classified) => (
                  <ClassifiedCard key={classified._id} classified={classified} />
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
              title="No classified ads found"
              description="Try adjusting your filters or check back later for new ads."
              actionText="Reset Filters"
              action={handleResetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Classifieds;
