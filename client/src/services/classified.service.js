import api from './api';

const ClassifiedService = {
  // Create a new classified ad
  createClassified: async (classifiedData) => {
    const response = await api.post('/classifieds', classifiedData);
    return response.data;
  },

  // Get all classified ads
  getClassifieds: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    const response = await api.get(`/classifieds?${queryParams.toString()}`);
    return response.data;
  },

  // Get classified ad by ID
  getClassifiedById: async (id) => {
    const response = await api.get(`/classifieds/${id}`);
    return response.data;
  },

  // Update classified ad
  updateClassified: async (id, classifiedData) => {
    const response = await api.put(`/classifieds/${id}`, classifiedData);
    return response.data;
  },

  // Delete classified ad
  deleteClassified: async (id) => {
    const response = await api.delete(`/classifieds/${id}`);
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

    // Use the /classifieds endpoint with a seller filter instead of a separate endpoint
    const response = await api.get(`/classifieds?${queryParams.toString()}`);
    return response.data;
  },
};

export default ClassifiedService;
