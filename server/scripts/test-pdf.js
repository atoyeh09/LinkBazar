#!/usr/bin/env node

/**
 * Test script for PDF generation functionality
 * Run with: node scripts/test-pdf.js
 */

const path = require('path');
const fs = require('fs').promises;

// Add the server directory to the path so we can import services
process.chdir(path.join(__dirname, '..'));

const pdfService = require('./services/pdf.service');
const fileService = require('./services/file.service');

async function testPDFGeneration() {
    console.log('🚀 Starting PDF generation tests...\n');

    try {
        // Test 1: User Report
        console.log('📊 Testing User Report PDF...');
        const userData = {
            user: {
                username: 'testuser',
                email: 'test@linkbzaar.com',
                role: 'seller',
                isVerified: true,
                createdAt: new Date(),
                lastLogin: new Date(),
                phone: '+92-300-1234567',
                location: 'Karachi, Pakistan'
            },
            totalUsers: 1250,
            activeUsers: 890,
            newUsersThisMonth: 45
        };

        const userPDF = await pdfService.generateUserReport(userData);
        await fs.writeFile('./exports/test-user-report.pdf', userPDF);
        console.log('✅ User Report PDF generated successfully!\n');

        // Test 2: Analytics Report
        console.log('📈 Testing Analytics Report PDF...');
        const analyticsData = {
            totalUsers: 1250,
            activeUsers: 890,
            newUsers: 45,
            userGrowthRate: 12.5,
            totalListings: 3420,
            activeListings: 2890,
            newListings: 156,
            listingGrowthRate: 8.3,
            topCategories: [
                { name: 'Electronics', count: 450 },
                { name: 'Vehicles', count: 320 },
                { name: 'Real Estate', count: 280 },
                { name: 'Fashion', count: 190 },
                { name: 'Home & Garden', count: 150 }
            ],
            revenueBreakdown: [
                { source: 'Premium Listings', amount: 25000 },
                { source: 'Featured Ads', amount: 18000 },
                { source: 'Subscription Fees', amount: 12000 }
            ],
            period: 'Last 30 days'
        };

        const analyticsPDF = await pdfService.generateAnalyticsReport(analyticsData);
        await fs.writeFile('./exports/test-analytics-report.pdf', analyticsPDF);
        console.log('✅ Analytics Report PDF generated successfully!\n');

        // Test 3: Listing Catalog
        console.log('📋 Testing Listing Catalog PDF...');
        const listings = [
            {
                _id: '507f1f77bcf86cd799439011',
                title: 'iPhone 13 Pro Max - 256GB',
                category: 'Electronics',
                price: 150000,
                condition: 'new',
                location: 'Karachi',
                seller: { username: 'techseller' },
                status: 'active',
                createdAt: new Date(),
                views: 245,
                description: 'Brand new iPhone 13 Pro Max with 256GB storage. Complete box with all accessories.'
            },
            {
                _id: '507f1f77bcf86cd799439012',
                title: 'Honda Civic 2020 - Excellent Condition',
                category: 'Vehicles',
                price: 3500000,
                condition: 'used',
                location: 'Lahore',
                seller: { username: 'carseller' },
                status: 'active',
                createdAt: new Date(),
                views: 189,
                description: 'Well maintained Honda Civic 2020 with low mileage. Single owner, all documents clear.'
            },
            {
                _id: '507f1f77bcf86cd799439013',
                title: 'MacBook Pro M1 - 16 inch',
                category: 'Electronics',
                price: 250000,
                condition: 'refurbished',
                location: 'Islamabad',
                seller: { username: 'laptopstore' },
                status: 'active',
                createdAt: new Date(),
                views: 156,
                description: 'Refurbished MacBook Pro with M1 chip. Perfect for professionals and students.'
            }
        ];

        const catalogPDF = await pdfService.generateListingCatalog(listings);
        await fs.writeFile('./exports/test-listing-catalog.pdf', catalogPDF);
        console.log('✅ Listing Catalog PDF generated successfully!\n');

        // Test 4: Seller Report
        console.log('👤 Testing Seller Report PDF...');
        const sellerData = {
            seller: {
                username: 'proseller',
                email: 'seller@linkbzaar.com',
                role: 'seller',
                createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
                rating: 4.8
            },
            totalListings: 45,
            activeListings: 32,
            soldItems: 28,
            totalViews: 5420,
            totalRevenue: 125000,
            conversionRate: 62.2,
            averageResponseTime: 2.5,
            listingGrowthRate: 15.3,
            averageListingDuration: 12,
            repeatCustomers: 8,
            performanceScore: 92,
            performanceLevel: 'excellent',
            topCategories: [
                { name: 'Electronics', count: 18 },
                { name: 'Fashion', count: 12 },
                { name: 'Home & Garden', count: 8 },
                { name: 'Sports', count: 5 },
                { name: 'Books', count: 2 }
            ],
            recentListings: [
                { title: 'Gaming Laptop', category: 'Electronics', price: 85000, status: 'active', createdAt: new Date() },
                { title: 'Designer Handbag', category: 'Fashion', price: 12000, status: 'sold', createdAt: new Date() },
                { title: 'Coffee Table', category: 'Home & Garden', price: 8500, status: 'active', createdAt: new Date() }
            ],
            period: 'Last 30 days'
        };

        const sellerPDF = await pdfService.generateSellerReport(sellerData);
        await fs.writeFile('./exports/test-seller-report.pdf', sellerPDF);
        console.log('✅ Seller Report PDF generated successfully!\n');

        // Test 5: Invoice
        console.log('🧾 Testing Invoice PDF...');
        const invoiceData = {
            invoiceNumber: 'INV-2024-001',
            from: {
                name: 'LinkBzaar Platform',
                address: '123 Business Street',
                city: 'Karachi',
                state: 'Sindh',
                zipCode: '75000',
                email: 'billing@linkbzaar.com',
                phone: '+92-21-1234567'
            },
            to: {
                name: 'John Doe',
                address: '456 Customer Avenue',
                city: 'Lahore',
                state: 'Punjab',
                zipCode: '54000',
                email: 'john@example.com',
                phone: '+92-42-7654321'
            },
            items: [
                {
                    description: 'Premium Listing Package',
                    details: '30 days featured listing with priority placement',
                    quantity: 1,
                    unitPrice: 2500,
                    total: 2500
                },
                {
                    description: 'Additional Photos',
                    details: 'Extra 10 photos for listing enhancement',
                    quantity: 2,
                    unitPrice: 500,
                    total: 1000
                },
                {
                    description: 'Boost Package',
                    details: '7 days top placement in search results',
                    quantity: 1,
                    unitPrice: 1500,
                    total: 1500
                }
            ],
            subtotal: 5000,
            tax: 800,
            taxRate: 16,
            discount: 0,
            shipping: 0,
            total: 5800,
            payment: {
                status: 'paid',
                method: 'Credit Card',
                paidDate: new Date()
            },
            notes: 'Thank you for choosing LinkBzaar Premium services. Your listing will be activated within 24 hours.',
            terms: 'Payment is due within 30 days. Late payments may incur additional charges.'
        };

        const invoicePDF = await pdfService.generateInvoice(invoiceData);
        await fs.writeFile('./exports/test-invoice.pdf', invoicePDF);
        console.log('✅ Invoice PDF generated successfully!\n');

        console.log('🎉 All PDF tests completed successfully!');
        console.log('📁 Generated files saved in ./exports/ directory');
        console.log('\nGenerated files:');
        console.log('  - test-user-report.pdf');
        console.log('  - test-analytics-report.pdf');
        console.log('  - test-listing-catalog.pdf');
        console.log('  - test-seller-report.pdf');
        console.log('  - test-invoice.pdf');

    } catch (error) {
        console.error('❌ PDF generation test failed:', error);
        process.exit(1);
    } finally {
        // Close the PDF service browser
        await pdfService.closeBrowser();
    }
}

