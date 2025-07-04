import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminService, ClassifiedService, ProductService } from '../../services';
import AnalyticsService from '../../services/analytics.service';
import { Card, Button } from '../../components/ui';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { LineChart, BarChart, PieChart, DoughnutChart, AreaChart } from '../../components/charts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClassifieds: 0,
    totalProducts: 0,
    activeClassifieds: 0,
    inactiveClassifieds: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentClassifieds, setRecentClassifieds] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await AdminService.getUsers();
        if (usersResponse.success) {
          setRecentUsers(usersResponse.data.slice(0, 5));
          setStats(prev => ({ ...prev, totalUsers: usersResponse.count }));
        }
        
        // Fetch classifieds
        const classifiedsResponse = await ClassifiedService.getClassifieds({ limit: 5, sort: '-createdAt' });
        if (classifiedsResponse.success) {
          setRecentClassifieds(classifiedsResponse.data);
          
          // Count active and inactive classifieds
          const activeCount = classifiedsResponse.data.filter(item => item.isActive).length;
          const inactiveCount = classifiedsResponse.data.filter(item => !item.isActive).length;
          
          setStats(prev => ({ 
            ...prev, 
            totalClassifieds: classifiedsResponse.count,
            activeClassifieds: activeCount,
            inactiveClassifieds: inactiveCount
          }));
        }
        
        // Fetch products
        const productsResponse = await ProductService.getProducts({ limit: 5 });
        if (productsResponse.success) {
          setStats(prev => ({ ...prev, totalProducts: productsResponse.count }));
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const response = await AnalyticsService.getAdminAnalytics(selectedPeriod);
        if (response.success) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Use mock data if API fails
        setAnalytics({
          userRegistrations: AnalyticsService.generateMockData.userGrowth(30),
          listingTrends: AnalyticsService.generateMockData.dailyViews(30),
          categoryStats: AnalyticsService.generateMockData.categoryDistribution(),
          userRoleStats: [
            { _id: 'user', count: 150 },
            { _id: 'seller', count: 45 },
            { _id: 'admin', count: 5 }
          ],
          regionStats: [
            { _id: 'Karachi', count: 45, avgPrice: 25000 },
            { _id: 'Lahore', count: 38, avgPrice: 22000 },
            { _id: 'Islamabad', count: 32, avgPrice: 35000 },
            { _id: 'Faisalabad', count: 25, avgPrice: 18000 },
            { _id: 'Rawalpindi', count: 20, avgPrice: 28000 }
          ],
          monthlyRevenue: AnalyticsService.transformRevenueData([
            { month: 'Jan 2024', revenue: 8500, listings: 320 },
            { month: 'Feb 2024', revenue: 9200, listings: 380 },
            { month: 'Mar 2024', revenue: 7800, listings: 290 },
            { month: 'Apr 2024', revenue: 10500, listings: 420 },
            { month: 'May 2024', revenue: 11200, listings: 450 },
            { month: 'Jun 2024', revenue: 9800, listings: 380 }
          ])
        });
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

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
        title="Error Loading Dashboard"
        description={error}
        actionText="Try Again"
        action={() => window.location.reload()}
      />
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-green-100 p-3 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Classifieds</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClassifieds}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeClassifieds}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Link to="/admin/users">
            <Button variant="primary" className="w-full">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/classifieds">
            <Button variant="primary" className="w-full">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              Manage Classifieds
            </Button>
          </Link>
          <Link to="/admin/products">
            <Button variant="primary" className="w-full">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              Manage Products
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
          <Link to="/">
            <Button variant="outline" className="w-full">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Site
            </Button>
          </Link>
        </div>
      </Card>

      {/* Analytics Charts */}
      {analyticsLoading ? (
        <Card className="mb-8">
          <div className="flex h-96 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      ) : analytics && (
        <>
          {/* Revenue and Listings Trend */}
          <Card className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue & Listings Trend</h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <AreaChart
              data={analytics.monthlyRevenue}
              height={350}
              showGrid={true}
            />
          </Card>

          {/* Charts Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* User Registrations */}
            <Card>
              <LineChart
                data={AnalyticsService.transformTimeSeriesData(analytics.userRegistrations)}
                title="User Registrations"
                height={300}
                fill={true}
                color="#10B981"
                backgroundColor="rgba(16, 185, 129, 0.1)"
              />
            </Card>

            {/* Listing Trends */}
            <Card>
              <LineChart
                data={AnalyticsService.transformTimeSeriesData(analytics.listingTrends)}
                title="New Listings"
                height={300}
                fill={true}
                color="#3B82F6"
                backgroundColor="rgba(59, 130, 246, 0.1)"
              />
            </Card>

            {/* Category Distribution */}
            <Card>
              <PieChart
                data={AnalyticsService.transformCategoryData(analytics.categoryStats)}
                title="Category Distribution"
                height={300}
              />
            </Card>

            {/* User Roles */}
            <Card>
              <DoughnutChart
                data={AnalyticsService.transformCategoryData(analytics.userRoleStats)}
                title="User Roles"
                height={300}
                centerText={{
                  value: analytics.userRoleStats.reduce((sum, item) => sum + item.count, 0),
                  label: 'Total Users'
                }}
              />
            </Card>
          </div>

          {/* Regional Performance */}
          <Card className="mb-8">
            <BarChart
              data={AnalyticsService.transformBarData(
                analytics.regionStats,
                '_id',
                'count',
                ['avgPrice']
              )}
              title="Regional Performance"
              height={350}
            />
          </Card>
        </>
      )}

      {/* Recent Users */}
      <Card className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {recentUsers.map((user) => (
                <tr key={user._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.profilePicture || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740'}
                          alt={user.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : user.role === 'seller'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link to="/admin/users" className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
            View All Users →
          </Link>
        </div>
      </Card>
      
      {/* Recent Classifieds */}
      <Card>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Recent Classifieds</h2>
        <div className="overflow-x-auto">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {recentClassifieds.map((classified) => (
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
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{classified.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{classified.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {classified.sellerId?.name || 'Unknown'}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link to="/admin/classifieds" className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
            View All Classifieds →
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
