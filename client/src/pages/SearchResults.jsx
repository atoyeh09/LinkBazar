import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductService, ClassifiedService, ScraperService } from '../services';
import { ProductCard, ClassifiedCard, ScrapedProductCard, LoadingSpinner, SkeletonLoader, EmptyState } from '../components/common';
import { Button, Card, Select } from '../components/ui';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState([]);
  const [classifieds, setClassifieds] = useState([]);
  const [scrapedProducts, setScrapedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('');
  const [scrapingOptions, setScrapingOptions] = useState({
    numResults: 5,
    countryCode: 'com'
  });

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query, activeTab]); // We don't include scrapingOptions here as we want to use the Apply button

  const fetchResults = async () => {
    setLoading(true);

    try {
      console.log(`Fetching results for query: "${query}" with tab: ${activeTab}`);
      console.log('Scraping options:', scrapingOptions);

      // Fetch data based on active tab
      const promises = [];

      if (activeTab === 'products' || activeTab === 'all') {
        console.log('Fetching products...');
        promises.push(ProductService.searchProducts(query));
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      if (activeTab === 'classifieds' || activeTab === 'all') {
        console.log('Fetching classifieds...');
        promises.push(ClassifiedService.getClassifieds({ search: query }));
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      if (activeTab === 'web' || activeTab === 'all') {
        console.log('Fetching scraped products with options:', scrapingOptions);
        try {
          const scraperPromise = ScraperService.searchAndScrape(query, scrapingOptions);
          promises.push(scraperPromise);
        } catch (scraperError) {
          console.error('Error creating scraper promise:', scraperError);
          promises.push(Promise.resolve({ results: [] }));
        }
      } else {
        promises.push(Promise.resolve({ results: [] }));
      }

      // Wait for all promises to resolve
      console.log('Waiting for all promises to resolve...');
      const responses = await Promise.all(promises);
      console.log('All promises resolved:', responses);

      const [productsResponse, classifiedsResponse, scrapedResponse] = responses;

      // Handle products and classifieds
      setProducts(productsResponse.data || []);
      setClassifieds(classifiedsResponse.data || []);

      // Handle scraped products - ensure it's an array
      console.log('Raw scraped response:', scrapedResponse);

      const scrapedResults = scrapedResponse.results || [];
      console.log('Extracted scraped results:', scrapedResults);
      console.log('Is array?', Array.isArray(scrapedResults));
      console.log('Length:', scrapedResults.length);

      // Ensure we're setting an array
      setScrapedProducts(Array.isArray(scrapedResults) ? scrapedResults : []);

      // Apply sorting if needed
      if (sortOrder) {
        applySorting(sortOrder);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to apply sorting to all results
  const applySorting = (order) => {
    if (order === 'price-asc') {
      setProducts([...products].sort((a, b) => a.price - b.price));
      setClassifieds([...classifieds].sort((a, b) => a.price - b.price));
      setScrapedProducts([...scrapedProducts].sort((a, b) => (a.price || 0) - (b.price || 0)));
    } else if (order === 'price-desc') {
      setProducts([...products].sort((a, b) => b.price - a.price));
      setClassifieds([...classifieds].sort((a, b) => b.price - a.price));
      setScrapedProducts([...scrapedProducts].sort((a, b) => (b.price || 0) - (a.price || 0)));
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    applySorting(value);
  };

  // Handle scraping options change
  const handleScrapingOptionsChange = (e) => {
    const { name, value } = e.target;
    setScrapingOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderResults = () => {
    // Debug the state of scrapedProducts
    console.log('Rendering with scrapedProducts:', scrapedProducts);

    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
      );
    }

    if (activeTab === 'products') {
      if (products.length === 0) {
        return (
          <EmptyState
            title="No products found"
            description={`We couldn't find any products matching "${query}".`}
            actionText="Browse All Products"
            actionLink="/products"
          />
        );
      }

      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      );
    }

    if (activeTab === 'classifieds') {
      if (classifieds.length === 0) {
        return (
          <EmptyState
            title="No classified ads found"
            description={`We couldn't find any classified ads matching "${query}".`}
            actionText="Browse All Classifieds"
            actionLink="/classifieds"
          />
        );
      }

      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classifieds.map((classified) => (
            <ClassifiedCard key={classified._id} classified={classified} />
          ))}
        </div>
      );
    }

    if (activeTab === 'web') {
      if (scrapedProducts.length === 0) {
        return (
          <EmptyState
            title="No web results found"
            description={`We couldn't find any web results matching "${query}".`}
            actionText="Try Different Search"
            action={() => {
              setScrapingOptions({
                numResults: 10,
                countryCode: 'com'
              });
              fetchResults();
            }}
          />
        );
      }

      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scrapedProducts.map((product, index) => (
            <ScrapedProductCard key={`scraped-${index}`} product={product} />
          ))}
        </div>
      );
    }

    if (activeTab === 'all') {
      if (products.length === 0 && classifieds.length === 0 && scrapedProducts.length === 0) {
        return (
          <EmptyState
            title="No results found"
            description={`We couldn't find any results matching "${query}".`}
            actionText="Go to Home"
            actionLink="/"
          />
        );
      }

      return (
        <div>
          {products.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-black">Products</h2>
                <Link to={`/products?search=${encodeURIComponent(query)}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                  View All Products
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 3).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}

          {classifieds.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-black">Classified Ads</h2>
                <Link to={`/classifieds?search=${encodeURIComponent(query)}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                  View All Classifieds
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {classifieds.slice(0, 3).map((classified) => (
                  <ClassifiedCard key={classified._id} classified={classified} />
                ))}
              </div>
            </div>
          )}

          {scrapedProducts.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-black">Web Results</h2>
                <button
                  onClick={() => setActiveTab('web')}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  View All Web Results
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {scrapedProducts.slice(0, 3).map((product, index) => (
                  <ScrapedProductCard key={`scraped-${index}`} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-black">
        Search Results for "{query}"
      </h1>

      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Results
            </button>
            <button
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'classifieds'
                  ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('classifieds')}
            >
              Classified Ads
            </button>
            <button
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'web'
                  ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('web')}
            >
              Web Results
            </button>
          </nav>
        </div>

        <div className="flex items-center text-black space-x-4">
          <select
            className="select select-sm"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          {activeTab === 'web' && (
            <div className="flex items-center space-x-2">
              <select
                className="select select-sm"
                name="numResults"
                value={scrapingOptions.numResults}
                onChange={handleScrapingOptionsChange}
              >
                <option value="5">5 Results</option>
                <option value="10">10 Results</option>
                <option value="15">15 Results</option>
                <option value="20">20 Results</option>
              </select>

              <select
                className="select select-sm"
                name="countryCode"
                value={scrapingOptions.countryCode}
                onChange={handleScrapingOptionsChange}
              >
                <option value="com">Global</option>
                <option value="com.pk">Pakistan</option>
                <option value="co.uk">UK</option>
                <option value="com.au">Australia</option>
              </select>

              <Button
                size="sm"
                onClick={fetchResults}
                className="bg-primary-600 text-white hover:bg-primary-700"
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      {renderResults()}
    </div>
  );
};

export default SearchResults;
