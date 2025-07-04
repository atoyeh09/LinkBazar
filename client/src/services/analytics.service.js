import api from './api';

const AnalyticsService = {
  // Get admin analytics data
  getAdminAnalytics: async (period = '30') => {
    const response = await api.get(`/dashboard/admin/analytics?period=${period}`);
    return response.data;
  },

  // Get seller analytics data
  getSellerAnalytics: async (period = '30') => {
    const response = await api.get(`/dashboard/seller/analytics?period=${period}`);
    return response.data;
  },

  // Transform data for charts
  transformTimeSeriesData: (data, labelKey = '_id', valueKey = 'count') => {
    return {
      labels: data.map(item => {
        const date = new Date(item[labelKey]);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      values: data.map(item => item[valueKey])
    };
  },

  // Transform category data for pie charts
  transformCategoryData: (data, labelKey = '_id', valueKey = 'count') => {
    return {
      labels: data.map(item => item[labelKey] || 'Unknown'),
      values: data.map(item => item[valueKey])
    };
  },

  // Transform data for bar charts
  transformBarData: (data, labelKey = '_id', valueKey = 'count', additionalKeys = []) => {
    const result = {
      labels: data.map(item => item[labelKey] || 'Unknown'),
      datasets: [
        {
          label: valueKey.charAt(0).toUpperCase() + valueKey.slice(1),
          data: data.map(item => item[valueKey])
        }
      ]
    };

    // Add additional datasets if specified
    additionalKeys.forEach(key => {
      result.datasets.push({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        data: data.map(item => item[key] || 0)
      });
    });

    return result;
  },

  // Transform monthly revenue data for area charts
  transformRevenueData: (data) => {
    return data.map(item => ({
      name: item.month,
      Revenue: item.revenue,
      Listings: item.listings
    }));
  },

  // Generate mock data for demonstration
  generateMockData: {
    dailyViews: (days = 30) => {
      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          _id: date.toISOString().split('T')[0],
          views: Math.floor(Math.random() * 100) + 20
        });
      }
      return data;
    },

    categoryDistribution: () => [
      { _id: 'Electronics', count: 45, totalViews: 1250 },
      { _id: 'Vehicles', count: 32, totalViews: 980 },
      { _id: 'Real Estate', count: 28, totalViews: 1100 },
      { _id: 'Fashion', count: 25, totalViews: 750 },
      { _id: 'Home & Garden', count: 20, totalViews: 600 },
      { _id: 'Sports', count: 15, totalViews: 400 }
    ],

    priceRanges: () => [
      { _id: '0-1000', count: 25 },
      { _id: '1000-5000', count: 35 },
      { _id: '5000-10000', count: 20 },
      { _id: '10000-50000', count: 15 },
      { _id: '50000+', count: 5 }
    ],

    userGrowth: (months = 12) => {
      const data = [];
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        data.push({
          _id: date.toISOString().split('T')[0].substring(0, 7),
          count: Math.floor(Math.random() * 50) + 10
        });
      }
      return data;
    }
  }
};

export default AnalyticsService;
