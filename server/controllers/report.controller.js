const User = require('../models/user.model');
const Classified = require('../models/classified.model');
const Product = require('../models/product.model');
const pdfService = require('../services/pdf.service');
const fileService = require('../services/file.service');
const path = require('path');
const fs = require('fs').promises;

class ReportController {
    // PDF Generation Endpoints
    async generateUserReportPDF(req, res) {
        try {
            const { userId } = req.params;
            let userData;

            if (userId && userId !== 'all') {
                // Generate report for specific user
                const user = await User.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                userData = { user: user.toObject() };
            } else {
                // Generate summary report for all users
                const totalUsers = await User.countDocuments();
                const activeUsers = await User.countDocuments({ 
                    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
                });
                const newUsersThisMonth = await User.countDocuments({
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                });

                userData = {
                    totalUsers,
                    activeUsers,
                    newUsersThisMonth
                };
            }

            const pdfBuffer = await pdfService.generateUserReport(userData);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="user-report-${Date.now()}.pdf"`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating user report PDF:', error);
            res.status(500).json({ message: 'Failed to generate PDF report', error: error.message });
        }
    }

    async generateAnalyticsReportPDF(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            // Gather analytics data
            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({ 
                lastLogin: { $gte: startDate } 
            });
            const newUsers = await User.countDocuments({ 
                createdAt: { $gte: startDate } 
            });

            const totalListings = await Classified.countDocuments() + await Product.countDocuments();
            const activeListings = await Classified.countDocuments({ status: 'active' }) + 
                                 await Product.countDocuments({ status: 'active' });
            const newListings = await Classified.countDocuments({ createdAt: { $gte: startDate } }) +
                              await Product.countDocuments({ createdAt: { $gte: startDate } });

            // Calculate growth rates
            const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
            const previousNewUsers = await User.countDocuments({ 
                createdAt: { $gte: previousPeriodStart, $lt: startDate } 
            });
            const userGrowthRate = previousNewUsers > 0 ? 
                ((newUsers - previousNewUsers) / previousNewUsers * 100).toFixed(1) : 0;

            const previousNewListings = await Classified.countDocuments({ 
                createdAt: { $gte: previousPeriodStart, $lt: startDate } 
            }) + await Product.countDocuments({ 
                createdAt: { $gte: previousPeriodStart, $lt: startDate } 
            });
            const listingGrowthRate = previousNewListings > 0 ? 
                ((newListings - previousNewListings) / previousNewListings * 100).toFixed(1) : 0;

            // Get top categories
            const classifiedCategories = await Classified.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);
            const productCategories = await Product.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            const topCategories = [...classifiedCategories, ...productCategories]
                .map(cat => ({ name: cat._id, count: cat.count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const analyticsData = {
                totalUsers,
                activeUsers,
                newUsers,
                userGrowthRate,
                totalListings,
                activeListings,
                newListings,
                listingGrowthRate,
                topCategories,
                period: `Last ${days} days`
            };

            const pdfBuffer = await pdfService.generateAnalyticsReport(analyticsData);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${Date.now()}.pdf"`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating analytics report PDF:', error);
            res.status(500).json({ message: 'Failed to generate PDF report', error: error.message });
        }
    }

    async generateListingCatalogPDF(req, res) {
        try {
            const { type = 'all', category, status = 'active', limit = 50 } = req.query;
            let listings = [];

            const query = {};
            if (category) query.category = category;
            if (status !== 'all') query.status = status;

            // If user is a seller, only show their listings
            if (req.user.role === 'seller') {
                query.seller = req.user._id;
            }

            if (type === 'classified' || type === 'all') {
                const classifieds = await Classified.find(query)
                    .populate('seller', 'username email')
                    .limit(parseInt(limit))
                    .sort({ createdAt: -1 });
                listings = [...listings, ...classifieds];
            }

            if (type === 'product' || type === 'all') {
                const products = await Product.find(query)
                    .populate('seller', 'username email')
                    .limit(parseInt(limit))
                    .sort({ createdAt: -1 });
                listings = [...listings, ...products];
            }

            const pdfBuffer = await pdfService.generateListingCatalog(listings);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="listing-catalog-${Date.now()}.pdf"`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating listing catalog PDF:', error);
            res.status(500).json({ message: 'Failed to generate PDF report', error: error.message });
        }
    }

    async generateSellerReportPDF(req, res) {
        try {
            const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user._id;
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            // Get seller information
            const seller = await User.findById(sellerId);
            if (!seller) {
                return res.status(404).json({ message: 'Seller not found' });
            }

            // Get seller's listings
            const totalListings = await Classified.countDocuments({ seller: sellerId }) +
                                await Product.countDocuments({ seller: sellerId });
            const activeListings = await Classified.countDocuments({ seller: sellerId, status: 'active' }) +
                                 await Product.countDocuments({ seller: sellerId, status: 'active' });

            // Get recent listings for the report
            const recentClassifieds = await Classified.find({ seller: sellerId })
                .sort({ createdAt: -1 })
                .limit(5);
            const recentProducts = await Product.find({ seller: sellerId })
                .sort({ createdAt: -1 })
                .limit(5);

            const recentListings = [...recentClassifieds, ...recentProducts]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            // Calculate performance metrics
            const totalViews = recentListings.reduce((sum, listing) => sum + (listing.views || 0), 0);
            const averagePrice = recentListings.length > 0 ?
                recentListings.reduce((sum, listing) => sum + listing.price, 0) / recentListings.length : 0;

            // Get top categories
            const categoryStats = await Classified.aggregate([
                { $match: { seller: sellerId } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            const sellerData = {
                seller: seller.toObject(),
                totalListings,
                activeListings,
                soldItems: 0, // This would need to be tracked in your system
                totalViews,
                averagePrice,
                topCategories: categoryStats.map(cat => ({ name: cat._id, count: cat.count })),
                recentListings: recentListings.map(listing => ({
                    title: listing.title,
                    category: listing.category,
                    price: listing.price,
                    status: listing.status,
                    createdAt: listing.createdAt
                })),
                period: `Last ${days} days`
            };

            const pdfBuffer = await pdfService.generateSellerReport(sellerData);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="seller-report-${Date.now()}.pdf"`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating seller report PDF:', error);
            res.status(500).json({ message: 'Failed to generate PDF report', error: error.message });
        }
    }