async function testFileExports() {
    console.log('\n📊 Testing file export functionality...\n');

    try {
        // Test CSV export
        console.log('📄 Testing CSV export...');
        const testData = [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'seller', verified: true },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', verified: false },
            { id: 3, name: 'Admin User', email: 'admin@linkbzaar.com', role: 'admin', verified: true }
        ];

        const headers = [
            { id: 'id', title: 'ID' },
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'role', title: 'Role' },
            { id: 'verified', title: 'Verified' }
        ];

        const csvPath = await fileService.exportToCSV(testData, 'test-export', headers);
        console.log('✅ CSV export successful:', csvPath);

        // Test Excel export
        console.log('📊 Testing Excel export...');
        const excelPath = await fileService.exportToExcel(testData, 'test-export', 'Test Data');
        console.log('✅ Excel export successful:', excelPath);

        // Test JSON export
        console.log('📋 Testing JSON export...');
        const jsonPath = await fileService.exportToJSON(testData, 'test-export');
        console.log('✅ JSON export successful:', jsonPath);

        console.log('\n🎉 All file export tests completed successfully!');

    } catch (error) {
        console.error('❌ File export test failed:', error);
        process.exit(1);
    }
}

// Main execution
async function main() {
    console.log('🔧 LinkBzaar PDF & File Export Test Suite\n');
    
    // Ensure exports directory exists
    try {
        await fs.access('./exports');
    } catch {
        await fs.mkdir('./exports', { recursive: true });
        console.log('📁 Created exports directory\n');
    }

    await testPDFGeneration();
    await testFileExports();

    console.log('\n✨ All tests completed successfully!');
    console.log('🚀 Your PDF generation and file export system is ready to use!');
}

// Run the tests
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testPDFGeneration, testFileExports };
