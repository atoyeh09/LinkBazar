const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// PDF Generation Routes
router.get('/pdf/users',
    protect,
    authorize('admin'),
    reportController.generateUserReportPDF
);

router.get('/pdf/users/:userId',
    protect,
    authorize('admin'),
    reportController.generateUserReportPDF
);

router.get('/pdf/analytics',
    protect,
    authorize('admin'),
    reportController.generateAnalyticsReportPDF
);

router.get('/pdf/listings',
    protect,
    authorize('admin', 'seller'),
    reportController.generateListingCatalogPDF
);

router.get('/pdf/seller',
    protect,
    authorize('admin', 'seller'),
    reportController.generateSellerReportPDF
);

router.get('/pdf/seller/:sellerId',
    protect,
    authorize('admin', 'seller'),
    reportController.generateSellerReportPDF
);

// CSV Export Routes
router.get('/export/users/csv',
    protect,
    authorize('admin'),
    reportController.exportUsersToCSV
);

router.get('/export/listings/csv',
    protect,
    authorize('admin', 'seller'),
    reportController.exportListingsToCSV
);

// Excel Export Routes
router.get('/export/users/excel',
    protect,
    authorize('admin'),
    reportController.exportUsersToExcel
);

router.get('/export/listings/excel',
    protect,
    authorize('admin', 'seller'),
    reportController.exportListingsToExcel
);

// Utility Routes
router.post('/cleanup',
    protect,
    authorize('admin'),
    reportController.cleanupOldFiles
);

// Test route (remove in production)
router.get('/test/pdf', async (req, res) => {
    try {
        const pdfService = require('../services/pdf.service');
        const testData = {
            user: {
                username: 'testuser',
                email: 'test@example.com',
                role: 'admin',
                isVerified: true,
                createdAt: new Date(),
                lastLogin: new Date()
            }
        };

        const pdfBuffer = await pdfService.generateUserReport(testData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="test-report.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Test PDF error:', error);
        res.status(500).json({ message: 'Test failed', error: error.message });
    }
});

module.exports = router;
