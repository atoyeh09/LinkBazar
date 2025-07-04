const Classified = require('../models/classified.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

// @desc    Get seller dashboard data
// @route   GET /api/dashboard/:sellerId
// @access  Private
exports.getSellerDashboard = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Check if user exists
    const user = await User.findById(sellerId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is the owner of the dashboard or an admin
    if (sellerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this dashboard'
      });
    }

    // Get seller's classifieds
    const classifieds = await Classified.find({ sellerId });

    // Calculate metrics
    const totalListings = classifieds.length;
    const activeListings = classifieds.filter(ad => ad.isActive).length;
    const totalViews = classifieds.reduce((acc, ad) => acc + ad.views, 0);
    const averagePrice = totalListings > 0 
      ? classifieds.reduce((acc, ad) => acc + ad.price, 0) / totalListings 
      : 0;

    // Get most viewed listings (top 5)
    const mostViewedListings = await Classified.find({ sellerId })
      .sort('-views')
      .limit(5);

    // Get recent listings (latest 5)
    const recentListings = await Classified.find({ sellerId })
      .sort('-createdAt')
      .limit(5);

    // Mock metrics for demonstration
    const mockMetrics = {
      inquiriesReceived: Math.floor(Math.random() * 100),
      responseRate: Math.floor(Math.random() * 100),
      averageResponseTime: Math.floor(Math.random() * 24) + ' hours',
      sellerRating: (Math.random() * 2 + 3).toFixed(1) // Random rating between 3.0 and 5.0
    };

    res.status(200).json({
      success: true,
      data: {
        sellerInfo: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        metrics: {
          totalListings,
          activeListings,
          totalViews,
          averagePrice,
          ...mockMetrics
        },
        mostViewedListings,
        recentListings
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get admin analytics data
// @route   GET /api/dashboard/admin/analytics
// @access  Private (Admin only)
exports.getAdminAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Listing creation trends
    const listingTrends = await Classified.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category distribution
    const categoryStats = await Classified.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // User role distribution
    const userRoleStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    // Regional distribution
    const regionStats = await Classified.aggregate([
      {
        $group: {
          _id: "$region",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Monthly revenue simulation (mock data)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      monthlyRevenue.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.floor(Math.random() * 10000) + 5000,
        listings: Math.floor(Math.random() * 500) + 200
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userRegistrations,
        listingTrends,
        categoryStats,
        userRoleStats,
        regionStats,
        monthlyRevenue,
        summary: {
          totalUsers: await User.countDocuments(),
          totalListings: await Classified.countDocuments(),
          activeListings: await Classified.countDocuments({ isActive: true }),
          totalProducts: await Product.countDocuments()
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get seller analytics data
// @route   GET /api/dashboard/seller/analytics
// @access  Private
exports.getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Listing performance over time
    const listingPerformance = await Classified.aggregate([
      {
        $match: {
          sellerId: sellerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          listings: { $sum: 1 },
          totalViews: { $sum: "$views" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Views over time
    const viewsOverTime = await Classified.aggregate([
      {
        $match: {
          sellerId: sellerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          views: { $sum: "$views" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category performance
    const categoryPerformance = await Classified.aggregate([
      {
        $match: { sellerId: sellerId }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
          avgPrice: { $avg: "$price" }
        }
      },
      { $sort: { totalViews: -1 } }
    ]);

    // Price range distribution
    const priceRanges = await Classified.aggregate([
      {
        $match: { sellerId: sellerId }
      },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 1000, 5000, 10000, 50000, 100000, Infinity],
          default: "Other",
          output: {
            count: { $sum: 1 },
            avgViews: { $avg: "$views" }
          }
        }
      }
    ]);

    // Top performing listings
    const topListings = await Classified.find({ sellerId })
      .sort('-views')
      .limit(5)
      .select('title views price category createdAt');

    res.status(200).json({
      success: true,
      data: {
        listingPerformance,
        viewsOverTime,
        categoryPerformance,
        priceRanges,
        topListings
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
