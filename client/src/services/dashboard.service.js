import api from './api';

const DashboardService = {
  // Get seller dashboard data
  getSellerDashboard: async (sellerId) => {
    const response = await api.get(`/dashboard/${sellerId}`);
    return response.data;
  },

  // Get seller's classified ads
  getSellerClassifieds: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    const response = await api.get(`/dashboard/classifieds?${queryParams.toString()}`);
    return response.data;
  },

  // Get seller's statistics
  getSellerStats: async (period = 'month') => {
    const response = await api.get(`/dashboard/stats?period=${period}`);
    return response.data;
  },

  // Get seller's performance metrics
  getSellerPerformance: async () => {
    const response = await api.get(`/dashboard/performance`);
    return response.data;
  },
};

export default DashboardService;
