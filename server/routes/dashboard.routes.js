const express = require('express');
const router = express.Router();
const {
  getSellerDashboard,
  getAdminAnalytics,
  getSellerAnalytics
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected routes
router.get('/admin/analytics', protect, getAdminAnalytics);
router.get('/seller/analytics', protect, getSellerAnalytics);
router.get('/:sellerId', protect, getSellerDashboard);

module.exports = router;