    // File Export Endpoints
    async exportUsersToCSV(req, res) {
        try {
            const { role, verified } = req.query;
            const query = {};
            
            if (role) query.role = role;
            if (verified !== undefined) query.isVerified = verified === 'true';

            const users = await User.find(query).sort({ createdAt: -1 });
            const filePath = await fileService.exportUsersToCSV(users);
            
            res.download(filePath, `users-export-${Date.now()}.csv`, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                }
                // Clean up file after download
                setTimeout(() => fileService.deleteFile(filePath), 60000);
            });
        } catch (error) {
            console.error('Error exporting users to CSV:', error);
            res.status(500).json({ message: 'Failed to export users', error: error.message });
        }
    }

    async exportUsersToExcel(req, res) {
        try {
            const { role, verified } = req.query;
            const query = {};
            
            if (role) query.role = role;
            if (verified !== undefined) query.isVerified = verified === 'true';

            const users = await User.find(query).sort({ createdAt: -1 });
            const filePath = await fileService.exportUsersToExcel(users);
            
            res.download(filePath, `users-export-${Date.now()}.xlsx`, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                }
                // Clean up file after download
                setTimeout(() => fileService.deleteFile(filePath), 60000);
            });
        } catch (error) {
            console.error('Error exporting users to Excel:', error);
            res.status(500).json({ message: 'Failed to export users', error: error.message });
        }
    }

    async exportListingsToCSV(req, res) {
        try {
            const { type = 'all', category, status } = req.query;
            let listings = [];

            const query = {};
            if (category) query.category = category;
            if (status) query.status = status;

            // If user is a seller, only export their listings
            if (req.user.role === 'seller') {
                query.seller = req.user._id;
            }

            if (type === 'classified' || type === 'all') {
                const classifieds = await Classified.find(query)
                    .populate('seller', 'username email')
                    .sort({ createdAt: -1 });
                listings = [...listings, ...classifieds];
            }

            if (type === 'product' || type === 'all') {
                const products = await Product.find(query)
                    .populate('seller', 'username email')
                    .sort({ createdAt: -1 });
                listings = [...listings, ...products];
            }

            const filePath = await fileService.exportListingsToCSV(listings);

            res.download(filePath, `listings-export-${Date.now()}.csv`, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                }
                // Clean up file after download
                setTimeout(() => fileService.deleteFile(filePath), 60000);
            });
        } catch (error) {
            console.error('Error exporting listings to CSV:', error);
            res.status(500).json({ message: 'Failed to export listings', error: error.message });
        }
    }

    async exportListingsToExcel(req, res) {
        try {
            const { type = 'all', category, status } = req.query;
            let listings = [];

            const query = {};
            if (category) query.category = category;
            if (status) query.status = status;

            // If user is a seller, only export their listings
            if (req.user.role === 'seller') {
                query.seller = req.user._id;
            }

            if (type === 'classified' || type === 'all') {
                const classifieds = await Classified.find(query)
                    .populate('seller', 'username email')
                    .sort({ createdAt: -1 });
                listings = [...listings, ...classifieds];
            }

            if (type === 'product' || type === 'all') {
                const products = await Product.find(query)
                    .populate('seller', 'username email')
                    .sort({ createdAt: -1 });
                listings = [...listings, ...products];
            }

            const filePath = await fileService.exportListingsToExcel(listings);

            res.download(filePath, `listings-export-${Date.now()}.xlsx`, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                }
                // Clean up file after download
                setTimeout(() => fileService.deleteFile(filePath), 60000);
            });
        } catch (error) {
            console.error('Error exporting listings to Excel:', error);
            res.status(500).json({ message: 'Failed to export listings', error: error.message });
        }
    }

    // Utility endpoints
    async cleanupOldFiles(req, res) {
        try {
            await fileService.cleanupOldFiles(24); // Clean files older than 24 hours
            res.json({ message: 'Old files cleaned up successfully' });
        } catch (error) {
            console.error('Error cleaning up files:', error);
            res.status(500).json({ message: 'Failed to cleanup files', error: error.message });
        }
    }
}

module.exports = new ReportController();
