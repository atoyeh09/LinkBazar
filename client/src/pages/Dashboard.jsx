import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardService } from '../services';
import AnalyticsService from '../services/analytics.service';
import { ClassifiedCard, LoadingSpinner, EmptyState } from '../components/common';
import { Card, Button } from '../components/ui';
import { LineChart, BarChart, PieChart, DoughnutChart, AreaChart } from '../components/charts';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await DashboardService.getSellerDashboard(user._id);

        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError('Failed to fetch dashboard data.');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('An error occurred while fetching dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const response = await AnalyticsService.getSellerAnalytics(selectedPeriod);
        if (response.success) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Use mock data if API fails
        setAnalytics({
          listingPerformance: AnalyticsService.generateMockData.dailyViews(30),
          viewsOverTime: AnalyticsService.generateMockData.dailyViews(30),
          categoryPerformance: AnalyticsService.generateMockData.categoryDistribution(),
          priceRanges: AnalyticsService.generateMockData.priceRanges(),
          topListings: [
            { title: 'iPhone 13 Pro Max', views: 245, price: 150000, category: 'Electronics' },
            { title: 'Honda Civic 2020', views: 189, price: 3500000, category: 'Vehicles' },
            { title: 'MacBook Pro M1', views: 156, price: 250000, category: 'Electronics' },
            { title: 'Samsung Galaxy S22', views: 134, price: 120000, category: 'Electronics' },
            { title: 'Toyota Corolla 2019', views: 98, price: 2800000, category: 'Vehicles' }
          ]
        });
      } finally {
        setAnalyticsLoading(false);
      }
    };

    if (user && user._id) {
      fetchAnalytics();
    }
  }, [user, selectedPeriod]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <EmptyState
        title="Dashboard Error"
        description={error || "We couldn't load your dashboard data."}
        actionText="Refresh"
        action={() => window.location.reload()}
      />
    );
  }

  const { metrics, mostViewedListings, recentListings } = dashboardData;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Link to="/classifieds/create">
            <Button variant="primary">
              Post New Ad
            </Button>
          </Link>
          <Link to="/products/create">
            <Button variant="outline">
              Create Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-primary-100 p-3 dark:bg-primary-900">
              <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalListings}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-green-100 p-3 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.activeListings}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalViews}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                Rs. {Math.round(metrics.averagePrice).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      {analyticsLoading ? (
        <Card className="mb-8">
          <div className="flex h-96 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      ) : analytics && (
        <>
          {/* Performance Overview */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Views Over Time */}
            <Card>
              <LineChart
                data={AnalyticsService.transformTimeSeriesData(analytics.viewsOverTime, '_id', 'views')}
                title="Views Over Time"
                height={300}
                fill={true}
                color="#3B82F6"
                backgroundColor="rgba(59, 130, 246, 0.1)"
              />
            </Card>

            {/* Listing Performance */}
            <Card>
              <AreaChart
                data={analytics.listingPerformance.map(item => ({
                  name: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  Listings: item.listings || 0,
                  Views: item.totalViews || 0
                }))}
                height={300}
                showGrid={true}
              />
            </Card>

            {/* Category Performance */}
            <Card>
              <BarChart
                data={AnalyticsService.transformBarData(
                  analytics.categoryPerformance,
                  '_id',
                  'totalViews',
                  ['count']
                )}
                title="Category Performance"
                height={300}
              />
            </Card>

            {/* Price Range Distribution */}
            <Card>
              <DoughnutChart
                data={AnalyticsService.transformCategoryData(analytics.priceRanges)}
                title="Price Range Distribution"
                height={300}
                centerText={{
                  value: analytics.priceRanges.reduce((sum, item) => sum + item.count, 0),
                  label: 'Total Listings'
                }}
              />
            </Card>
          </div>

          {/* Top Performing Listings */}
          <Card className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Top Performing Listings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {analytics.topListings.map((listing, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {listing.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {listing.category}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <svg className="mr-1 h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          {listing.views}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        Rs. {listing.price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Additional Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">Inquiries Received</p>
              <p className="font-semibold text-gray-900 dark:text-white">{metrics.inquiriesReceived}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">Response Rate</p>
              <p className="font-semibold text-gray-900 dark:text-white">{metrics.responseRate}%</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">Average Response Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">{metrics.averageResponseTime}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">Seller Rating</p>
              <div className="flex items-center">
                <span className="mr-1 font-semibold text-gray-900 dark:text-white">{metrics.sellerRating}</span>
                <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link to="/classifieds/create">
              <Button variant="primary" className="w-full">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Post New Ad
              </Button>
            </Link>
            <Link to="/products/create">
              <Button variant="primary" className="w-full">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create Product
              </Button>
            </Link>
            <Link to="/dashboard/listings">
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                Manage Listings
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="secondary" className="w-full">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Reports & Exports
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Edit Profile
              </Button>
            </Link>
            <a href="mailto:support@linkbzaar.com">
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Contact Support
              </Button>
            </a>
          </div>
        </Card>
      </div>

      {/* Most Viewed Listings */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Most Viewed Listings</h2>
        {mostViewedListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mostViewedListings.map((classified) => (
              <ClassifiedCard key={classified._id} classified={classified} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-600 dark:text-gray-400">No listings to display.</p>
          </Card>
        )}
      </div>

      {/* Recent Listings */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Recent Listings</h2>
        {recentListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentListings.map((classified) => (
              <ClassifiedCard key={classified._id} classified={classified} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-600 dark:text-gray-400">No listings to display.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
