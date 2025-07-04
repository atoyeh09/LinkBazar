import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductService, ClassifiedService } from '../services';
import { ProductCard, ClassifiedCard, LoadingSpinner, SkeletonLoader } from '../components/common';
import { Button, Card } from '../components/ui';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentClassifieds, setRecentClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch featured products
        const productsResponse = await ProductService.getProducts({ limit: 4 });
        setFeaturedProducts(productsResponse.data || []);

        // Fetch recent classifieds
        const classifiedsResponse = await ClassifiedService.getClassifieds({
          limit: 4,
          sort: '-createdAt'
        });
        setRecentClassifieds(classifiedsResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { name: 'Electronics', icon: '📱', link: '/classifieds?category=Electronics' },
    { name: 'Clothing', icon: '👕', link: '/classifieds?category=Clothing' },
    { name: 'Furniture', icon: '🪑', link: '/classifieds?category=Furniture' },
    { name: 'Vehicles', icon: '🚗', link: '/classifieds?category=Vehicles' },
    { name: 'Real Estate', icon: '🏠', link: '/classifieds?category=Real%20Estate' },
    { name: 'Services', icon: '🔧', link: '/classifieds?category=Services' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="mb-12">
        <div className="rounded-apple bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-12 text-white md:px-12 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/favIcon_dark.png"
                alt="LinkBzaar Logo"
                className="h-30 w-auto rounded-lg"
              />
            </motion.div>
            <motion.h1
              className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Find Everything You Need at LinkBzaar
            </motion.h1>
            <motion.p
              className="mb-8 text-lg md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Your one-stop platform for smart product search and classified ads
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <form onSubmit={handleSearch} className="mx-auto flex max-w-lg flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="input flex-1 bg-white/90 text-gray-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" className="bg-black text-primary-200 hover:bg-gray-900">
                  Search
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black-900 dark:text-gray-800">Browse Categories</h2>
          <Link to="/classifieds" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((category, index) => (
            <Link key={category.name} to={category.link}>
              <motion.div
                className="flex flex-col items-center rounded-apple bg-white p-4 text-center shadow-apple transition-all hover:shadow-apple-md dark:bg-gray-800"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <span className="mb-2 text-3xl">{category.icon}</span>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</h3>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-800">Featured Products</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Classifieds Section */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-800">Recent Classifieds</h2>
          <Link to="/classifieds" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentClassifieds.map((classified) => (
              <ClassifiedCard key={classified._id} classified={classified} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section>
        <Card className="bg-gradient-to-r from-gray-100 to-gray-200 p-8 dark:from-gray-800 dark:to-gray-900">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Have something to sell?</h2>
              <p className="text-gray-600 dark:text-gray-400">Post your classified ad and reach thousands of potential buyers.</p>
            </div>
            <Link to="/classifieds/new">
              <Button size="lg">
                Post a Classified Ad
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Home;
